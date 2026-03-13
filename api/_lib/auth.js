import { createRemoteJWKSet, jwtVerify } from "jose";

function getBearerToken(request) {
  const authorization = request.headers?.authorization || request.headers?.Authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

export async function requireAuth0User(request, { auth0Domain, auth0Audience }) {
  const token = getBearerToken(request);

  if (!token) {
    throw new Error("Missing bearer token.");
  }

  if (!auth0Domain || !auth0Audience) {
    throw new Error("Auth0 API settings are not configured yet.");
  }

  const jwks = createRemoteJWKSet(new URL(`https://${auth0Domain}/.well-known/jwks.json`));
  const { payload } = await jwtVerify(token, jwks, {
    issuer: `https://${auth0Domain}/`,
    audience: auth0Audience,
  });

  return payload;
}
