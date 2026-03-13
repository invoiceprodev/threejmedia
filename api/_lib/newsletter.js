const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

async function insertSubscriber({ supabaseUrl, serviceRoleKey, table, subscriber }) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "return=minimal,resolution=merge-duplicates",
    },
    body: JSON.stringify(subscriber),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || "Supabase insert failed.");
  }
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

export async function handleNewsletterRequest(request, response, options) {
  const {
    supabaseUrl,
    serviceRoleKey,
    table = "newsletter_subscribers",
    allowedOrigin = "",
    source = "threejmedia.co.za",
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
    return json(response, 503, { message: "Newsletter submissions are not configured yet." }, corsHeaders);
  }

  let payload;

  try {
    payload = await parseJsonBody(request);
  } catch {
    return json(response, 400, { message: "Invalid request payload." }, corsHeaders);
  }

  const name = String(payload?.name ?? "").trim();
  const email = String(payload?.email ?? "").trim().toLowerCase();

  if (!name || !email) {
    return json(response, 400, { message: "Name and email are required." }, corsHeaders);
  }

  if (!emailPattern.test(email)) {
    return json(response, 400, { message: "Please enter a valid email address." }, corsHeaders);
  }

  try {
    await insertSubscriber({
      supabaseUrl,
      serviceRoleKey,
      table,
      subscriber: {
        name,
        email,
        source,
        submitted_at: new Date().toISOString(),
      },
    });

    return json(response, 200, { message: "Thanks. You're on the list." }, corsHeaders);
  } catch {
    return json(response, 502, { message: "Newsletter service is temporarily unavailable." }, corsHeaders);
  }
}

export function handleHealthRequest(_request, response) {
  return json(response, 200, {
    ok: true,
    service: "threejmedia-api",
    timestamp: new Date().toISOString(),
  });
}
