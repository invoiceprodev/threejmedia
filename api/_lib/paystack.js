function json(response, status, payload, extraHeaders = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    ...extraHeaders,
  });
  response.end(JSON.stringify(payload));
}

function getCorsHeaders(origin, allowedOrigin) {
  if (!origin || !allowedOrigin) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    Vary: "Origin",
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

    const signup = await updateSignupRecord({
      supabaseUrl,
      serviceRoleKey,
      table: signupTable,
      paymentReference: reference,
      update: {
        payment_status: paymentStatus,
        auth0_user_id: metadata.auth0_user_id || null,
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
