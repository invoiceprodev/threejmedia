import { handleDomainEppCodeRequest } from "../_lib/hostafrica.js";

export default async function handler(req, res) {
  return handleDomainEppCodeRequest(req, res, {
    allowedOrigin: process.env.ALLOWED_ORIGIN,
  });
}
