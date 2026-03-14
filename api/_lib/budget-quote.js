const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

async function insertBudgetQuote({ supabaseUrl, serviceRoleKey, table, quote }) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(quote),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || "Unable to save budget quote.");
  }
}

export async function handleBudgetQuoteRequest(request, response, options) {
  const {
    supabaseUrl,
    serviceRoleKey,
    table = "budget_quote_requests",
    allowedOrigin = "",
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

  if (!supabaseUrl || !serviceRoleKey) {
    return json(response, 503, { message: "Budget quote requests are not configured yet." }, corsHeaders);
  }

  let payload;

  try {
    payload = await parseJsonBody(request);
  } catch {
    return json(response, 400, { message: "Invalid request payload." }, corsHeaders);
  }

  const name = String(payload?.name ?? "").trim();
  const email = String(payload?.email ?? "").trim().toLowerCase();
  const websiteTypeId = String(payload?.websiteTypeId ?? "").trim();
  const hostingPlanId = String(payload?.hostingPlanId ?? "").trim();
  const domainOptionId = String(payload?.domainOptionId ?? "").trim();
  const addonIds = Array.isArray(payload?.addonIds)
    ? payload.addonIds.map((value) => String(value).trim()).filter(Boolean)
    : [];
  const onceOffTotal = Number(payload?.onceOffTotal ?? 0);
  const monthlyTotal = Number(payload?.monthlyTotal ?? 0);
  const yearlyTotal = Number(payload?.yearlyTotal ?? 0);
  const summary = payload?.summary && typeof payload.summary === "object" ? payload.summary : null;

  if (!name || !email || !websiteTypeId || !hostingPlanId || !domainOptionId) {
    return json(response, 400, { message: "Name, email, website type, hosting plan, and domain are required." }, corsHeaders);
  }

  if (!emailPattern.test(email)) {
    return json(response, 400, { message: "Please enter a valid email address." }, corsHeaders);
  }

  try {
    await insertBudgetQuote({
      supabaseUrl,
      serviceRoleKey,
      table,
      quote: {
        name,
        email,
        website_type_id: websiteTypeId,
        addon_ids: addonIds,
        hosting_plan_id: hostingPlanId,
        domain_option_id: domainOptionId,
        once_off_total: onceOffTotal,
        monthly_total: monthlyTotal,
        yearly_total: yearlyTotal,
        summary,
        submitted_at: new Date().toISOString(),
      },
    });

    return json(response, 200, { message: "Thanks. Your budget request has been sent." }, corsHeaders);
  } catch (error) {
    return json(
      response,
      502,
      { message: error instanceof Error ? error.message : "Budget quote service is temporarily unavailable." },
      corsHeaders,
    );
  }
}
