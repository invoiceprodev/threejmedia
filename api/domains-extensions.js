import { handleDomainCatalogRequest } from "./_lib/hostafrica.js";

export default async function handler(req, res) {
  return handleDomainCatalogRequest(req, res, {
    allowedOrigin: process.env.ALLOWED_ORIGIN,
  });
}
