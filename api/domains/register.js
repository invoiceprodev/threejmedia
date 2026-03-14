import { handleDomainRegisterRequest } from "../_lib/hostafrica.js";

export default async function handler(req, res) {
  return handleDomainRegisterRequest(req, res, {
    allowedOrigin: process.env.ALLOWED_ORIGIN,
  });
}
