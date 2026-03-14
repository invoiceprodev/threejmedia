import { handleDomainContactRequest } from "../_lib/hostafrica.js";

export default async function handler(req, res) {
  return handleDomainContactRequest(req, res, {
    allowedOrigin: process.env.ALLOWED_ORIGIN,
  });
}
