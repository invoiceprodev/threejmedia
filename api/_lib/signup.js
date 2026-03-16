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

const supportedDomainExtensions = new Set([".co.za", ".com", ".org", ".net"]);

function normalizeDomainLabel(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/[^a-z0-9-]/g, "");
}

function normalizeDomainSelection(domainName, domainExtension) {
  const name = normalizeDomainLabel(domainName).replace(/\..*$/, "");
  const extension = String(domainExtension || "").trim().toLowerCase();

  if (!name || !extension || !supportedDomainExtensions.has(extension)) {
    throw new Error("Please choose a valid domain name and extension.");
  }

  return {
    name,
    extension,
    full: `${name}${extension}`,
    years: 1,
  };
}

function getStoredDomainSelection(record) {
  const name = normalizeDomainLabel(record?.selected_domain_name);
  const extension = String(record?.selected_domain_extension || "").trim().toLowerCase();
  const fullFromParts =
    name && extension && supportedDomainExtensions.has(extension) ? `${name}${extension}` : "";
  const full = normalizeDomainLabel(record?.selected_domain_full) || fullFromParts;
  const years = Number(record?.domain_registration_years || 1);

  return {
    name,
    extension,
    full,
    years: Number.isFinite(years) && years > 0 ? years : 1,
  };
}

function maskEmailForLog(email) {
  const normalized = String(email || "").trim().toLowerCase();

  if (!normalized.includes("@")) {
    return "";
  }

  const [localPart, domain] = normalized.split("@");
  const visibleLocal = localPart.slice(0, 2);
  return `${visibleLocal}${"*".repeat(Math.max(localPart.length - visibleLocal.length, 1))}@${domain}`;
}

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

