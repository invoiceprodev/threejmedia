import { handleSignupRequest } from "./_lib/signup.js";

export default async function handler(req, res) {
  return handleSignupRequest(req, res, {
    allowedOrigin: process.env.ALLOWED_ORIGIN,
    auth0Domain: process.env.AUTH0_DOMAIN,
    auth0ClientId: process.env.AUTH0_CLIENT_ID,
    auth0Connection: process.env.AUTH0_CONNECTION,
    paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
    paystackCallbackUrl: process.env.PAYSTACK_CALLBACK_URL,
    supabaseUrl: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    signupTable: process.env.SUPABASE_SIGNUPS_TABLE,
  });
}
