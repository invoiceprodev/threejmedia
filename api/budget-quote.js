import { handleBudgetQuoteRequest } from "./_lib/budget-quote.js";

export default async function handler(req, res) {
  return handleBudgetQuoteRequest(req, res, {
    supabaseUrl: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    table: process.env.SUPABASE_BUDGET_QUOTES_TABLE,
    allowedOrigin: process.env.ALLOWED_ORIGIN,
  });
}
