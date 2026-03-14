import { handleDomainLookupRequest } from "../_lib/hostafrica.js";

export default async function handler(req, res) {
  return handleDomainLookupRequest(req, res, {
    allowedOrigin: process.env.ALLOWED_ORIGIN,
  });
}
