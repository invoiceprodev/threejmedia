import { createHmac } from "node:crypto";

const HOSTAFRICA_API_BASE_URL =
  process.env.HOSTAFRICA_RESELLER_API_BASE_URL?.trim() ||
  "https://my.hostafrica.com/modules/addons/DomainsReseller/api/index.php";

const DEFAULT_DOMAIN_OPTIONS = [
  {
    id: "coza",
    extension: ".co.za",
    name: ".co.za",
    description: "Local South African domain for businesses targeting the home market.",
    price: 150,
    currency: "ZAR",
    source: "fallback",
  },
  {
    id: "com",
    extension: ".com",
    name: ".com",
    description: "The most recognised global domain for commercial brands.",
    price: 280,
    currency: "ZAR",
    source: "fallback",
  },
  {
    id: "org",
    extension: ".org",
    name: ".org",
    description: "Strong fit for communities, nonprofits and trust-led brands.",
    price: 150,
    currency: "ZAR",
    source: "fallback",
  },
  {
    id: "net",
    extension: ".net",
    name: ".net",
    description: "Alternative global extension for networked or digital-first brands.",
    price: 360,
    currency: "ZAR",
    source: "fallback",
  },
];

const DOMAIN_DESCRIPTIONS = {
  ".co.za": "Local South African domain for businesses targeting the home market.",
  ".com": "The most recognised global domain for commercial brands.",
  ".org": "Strong fit for communities, nonprofits and trust-led brands.",
  ".net": "Alternative global extension for networked or digital-first brands.",
};

const REQUIRED_CONTACT_FIELDS = [
  "firstname",
  "lastname",
  "fullname",
  "companyname",
  "email",
  "address1",
  "city",
  "state",
  "postcode",
  "country",
  "phonenumber",
];

function json(response, status, payload, extraHeaders = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    ...extraHeaders,
  });
  response.end(JSON.stringify(payload));
}

