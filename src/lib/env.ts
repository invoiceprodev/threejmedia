const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN?.trim();
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID?.trim();
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE?.trim();

export const env = {
  apiBaseUrl: apiBaseUrl ? apiBaseUrl.replace(/\/$/, "") : "",
  supabase: {
    url: supabaseUrl ?? "",
    anonKey: supabaseAnonKey ?? "",
  },
  auth0: {
    domain: auth0Domain ?? "",
    clientId: auth0ClientId ?? "",
    audience: auth0Audience ?? "",
  },
};

export const apiRoutes = {
  newsletter: env.apiBaseUrl ? `${env.apiBaseUrl}/api/newsletter` : "/api/newsletter",
  signup: env.apiBaseUrl ? `${env.apiBaseUrl}/api/signup` : "/api/signup",
  paystackVerify: env.apiBaseUrl ? `${env.apiBaseUrl}/api/paystack/verify` : "/api/paystack/verify",
  me: env.apiBaseUrl ? `${env.apiBaseUrl}/api/me` : "/api/me",
  health: env.apiBaseUrl ? `${env.apiBaseUrl}/health` : "/health",
};

export const hasSupabaseBrowserEnv = Boolean(env.supabase.url && env.supabase.anonKey);
export const hasAuth0BrowserEnv = Boolean(env.auth0.domain && env.auth0.clientId);
