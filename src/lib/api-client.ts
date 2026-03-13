import { env } from "@/lib/env";

const railwayFallbackBaseUrl = "https://threejmedia-production.up.railway.app";

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function getApiCandidateUrls(path: string) {
  if (!path.startsWith("/")) {
    throw new Error("API path must start with '/'.");
  }

  const primaryBaseUrl = env.apiBaseUrl;
  const shouldUseRailwayFallback =
    !primaryBaseUrl ||
    primaryBaseUrl.includes("api.threejmedia.co.za") ||
    primaryBaseUrl.includes("threejmedia-production.up.railway.app");

  const baseUrls =
    shouldUseRailwayFallback && primaryBaseUrl?.includes("api.threejmedia.co.za")
      ? unique([railwayFallbackBaseUrl, primaryBaseUrl])
      : shouldUseRailwayFallback
        ? unique([primaryBaseUrl, railwayFallbackBaseUrl])
        : unique([primaryBaseUrl]);

  if (baseUrls.length === 0) {
    return [path];
  }

  return baseUrls.map((baseUrl) => `${baseUrl.replace(/\/$/, "")}${path}`);
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