function getRequestUrl(request) {
  return new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
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

function getCurrentUtcHour() {
  const now = new Date();
  const year = String(now.getUTCFullYear()).slice(-2);
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hour = String(now.getUTCHours()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}`;
}

function createToken(username, apiKey) {
  const message = `${username}:${getCurrentUtcHour()}`;
  const signature = createHmac("sha256", message).update(apiKey).digest("hex");
  return Buffer.from(signature, "utf8").toString("base64");
}

function createHeaders(username, apiKey, body) {
  const headers = {
    Accept: "application/json",
    username,
    token: createToken(username, apiKey),
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  return headers;
}

function appendFormValue(params, key, value) {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      appendFormValue(params, `${key}[${index}]`, item);
    });
    return;
  }

  if (typeof value === "object") {
    Object.entries(value).forEach(([childKey, childValue]) => {
      appendFormValue(params, `${key}[${childKey}]`, childValue);
    });
    return;
  }

  params.append(key, String(value));
}

function toFormEncoded(body) {
  const params = new URLSearchParams();

  Object.entries(body || {}).forEach(([key, value]) => {
    appendFormValue(params, key, value);
  });

  return params.toString();
}

function normalizeErrorMessage(payload, fallback) {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }

  if (payload && typeof payload === "object") {
    const candidates = [payload.message, payload.error, payload.description];

    for (const value of candidates) {
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
  }

  return fallback;
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

function getQueryParam(request, name) {
  return getRequestUrl(request).searchParams.get(name) || "";
}

export function getHostAfricaConfig() {
  const username = process.env.HOSTAFRICA_RESELLER_USERNAME?.trim() || "";
  const apiKey = process.env.HOSTAFRICA_RESELLER_API_KEY?.trim() || "";

  return {
    apiBaseUrl: HOSTAFRICA_API_BASE_URL,
    username,
    apiKey,
    configured: Boolean(username && apiKey),
  };
}

export async function hostAfricaRequest(pathname, { method = "GET", body } = {}) {
  const { apiBaseUrl, username, apiKey, configured } = getHostAfricaConfig();

  if (!configured) {
    throw new Error("HostAfrica reseller credentials are not configured yet.");
  }

  const url = `${apiBaseUrl.replace(/\/$/, "")}/${pathname.replace(/^\/+/, "")}`;
  const response = await fetch(url, {
    method,
    headers: createHeaders(username, apiKey, body),
    body: body === undefined ? undefined : toFormEncoded(body),
  });

  const rawText = await response.text();
  let payload = null;

  try {
    payload = rawText ? JSON.parse(rawText) : null;
  } catch {
    payload = rawText || null;
  }

  if (!response.ok) {
    throw new Error(normalizeErrorMessage(payload, "HostAfrica request failed."));
  }

  if (payload?.success === false) {
    throw new Error(normalizeErrorMessage(payload, "HostAfrica rejected the request."));
  }

  return payload;
}

function parsePrice(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

function normalizeExtension(value) {
  const raw = String(value || "").trim().toLowerCase();

  if (!raw) {
    return "";
  }

  return raw.startsWith(".") ? raw : `.${raw}`;
}

function normalizeCatalogItem(record) {
  const extension = normalizeExtension(record?.tld || record?.name || record?.extension || record?.domain);

  if (!extension) {
    return null;
  }

  const registerPrice =
    parsePrice(record?.registrationPrice) ??
    parsePrice(record?.register) ??
    parsePrice(record?.registration) ??
    parsePrice(record?.price) ??
    parsePrice(record?.amount);

  return {
    id: extension.replace(/^\./, "").replace(/\./g, "-"),
    extension,
    name: extension,
    description: DOMAIN_DESCRIPTIONS[extension] || `Register a ${extension} domain.`,
    price: registerPrice,
    currency: String(record?.currencyCode || record?.currency || "ZAR").toUpperCase(),
    source: "hostafrica",
  };
}

function asRecords(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.result)) {
    return payload.result;
  }

  if (payload?.data && typeof payload.data === "object") {
    return Object.entries(payload.data).map(([key, value]) => ({
      tld: key,
      ...(typeof value === "object" && value ? value : { price: value }),
    }));
  }

  if (payload && typeof payload === "object") {
    return Object.entries(payload).map(([key, value]) => ({
      tld: key,
      ...(typeof value === "object" && value ? value : { price: value }),
    }));
  }

  return [];
}

export async function getDomainCatalog() {
  const { configured } = getHostAfricaConfig();

  if (!configured) {
    return {
      configured: false,
      source: "fallback",
      options: DEFAULT_DOMAIN_OPTIONS,
    };
  }

  try {
    const payload = await hostAfricaRequest("/tlds/pricing");
    const preferredOrder = [".co.za", ".com", ".org", ".net"];
    const options = asRecords(payload)
      .filter((record) => String(record?.currencyCode || record?.currency || "").toUpperCase() === "ZAR")
      .map(normalizeCatalogItem)
      .filter(Boolean)
      .filter((item) => preferredOrder.includes(item.extension))
      .sort((left, right) => preferredOrder.indexOf(left.extension) - preferredOrder.indexOf(right.extension));

    if (options.length > 0) {
      return {
        configured: true,
        source: "hostafrica",
        options,
      };
    }
  } catch (error) {
    return {
      configured: true,
      source: "fallback",
      options: DEFAULT_DOMAIN_OPTIONS,
      warning: error instanceof Error ? error.message : "Unable to load reseller pricing.",
    };
  }

  return {
    configured: true,
    source: "fallback",
    options: DEFAULT_DOMAIN_OPTIONS,
  };
}

function normalizeDomainName(domainName, extension) {
  const name = String(domainName || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/[^a-z0-9-]/g, "");

  const normalizedExtension = normalizeExtension(extension);

  if (!name || !normalizedExtension) {
    return "";
  }

  if (name.endsWith(normalizedExtension)) {
    return name;
  }

  return `${name}${normalizedExtension}`;
}

function normalizeDomain(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

function ensureDomain(value) {
  const domain = normalizeDomain(value);

  if (!domain.includes(".")) {
    throw new Error("Enter a valid domain name including the extension.");
  }

  return domain;
}

function splitDomain(domain) {
  const normalized = normalizeDomain(domain);
  const dotIndex = normalized.indexOf(".");

  if (dotIndex === -1) {
    return { normalized, searchTerm: normalized, extension: "" };
  }

  return {
    normalized,
    searchTerm: normalized.slice(0, dotIndex),
    extension: normalizeExtension(normalized.slice(dotIndex)),
  };
}

function normalizeNameservers(nameservers) {
  const source = nameservers && typeof nameservers === "object" ? nameservers : {};
  const normalized = {
    ns1: String(source.ns1 || "").trim().toLowerCase(),
    ns2: String(source.ns2 || "").trim().toLowerCase(),
    ns3: String(source.ns3 || "").trim().toLowerCase(),
    ns4: String(source.ns4 || "").trim().toLowerCase(),
    ns5: String(source.ns5 || "").trim().toLowerCase(),
  };

  if (!normalized.ns1 || !normalized.ns2) {
    throw new Error("Primary and secondary nameservers are required.");
  }

  return normalized;
}

function normalizeOptionalNameservers(nameservers) {
  const source = nameservers && typeof nameservers === "object" ? nameservers : {};

  return {
    ns1: String(source.ns1 || "").trim().toLowerCase(),
    ns2: String(source.ns2 || "").trim().toLowerCase(),
    ns3: String(source.ns3 || "").trim().toLowerCase(),
    ns4: String(source.ns4 || "").trim().toLowerCase(),
    ns5: String(source.ns5 || "").trim().toLowerCase(),
  };
}

function normalizeContact(contact) {
  const source = contact && typeof contact === "object" ? contact : {};
  const firstname = String(source.firstname || "").trim();
  const lastname = String(source.lastname || "").trim();
  const fullname = String(source.fullname || `${firstname} ${lastname}` || "").trim();
  const normalized = {
    firstname,
    lastname,
    fullname,
    companyname: String(source.companyname || fullname).trim(),
    email: String(source.email || "").trim().toLowerCase(),
    address1: String(source.address1 || "").trim(),
    address2: String(source.address2 || "").trim(),
    city: String(source.city || "").trim(),
    state: String(source.state || "").trim(),
    postcode: String(source.postcode || "").trim(),
    country: String(source.country || "").trim().toUpperCase(),
    phonenumber: String(source.phonenumber || "").trim(),
  };

  for (const field of REQUIRED_CONTACT_FIELDS) {
    if (!normalized[field]) {
      throw new Error(`Contact field '${field}' is required.`);
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) {
    throw new Error("Please enter a valid email address.");
  }

  return normalized;
}

function normalizeAddons(addons) {
  const source = addons && typeof addons === "object" ? addons : {};

  return {
    dnsmanagement: source.dnsmanagement ? 1 : 0,
    emailforwarding: source.emailforwarding ? 1 : 0,
    idprotection: source.idprotection ? 1 : 0,
  };
}

function normalizeContacts(payload) {
  const source = payload && typeof payload === "object" ? payload : {};

  if (source.registrant || source.tech || source.billing || source.admin) {
    return {
      registrant: normalizeContact(source.registrant),
      tech: normalizeContact(source.tech || source.registrant),
      billing: normalizeContact(source.billing || source.registrant),
      admin: normalizeContact(source.admin || source.registrant),
    };
  }

  const registrant = normalizeContact(source);

  return {
    registrant,
    tech: registrant,
    billing: registrant,
    admin: registrant,
  };
}

function normalizeContactDetailsPayload(payload) {
  const contacts = normalizeContacts(payload);

  return {
    Registrant: contacts.registrant,
    Technical: contacts.tech,
    Billing: contacts.billing,
    Admin: contacts.admin,
  };
}

function normalizeDnsRecords(records) {
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error("At least one DNS record is required.");
  }

  return records.map((record, index) => {
    const normalized = {
      hostname: String(record?.hostname || "").trim(),
      type: String(record?.type || "").trim().toUpperCase(),
      address: String(record?.address || "").trim(),
      priority: Number(record?.priority ?? 0),
      recid: String(record?.recid || "").trim(),
    };

    if (!normalized.hostname || !normalized.type || !normalized.address) {
      throw new Error(`DNS record ${index + 1} is missing hostname, type, or address.`);
    }

    if (!Number.isFinite(normalized.priority)) {
      throw new Error(`DNS record ${index + 1} has an invalid priority.`);
    }

    return normalized;
  });
}

function normalizeLockStatus(value) {
  if (typeof value === "boolean") {
    return value ? "locked" : "unlocked";
  }

  const normalized = String(value || "").trim().toLowerCase();

  if (!normalized) {
    throw new Error("Lock status is required.");
  }

  if (["locked", "lock", "1", "true", "on"].includes(normalized)) {
    return "locked";
  }

  if (["unlocked", "unlock", "0", "false", "off"].includes(normalized)) {
    return "unlocked";
  }

  return normalized;
}

function normalizeRegistrationPayload(payload) {
  const domain = normalizeDomain(payload?.domain);
  const regperiod = Number(payload?.regperiod || 1);

  if (!domain.includes(".")) {
    throw new Error("Enter a valid domain name including the extension.");
  }

  if (!Number.isInteger(regperiod) || regperiod < 1) {
    throw new Error("Registration period must be at least 1 year.");
  }

  return {
    domain,
    regperiod,
    domainfields: payload?.domainfields && typeof payload.domainfields === "object" ? payload.domainfields : {},
    nameservers: normalizeNameservers(payload?.nameservers),
    contacts: normalizeContacts(payload?.contacts),
    addons: normalizeAddons(payload?.addons),
  };
}

function normalizeTransferPayload(payload) {
  const normalized = normalizeRegistrationPayload(payload);
  const eppcode = String(payload?.eppcode || "").trim();

  if (!eppcode) {
    throw new Error("EPP code is required for transfers.");
  }

  return {
    ...normalized,
    eppcode,
  };
}

function redactContact(contact) {
  return {
    firstname: contact.firstname,
    lastname: contact.lastname,
    fullname: contact.fullname,
    companyname: contact.companyname,
    email: contact.email,
    address1: contact.address1,
    address2: contact.address2,
    city: contact.city,
    state: contact.state,
    postcode: contact.postcode,
    country: contact.country,
    phonenumber: contact.phonenumber,
  };
}

function buildDryRunSummary(type, payload) {
  if (type === "renew") {
    return {
      type,
      domain: ensureDomain(payload?.domain),
      regperiod: Number(payload?.regperiod || 1),
      addons: normalizeAddons(payload?.addons),
    };
  }

  const normalized = type === "register" ? normalizeRegistrationPayload(payload) : normalizeTransferPayload(payload);

  return {
    type,
    domain: normalized.domain,
    regperiod: normalized.regperiod,
    nameservers: normalized.nameservers,
    addons: normalized.addons,
    contacts: {
      registrant: redactContact(normalized.contacts.registrant),
      tech: redactContact(normalized.contacts.tech),
      billing: redactContact(normalized.contacts.billing),
      admin: redactContact(normalized.contacts.admin),
    },
    requiresEppCode: type === "transfer",
    hasEppCode: type === "transfer" ? Boolean(normalized.eppcode) : false,
  };
}

function formatOrderResponseMessage(payload, action) {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }

  if (payload && typeof payload === "object") {
    const candidates = [
      payload.message,
      payload.result,
      payload.status,
      payload.description,
      payload.orderid ? `${action} submitted with order ID ${payload.orderid}.` : "",
    ];

    for (const value of candidates) {
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
  }

  return `${action} submitted successfully.`;
}

function normalizeAvailabilityEntry(record, requestedDomain) {
  if (!record || typeof record !== "object") {
    return {
      domain: requestedDomain,
      available: null,
      raw: record,
    };
  }

  const availableValue = record.available ?? record.status ?? record.result ?? record.is_available;
  const directAvailableValue = record.isAvailable ?? record.isRegistered;
  let available = null;

  if (typeof directAvailableValue === "boolean") {
    available = record.isAvailable ?? !record.isRegistered;
  } else if (typeof availableValue === "boolean") {
    available = availableValue;
  } else if (typeof availableValue === "string") {
    const normalized = availableValue.toLowerCase();
    if (["available", "yes", "true", "free"].includes(normalized)) {
      available = true;
    }
    if (["unavailable", "taken", "registered", "false", "no"].includes(normalized)) {
      available = false;
    }
  } else if (typeof availableValue === "number") {
    available = availableValue === 1;
  }

  return {
    domain: String(record.domainName || record.domain || record.name || requestedDomain),
    available,
    message: typeof record.domainErrorMessage === "string" ? record.domainErrorMessage : typeof record.message === "string" ? record.message : "",
    raw: record,
  };
}

export async function lookupDomainAvailability(domainName, extensions) {
  const normalizedName = String(domainName || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/\..*$/, "")
    .replace(/[^a-z0-9-]/g, "");

  const normalizedExtensions = extensions.map((extension) => normalizeExtension(extension)).filter(Boolean);
  const targets = normalizedExtensions.map((extension) => normalizeDomainName(normalizedName, extension)).filter(Boolean);

  if (targets.length === 0) {
    throw new Error("Enter a domain name before checking availability.");
  }

  const payload = await hostAfricaRequest("/domains/lookup", {
    method: "POST",
    body: {
      searchTerm: normalizedName,
      tldsToInclude: normalizedExtensions,
      isIdnDomain: false,
      premiumEnabled: true,
    },
  });

  const entries = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.result)
      ? payload.result
      : Array.isArray(payload?.results)
        ? payload.results
        : Array.isArray(payload)
          ? payload
          : [];

  const byDomain = new Map(
    entries.map((entry) => [String(entry?.domainName || entry?.domain || entry?.name || "").toLowerCase(), entry]),
  );

  return targets.map((domain) => normalizeAvailabilityEntry(byDomain.get(domain.toLowerCase()), domain));
}

export async function registerDomainOrder(payload) {
  const normalized = normalizeRegistrationPayload(payload);

  return hostAfricaRequest("/order/domains/register", {
    method: "POST",
    body: normalized,
  });
}

export async function transferDomainOrder(payload) {
  const normalized = normalizeTransferPayload(payload);

  return hostAfricaRequest("/order/domains/transfer", {
    method: "POST",
    body: normalized,
  });
}

export async function renewDomainOrder(payload) {
  const domain = ensureDomain(payload?.domain);
  const regperiod = Number(payload?.regperiod || 1);

  if (!Number.isInteger(regperiod) || regperiod < 1) {
    throw new Error("Renewal period must be at least 1 year.");
  }

  return hostAfricaRequest("/order/domains/renew", {
    method: "POST",
    body: {
      domain,
      regperiod,
      addons: normalizeAddons(payload?.addons),
    },
  });
}

export async function getDomainInformation(domain) {
  return hostAfricaRequest(`/domains/${ensureDomain(domain)}/information`);
}

export async function getDomainNameservers(domain) {
  return hostAfricaRequest(`/domains/${ensureDomain(domain)}/nameservers`);
}

export async function saveDomainNameservers(payload) {
  const domain = ensureDomain(payload?.domain);

  return hostAfricaRequest(`/domains/${domain}/nameservers`, {
    method: "POST",
    body: {
      domain,
      ...normalizeNameservers(payload?.nameservers ?? payload),
    },
  });
}

export async function getDomainLock(domain) {
  return hostAfricaRequest(`/domains/${ensureDomain(domain)}/lock`);
}

export async function saveDomainLock(payload) {
  const domain = ensureDomain(payload?.domain);

  return hostAfricaRequest(`/domains/${domain}/lock`, {
    method: "POST",
    body: {
      domain,
      lockstatus: normalizeLockStatus(payload?.lockstatus),
    },
  });
}

export async function getDomainEppCode(domain) {
  return hostAfricaRequest(`/domains/${ensureDomain(domain)}/eppcode`);
}

export async function getDomainContacts(domain) {
  return hostAfricaRequest(`/domains/${ensureDomain(domain)}/contact`);
}

export async function saveDomainContacts(payload) {
  const domain = ensureDomain(payload?.domain);

  return hostAfricaRequest(`/domains/${domain}/contact`, {
    method: "POST",
    body: {
      domain,
      contactdetails: normalizeContactDetailsPayload(payload?.contactdetails ?? payload?.contacts ?? payload),
    },
  });
}

export async function getDomainDns(domain) {
  return hostAfricaRequest(`/domains/${ensureDomain(domain)}/dns`);
}

export async function saveDomainDns(payload) {
  const domain = ensureDomain(payload?.domain);

  return hostAfricaRequest(`/domains/${domain}/dns`, {
    method: "POST",
    body: {
      domain,
      dnsrecords: normalizeDnsRecords(payload?.dnsrecords),
    },
  });
}

export async function handleDomainCatalogRequest(request, response, { allowedOrigin }) {
  const corsHeaders = getCorsHeaders(request.headers.origin, allowedOrigin);

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      ...corsHeaders,
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    response.end();
    return;
  }

  if (request.method !== "GET") {
    return json(response, 405, { message: "Method not allowed." }, corsHeaders);
  }

  try {
    const catalog = await getDomainCatalog();
    return json(response, 200, catalog, corsHeaders);
  } catch (error) {
    return json(
      response,
      500,
      { message: error instanceof Error ? error.message : "Unable to load domain pricing right now." },
      corsHeaders,
    );
  }
}

export async function handleDomainLookupRequest(request, response, { allowedOrigin }) {
  const corsHeaders = getCorsHeaders(request.headers.origin, allowedOrigin);

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      ...corsHeaders,
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    response.end();
    return;
  }

  if (request.method !== "POST") {
    return json(response, 405, { message: "Method not allowed." }, corsHeaders);
  }

  try {
    const body = await parseJsonBody(request);

    const name = String(body?.name || "").trim();
    const extensions = Array.isArray(body?.extensions) ? body.extensions.map((value) => String(value)) : [];

    if (!name || extensions.length === 0) {
      return json(response, 400, { message: "Domain name and at least one extension are required." }, corsHeaders);
    }

    const results = await lookupDomainAvailability(name, extensions);

    return json(response, 200, { results }, corsHeaders);
  } catch (error) {
    return json(
      response,
      500,
      { message: error instanceof Error ? error.message : "Unable to check domain availability right now." },
      corsHeaders,
    );
  }
}

async function handleDomainOrderRequest(request, response, { allowedOrigin, type }) {
  const corsHeaders = getCorsHeaders(request.headers.origin, allowedOrigin);

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      ...corsHeaders,
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    response.end();
    return;
  }

  if (request.method !== "POST") {
    return json(response, 405, { message: "Method not allowed." }, corsHeaders);
  }

  try {
    const body = await parseJsonBody(request);
    const isDryRun = body?.dryRun === true;

    if (isDryRun) {
      const summary = buildDryRunSummary(type, body);

      return json(
        response,
        200,
        {
          message: "Dry run passed. The order payload is valid and ready for live submission.",
          dryRun: true,
          summary,
        },
        corsHeaders,
      );
    }

    if (body?.confirmOrder !== true) {
      return json(
        response,
        400,
        { message: "Please confirm that you want to place a live reseller order before continuing." },
        corsHeaders,
      );
    }

    const normalizedDomain = splitDomain(body?.domain);

    if (type === "register" && normalizedDomain.searchTerm && normalizedDomain.extension) {
      const [lookupResult] = await lookupDomainAvailability(normalizedDomain.searchTerm, [normalizedDomain.extension]);

      if (lookupResult?.available === false) {
        return json(response, 409, { message: "That domain is no longer available for registration." }, corsHeaders);
      }
    }

    const result =
      type === "register"
        ? await registerDomainOrder(body)
        : type === "transfer"
          ? await transferDomainOrder(body)
          : await renewDomainOrder(body);

    return json(
      response,
      200,
      {
        message: formatOrderResponseMessage(
          result,
          type === "register" ? "Registration order" : type === "transfer" ? "Transfer order" : "Renewal order",
        ),
        result,
      },
      corsHeaders,
    );
  } catch (error) {
    return json(
      response,
      500,
      { message: error instanceof Error ? error.message : "Unable to place the domain order right now." },
      corsHeaders,
    );
  }
}

export async function handleDomainRegisterRequest(request, response, { allowedOrigin }) {
  return handleDomainOrderRequest(request, response, {
    allowedOrigin,
    type: "register",
  });
}

export async function handleDomainTransferRequest(request, response, { allowedOrigin }) {
  return handleDomainOrderRequest(request, response, {
    allowedOrigin,
    type: "transfer",
  });
}

export async function handleDomainRenewRequest(request, response, { allowedOrigin }) {
  return handleDomainOrderRequest(request, response, {
    allowedOrigin,
    type: "renew",
  });
}

async function handleDomainGetRequest(request, response, { allowedOrigin, action }) {
  const corsHeaders = getCorsHeaders(request.headers.origin, allowedOrigin);

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      ...corsHeaders,
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    response.end();
    return;
  }

  if (request.method !== "GET") {
    return json(response, 405, { message: "Method not allowed." }, corsHeaders);
  }

  try {
    const domain = getQueryParam(request, "domain");
    const result =
      action === "information"
        ? await getDomainInformation(domain)
        : action === "nameservers"
          ? await getDomainNameservers(domain)
          : action === "lock"
            ? await getDomainLock(domain)
            : action === "eppcode"
              ? await getDomainEppCode(domain)
              : action === "contact"
                ? await getDomainContacts(domain)
                : await getDomainDns(domain);

    return json(response, 200, { result }, corsHeaders);
  } catch (error) {
    return json(
      response,
      500,
      { message: error instanceof Error ? error.message : "Unable to load the domain data right now." },
      corsHeaders,
    );
  }
}

async function handleDomainSaveRequest(request, response, { allowedOrigin, action }) {
  const corsHeaders = getCorsHeaders(request.headers.origin, allowedOrigin);

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      ...corsHeaders,
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    response.end();
    return;
  }

  if (request.method !== "POST") {
    return json(response, 405, { message: "Method not allowed." }, corsHeaders);
  }

  try {
    const body = await parseJsonBody(request);
    const isDryRun = body?.dryRun === true;

    if (isDryRun) {
      const summary =
        action === "nameservers"
          ? { domain: ensureDomain(body?.domain), nameservers: normalizeOptionalNameservers(body?.nameservers ?? body) }
          : action === "lock"
            ? { domain: ensureDomain(body?.domain), lockstatus: normalizeLockStatus(body?.lockstatus) }
            : action === "contact"
              ? { domain: ensureDomain(body?.domain), contactdetails: normalizeContactDetailsPayload(body?.contactdetails ?? body?.contacts ?? body) }
              : { domain: ensureDomain(body?.domain), dnsrecords: normalizeDnsRecords(body?.dnsrecords) };

      return json(
        response,
        200,
        {
          message: "Dry run passed. The update payload is valid and ready for live submission.",
          dryRun: true,
          summary,
        },
        corsHeaders,
      );
    }

    const result =
      action === "nameservers"
        ? await saveDomainNameservers(body)
        : action === "lock"
          ? await saveDomainLock(body)
          : action === "contact"
            ? await saveDomainContacts(body)
            : await saveDomainDns(body);

    return json(
      response,
      200,
      {
        message: formatOrderResponseMessage(result, "Domain update"),
        result,
      },
      corsHeaders,
    );
  } catch (error) {
    return json(
      response,
      500,
      { message: error instanceof Error ? error.message : "Unable to save the domain update right now." },
      corsHeaders,
    );
  }
}

export async function handleDomainInformationRequest(request, response, { allowedOrigin }) {
  return handleDomainGetRequest(request, response, {
    allowedOrigin,
    action: "information",
  });
}

export async function handleDomainNameserversRequest(request, response, { allowedOrigin }) {
  if (request.method === "GET" || request.method === "OPTIONS") {
    return handleDomainGetRequest(request, response, {
      allowedOrigin,
      action: "nameservers",
    });
  }

  return handleDomainSaveRequest(request, response, {
    allowedOrigin,
    action: "nameservers",
  });
}

export async function handleDomainLockRequest(request, response, { allowedOrigin }) {
  if (request.method === "GET" || request.method === "OPTIONS") {
    return handleDomainGetRequest(request, response, {
      allowedOrigin,
      action: "lock",
    });
  }

  return handleDomainSaveRequest(request, response, {
    allowedOrigin,
    action: "lock",
  });
}

export async function handleDomainEppCodeRequest(request, response, { allowedOrigin }) {
  return handleDomainGetRequest(request, response, {
    allowedOrigin,
    action: "eppcode",
  });
}

export async function handleDomainContactRequest(request, response, { allowedOrigin }) {
  if (request.method === "GET" || request.method === "OPTIONS") {
    return handleDomainGetRequest(request, response, {
      allowedOrigin,
      action: "contact",
    });
  }

  return handleDomainSaveRequest(request, response, {
    allowedOrigin,
    action: "contact",
  });
}

export async function handleDomainDnsRequest(request, response, { allowedOrigin }) {
  if (request.method === "GET" || request.method === "OPTIONS") {
    return handleDomainGetRequest(request, response, {
      allowedOrigin,
      action: "dns",
    });
  }

  return handleDomainSaveRequest(request, response, {
    allowedOrigin,
    action: "dns",
  });
}
