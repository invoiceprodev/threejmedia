import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_ORIGIN = "https://threejmedia.co.za";
const LAST_MODIFIED = "2026-03-16";

const staticRoutes = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/services", changefreq: "monthly", priority: "0.8" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/legal/privacy-policy", changefreq: "yearly", priority: "0.4" },
  { path: "/legal/terms-of-service", changefreq: "yearly", priority: "0.4" },
  { path: "/legal/refund-policy", changefreq: "yearly", priority: "0.4" },
  { path: "/legal/cookie-policy", changefreq: "yearly", priority: "0.4" },
  { path: "/legal/acceptable-use", changefreq: "yearly", priority: "0.4" },
  { path: "/legal/data-processing-agreement", changefreq: "yearly", priority: "0.4" },
  { path: "/legal/service-level-agreement", changefreq: "yearly", priority: "0.4" },
  { path: "/legal/eula", changefreq: "yearly", priority: "0.4" },
];

const blogRoutes = [
  {
    path: "/blog/why-every-business-and-personal-brand-should-have-a-website",
    lastmod: "2026-03-15",
    changefreq: "monthly",
    priority: "0.7",
  },
];

function createUrlTag({ path: routePath, lastmod = LAST_MODIFIED, changefreq, priority }) {
  return [
    "  <url>",
    `    <loc>${new URL(routePath, SITE_ORIGIN).toString()}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
}

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...staticRoutes.map((route) => createUrlTag(route)),
  ...blogRoutes.map((route) => createUrlTag(route)),
  "</urlset>",
  "",
].join("\n");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sitemapPath = path.resolve(__dirname, "../public/sitemap.xml");

await writeFile(sitemapPath, sitemap, "utf8");

console.log(`Updated sitemap: ${sitemapPath}`);
