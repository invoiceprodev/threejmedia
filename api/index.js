import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleHealthRequest, handleNewsletterRequest } from "./_lib/newsletter.js";
import { handleSignupContinueRequest, handleSignupRequest } from "./_lib/signup.js";
import { handlePaystackVerifyRequest } from "./_lib/paystack.js";
import { handleMeRequest } from "./_lib/me.js";
import { handleBudgetQuoteRequest } from "./_lib/budget-quote.js";
import {
  handleDomainFulfillmentOnboardingRequest,
  handleDomainFulfillmentSubmitRequest,
} from "./_lib/domain-fulfillment.js";
import {
  handleDomainCatalogRequest,
  handleDomainContactRequest,
  handleDomainDnsRequest,
  handleDomainEppCodeRequest,
  handleDomainInformationRequest,
  handleDomainLockRequest,
  handleDomainLookupRequest,
  handleDomainNameserversRequest,
  handleDomainRegisterRequest,
  handleDomainRenewRequest,
  handleDomainTransferRequest,
} from "./_lib/hostafrica.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envFilePath = path.resolve(__dirname, "../.env");

function loadLocalEnv() {
  if (!existsSync(envFilePath)) {
    return;
  }

  const lines = readFileSync(envFilePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const port = Number(process.env.PORT || 3001);

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (url.pathname === "/health") {
    return handleHealthRequest(request, response);
  }

  if (url.pathname === "/api/newsletter") {
    return handleNewsletterRequest(request, response, {
      supabaseUrl: process.env.SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      table: process.env.SUPABASE_NEWSLETTER_TABLE,
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (url.pathname === "/api/budget-quote") {
    return handleBudgetQuoteRequest(request, response, {
      supabaseUrl: process.env.SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      table: process.env.SUPABASE_BUDGET_QUOTES_TABLE,
      allowedOrigin: process.env.ALLOWED_ORIGIN,
      resendApiKey: process.env.RESEND_API_KEY,
      resendFromEmail: process.env.RESEND_FROM_EMAIL,
      internalRecipients: process.env.RESEND_BUDGET_QUOTES_TO,
    });
  }

  if (url.pathname === "/api/signup") {
    return handleSignupRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
      auth0Domain: process.env.AUTH0_DOMAIN,
      auth0ClientId: process.env.AUTH0_CLIENT_ID,
      auth0Connection: process.env.AUTH0_CONNECTION,
      auth0Audience: process.env.AUTH0_AUDIENCE,
      paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
      paystackCallbackUrl: process.env.PAYSTACK_CALLBACK_URL,
      supabaseUrl: process.env.SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      signupTable: process.env.SUPABASE_SIGNUPS_TABLE,
    });
  }

  if (url.pathname === "/api/signup/continue") {
    return handleSignupContinueRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
      auth0Domain: process.env.AUTH0_DOMAIN,
      auth0Audience: process.env.AUTH0_AUDIENCE,
      auth0ClientId: process.env.AUTH0_CLIENT_ID,
      paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
      paystackCallbackUrl: process.env.PAYSTACK_CALLBACK_URL,
      supabaseUrl: process.env.SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      signupTable: process.env.SUPABASE_SIGNUPS_TABLE,
    });
  }

  if (url.pathname === "/api/paystack/verify") {
    return handlePaystackVerifyRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
      paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      signupTable: process.env.SUPABASE_SIGNUPS_TABLE,
    });
  }

  if (url.pathname === "/api/me") {
    return handleMeRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
      auth0Domain: process.env.AUTH0_DOMAIN,
      auth0Audience: process.env.AUTH0_AUDIENCE,
      auth0ClientId: process.env.AUTH0_CLIENT_ID,
      supabaseUrl: process.env.SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      signupTable: process.env.SUPABASE_SIGNUPS_TABLE,
    });
  }

  if (url.pathname === "/api/domains/extensions") {
    return handleDomainCatalogRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (url.pathname === "/api/domains/lookup") {
    return handleDomainLookupRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (url.pathname === "/api/domains/register") {
    return handleDomainRegisterRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (url.pathname === "/api/domains/renew") {
    return handleDomainRenewRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (url.pathname === "/api/domains/transfer") {
    return handleDomainTransferRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (url.pathname === "/api/domains/information") {
    return handleDomainInformationRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (url.pathname === "/api/domains/nameservers") {
    return handleDomainNameserversRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (url.pathname === "/api/domains/lock") {
    return handleDomainLockRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (url.pathname === "/api/domains/eppcode") {
    return handleDomainEppCodeRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (url.pathname === "/api/domains/contact") {
    return handleDomainContactRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (url.pathname === "/api/domains/dns") {
    return handleDomainDnsRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (url.pathname === "/api/domain-fulfillment/onboarding") {
    return handleDomainFulfillmentOnboardingRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
      auth0Domain: process.env.AUTH0_DOMAIN,
      auth0Audience: process.env.AUTH0_AUDIENCE,
      auth0ClientId: process.env.AUTH0_CLIENT_ID,
      supabaseUrl: process.env.SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      signupTable: process.env.SUPABASE_SIGNUPS_TABLE,
    });
  }

  if (url.pathname === "/api/domain-fulfillment/submit") {
    return handleDomainFulfillmentSubmitRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
      supabaseUrl: process.env.SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      signupTable: process.env.SUPABASE_SIGNUPS_TABLE,
      adminToken: process.env.DOMAIN_FULFILLMENT_ADMIN_TOKEN,
    });
  }

  response.writeHead(404, { "Content-Type": "application/json" });
  response.end(JSON.stringify({ message: "Not found." }));
});

server.listen(port, () => {
  console.log(`Three J Media API listening on port ${port}`);
});
