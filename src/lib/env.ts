const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const env = {
  apiBaseUrl: apiBaseUrl ? apiBaseUrl.replace(/\/$/, "") : "",
  supabase: {
    url: supabaseUrl ?? "",
    anonKey: supabaseAnonKey ?? "",
  },
};

export const apiRoutes = {
  newsletter: env.apiBaseUrl ? `${env.apiBaseUrl}/api/newsletter` : "/api/newsletter",
  health: env.apiBaseUrl ? `${env.apiBaseUrl}/health` : "/health",
};

export const hasSupabaseBrowserEnv = Boolean(env.supabase.url && env.supabase.anonKey);
