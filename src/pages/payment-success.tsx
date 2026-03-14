import { useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { CheckCircle2, LoaderCircle, ShieldCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasAuth0BrowserEnv } from "@/lib/env";
import { apiFetch } from "@/lib/api-client";
import { navigate } from "@/lib/navigation";

type VerificationState = "loading" | "success" | "error";

type VerificationPayload = {
  message?: string;
  email?: string;
  fullName?: string;
  companyName?: string;
  planName?: string;
  paymentStatus?: string;
  selectedDomain?: string;
  domainAutoRenewAt?: string;
  domainFulfillmentStatus?: string;
  domainFulfillmentNotes?: string;
};

export default function PaymentSuccessPage() {
  const { isAuthenticated, isLoading, loginWithPopup, loginWithRedirect } = useAuth0();
  const [status, setStatus] = useState<VerificationState>("loading");
  const [message, setMessage] = useState("Verifying your payment...");
  const [payload, setPayload] = useState<VerificationPayload | null>(null);
  const reference = useMemo(() => new URLSearchParams(window.location.search).get("reference"), []);

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      setMessage("We could not find a payment reference in the callback URL.");
      return;
    }

    const controller = new AbortController();

    void (async () => {
      try {
        const response = await apiFetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`, {
          signal: controller.signal,
        });

        const body = (await response.json().catch(() => null)) as VerificationPayload | null;

        if (!response.ok) {
          throw new Error(body?.message || "We could not verify your payment right now.");
        }

        setPayload(body);
        setStatus("success");
        setMessage(body?.message || "Payment verified successfully.");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setStatus("error");
        setMessage(error instanceof Error ? error.message : "We could not verify your payment right now.");
      }
    })();

    return () => controller.abort();
  }, [reference]);

  useEffect(() => {
    if (status === "success" && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, status]);

  const handleContinue = async () => {
    if (!hasAuth0BrowserEnv) {
      setStatus("error");
      setMessage("Auth0 browser settings are not configured yet.");
      return;
    }

    setMessage("Opening secure sign-in...");

    const authorizationParams = {
      ...(payload?.email ? { login_hint: payload.email } : {}),
      prompt: "login" as const,
    };

    try {
      await loginWithPopup({
        authorizationParams,
      });
      navigate("/dashboard");
    } catch (error) {
      console.warn("[auth] payment success popup login failed, falling back to redirect", error);
      setMessage("Popup sign-in was blocked, redirecting to secure sign-in...");

      await loginWithRedirect({
        authorizationParams,
        appState: {
          returnTo: "/dashboard",
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#83c406]/35 bg-[#83c406]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#dff3ab]">
          <ShieldCheck className="h-3.5 w-3.5" />
          Paystack Verification
        </div>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {status === "success" ? "Payment Confirmed" : status === "error" ? "Something Needs Attention" : "Almost There"}
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-300">{message}</p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
          {status === "loading" && (
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <LoaderCircle className="h-5 w-5 animate-spin text-[#83c406]" />
              <span>Checking your Paystack transaction details...</span>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-3 text-sm text-gray-200">
              <div className="flex items-center gap-3 text-[#dff3ab]">
                <CheckCircle2 className="h-5 w-5" />
                <span>We’ve matched your payment and activated your signup.</span>
              </div>
              <div className="grid gap-2 text-gray-300 sm:grid-cols-2">
                <p>Plan: {payload?.planName ?? "Selected plan"}</p>
                <p>Email: {payload?.email ?? "Your account email"}</p>
                <p>Company: {payload?.companyName ?? "Your company"}</p>
                <p>Status: {payload?.paymentStatus ?? "success"}</p>
                <p>Domain: {payload?.selectedDomain ?? "Included domain selection"}</p>
                <p>
                  Auto renews:{" "}
                  {payload?.domainAutoRenewAt
                    ? new Date(payload.domainAutoRenewAt).toLocaleDateString("en-ZA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "1 year after purchase date"}
                </p>
                <p>Fulfillment: {payload?.domainFulfillmentStatus ?? "Queued after payment"}</p>
              </div>
              {payload?.domainFulfillmentNotes && (
                <p className="text-sm text-gray-300">{payload.domainFulfillmentNotes}</p>
              )}
            </div>
          )}

          {status === "error" && (
            <div className="flex items-start gap-3 text-sm text-red-300">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{message}</span>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {status === "success" && (
            <Button
              onClick={() => void handleContinue()}
              disabled={isLoading}
              className="h-12 rounded-xl bg-[#83c406] px-6 font-bold text-gray-950 hover:bg-[#97d71a]">
              {isAuthenticated ? "Open your dashboard" : "Sign in to your dashboard"}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="h-12 rounded-xl border-white/15 bg-transparent px-6 text-white hover:bg-white/10">
            Back to home
          </Button>
        </div>
      </div>
    </div>
  );
}
