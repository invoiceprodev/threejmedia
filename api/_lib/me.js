import { requireAuth0User } from "./auth.js";

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

async function fetchLatestSignup({ supabaseUrl, serviceRoleKey, table, email }) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${table}?select=company_name,plan_name,payment_status,payment_reference,created_at&email=eq.${encodeURIComponent(email)}&order=created_at.desc&limit=1`,
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

    const email = typeof user.email === "string" ? user.email : "";

    if (!email) {
      return json(response, 400, { message: "No email claim was found in the token." }, corsHeaders);
    }

    const latestSignup = await fetchLatestSignup({
      supabaseUrl,
      serviceRoleKey,
      table: signupTable,
      email,
    });

    return json(
      response,
      200,
      {
        email,
        fullName: typeof user.name === "string" ? user.name : null,
        auth0UserId: typeof user.sub === "string" ? user.sub : "",
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
