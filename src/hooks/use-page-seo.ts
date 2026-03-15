import { useEffect } from "react";

type SeoConfig = {
  title: string;
  description: string;
  path?: string;
  robots?: string;
};

const SITE_ORIGIN = "https://threejmedia.co.za";
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-image.png`;

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
}

export function usePageSeo({ title, description, path = "/", robots = "index, follow" }: SeoConfig) {
  useEffect(() => {
    const canonicalHref = new URL(path, SITE_ORIGIN).toString();
    const previousTitle = document.title;
    const canonical =
      document.head.querySelector('link[rel="canonical"]') ||
      Object.assign(document.createElement("link"), { rel: "canonical" });

    canonical.setAttribute("href", canonicalHref);
    if (!canonical.parentNode) {
      document.head.appendChild(canonical);
    }

    document.title = title;
    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="robots"]', { name: "robots", content: robots });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalHref });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: DEFAULT_OG_IMAGE });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: DEFAULT_OG_IMAGE });

    return () => {
      document.title = previousTitle;
    };
  }, [description, path, robots, title]);
}
