import { requireAuth0IdToken, requireAuth0User } from "./auth.js";
import { registerDomainOrder } from "./hostafrica.js";

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

  if (!getAllowedOrigins(allowedOrigin).includes(origin)) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
  };
}

async function parseJsonBody(request) {
  if (typeof request.body === "string") {
    return JSON.parse(request.body);
  }

  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  const chunks = [];

  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return chunks.length > 0 ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
}

async function fetchLatestSignup({ supabaseUrl, serviceRoleKey, table, email, auth0UserId }) {
  const filters = [];

  if (auth0UserId) {
    filters.push(`auth0_user_id.eq.${encodeURIComponent(auth0UserId)}`);
  }

  if (email) {
    filters.push(`email.eq.${encodeURIComponent(email)}`);
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/${table}?select=signup_reference,payment_status,selected_domain_full,domain_fulfillment_status&or=(${filters.join(",")})&order=created_at.desc&limit=1`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error("Unable to load the current signup.");
  }

  return Array.isArray(payload) ? payload[0] ?? null : null;
}

async function fetchSignupForFulfillment({ supabaseUrl, serviceRoleKey, table, signupReference, domain }) {
  const filters = [];

  if (signupReference) {
    filters.push(`signup_reference=eq.${encodeURIComponent(signupReference)}`);
  }

  if (domain) {
    filters.push(`selected_domain_full=eq.${encodeURIComponent(domain)}`);
  }

  if (filters.length === 0) {
    throw new Error("A signup reference or domain is required.");
  }

  const query = filters.join("&");
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${table}?select=signup_reference,selected_domain_full,domain_registration_years,domain_fulfillment_status,domain_onboarding_details,payment_status&${query}&order=created_at.desc&limit=1`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const details =
      typeof payload?.message === "string"
        ? payload.message
        : typeof payload?.error_description === "string"
          ? payload.error_description
          : typeof payload?.error === "string"
            ? payload.error
            : null;

    throw new Error(details ? `Unable to load the fulfillment signup. ${details}` : "Unable to load the fulfillment signup.");
  }

  return Array.isArray(payload) ? payload[0] ?? null : null;
}

