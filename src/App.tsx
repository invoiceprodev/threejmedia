import { useEffect, useState } from "react";
import { Auth0ShellProvider } from "@/providers/auth0-provider";
import LandingPage from "@/pages/landing";
import DashboardPage from "@/pages/dashboard";
import PaymentSuccessPage from "@/pages/payment-success";
import AuthCallbackPage from "@/pages/auth-callback";
import SignupContinuePage from "@/pages/signup-continue";
import { LegalPage, legalDocuments } from "@/pages/legal";

function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);

    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  let page = <LandingPage />;

  if (pathname === "/dashboard") {
    page = <DashboardPage />;
  } else if (pathname === "/payment/success") {
    page = <PaymentSuccessPage />;
  } else if (pathname === "/auth/callback") {
    page = <AuthCallbackPage />;
  } else if (pathname === "/signup/continue") {
    page = <SignupContinuePage />;
  } else if (pathname in legalDocuments) {
    page = <LegalPage pathname={pathname} />;
  }

  return <Auth0ShellProvider>{page}</Auth0ShellProvider>;
}

export default App;
