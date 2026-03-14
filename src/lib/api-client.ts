import { env } from "@/lib/env";

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function isLocalBrowser() {
  if (typeof window === "undefined") {
    return false;
  }

  const hostname = window.location.hostname;
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function getApiCandidateUrls(path: string) {
  if (!path.startsWith("/")) {
    throw new Error("API path must start with '/'.");
  }

  const preferLocalApi = isLocalBrowser();

  if (preferLocalApi) {
    return [path];
  }

  const primaryBaseUrl = env.apiBaseUrl;
  const fallbackBaseUrl = env.apiFallbackBaseUrl;
  const shouldUseRailwayFallback =
    Boolean(fallbackBaseUrl) &&
    (!primaryBaseUrl ||
    primaryBaseUrl.includes("api.threejmedia.co.za") ||
    primaryBaseUrl === fallbackBaseUrl);

  const remoteBaseUrls =
    shouldUseRailwayFallback && primaryBaseUrl?.includes("api.threejmedia.co.za")
      ? unique([fallbackBaseUrl, primaryBaseUrl])
      : shouldUseRailwayFallback
        ? unique([primaryBaseUrl, fallbackBaseUrl])
        : unique([primaryBaseUrl]);

  const baseUrls = remoteBaseUrls;

  if (baseUrls.length === 0) {
    return [path];
  }

  return baseUrls.map((baseUrl) => (baseUrl ? `${baseUrl.replace(/\/$/, "")}${path}` : path));
}

export async function apiFetch(path: string, init?: RequestInit) {
  const candidates = getApiCandidateUrls(path);
  let lastResponse: Response | null = null;
  let lastError: unknown = null;

  for (const url of candidates) {
    try {
      const response = await fetch(url, init);

      if (response.ok || candidates.length === 1) {
        return response;
      }

      lastResponse = response;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastResponse) {
    return lastResponse;
  }

  throw lastError instanceof Error ? lastError : new Error("Unable to reach the API right now.");
}
