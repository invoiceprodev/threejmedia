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

  const adminEmails = getAdminEmails(adminAllowedEmails);

  if (adminEmails.length === 0) {
    return json(response, 503, { message: "Admin access is not configured yet." }, corsHeaders);
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
      typeof identity.name === "string" ? identity.name : typeof user.name === "string" ? user.name : "";

    if (!auth0UserId || !identityUserId || identityUserId !== auth0UserId) {
      return json(response, 400, { message: "Your admin session could not be verified." }, corsHeaders);
    }

    if (!adminEmails.includes(email)) {
      return json(response, 403, { message: "Your account does not have admin access." }, corsHeaders);
    }

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
        admin: {
          email,
          fullName,
        },
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
