import { handlePaystackVerifyRequest } from "./_lib/paystack.js";

export default async function handler(req, res) {
  return handlePaystackVerifyRequest(req, res, {
    allowedOrigin: process.env.ALLOWED_ORIGIN,
    paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    signupTable: process.env.SUPABASE_SIGNUPS_TABLE,
  });
}
