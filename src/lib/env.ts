const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const apiFallbackBaseUrl = import.meta.env.VITE_API_FALLBACK_BASE_URL?.trim();
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN?.trim();
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID?.trim();
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE?.trim();
const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL?.trim();
const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
const cloudinaryFolder = import.meta.env.VITE_CLOUDINARY_FOLDER?.trim();
const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER?.trim();
const whatsappMessage = import.meta.env.VITE_WHATSAPP_MESSAGE?.trim();

function normalizePathSegment(value: string | undefined) {
  return value ? value.replace(/^\/+|\/+$/g, "") : "";
}

export const env = {
  apiBaseUrl: apiBaseUrl ? apiBaseUrl.replace(/\/$/, "") : "",
  apiFallbackBaseUrl: apiFallbackBaseUrl ? apiFallbackBaseUrl.replace(/\/$/, "") : "",
  imageBaseUrl: imageBaseUrl ? imageBaseUrl.replace(/\/$/, "") : "",
  cloudinary: {
    cloudName: cloudinaryCloudName ?? "",
    folder: normalizePathSegment(cloudinaryFolder),
  },
  supabase: {
    url: supabaseUrl ?? "",
    anonKey: supabaseAnonKey ?? "",
  },
  auth0: {
    domain: auth0Domain ?? "",
    clientId: auth0ClientId ?? "",
    audience: auth0Audience ?? "",
  },
  whatsapp: {
    number: whatsappNumber ? whatsappNumber.replace(/[^\d]/g, "") : "",
    message: whatsappMessage ?? "Hi Three J Media, I'd like help with my website or domain setup.",
  },
};

export const apiRoutes = {
  newsletter: env.apiBaseUrl ? `${env.apiBaseUrl}/api/newsletter` : "/api/newsletter",
  signup: env.apiBaseUrl ? `${env.apiBaseUrl}/api/signup` : "/api/signup",
  signupContinue: env.apiBaseUrl ? `${env.apiBaseUrl}/api/signup/continue` : "/api/signup/continue",
  paystackVerify: env.apiBaseUrl ? `${env.apiBaseUrl}/api/paystack/verify` : "/api/paystack/verify",
  me: env.apiBaseUrl ? `${env.apiBaseUrl}/api/me` : "/api/me",
  health: env.apiBaseUrl ? `${env.apiBaseUrl}/health` : "/health",
};

export const hasSupabaseBrowserEnv = Boolean(env.supabase.url && env.supabase.anonKey);
export const hasAuth0BrowserEnv = Boolean(env.auth0.domain && env.auth0.clientId);
export const hasWhatsAppBrowserEnv = Boolean(env.whatsapp.number);
