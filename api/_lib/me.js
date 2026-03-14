import { requireAuth0IdToken, requireAuth0User } from "./auth.js";

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

async function fetchLatestSignup({ supabaseUrl, serviceRoleKey, table, email, auth0UserId }) {
  const filters = [];

  if (auth0UserId) {
    filters.push(`auth0_user_id.eq.${encodeURIComponent(auth0UserId)}`);
  }

  if (email) {
    filters.push(`email.eq.${encodeURIComponent(email)}`);
  }

  if (filters.length === 0) {
    throw new Error("Unable to identify the current account.");
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/${table}?select=company_name,plan_name,payment_status,payment_reference,selected_domain_full,domain_auto_renew_at,domain_fulfillment_status,domain_fulfillment_notes,created_at,email&or=(${filters.join(",")})&order=created_at.desc&limit=1`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error("Unable to load signup details.");
  }

  return Array.isArray(payload) ? payload[0] ?? null : null;
}

export async function handleMeRequest(request, response, options) {
  const {
    auth0Domain,
    auth0Audience,
    auth0ClientId,
    supabaseUrl,
    serviceRoleKey,
    signupTable = "client_signups",
    allowedOrigin = "",
  } = options;

  const origin = request.headers?.origin;
  const corsHeaders = getCorsHeaders(origin, allowedOrigin);

  if (request.method === "OPTIONS") {
    return json(response, 204, {}, {
      ...corsHeaders,
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Auth0-Id-Token",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    });
  }

  if (request.method !== "GET") {
    return json(response, 405, { message: "Method not allowed." }, { ...corsHeaders, Allow: "GET, OPTIONS" });
  }

  try {
    const user = await requireAuth0User(request, {
      auth0Domain,
      auth0Audience,
    });
    const identity = await requireAuth0IdToken(request, {
      auth0Domain,
      auth0ClientId,
    });
    const auth0UserId = typeof user.sub === "string" ? user.sub : "";
    const identityUserId = typeof identity.sub === "string" ? identity.sub : "";
    const email = typeof identity.email === "string" ? identity.email.trim().toLowerCase() : "";
    const fullName =
      typeof identity.name === "string" ? identity.name : typeof user.name === "string" ? user.name : null;

    if (!auth0UserId || !identityUserId || identityUserId !== auth0UserId) {
      return json(response, 400, { message: "Your account session could not be verified." }, corsHeaders);
    }

    const latestSignup = await fetchLatestSignup({
      supabaseUrl,
      serviceRoleKey,
      table: signupTable,
      email,
      auth0UserId,
    });

    return json(
      response,
      200,
      {
        email: email || latestSignup?.email || "",
        fullName,
        auth0UserId,
        latestSignup: latestSignup
          ? {
              companyName: latestSignup.company_name,
              planName: latestSignup.plan_name,
              paymentStatus: latestSignup.payment_status,
              paymentReference: latestSignup.payment_reference,
              selectedDomain: latestSignup.selected_domain_full,
              domainAutoRenewAt: latestSignup.domain_auto_renew_at,
              domainFulfillmentStatus: latestSignup.domain_fulfillment_status,
              domainFulfillmentNotes: latestSignup.domain_fulfillment_notes,
              createdAt: latestSignup.created_at,
            }
          : null,
      },
      corsHeaders,
    );
  } catch (error) {
    return json(
      response,
      401,
      {
        message: error instanceof Error ? error.message : "Unauthorized.",
      },
      corsHeaders,
    );
  }
}
