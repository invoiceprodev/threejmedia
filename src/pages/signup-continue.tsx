import { useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { CheckCircle2, LoaderCircle, MailCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasAuth0BrowserEnv } from "@/lib/env";
import { apiFetch } from "@/lib/api-client";
import { navigate } from "@/lib/navigation";

type ContinueState = "idle" | "loading" | "error";

type ContinuePayload = {
  message?: string;
  authorizationUrl?: string;
};

export default function SignupContinuePage() {
  const { isAuthenticated, isLoading, loginWithPopup, loginWithRedirect, getAccessTokenSilently, getIdTokenClaims, user } = useAuth0();
  const [status, setStatus] = useState<ContinueState>("idle");
  const [message, setMessage] = useState("Check your inbox, confirm your email, then sign in to continue to secure payment.");
  const email = useMemo(() => new URLSearchParams(window.location.search).get("email")?.trim() || "", []);

  useEffect(() => {
    if (!hasAuth0BrowserEnv || isLoading || !isAuthenticated) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        setStatus("loading");
        setMessage("Checking your verified account and preparing checkout...");

        const accessToken = await getAccessTokenSilently();
        const idTokenClaims = await getIdTokenClaims();
        const idToken = typeof idTokenClaims?.__raw === "string" ? idTokenClaims.__raw : "";

        if (!idToken) {
          throw new Error("We could not verify your sign-in details. Please sign in again.");
        }

        const response = await apiFetch("/api/signup/continue", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "X-Auth0-Id-Token": idToken,
          },
          body: JSON.stringify({}),
        });

        const payload = (await response.json().catch(() => null)) as ContinuePayload | null;

        if (!response.ok || !payload?.authorizationUrl) {
          throw new Error(payload?.message || "We could not continue to payment right now.");
        }

        if (!cancelled) {
          window.location.assign(payload.authorizationUrl);
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setMessage(error instanceof Error ? error.message : "We could not continue to payment right now.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getAccessTokenSilently, getIdTokenClaims, isAuthenticated, isLoading, user?.email, user?.sub]);

  const handleContinue = async () => {
    if (!hasAuth0BrowserEnv) {
      setStatus("error");
      setMessage("Auth0 browser settings are not configured yet.");
      return;
    }

    setStatus("loading");
    setMessage("Opening secure sign-in...");

    const authorizationParams = {
      ...(email ? { login_hint: email } : {}),
      prompt: "login" as const,
    };

    try {
      await loginWithPopup({
        authorizationParams,
      });
      setMessage("Checking your verified account and preparing checkout...");
    } catch (error) {
      console.warn("[auth] popup login failed, falling back to redirect", error);
      setMessage("Popup sign-in was blocked, redirecting to secure sign-in...");

      await loginWithRedirect({
        authorizationParams,
        appState: {
          returnTo: `/signup/continue${email ? `?email=${encodeURIComponent(email)}` : ""}`,
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#83c406]/35 bg-[#83c406]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#dff3ab]">
          <MailCheck className="h-3.5 w-3.5" />
          Verify Email First
        </div>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">Confirm your email to continue</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-300">{message}</p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="space-y-3 text-sm text-gray-200">
            <div className="flex items-start gap-3 text-[#dff3ab]">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <span>Create your account.</span>
            </div>
            <div className="flex items-start gap-3 text-[#dff3ab]">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <span>Open the Auth0 verification email{email ? ` sent to ${email}` : ""} and confirm your address.</span>
            </div>
            <div className="flex items-start gap-3 text-[#dff3ab]">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <span>Come back here and continue to payment.</span>
            </div>
          </div>

          {status === "loading" && (
            <div className="mt-5 flex items-center gap-3 text-sm text-gray-300">
              <LoaderCircle className="h-5 w-5 animate-spin text-[#83c406]" />
              <span>Preparing your Paystack checkout...</span>
            </div>
          )}

          {status === "error" && (
            <div className="mt-5 flex items-start gap-3 text-sm text-red-300">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{message}</span>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={() => void handleContinue()}
            disabled={isLoading || status === "loading"}
            className="h-12 rounded-xl bg-[#83c406] px-6 font-bold text-gray-950 hover:bg-[#97d71a]">
            {isAuthenticated ? "Continue to payment" : "Sign in to continue"}
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="h-12 rounded-xl border-white/15 bg-transparent px-6 text-white hover:bg-white/10">
            Back to home
          </Button>
        </div>

        <p className="mt-4 text-sm text-gray-400">
          {user?.email
            ? `Signed in as ${user.email}`
            : "After verifying your email, sign in with the same account to unlock payment."}
        </p>
      </div>
    </div>
  );
}
