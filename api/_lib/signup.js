import { randomUUID } from "node:crypto";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const planCatalog = {
  starter: {
    id: "starter",
    name: "Starter",
    amountZar: 1999,
  },
  "business-website": {
    id: "business-website",
    name: "Business Website",
    amountZar: 4999,
  },
  pro: {
    id: "pro",
    name: "Pro",
    amountZar: 7999,
  },
};

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

async function parseJsonBody(request) {
  if (typeof request.body === "string") {
    return JSON.parse(request.body);
  }

  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  if (!request.on) {
    return {};
  }

  const chunks = [];

  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function createAuth0User({ domain, clientId, connection, email, password, fullName, companyName }) {
  const response = await fetch(`https://${domain}/dbconnections/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      connection,
      email,
      password,
      name: fullName,
      user_metadata: {
        company_name: companyName,
        full_name: fullName,
      },
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.description || payload?.message || "Unable to create your account right now.");
  }

  return payload;
}

async function initializePaystackTransaction({
  secretKey,
  email,
  fullName,
  companyName,
  plan,
  callbackUrl,
  metadata,
}) {
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secretKey}`,
    },
    body: JSON.stringify({
      email,
      amount: plan.amountZar * 100,
      currency: "ZAR",
      callback_url: callbackUrl,
      metadata: {
        custom_fields: [
          {
            display_name: "Company Name",
            variable_name: "company_name",
            value: companyName,
          },
          {
            display_name: "Client Full Name",
            variable_name: "client_full_name",
            value: fullName,
          },
          {
            display_name: "Selected Plan",
            variable_name: "selected_plan",
            value: plan.name,
          },
        ],
        ...metadata,
      },
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.status || !payload?.data?.authorization_url) {
    throw new Error(payload?.message || "Unable to start Paystack checkout right now.");
  }

  return payload.data;
}

async function insertSignupRecord({
  supabaseUrl,
  serviceRoleKey,
  table,
  signup,
}) {
  if (!supabaseUrl || !serviceRoleKey) {
    return;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(signup),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || "Unable to save signup record.");
  }
}

export async function handleSignupRequest(request, response, options) {
  const {
    allowedOrigin = "",
    auth0Domain,
    auth0ClientId,
    auth0Connection,
    paystackSecretKey,
    paystackCallbackUrl,
    supabaseUrl,
    serviceRoleKey,
    signupTable = "client_signups",
  } = options;

  const origin = request.headers?.origin;
  const corsHeaders = getCorsHeaders(origin, allowedOrigin);

  if (request.method === "OPTIONS") {
    return json(response, 204, {}, {
      ...corsHeaders,
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    });
  }

  if (request.method !== "POST") {
    return json(response, 405, { message: "Method not allowed." }, {
      ...corsHeaders,
      Allow: "POST, OPTIONS",
    });
  }

  if (!auth0Domain || !auth0ClientId || !auth0Connection || !paystackSecretKey || !paystackCallbackUrl) {
    return json(response, 503, { message: "Signup and payment are not configured yet." }, corsHeaders);
  }

  let payload;

  try {
    payload = await parseJsonBody(request);
  } catch {
    return json(response, 400, { message: "Invalid request payload." }, corsHeaders);
  }

  const companyName = String(payload?.companyName ?? "").trim();
  const fullName = String(payload?.fullName ?? "").trim();
  const email = String(payload?.email ?? "").trim().toLowerCase();
  const password = String(payload?.password ?? "");
  const planId = String(payload?.planId ?? "").trim();
  const plan = planCatalog[planId];

  if (!companyName || !fullName || !email || !password || !plan) {
    return json(response, 400, { message: "Company, client details, password, and plan are required." }, corsHeaders);
  }

  if (!emailPattern.test(email)) {
    return json(response, 400, { message: "Please enter a valid email address." }, corsHeaders);
  }

  if (password.length < 8) {
    return json(response, 400, { message: "Use at least 8 characters for your password." }, corsHeaders);
  }

  const signupReference = randomUUID();

  try {
    const auth0User = await createAuth0User({
      domain: auth0Domain,
      clientId: auth0ClientId,
      connection: auth0Connection,
      email,
      password,
      fullName,
      companyName,
    });

    const paystackTransaction = await initializePaystackTransaction({
      secretKey: paystackSecretKey,
      email,
      fullName,
      companyName,
      plan,
      callbackUrl: paystackCallbackUrl,
      metadata: {
        signup_reference: signupReference,
        auth0_email: email,
        auth0_user_id: auth0User?._id || auth0User?.user_id || "",
        plan_id: plan.id,
      },
    });

    await insertSignupRecord({
      supabaseUrl,
      serviceRoleKey,
      table: signupTable,
      signup: {
        signup_reference: signupReference,
        company_name: companyName,
        client_full_name: fullName,
        email,
        plan_id: plan.id,
        plan_name: plan.name,
        amount_zar: plan.amountZar,
        auth0_user_id: auth0User?._id || auth0User?.user_id || null,
        payment_reference: paystackTransaction.reference,
        payment_status: "initialized",
        payment_provider: "paystack",
        created_at: new Date().toISOString(),
      },
    });

    return json(
      response,
      200,
      {
        message: "Signup started successfully.",
        authorizationUrl: paystackTransaction.authorization_url,
        reference: paystackTransaction.reference,
      },
      corsHeaders,
    );
  } catch (error) {
    return json(
      response,
      502,
      {
        message: error instanceof Error ? error.message : "We could not complete signup right now.",
      },
      corsHeaders,
    );
  }
}
