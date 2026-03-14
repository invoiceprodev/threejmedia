import { requireAuth0User } from "./auth.js";

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
    `${supabaseUrl}/rest/v1/${table}?select=company_name,plan_name,payment_status,payment_reference,created_at,email&or=(${filters.join(",")})&order=created_at.desc&limit=1`,
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
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

    const emailFromHeader = String(request.headers?.["x-user-email"] || request.headers?.["X-User-Email"] || "").trim();
    const auth0UserIdFromHeader = String(
      request.headers?.["x-auth0-user-id"] || request.headers?.["X-Auth0-User-Id"] || "",
    ).trim();
    const auth0UserId = typeof user.sub === "string" ? user.sub : "";

    if (auth0UserIdFromHeader && auth0UserId && auth0UserIdFromHeader !== auth0UserId) {
      return json(response, 400, { message: "Your account session could not be verified." }, corsHeaders);
    }

    const email = typeof user.email === "string" ? user.email : emailFromHeader;

    const latestSignup = await fetchLatestSignup({
      supabaseUrl,
      serviceRoleKey,
      table: signupTable,
      email,
      auth0UserId: auth0UserId || auth0UserIdFromHeader,
    });

    return json(
      response,
      200,
      {
        email: email || latestSignup?.email || "",
        fullName: typeof user.name === "string" ? user.name : null,
        auth0UserId,
        latestSignup: latestSignup
          ? {
              companyName: latestSignup.company_name,
              planName: latestSignup.plan_name,
              paymentStatus: latestSignup.payment_status,
              paymentReference: latestSignup.payment_reference,
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
