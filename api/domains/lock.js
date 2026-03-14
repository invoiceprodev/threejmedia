import { handleDomainLockRequest } from "../_lib/hostafrica.js";

export default async function handler(req, res) {
  return handleDomainLockRequest(req, res, {
    allowedOrigin: process.env.ALLOWED_ORIGIN,
  });
}