function normalizeAuth0SignupError(payload) {
  const description = String(payload?.description || payload?.message || "").trim();
  const normalized = description.toLowerCase();

  if (!description) {
    return "We couldn't create your account right now.";
  }

  if (
    normalized.includes("user already exists") ||
    normalized.includes("already registered") ||
    normalized.includes("already exists")
  ) {
    return "An account with this email already exists. Try signing in instead.";
  }

  if (
    normalized.includes("passwordstrengtherror") ||
    normalized.includes("password is too weak") ||
    normalized.includes("password strength") ||
    normalized.includes("password is weak") ||
    normalized.includes("invalid password")
  ) {
    return "Your password is too weak. Use at least 8 characters with uppercase, lowercase, numbers, and a symbol.";
  }

  if (normalized.includes("invalid sign up") || normalized.includes("invalid signup")) {
    return "We couldn't create your account with those details. Check the email format and use a stronger password.";
  }

  if (normalized.includes("signup is disabled") || normalized.includes("connection is disabled")) {
    return "Account signup is temporarily unavailable. Please contact support.";
  }

  return description;
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
    throw new Error(normalizeAuth0SignupError(payload));
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
          ...(metadata?.selected_domain_full
            ? [
                {
                  display_name: "Selected Domain",
                  variable_name: "selected_domain_full",
                  value: metadata.selected_domain_full,
                },
              ]
            : []),
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

async function fetchLatestPendingSignup({ supabaseUrl, serviceRoleKey, table, email, auth0UserId }) {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Signup storage is not configured yet.");
  }

  const filters = [];

  if (auth0UserId) {
    filters.push(`auth0_user_id.eq.${encodeURIComponent(auth0UserId)}`);
  }

  if (email) {
    filters.push(`email.eq.${encodeURIComponent(email)}`);
  }

  if (filters.length === 0) {
    throw new Error("We could not identify your pending signup.");
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/${table}?select=signup_reference,company_name,client_full_name,email,plan_id,plan_name,amount_zar,selected_domain_name,selected_domain_extension,selected_domain_full,domain_registration_years,domain_registration_starts_at,domain_auto_renew_at,domain_fulfillment_status,domain_fulfillment_notes,domain_fulfillment_requested_at,domain_fulfillment_completed_at,auth0_user_id,payment_reference,payment_status,created_at&payment_status=in.(pending_verification,initialized)&or=(${filters.join(",")})&order=created_at.desc&limit=1`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error("Unable to load your pending signup.");
  }

  return Array.isArray(payload) ? payload[0] ?? null : null;
}

async function updateSignupRecordByReference({ supabaseUrl, serviceRoleKey, table, signupReference, update }) {
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
    const errorText = typeof payload === "string" ? payload : JSON.stringify(payload);
    throw new Error(errorText || "Unable to update your signup record.");
  }

  return Array.isArray(payload) ? payload[0] ?? null : payload;
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

function getVerifiedIdentity({ auth0User, auth0Identity }) {
  const auth0UserId = typeof auth0User?.sub === "string" ? auth0User.sub : "";
  const identityUserId = typeof auth0Identity?.sub === "string" ? auth0Identity.sub : "";
  const email = typeof auth0Identity?.email === "string" ? auth0Identity.email.trim().toLowerCase() : "";
  const emailVerified = auth0Identity?.email_verified === true;

  if (!auth0UserId || !identityUserId) {
    throw new Error("Your Auth0 session does not include a valid user identifier.");
  }

  if (identityUserId !== auth0UserId) {
    throw new Error("Your sign-in details could not be verified. Please sign in again.");
  }

  if (!email) {
    throw new Error("Your verified account does not include an email address.");
  }

  if (!emailVerified) {
    const error = new Error("Please confirm your email address before continuing to payment.");
    error.statusCode = 409;
    throw error;
  }

  return {
    auth0UserId,
    email,
  };
}

export async function handleSignupRequest(request, response, options) {
  const {
    allowedOrigin = "",
    auth0Domain,
    auth0ClientId,
    auth0Connection,
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

  if (!auth0Domain || !auth0ClientId || !auth0Connection) {
    return json(response, 503, { message: "Signup is not configured yet." }, corsHeaders);
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
  let selectedDomain;

  if (!companyName || !fullName || !email || !password || !plan) {
    return json(response, 400, { message: "Company, client details, password, and plan are required." }, corsHeaders);
  }

  try {
    selectedDomain = normalizeDomainSelection(payload?.domainName, payload?.domainExtension);
  } catch (error) {
    return json(
      response,
      400,
      { message: error instanceof Error ? error.message : "Please choose a valid domain." },
      corsHeaders,
    );
  }

  if (!emailPattern.test(email)) {
    return json(response, 400, { message: "Please enter a valid email address." }, corsHeaders);
  }

  if (password.length < 8) {
    return json(response, 400, { message: "Use at least 8 characters for your password." }, corsHeaders);
  }

  const signupReference = randomUUID();
  let failedStep = "unknown";

  try {
    failedStep = "auth0_signup";
    const auth0User = await createAuth0User({
      domain: auth0Domain,
      clientId: auth0ClientId,
      connection: auth0Connection,
      email,
      password,
      fullName,
      companyName,
    });

    failedStep = "supabase_insert";
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
        selected_domain_name: selectedDomain.name,
        selected_domain_extension: selectedDomain.extension,
        selected_domain_full: selectedDomain.full,
        domain_registration_years: selectedDomain.years,
        domain_registration_starts_at: null,
        domain_auto_renew_at: null,
        domain_fulfillment_status: "awaiting_payment",
        domain_fulfillment_notes: "Waiting for successful plan payment before domain fulfillment can start.",
        domain_fulfillment_requested_at: null,
        domain_fulfillment_completed_at: null,
        auth0_user_id: auth0User?._id || auth0User?.user_id || null,
        payment_reference: null,
        payment_status: "pending_verification",
        payment_provider: "paystack",
        created_at: new Date().toISOString(),
      },
    });

    return json(
      response,
      200,
      {
        message: "Account created. Please verify your email before continuing to payment.",
        requiresEmailVerification: true,
        email,
      },
      corsHeaders,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "We could not complete signup right now.";

    console.error("[signup] request failed", {
      step: failedStep,
      signupReference,
      email: maskEmailForLog(email),
      planId,
      message,
    });

    return json(
      response,
      502,
      {
        message,
        step: failedStep,
      },
      corsHeaders,
    );
  }
}

export async function handleSignupContinueRequest(request, response, options) {
  const {
    allowedOrigin = "",
    auth0Domain,
    auth0Audience,
    auth0ClientId,
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
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Auth0-Id-Token",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    });
  }

  if (request.method !== "POST") {
    return json(response, 405, { message: "Method not allowed." }, {
      ...corsHeaders,
      Allow: "POST, OPTIONS",
    });
  }

  if (!paystackSecretKey || !paystackCallbackUrl || !supabaseUrl || !serviceRoleKey) {
    return json(response, 503, { message: "Payment is not configured yet." }, corsHeaders);
  }

  try {
    await parseJsonBody(request);
    const { requireAuth0IdToken, requireAuth0User } = await import("./auth.js");
    const user = await requireAuth0User(request, { auth0Domain, auth0Audience });
    const identityClaims = await requireAuth0IdToken(request, { auth0Domain, auth0ClientId });
    const identity = getVerifiedIdentity({
      auth0User: user,
      auth0Identity: identityClaims,
    });
    const pendingSignup = await fetchLatestPendingSignup({
      supabaseUrl,
      serviceRoleKey,
      table: signupTable,
      email: identity.email,
      auth0UserId: identity.auth0UserId,
    });

    if (!pendingSignup) {
      return json(response, 404, { message: "We could not find a pending signup for this account." }, corsHeaders);
    }

    const plan = planCatalog[pendingSignup.plan_id];

    if (!plan) {
      return json(response, 400, { message: "The selected plan is no longer available." }, corsHeaders);
    }

    const paystackTransaction = await initializePaystackTransaction({
      secretKey: paystackSecretKey,
      email: pendingSignup.email || identity.email,
      fullName: pendingSignup.client_full_name,
      companyName: pendingSignup.company_name,
      plan,
      callbackUrl: paystackCallbackUrl,
      metadata: {
        ...getStoredDomainSelection(pendingSignup),
        signup_reference: pendingSignup.signup_reference,
        auth0_email: pendingSignup.email || identity.email,
        auth0_user_id: pendingSignup.auth0_user_id || identity.auth0UserId,
        plan_id: plan.id,
      },
    });

    const selectedDomain = getStoredDomainSelection(pendingSignup);

    await updateSignupRecordByReference({
      supabaseUrl,
      serviceRoleKey,
      table: signupTable,
      signupReference: pendingSignup.signup_reference,
      update: {
        payment_reference: paystackTransaction.reference,
        payment_status: "initialized",
        auth0_user_id: pendingSignup.auth0_user_id || identity.auth0UserId,
        ...(selectedDomain.name
          ? {
              selected_domain_name: selectedDomain.name,
              selected_domain_extension: selectedDomain.extension,
              selected_domain_full: selectedDomain.full,
              domain_registration_years: selectedDomain.years,
            }
          : {}),
      },
    });

    return json(
      response,
      200,
      {
        message: "Email verified. Redirecting you to secure checkout.",
        authorizationUrl: paystackTransaction.authorization_url,
        reference: paystackTransaction.reference,
      },
      corsHeaders,
    );
  } catch (error) {
    const statusCode = typeof error?.statusCode === "number" ? error.statusCode : 502;
    const message = error instanceof Error ? error.message : "We could not continue to payment right now.";

    console.error("[signup] continue request failed", {
      message,
      statusCode,
    });

    return json(response, statusCode, { message }, corsHeaders);
  }
}