async function updateSignup({ supabaseUrl, serviceRoleKey, table, signupReference, update }) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${table}?signup_reference=eq.${encodeURIComponent(signupReference)}`,
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
    throw new Error("Unable to save domain onboarding details.");
  }

  return Array.isArray(payload) ? payload[0] ?? null : payload;
}

function normalizeValue(value) {
  return String(value || "").trim();
}

function normalizeNameservers(source) {
  return {
    ns1: normalizeValue(source?.ns1).toLowerCase(),
    ns2: normalizeValue(source?.ns2).toLowerCase(),
    ns3: normalizeValue(source?.ns3).toLowerCase(),
    ns4: normalizeValue(source?.ns4).toLowerCase(),
    ns5: normalizeValue(source?.ns5).toLowerCase(),
  };
}

function normalizeRegistrant(source) {
  const firstname = normalizeValue(source?.firstname);
  const lastname = normalizeValue(source?.lastname);
  const normalized = {
    firstname,
    lastname,
    companyname: normalizeValue(source?.companyname),
    email: normalizeValue(source?.email).toLowerCase(),
    phonenumber: normalizeValue(source?.phonenumber),
    address1: normalizeValue(source?.address1),
    city: normalizeValue(source?.city),
    state: normalizeValue(source?.state),
    postcode: normalizeValue(source?.postcode),
    country: normalizeValue(source?.country).toUpperCase(),
  };

  const required = Object.entries(normalized).filter(([, value]) => !value);
  if (!firstname || !lastname || required.length > 0) {
    throw new Error("Please complete all required registrant details before submitting.");
  }

  return normalized;
}

export async function handleDomainFulfillmentOnboardingRequest(request, response, options) {
  const {
    auth0Domain,
    auth0Audience,
    auth0ClientId,
    supabaseUrl,
    serviceRoleKey,
    signupTable = "client_signups",
    allowedOrigin = "",
  } = options;

  const corsHeaders = getCorsHeaders(request.headers?.origin, allowedOrigin);

  if (request.method === "OPTIONS") {
    return json(response, 204, {}, {
      ...corsHeaders,
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Auth0-Id-Token",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    });
  }

  if (request.method !== "POST") {
    return json(response, 405, { message: "Method not allowed." }, { ...corsHeaders, Allow: "POST, OPTIONS" });
  }

  try {
    const user = await requireAuth0User(request, { auth0Domain, auth0Audience });
    const identity = await requireAuth0IdToken(request, { auth0Domain, auth0ClientId });
    const auth0UserId = typeof user.sub === "string" ? user.sub : "";
    const identityUserId = typeof identity.sub === "string" ? identity.sub : "";
    const email = typeof identity.email === "string" ? identity.email.trim().toLowerCase() : "";

    if (!auth0UserId || !identityUserId || auth0UserId !== identityUserId) {
      return json(response, 400, { message: "Your account session could not be verified." }, corsHeaders);
    }

    const body = await parseJsonBody(request);
    const nameservers = normalizeNameservers(body?.nameservers);
    const registrant = normalizeRegistrant(body?.registrant);

    if (!nameservers.ns1 || !nameservers.ns2) {
      return json(response, 400, { message: "Primary and secondary nameservers are required." }, corsHeaders);
    }

    const signup = await fetchLatestSignup({
      supabaseUrl,
      serviceRoleKey,
      table: signupTable,
      email,
      auth0UserId,
    });

    if (!signup) {
      return json(response, 404, { message: "We could not find a paid signup for this account." }, corsHeaders);
    }

    if (signup.payment_status !== "success") {
      return json(response, 400, { message: "Domain onboarding is only available after successful payment." }, corsHeaders);
    }

    const onboardingPayload = {
      registrant,
      nameservers,
      submitted_at: new Date().toISOString(),
    };

    const updated = await updateSignup({
      supabaseUrl,
      serviceRoleKey,
      table: signupTable,
      signupReference: signup.signup_reference,
      update: {
        domain_fulfillment_status: "details_submitted",
        domain_fulfillment_notes: "Client submitted domain onboarding details. Registration and configuration can now proceed.",
        domain_fulfillment_requested_at: new Date().toISOString(),
        domain_onboarding_details: onboardingPayload,
      },
    });

    return json(
      response,
      200,
      {
        message: `Domain onboarding submitted for ${signup.selected_domain_full || "your selected domain"}.`,
        fulfillmentStatus: updated?.domain_fulfillment_status || "details_submitted",
        selectedDomain: updated?.selected_domain_full || signup.selected_domain_full || null,
      },
      corsHeaders,
    );
  } catch (error) {
    return json(
      response,
      500,
      { message: error instanceof Error ? error.message : "Unable to submit domain onboarding right now." },
      corsHeaders,
    );
  }
}

function requireAdminToken(request, adminToken) {
  const headerToken = String(request.headers?.["x-admin-token"] || "").trim();

  if (!adminToken) {
    throw new Error("Domain fulfillment admin token is not configured yet.");
  }

  if (!headerToken || headerToken !== adminToken) {
    const error = new Error("Unauthorized.");
    error.statusCode = 401;
    throw error;
  }
}

function normalizeOnboardingForRegistration(source) {
  const registrant = source?.registrant;
  const nameservers = source?.nameservers;

  if (!registrant || !nameservers) {
    throw new Error("The stored onboarding details are incomplete.");
  }

  return {
    regperiod: Number(source?.regperiod || 1),
    nameservers,
    contacts: {
      registrant: {
        ...registrant,
        fullname: `${registrant.firstname || ""} ${registrant.lastname || ""}`.trim(),
      },
    },
    addons: {
      dnsmanagement: true,
      emailforwarding: false,
      idprotection: false,
    },
  };
}

export async function handleDomainFulfillmentSubmitRequest(request, response, options) {
  const {
    supabaseUrl,
    serviceRoleKey,
    signupTable = "client_signups",
    allowedOrigin = "",
    adminToken,
  } = options;

  const corsHeaders = getCorsHeaders(request.headers?.origin, allowedOrigin);

  if (request.method === "OPTIONS") {
    return json(response, 204, {}, {
      ...corsHeaders,
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    });
  }

  if (request.method !== "POST") {
    return json(response, 405, { message: "Method not allowed." }, { ...corsHeaders, Allow: "POST, OPTIONS" });
  }

  try {
    requireAdminToken(request, adminToken);

    const body = await parseJsonBody(request);
    const dryRun = body?.dryRun === true;
    const signup = await fetchSignupForFulfillment({
      supabaseUrl,
      serviceRoleKey,
      table: signupTable,
      signupReference: String(body?.signupReference || "").trim(),
      domain: String(body?.domain || "").trim().toLowerCase(),
    });

    if (!signup) {
      return json(response, 404, { message: "We could not find a fulfillment-ready signup." }, corsHeaders);
    }

    if (signup.payment_status !== "success") {
      return json(response, 400, { message: "The signup payment has not been verified yet." }, corsHeaders);
    }

    if (!["details_submitted", "queued"].includes(String(signup.domain_fulfillment_status || ""))) {
      return json(
        response,
        400,
        { message: `This signup is not ready for submission. Current status: ${signup.domain_fulfillment_status || "unknown"}.` },
        corsHeaders,
      );
    }

    const onboarding = normalizeOnboardingForRegistration(signup.domain_onboarding_details || {});
    const registrationPayload = {
      domain: signup.selected_domain_full,
      regperiod: Number(signup.domain_registration_years || onboarding.regperiod || 1),
      nameservers: onboarding.nameservers,
      contacts: onboarding.contacts,
      addons: onboarding.addons,
    };

    if (dryRun) {
      return json(
        response,
        200,
        {
          message: `Dry run passed. ${signup.selected_domain_full} is ready for registrar submission.`,
          dryRun: true,
          signupReference: signup.signup_reference,
          payload: registrationPayload,
        },
        corsHeaders,
      );
    }

    const registrarResult = await registerDomainOrder(registrationPayload);
    const updated = await updateSignup({
      supabaseUrl,
      serviceRoleKey,
      table: signupTable,
      signupReference: signup.signup_reference,
      update: {
        domain_fulfillment_status: "submitted_to_registrar",
        domain_fulfillment_notes: "Domain registration was submitted to HostAfrica for processing.",
        domain_fulfillment_completed_at: null,
      },
    });

    return json(
      response,
      200,
      {
        message: `Domain registration submitted for ${signup.selected_domain_full}.`,
        signupReference: signup.signup_reference,
        fulfillmentStatus: updated?.domain_fulfillment_status || "submitted_to_registrar",
        registrarResult,
      },
      corsHeaders,
    );
  } catch (error) {
    const statusCode = typeof error?.statusCode === "number" ? error.statusCode : 500;

    return json(
      response,
      statusCode,
      { message: error instanceof Error ? error.message : "Unable to submit domain fulfillment right now." },
      corsHeaders,
    );
  }
}
