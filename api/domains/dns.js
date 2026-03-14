import { handleDomainDnsRequest } from "../_lib/hostafrica.js";

export default async function handler(req, res) {
  return handleDomainDnsRequest(req, res, {
    allowedOrigin: process.env.ALLOWED_ORIGIN,
  });
}
