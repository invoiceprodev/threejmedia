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

function getAdminEmails(value) {
  return String(value || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getClientKey(signup) {
  const email = String(signup?.email || "").trim().toLowerCase();
  const auth0UserId = String(signup?.auth0_user_id || "").trim();
  return auth0UserId || email;
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

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeOptionalText(value) {
  const normalized = normalizeText(value);
  return normalized || null;
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

function formatCurrencyZar(amount) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function summarizeReadiness({ allowedOrigin, adminEmails, paystackCallbackUrl, paystackSecretKey, auth0Domain, auth0Audience }) {
  const allowedOrigins = getAllowedOrigins(allowedOrigin);

  return [
    {
      id: "admin-access",
      label: "Admin access list",
      ready: adminEmails.length > 0,
      detail: adminEmails.length > 0 ? `${adminEmails.length} admin email(s) allowed.` : "Add ADMIN_ALLOWED_EMAILS on Railway.",
    },
    {
      id: "admin-origin",
      label: "Admin origin CORS",
      ready: allowedOrigins.includes("https://admin.threejmedia.co.za"),
      detail: allowedOrigins.includes("https://admin.threejmedia.co.za")
        ? "Admin subdomain is allowed to call the API."
        : "Add https://admin.threejmedia.co.za to ALLOWED_ORIGIN.",
    },
    {
      id: "auth0",
      label: "Auth0 protection",
      ready: Boolean(auth0Domain && auth0Audience),
      detail: auth0Domain && auth0Audience ? "Admin API is protected with Auth0." : "Set AUTH0_DOMAIN and AUTH0_AUDIENCE.",
    },
    {
      id: "paystack",
      label: "Paystack live",
      ready: Boolean(paystackSecretKey && paystackCallbackUrl),
      detail:
        paystackSecretKey && paystackCallbackUrl
          ? "Live checkout keys and callback are configured."
          : "Set PAYSTACK_SECRET_KEY and PAYSTACK_CALLBACK_URL.",
    },
  ];
}

async function fetchSignups({ supabaseUrl, serviceRoleKey, table }) {
  const query =
    "select=signup_reference,company_name,client_full_name,email,plan_id,plan_name,amount_zar,selected_domain_full,domain_registration_years,domain_auto_renew_at,domain_fulfillment_status,domain_fulfillment_notes,auth0_user_id,payment_reference,payment_status,created_at&order=created_at.desc&limit=1000";
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error("Unable to load admin signup records.");
  }

  return Array.isArray(payload) ? payload : [];
}

async function requireAdminIdentity(request, options) {
  const { auth0Domain, auth0Audience, auth0ClientId, adminAllowedEmails = "" } = options;
  const adminEmails = getAdminEmails(adminAllowedEmails);

  if (adminEmails.length === 0) {
    const error = new Error("Admin access is not configured yet.");
    error.statusCode = 503;
    throw error;
  }

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
    typeof identity.name === "string" ? identity.name : typeof user.name === "string" ? user.name : "";

  if (!auth0UserId || !identityUserId || identityUserId !== auth0UserId) {
    const error = new Error("Your admin session could not be verified.");
    error.statusCode = 400;
    throw error;
  }

  if (!adminEmails.includes(email)) {
    const error = new Error("Your account does not have admin access.");
    error.statusCode = 403;
    throw error;
  }

  return {
    admin: {
      email,
      fullName,
      auth0UserId,
    },
    adminEmails,
  };
}

async function listTableRows({ supabaseUrl, serviceRoleKey, table, select, orderBy = "created_at.desc", limit = 50 }) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${table}?select=${encodeURIComponent(select)}&order=${encodeURIComponent(orderBy)}&limit=${limit}`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`Unable to load ${table}.`);
  }

  return Array.isArray(payload) ? payload : [];
}

async function insertTableRow({ supabaseUrl, serviceRoleKey, table, record }) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify(record),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const errorText = typeof payload === "string" ? payload : JSON.stringify(payload);
    throw new Error(errorText || `Unable to create ${table} record.`);
  }

  return Array.isArray(payload) ? payload[0] ?? null : payload;
}

function buildAdminSnapshot(signups, options) {
  const latestByClient = new Map();

  for (const signup of signups) {
    const key = getClientKey(signup);

    if (!key || latestByClient.has(key)) {
      continue;
    }

    latestByClient.set(key, signup);
  }

  const latestClients = Array.from(latestByClient.values());
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextThirtyDays = new Date(now);
  nextThirtyDays.setUTCDate(nextThirtyDays.getUTCDate() + 30);

  const monthlyRevenueZar = signups.reduce((sum, signup) => {
    if (signup.payment_status !== "success") {
      return sum;
    }

    const createdAt = signup.created_at ? new Date(signup.created_at) : null;

    if (!createdAt || Number.isNaN(createdAt.getTime()) || createdAt < monthStart) {
      return sum;
    }

    return sum + Number(signup.amount_zar || 0);
  }, 0);

  const activeSubscriptions = latestClients.filter((signup) => signup.payment_status === "success").length;
  const pendingFulfillment = latestClients.filter(
    (signup) => signup.payment_status === "success" && signup.domain_fulfillment_status !== "completed",
  ).length;
  const paymentAttention = latestClients.filter(
    (signup) => signup.payment_status && signup.payment_status !== "success",
  ).length;

  const recentClients = latestClients.slice(0, 8).map((signup) => ({
    id: signup.signup_reference,
    companyName: signup.company_name,
    fullName: signup.client_full_name,
    email: signup.email,
    planName: signup.plan_name,
    paymentStatus: signup.payment_status,
    selectedDomain: signup.selected_domain_full,
    createdAt: signup.created_at,
  }));

  const renewalSchedule = latestClients
    .filter((signup) => signup.payment_status === "success" && signup.domain_auto_renew_at)
    .filter((signup) => {
      const renewalDate = new Date(signup.domain_auto_renew_at);
      return renewalDate >= now && renewalDate <= nextThirtyDays;
    })
    .sort((left, right) => new Date(left.domain_auto_renew_at).getTime() - new Date(right.domain_auto_renew_at).getTime())
    .slice(0, 8)
    .map((signup) => ({
      id: signup.signup_reference,
      companyName: signup.company_name,
      email: signup.email,
      domain: signup.selected_domain_full,
      renewsAt: signup.domain_auto_renew_at,
      planName: signup.plan_name,
    }));

  const subscriptions = latestClients.slice(0, 10).map((signup) => ({
    id: signup.signup_reference,
    companyName: signup.company_name,
    email: signup.email,
    planName: signup.plan_name,
    amountZar: signup.amount_zar,
    paymentStatus: signup.payment_status,
    paymentReference: signup.payment_reference,
    fulfillmentStatus: signup.domain_fulfillment_status,
    autoRenewAt: signup.domain_auto_renew_at,
  }));

  return {
    metrics: {
      totalClients: latestClients.length,
      activeSubscriptions,
      pendingFulfillment,
      paymentAttention,
      monthlyRevenueZar,
      monthlyRevenueLabel: formatCurrencyZar(monthlyRevenueZar),
    },
    recentClients,
    renewalSchedule,
    subscriptions,
    readiness: summarizeReadiness(options),
  };
}

export async function handleAdminOverviewRequest(request, response, options) {
  const {
    auth0Domain,
    auth0Audience,
    auth0ClientId,
    supabaseUrl,
    serviceRoleKey,
    signupTable = "client_signups",
    allowedOrigin = "",
    adminAllowedEmails = "",
    paystackSecretKey,
    paystackCallbackUrl,
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

  if (!supabaseUrl || !serviceRoleKey) {
    return json(response, 503, { message: "Admin data is not configured yet." }, corsHeaders);
  }

  try {
    const { admin, adminEmails } = await requireAdminIdentity(request, {
      auth0Domain,
      auth0Audience,
      auth0ClientId,
      adminAllowedEmails,
    });

    const signups = await fetchSignups({
      supabaseUrl,
      serviceRoleKey,
      table: signupTable,
    });
    const snapshot = buildAdminSnapshot(signups, {
      allowedOrigin,
      adminEmails,
      paystackSecretKey,
      paystackCallbackUrl,
      auth0Domain,
      auth0Audience,
    });

    return json(
      response,
      200,
      {
        admin,
        ...snapshot,
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

export async function handleAdminClientsRequest(request, response, options) {
  const {
    auth0Domain,
    auth0Audience,
    auth0ClientId,
    supabaseUrl,
    serviceRoleKey,
    allowedOrigin = "",
    adminAllowedEmails = "",
    adminClientsTable = "admin_clients",
  } = options;

  const origin = request.headers?.origin;
  const corsHeaders = getCorsHeaders(origin, allowedOrigin);

  if (request.method === "OPTIONS") {
    return json(response, 204, {}, {
      ...corsHeaders,
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Auth0-Id-Token",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return json(response, 503, { message: "Admin data is not configured yet." }, corsHeaders);
  }

  try {
    const { admin } = await requireAdminIdentity(request, {
      auth0Domain,
      auth0Audience,
      auth0ClientId,
      adminAllowedEmails,
    });

    if (request.method === "GET") {
      const clients = await listTableRows({
        supabaseUrl,
        serviceRoleKey,
        table: adminClientsTable,
        select: "id,auth0_user_id,signup_reference,company_name,primary_contact_name,primary_email,primary_phone,status,source,tags,notes,metadata,created_at,updated_at",
      });

      return json(response, 200, { admin, data: clients }, corsHeaders);
    }

    if (request.method === "POST") {
      const body = await parseJsonBody(request);
      const companyName = normalizeText(body?.companyName);
      const primaryEmail = normalizeEmail(body?.primaryEmail);

      if (!companyName || !primaryEmail) {
        return json(response, 400, { message: "Company name and primary email are required." }, corsHeaders);
      }

      const client = await insertTableRow({
        supabaseUrl,
        serviceRoleKey,
        table: adminClientsTable,
        record: {
          auth0_user_id: normalizeOptionalText(body?.auth0UserId),
          signup_reference: normalizeOptionalText(body?.signupReference),
          company_name: companyName,
          primary_contact_name: normalizeOptionalText(body?.primaryContactName),
          primary_email: primaryEmail,
          primary_phone: normalizeOptionalText(body?.primaryPhone),
          status: normalizeText(body?.status) || "lead",
          source: normalizeText(body?.source) || "admin_manual",
          tags: normalizeStringArray(body?.tags),
          notes: normalizeOptionalText(body?.notes),
          metadata: typeof body?.metadata === "object" && body.metadata ? body.metadata : {},
        },
      });

      return json(response, 201, { admin, data: client }, corsHeaders);
    }

    return json(response, 405, { message: "Method not allowed." }, { ...corsHeaders, Allow: "GET, POST, OPTIONS" });
  } catch (error) {
    const statusCode = typeof error?.statusCode === "number" ? error.statusCode : 401;
    return json(response, statusCode, { message: error instanceof Error ? error.message : "Unauthorized." }, corsHeaders);
  }
}

export async function handleAdminSubscriptionsRequest(request, response, options) {
  const {
    auth0Domain,
    auth0Audience,
    auth0ClientId,
    supabaseUrl,
    serviceRoleKey,
    allowedOrigin = "",
    adminAllowedEmails = "",
    adminSubscriptionsTable = "admin_subscriptions",
  } = options;

  const origin = request.headers?.origin;
  const corsHeaders = getCorsHeaders(origin, allowedOrigin);

  if (request.method === "OPTIONS") {
    return json(response, 204, {}, {
      ...corsHeaders,
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Auth0-Id-Token",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return json(response, 503, { message: "Admin data is not configured yet." }, corsHeaders);
  }

  try {
    const { admin } = await requireAdminIdentity(request, {
      auth0Domain,
      auth0Audience,
      auth0ClientId,
      adminAllowedEmails,
    });

    if (request.method === "GET") {
      const subscriptions = await listTableRows({
        supabaseUrl,
        serviceRoleKey,
        table: adminSubscriptionsTable,
        select:
          "id,client_id,signup_reference,plan_id,plan_name,status,billing_cycle,amount_zar,currency,payment_provider,payment_reference,starts_at,renews_at,paid_at,cancelled_at,metadata,created_at,updated_at",
      });

      return json(response, 200, { admin, data: subscriptions }, corsHeaders);
    }

    if (request.method === "POST") {
      const body = await parseJsonBody(request);
      const clientId = normalizeText(body?.clientId);
      const planId = normalizeText(body?.planId);
      const planName = normalizeText(body?.planName);

      if (!clientId || !planId || !planName) {
        return json(response, 400, { message: "Client, plan ID, and plan name are required." }, corsHeaders);
      }

      const amountZar = Number(body?.amountZar || 0);

      const subscription = await insertTableRow({
        supabaseUrl,
        serviceRoleKey,
        table: adminSubscriptionsTable,
        record: {
          client_id: clientId,
          signup_reference: normalizeOptionalText(body?.signupReference),
          plan_id: planId,
          plan_name: planName,
          status: normalizeText(body?.status) || "draft",
          billing_cycle: normalizeText(body?.billingCycle) || "once_off",
          amount_zar: Number.isFinite(amountZar) ? amountZar : 0,
          currency: normalizeText(body?.currency) || "ZAR",
          payment_provider: normalizeText(body?.paymentProvider) || "paystack",
          payment_reference: normalizeOptionalText(body?.paymentReference),
          starts_at: normalizeOptionalText(body?.startsAt),
          renews_at: normalizeOptionalText(body?.renewsAt),
          paid_at: normalizeOptionalText(body?.paidAt),
          cancelled_at: normalizeOptionalText(body?.cancelledAt),
          metadata: typeof body?.metadata === "object" && body.metadata ? body.metadata : {},
        },
      });

      return json(response, 201, { admin, data: subscription }, corsHeaders);
    }

    return json(response, 405, { message: "Method not allowed." }, { ...corsHeaders, Allow: "GET, POST, OPTIONS" });
  } catch (error) {
    const statusCode = typeof error?.statusCode === "number" ? error.statusCode : 401;
    return json(response, statusCode, { message: error instanceof Error ? error.message : "Unauthorized." }, corsHeaders);
  }
}
