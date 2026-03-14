import { handleDomainNameserversRequest } from "../_lib/hostafrica.js";

export default async function handler(req, res) {
  return handleDomainNameserversRequest(req, res, {
    allowedOrigin: process.env.ALLOWED_ORIGIN,
  });
}
