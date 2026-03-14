import { createRemoteJWKSet, jwtVerify } from "jose";

function getBearerToken(request) {
  const authorization = getHeaderValue(request, "authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

function getHeaderValue(request, name) {
  return request.headers?.[name] || request.headers?.[name.toLowerCase()] || request.headers?.[name.toUpperCase()];
}

function getTokenFromHeader(request, headerName) {
  const value = String(getHeaderValue(request, headerName) || "").trim();
  return value || null;
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

export async function requireAuth0IdToken(request, { auth0Domain, auth0ClientId }) {
  const token = getTokenFromHeader(request, "x-auth0-id-token");

  if (!token) {
    throw new Error("Missing Auth0 identity token.");
  }

  if (!auth0Domain || !auth0ClientId) {
    throw new Error("Auth0 identity settings are not configured yet.");
  }

  const jwks = createRemoteJWKSet(new URL(`https://${auth0Domain}/.well-known/jwks.json`));
  const { payload } = await jwtVerify(token, jwks, {
    issuer: `https://${auth0Domain}/`,
    audience: auth0ClientId,
  });

  return payload;
}
