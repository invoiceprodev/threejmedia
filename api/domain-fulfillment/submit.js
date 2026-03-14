import { handleDomainFulfillmentSubmitRequest } from "../_lib/domain-fulfillment.js";

export default async function handler(req, res) {
  return handleDomainFulfillmentSubmitRequest(req, res, {
    allowedOrigin: process.env.ALLOWED_ORIGIN,
    supabaseUrl: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    signupTable: process.env.SUPABASE_SIGNUPS_TABLE,
    adminToken: process.env.DOMAIN_FULFILLMENT_ADMIN_TOKEN,
  });
}
