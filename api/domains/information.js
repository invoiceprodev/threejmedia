import { handleDomainInformationRequest } from "../_lib/hostafrica.js";

export default async function handler(req, res) {
  return handleDomainInformationRequest(req, res, {
    allowedOrigin: process.env.ALLOWED_ORIGIN,
  });
}
