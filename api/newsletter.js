import { handleNewsletterRequest } from "./_lib/newsletter.js";

export default async function handler(req, res) {
  return handleNewsletterRequest(req, res, {
    supabaseUrl: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    table: process.env.SUPABASE_NEWSLETTER_TABLE,
    allowedOrigin: process.env.ALLOWED_ORIGIN,
  });
}
