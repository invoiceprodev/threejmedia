function json(response, status, payload, extraHeaders = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    ...extraHeaders,
  });
  response.end(JSON.stringify(payload));
}

function getAllowedOrigins(allowedOrigin) {
  return String(allowedOrigin || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function getCorsHeaders(origin, allowedOrigin) {
  if (!origin) {
    return {};
  }

  const allowedOrigins = getAllowedOrigins(allowedOrigin);

  if (!allowedOrigins.includes(origin)) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
  };
}

function addYearsIsoDate(value, years) {
  const next = new Date(value);
  next.setUTCFullYear(next.getUTCFullYear() + years);
  return next.toISOString();
}

function getFulfillmentUpdate(paymentStatus) {
  if (paymentStatus === "success") {
    return {
      domain_fulfillment_status: "queued",
      domain_fulfillment_notes:
        "Plan payment verified. Domain is now queued for managed registration and configuration.",
      domain_fulfillment_requested_at: new Date().toISOString(),
      domain_fulfillment_completed_at: null,
    };
  }

  return {
    domain_fulfillment_status: "awaiting_payment",
    domain_fulfillment_notes: `Payment status is ${paymentStatus}. Domain fulfillment has not started.`,
    domain_fulfillment_requested_at: null,
    domain_fulfillment_completed_at: null,
  };
}

function normalizeStoredDomainSelection(metadata) {
  const name = String(metadata?.selected_domain_name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
  const extension = String(metadata?.selected_domain_extension || "").trim().toLowerCase();
  const full = String(metadata?.selected_domain_full || "").trim().toLowerCase();
  const years = Number(metadata?.domain_registration_years || 1);

  return {
    selected_domain_name: name || null,
    selected_domain_extension: extension || null,
    selected_domain_full: full || (name && extension ? `${name}${extension}` : null),
    domain_registration_years: Number.isFinite(years) && years > 0 ? years : 1,
  };
}

async function updateSignupRecord({ supabaseUrl, serviceRoleKey, table, paymentReference, update }) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${table}?payment_reference=eq.${encodeURIComponent(paymentReference)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(update),
    },
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const text = typeof payload === "string" ? payload : JSON.stringify(payload);
    throw new Error(text || "Unable to update signup record.");
  }

  return Array.isArray(payload) ? payload[0] : payload;
}

export async function handlePaystackVerifyRequest(request, response, options) {
  const {
    allowedOrigin = "",
    paystackSecretKey,
    supabaseUrl,
    serviceRoleKey,
    signupTable = "client_signups",
  } = options;

  const origin = request.headers?.origin;
  const corsHeaders = getCorsHeaders(origin, allowedOrigin);

  if (request.method !== "GET") {
    return json(response, 405, { message: "Method not allowed." }, {
      ...corsHeaders,
      Allow: "GET",
    });
  }

  if (!paystackSecretKey || !supabaseUrl || !serviceRoleKey) {
    return json(response, 503, { message: "Payment verification is not configured yet." }, corsHeaders);
  }

  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const reference = url.searchParams.get("reference")?.trim();

  if (!reference) {
    return json(response, 400, { message: "Payment reference is required." }, corsHeaders);
  }

  try {
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      },
    });

    const verifyPayload = await verifyResponse.json().catch(() => null);

    if (!verifyResponse.ok || !verifyPayload?.status || !verifyPayload?.data) {
      throw new Error(verifyPayload?.message || "Unable to verify Paystack transaction.");
    }

    const transaction = verifyPayload.data;
    const paymentStatus = String(transaction.status || "unknown");
    const metadata = transaction.metadata || {};
    const paidAt = transaction.paid_at || transaction.paidAt || new Date().toISOString();
    const registrationYears = Number(metadata.domain_registration_years || 1);
    const domainRegistrationStartsAt = paymentStatus === "success" ? new Date(paidAt).toISOString() : null;
    const domainAutoRenewAt =
      paymentStatus === "success" ? addYearsIsoDate(domainRegistrationStartsAt, registrationYears) : null;
    const fulfillmentUpdate = getFulfillmentUpdate(paymentStatus);
    const storedDomain = normalizeStoredDomainSelection(metadata);

    const signup = await updateSignupRecord({
      supabaseUrl,
      serviceRoleKey,
      table: signupTable,
      paymentReference: reference,
      update: {
        payment_status: paymentStatus,
        auth0_user_id: metadata.auth0_user_id || null,
        domain_registration_starts_at: domainRegistrationStartsAt,
        domain_auto_renew_at: domainAutoRenewAt,
        ...(storedDomain.selected_domain_full
          ? {
              selected_domain_name: storedDomain.selected_domain_name,
              selected_domain_extension: storedDomain.selected_domain_extension,
              selected_domain_full: storedDomain.selected_domain_full,
              domain_registration_years: storedDomain.domain_registration_years,
            }
          : {}),
        ...fulfillmentUpdate,
      },
    });

    return json(
      response,
      200,
      {
        message: paymentStatus === "success" ? "Payment verified successfully." : `Payment status: ${paymentStatus}.`,
        paymentStatus,
        email: signup?.email || transaction.customer?.email || null,
        fullName: signup?.client_full_name || null,
        companyName: signup?.company_name || null,
        planName: signup?.plan_name || metadata?.plan_id || null,
        selectedDomain: signup?.selected_domain_full || metadata?.selected_domain_full || null,
        domainAutoRenewAt: signup?.domain_auto_renew_at || domainAutoRenewAt,
        domainFulfillmentStatus: signup?.domain_fulfillment_status || fulfillmentUpdate.domain_fulfillment_status,
        domainFulfillmentNotes: signup?.domain_fulfillment_notes || fulfillmentUpdate.domain_fulfillment_notes,
      },
      corsHeaders,
    );
  } catch (error) {
    return json(
      response,
      502,
      { message: error instanceof Error ? error.message : "Unable to verify Paystack transaction." },
      corsHeaders,
    );
  }
}
