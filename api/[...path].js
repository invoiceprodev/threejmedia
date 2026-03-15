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

function getPathname(request) {
  return new URL(request.url || "/", `http://${request.headers.host || "localhost"}`).pathname;
}

export default async function handler(request, response) {
  const pathname = getPathname(request);

  if (pathname === "/health") {
    return handleHealthRequest(request, response);
  }

  if (pathname === "/api/newsletter") {
    return handleNewsletterRequest(request, response, {
      supabaseUrl: process.env.SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      table: process.env.SUPABASE_NEWSLETTER_TABLE,
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (pathname === "/api/budget-quote") {
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

  if (pathname === "/api/signup") {
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

  if (pathname === "/api/signup/continue") {
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

  if (pathname === "/api/paystack/verify") {
    return handlePaystackVerifyRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
      paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      signupTable: process.env.SUPABASE_SIGNUPS_TABLE,
    });
  }

  if (pathname === "/api/me") {
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

  if (pathname === "/api/domains/extensions") {
    return handleDomainCatalogRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (pathname === "/api/domains/lookup") {
    return handleDomainLookupRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (pathname === "/api/domains/register") {
    return handleDomainRegisterRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (pathname === "/api/domains/renew") {
    return handleDomainRenewRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (pathname === "/api/domains/transfer") {
    return handleDomainTransferRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (pathname === "/api/domains/information") {
    return handleDomainInformationRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (pathname === "/api/domains/nameservers") {
    return handleDomainNameserversRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (pathname === "/api/domains/lock") {
    return handleDomainLockRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (pathname === "/api/domains/eppcode") {
    return handleDomainEppCodeRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (pathname === "/api/domains/contact") {
    return handleDomainContactRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (pathname === "/api/domains/dns") {
    return handleDomainDnsRequest(request, response, {
      allowedOrigin: process.env.ALLOWED_ORIGIN,
    });
  }

  if (pathname === "/api/domain-fulfillment/onboarding") {
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

  if (pathname === "/api/domain-fulfillment/submit") {
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
}
