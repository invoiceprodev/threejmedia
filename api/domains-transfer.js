import { handleDomainTransferRequest } from "./_lib/hostafrica.js";

export default async function handler(req, res) {
  return handleDomainTransferRequest(req, res, {
    allowedOrigin: process.env.ALLOWED_ORIGIN,
  });
}
