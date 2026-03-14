import { handleDomainFulfillmentOnboardingRequest } from "../_lib/domain-fulfillment.js";

export default async function handler(req, res) {
  return handleDomainFulfillmentOnboardingRequest(req, res, {
    allowedOrigin: process.env.ALLOWED_ORIGIN,
    auth0Domain: process.env.AUTH0_DOMAIN,
    auth0Audience: process.env.AUTH0_AUDIENCE,
    auth0ClientId: process.env.AUTH0_CLIENT_ID,
    supabaseUrl: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    signupTable: process.env.SUPABASE_SIGNUPS_TABLE,
  });
}
