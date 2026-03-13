import { useAuth0 } from "@auth0/auth0-react";
import { LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasAuth0BrowserEnv } from "@/lib/env";
import { navigate } from "@/lib/navigation";

export function NavbarAuthActions() {
  const { isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();

  if (!hasAuth0BrowserEnv) {
    return null;
  }

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/dashboard")}
          className="rounded-lg border-white/15 bg-transparent text-white hover:bg-white/10">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
        <Button
          size="sm"
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          className="rounded-lg bg-white text-gray-950 hover:bg-gray-100">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </>
    );
  }

  return (
    <Button
      size="sm"
      onClick={() =>
        void loginWithRedirect({
          appState: {
            returnTo: "/dashboard",
          },
        })
      }
      className="rounded-lg bg-gray-900 text-white hover:bg-gray-700">
      <LogIn className="mr-2 h-4 w-4" />
      Log in
    </Button>
  );
}
