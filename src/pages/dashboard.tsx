import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Building2, CreditCard, LoaderCircle, LogOut, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    selectedDomain: string | null;
    domainAutoRenewAt: string | null;
    domainFulfillmentStatus: string | null;
    domainFulfillmentNotes: string | null;
    createdAt: string;
  } | null;
};

export default function DashboardPage() {
  const { isAuthenticated, isLoading, loginWithRedirect, logout, getAccessTokenSilently, getIdTokenClaims, user } = useAuth0();
  const [profile, setProfile] = useState<DashboardPayload | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isSubmittingOnboarding, setIsSubmittingOnboarding] = useState(false);
  const [onboardingMessage, setOnboardingMessage] = useState("");
  const [registrant, setRegistrant] = useState({
    firstname: "",
    lastname: "",
    companyname: "",
    email: "",
    phonenumber: "",
    address1: "",
    city: "",
    state: "",
    postcode: "",
    country: "ZA",
  });
  const [nameservers, setNameservers] = useState({
    ns1: "",
    ns2: "",
    ns3: "",
    ns4: "",
    ns5: "",
  });

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
        setRegistrant((current) => ({
          ...current,
          companyname: body?.latestSignup?.companyName || current.companyname,
          email: body?.email || current.email,
        }));
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
              <p>Domain: {profile?.latestSignup?.selectedDomain || "No domain selected yet"}</p>
              <p>
                Next renewal:{" "}
                {profile?.latestSignup?.domainAutoRenewAt
                  ? new Date(profile.latestSignup.domainAutoRenewAt).toLocaleDateString("en-ZA")
                  : "Starts after the included first year"}
              </p>
              <p>Fulfillment: {profile?.latestSignup?.domainFulfillmentStatus || "Awaiting fulfillment"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#83c406]/15 via-white/5 to-white/0 p-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[#dff3ab]" />
            <h2 className="text-xl font-bold">Next Steps</h2>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-300">
            {profile?.latestSignup?.domainFulfillmentNotes ||
              "This dashboard is now protected by secure sign-in. The next phase can expand this area with onboarding tasks, project updates, invoice history, and content requests tied to each signed-in client."}
          </p>
        </div>

        {profile?.latestSignup?.paymentStatus === "success" && (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#83c406]" />
              <h2 className="text-xl font-bold">Domain Onboarding</h2>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-300">
              Submit the final nameserver and registrant details for {profile?.latestSignup?.selectedDomain || "your selected domain"} so we can move fulfillment from queued to delivery.
            </p>

            <form
              className="mt-6 grid gap-6 lg:grid-cols-2"
              onSubmit={async (event) => {
                event.preventDefault();

                try {
                  setIsSubmittingOnboarding(true);
                  setOnboardingMessage("Submitting your domain onboarding details...");

                  const accessToken = await getAccessTokenSilently();
                  const idTokenClaims = await getIdTokenClaims();
                  const idToken = typeof idTokenClaims?.__raw === "string" ? idTokenClaims.__raw : "";

                  const response = await apiFetch("/api/domain-fulfillment/onboarding", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${accessToken}`,
                      "X-Auth0-Id-Token": idToken,
                    },
                    body: JSON.stringify({
                      registrant,
                      nameservers,
                    }),
                  });

                  const payload = (await response.json().catch(() => null)) as { message?: string } | null;

                  if (!response.ok) {
                    throw new Error(payload?.message || "We could not submit domain onboarding right now.");
                  }

                  setOnboardingMessage(payload?.message || "Domain onboarding submitted successfully.");
                  setProfile((current) =>
                    current?.latestSignup
                      ? {
                          ...current,
                          latestSignup: {
                            ...current.latestSignup,
                            domainFulfillmentStatus: "details_submitted",
                            domainFulfillmentNotes: payload?.message || "Domain onboarding submitted successfully.",
                          },
                        }
                      : current,
                  );
                } catch (error) {
                  setOnboardingMessage(
                    error instanceof Error ? error.message : "We could not submit domain onboarding right now.",
                  );
                } finally {
                  setIsSubmittingOnboarding(false);
                }
              }}>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Registrant details</h3>
                <Field label="First name" value={registrant.firstname} onChange={(value) => setRegistrant((current) => ({ ...current, firstname: value }))} />
                <Field label="Last name" value={registrant.lastname} onChange={(value) => setRegistrant((current) => ({ ...current, lastname: value }))} />
                <Field label="Company name" value={registrant.companyname} onChange={(value) => setRegistrant((current) => ({ ...current, companyname: value }))} />
                <Field label="Email" type="email" value={registrant.email} onChange={(value) => setRegistrant((current) => ({ ...current, email: value }))} />
                <Field label="Phone number" value={registrant.phonenumber} onChange={(value) => setRegistrant((current) => ({ ...current, phonenumber: value }))} />
                <Field label="Address line 1" value={registrant.address1} onChange={(value) => setRegistrant((current) => ({ ...current, address1: value }))} />
                <Field label="City" value={registrant.city} onChange={(value) => setRegistrant((current) => ({ ...current, city: value }))} />
                <Field label="Province / State" value={registrant.state} onChange={(value) => setRegistrant((current) => ({ ...current, state: value }))} />
                <Field label="Postal code" value={registrant.postcode} onChange={(value) => setRegistrant((current) => ({ ...current, postcode: value }))} />
                <Field label="Country code" value={registrant.country} onChange={(value) => setRegistrant((current) => ({ ...current, country: value.toUpperCase() }))} />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Nameservers</h3>
                <Field label="Primary nameserver" value={nameservers.ns1} onChange={(value) => setNameservers((current) => ({ ...current, ns1: value }))} />
                <Field label="Secondary nameserver" value={nameservers.ns2} onChange={(value) => setNameservers((current) => ({ ...current, ns2: value }))} />
                <Field label="Nameserver 3" value={nameservers.ns3} onChange={(value) => setNameservers((current) => ({ ...current, ns3: value }))} required={false} />
                <Field label="Nameserver 4" value={nameservers.ns4} onChange={(value) => setNameservers((current) => ({ ...current, ns4: value }))} required={false} />
                <Field label="Nameserver 5" value={nameservers.ns5} onChange={(value) => setNameservers((current) => ({ ...current, ns5: value }))} required={false} />

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm leading-relaxed text-gray-300">
                    Once submitted, your domain fulfillment status moves to <span className="font-semibold text-white">details_submitted</span> so registration and configuration can proceed.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmittingOnboarding}
                  className="h-12 w-full rounded-xl bg-[#83c406] font-bold text-gray-950 hover:bg-[#97d71a]">
                  {isSubmittingOnboarding ? "Submitting details..." : "Submit domain onboarding"}
                </Button>
                {onboardingMessage && <p className="text-sm text-gray-300">{onboardingMessage}</p>}
              </div>
            </form>
          </div>
        )}
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

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-white">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-gray-500"
      />
    </div>
  );
}
