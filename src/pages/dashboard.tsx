import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Building2, CreditCard, LoaderCircle, LogOut, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasAuth0BrowserEnv } from "@/lib/env";
import { apiFetch } from "@/lib/api-client";
import { navigate } from "@/lib/navigation";

type DashboardPayload = {
  email: string;
  fullName: string | null;
  auth0UserId: string;
  latestSignup: {
    companyName: string;
    planName: string;
    paymentStatus: string;
    paymentReference: string | null;
    createdAt: string;
  } | null;
};

export default function DashboardPage() {
  const { isAuthenticated, isLoading, loginWithRedirect, logout, getAccessTokenSilently, getIdTokenClaims, user } = useAuth0();
  const [profile, setProfile] = useState<DashboardPayload | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!hasAuth0BrowserEnv) {
      setStatus("error");
      setMessage("Auth0 browser settings are not configured yet.");
      return;
    }

    if (isLoading || !isAuthenticated) {
      return;
    }

    const controller = new AbortController();

    void (async () => {
      setStatus("loading");
      setMessage("Loading your dashboard...");

      try {
        const accessToken = await getAccessTokenSilently();
        const idTokenClaims = await getIdTokenClaims();
        const idToken = typeof idTokenClaims?.__raw === "string" ? idTokenClaims.__raw : "";

        if (!idToken) {
          throw new Error("We could not verify your sign-in details. Please sign in again.");
        }

        const response = await apiFetch("/api/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Auth0-Id-Token": idToken,
          },
          signal: controller.signal,
        });

        const body = (await response.json().catch(() => null)) as DashboardPayload & { message?: string };

        if (!response.ok) {
          throw new Error(body?.message || "We could not load your account details.");
        }

        setProfile(body);
        setStatus("idle");
        setMessage("");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setStatus("error");
        setMessage(error instanceof Error ? error.message : "We could not load your account details.");
      }
    })();

    return () => controller.abort();
  }, [getAccessTokenSilently, getIdTokenClaims, isAuthenticated, isLoading, user?.email, user?.sub]);

  if (!hasAuth0BrowserEnv) {
    return <DashboardNotice title="Sign-in not configured" message="Add the browser sign-in variables to continue." />;
  }

  if (isLoading) {
    return <DashboardNotice title="Checking your session" message="Please wait while we restore your account." loading />;
  }

  if (!isAuthenticated) {
    return (
      <DashboardNotice
        title="Sign in to continue"
        message="Use the account you created during signup to access your customer dashboard."
        actionLabel="Sign in"
        onAction={() =>
          void loginWithRedirect({
            authorizationParams: {
              prompt: "login",
            },
            appState: {
              returnTo: "/dashboard",
            },
          })
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#83c406]/35 bg-[#83c406]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#dff3ab]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Customer Dashboard
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Welcome back, {user?.name || user?.email}</h1>
            <p className="mt-2 text-sm text-gray-300">Your secure sign-in session is active.</p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="h-11 rounded-xl border-white/15 bg-transparent text-white hover:bg-white/10">
              Home
            </Button>
            <Button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="h-11 rounded-xl bg-white text-gray-950 hover:bg-gray-100">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>

        {status === "loading" && (
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-gray-300">
            <LoaderCircle className="h-5 w-5 animate-spin text-[#83c406]" />
            <span>{message}</span>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200">{message}</div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-[#83c406]" />
              <h2 className="text-xl font-bold">Account</h2>
            </div>
            <div className="mt-5 space-y-2 text-sm text-gray-300">
              <p>Email: {profile?.email || user?.email || "Unavailable"}</p>
              <p>Name: {profile?.fullName || user?.name || "Unavailable"}</p>
              <p>Account ID: {profile?.auth0UserId || user?.sub || "Unavailable"}</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-[#83c406]" />
              <h2 className="text-xl font-bold">Latest Plan</h2>
            </div>
            <div className="mt-5 space-y-2 text-sm text-gray-300">
              <p>Plan: {profile?.latestSignup?.planName || "No paid plan yet"}</p>
              <p>Company: {profile?.latestSignup?.companyName || "No company linked yet"}</p>
              <p>Status: {profile?.latestSignup?.paymentStatus || "No payment recorded"}</p>
              <p>Reference: {profile?.latestSignup?.paymentReference || "Unavailable"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#83c406]/15 via-white/5 to-white/0 p-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[#dff3ab]" />
            <h2 className="text-xl font-bold">Next Steps</h2>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-300">
            This dashboard is now protected by secure sign-in. The next phase can expand this area with onboarding tasks,
            project updates, invoice history, and content requests tied to each signed-in client.
          </p>
        </div>
      </div>
    </div>
  );
}

type DashboardNoticeProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
};

function DashboardNotice({ title, message, actionLabel, onAction, loading = false }: DashboardNoticeProps) {
  return (
    <div className="min-h-screen bg-gray-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-gray-300">{message}</p>

        {loading && (
          <div className="mt-6 inline-flex items-center gap-3 text-sm text-gray-300">
            <LoaderCircle className="h-5 w-5 animate-spin text-[#83c406]" />
            <span>Working on it...</span>
          </div>
        )}

        {actionLabel && onAction && (
          <Button onClick={onAction} className="mt-6 h-12 rounded-xl bg-[#83c406] px-6 font-bold text-gray-950 hover:bg-[#97d71a]">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
