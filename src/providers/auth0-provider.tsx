import type { PropsWithChildren } from "react";
import { Auth0Provider } from "@auth0/auth0-react";
import { env } from "@/lib/env";
import { navigate } from "@/lib/navigation";

export function Auth0ShellProvider({ children }: PropsWithChildren) {
  if (!env.auth0.domain || !env.auth0.clientId) {
    return children;
  }

  return (
    <Auth0Provider
      domain={env.auth0.domain}
      clientId={env.auth0.clientId}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/auth/callback`,
        ...(env.auth0.audience ? { audience: env.auth0.audience } : {}),
      }}
      onRedirectCallback={(appState) => {
        navigate(appState?.returnTo || "/dashboard");
      }}>
      {children}
    </Auth0Provider>
  );
}
