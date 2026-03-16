import { useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  ArrowUpRight,
  BadgeDollarSign,
  Building2,
  CreditCard,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  ShieldCheck,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { hasAuth0BrowserEnv } from "@/lib/env";
import { apiFetch } from "@/lib/api-client";
import { navigate } from "@/lib/navigation";
import { usePageSeo } from "@/hooks/use-page-seo";

type AdminOverviewPayload = {
  message?: string;
  admin: {
    email: string;
    fullName: string;
  };
  metrics: {
    totalClients: number;
    activeSubscriptions: number;
    pendingFulfillment: number;
    paymentAttention: number;
    monthlyRevenueZar: number;
    monthlyRevenueLabel: string;
  };
  recentClients: Array<{
    id: string;
    companyName: string;
    fullName: string;
    email: string;
    planName: string;
    paymentStatus: string;
    selectedDomain: string | null;
    createdAt: string;
  }>;
  renewalSchedule: Array<{
    id: string;
    companyName: string;
    email: string;
    domain: string | null;
    renewsAt: string;
    planName: string;
  }>;
  subscriptions: Array<{
    id: string;
    companyName: string;
    email: string;
    planName: string;
    amountZar: number;
    paymentStatus: string;
    paymentReference: string | null;
    fulfillmentStatus: string | null;
    autoRenewAt: string | null;
  }>;
  readiness: Array<{
    id: string;
    label: string;
    ready: boolean;
    detail: string;
  }>;
};

function formatDate(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Not set";
  }

  return parsed.toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount?: number | null) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function getStatusVariant(status: string) {
  if (status === "success" || status === "completed" || status === "ready") {
    return "default";
  }

  if (status === "initialized" || status === "queued") {
    return "secondary";
  }

  return "outline";
}

function getAdminReturnTo() {
  return window.location.hostname === "admin.threejmedia.co.za" ? "/" : "/admin";
}

export default function AdminPage() {
  const { isAuthenticated, isLoading, loginWithRedirect, logout, getAccessTokenSilently, getIdTokenClaims, user } = useAuth0();
  const [payload, setPayload] = useState<AdminOverviewPayload | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const adminReturnTo = useMemo(() => getAdminReturnTo(), []);

  usePageSeo({
    title: "Admin Workspace | Three J Media",
    description: "Operations workspace for clients, subscriptions, billing, and business readiness.",
    path: "/admin",
    robots: "noindex, nofollow",
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
      setMessage("Loading your admin workspace...");

      try {
        const accessToken = await getAccessTokenSilently();
        const idTokenClaims = await getIdTokenClaims();
        const idToken = typeof idTokenClaims?.__raw === "string" ? idTokenClaims.__raw : "";

        if (!idToken) {
          throw new Error("We could not verify your sign-in details. Please sign in again.");
        }

        const response = await apiFetch("/api/admin/overview", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Auth0-Id-Token": idToken,
          },
          signal: controller.signal,
        });

        const body = (await response.json().catch(() => null)) as AdminOverviewPayload | { message?: string } | null;

        if (!response.ok) {
          throw new Error(body?.message || "We could not load your admin workspace.");
        }

        setPayload(body as AdminOverviewPayload);
        setStatus("idle");
        setMessage("");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setStatus("error");
        setMessage(error instanceof Error ? error.message : "We could not load your admin workspace.");
      }
    })();

    return () => controller.abort();
  }, [getAccessTokenSilently, getIdTokenClaims, isAuthenticated, isLoading, user?.email, user?.sub]);

  if (!hasAuth0BrowserEnv) {
    return <AdminNotice title="Admin sign-in is not configured" message="Add the Auth0 browser variables before opening the admin workspace." />;
  }

  if (isLoading) {
    return <AdminNotice title="Checking your session" message="Please wait while we restore the admin workspace." loading />;
  }

  if (!isAuthenticated) {
    return (
      <AdminNotice
        title="Sign in to the admin workspace"
        message="Use an allowed admin account to manage clients, subscriptions, billing, and operational readiness."
        actionLabel="Sign in"
        onAction={() =>
          void loginWithRedirect({
            authorizationParams: {
              prompt: "login",
            },
            appState: {
              returnTo: adminReturnTo,
            },
          })
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f4ee] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="overflow-hidden rounded-[2rem] border border-[#d7d2c4] bg-white shadow-[0_20px_80px_-40px_rgba(15,23,42,0.35)]">
          <div className="border-b border-[#e5dfd1] bg-[radial-gradient(circle_at_top_left,_rgba(131,196,6,0.18),_transparent_35%),linear-gradient(135deg,#fffdf8_0%,#f2eee4_100%)] px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#83c406]/25 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#5f8607]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin Workspace
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Run Three J Media from one place</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                  This is the first admin stage: client visibility, subscription tracking, revenue signals, and operational
                  readiness pulled from live signup and payment data.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => navigate("/")} className="rounded-xl border-slate-300 bg-white/80">
                  Marketing site
                </Button>
                <Button
                  variant="outline"
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                  className="rounded-xl border-slate-300 bg-white/80"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/70 bg-white/70 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Signed in as</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{payload?.admin.fullName || user?.name || "Admin user"}</p>
                <p className="text-sm text-slate-600">{payload?.admin.email || user?.email || "No email available"}</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/70 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Workspace focus</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Clients, billing, renewals</p>
                <p className="text-sm text-slate-600">Invoices and deeper automation can layer onto this next.</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/70 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Best URL</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">admin.threejmedia.co.za</p>
                <p className="text-sm text-slate-600">The same workspace also works right now at `/admin`.</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8">
            {status === "loading" && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <LoaderCircle className="h-5 w-5 animate-spin text-[#83c406]" />
                <span>{message}</span>
              </div>
            )}

            {status === "error" && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Total clients"
                value={String(payload?.metrics.totalClients ?? 0)}
                detail="Unique client accounts across recorded signups."
                icon={<UserRound className="h-5 w-5" />}
              />
              <MetricCard
                title="Active subscriptions"
                value={String(payload?.metrics.activeSubscriptions ?? 0)}
                detail="Latest signup per client with successful payment."
                icon={<CreditCard className="h-5 w-5" />}
              />
              <MetricCard
                title="Revenue this month"
                value={payload?.metrics.monthlyRevenueLabel ?? "R0"}
                detail="Successful payments recorded this calendar month."
                icon={<BadgeDollarSign className="h-5 w-5" />}
              />
              <MetricCard
                title="Needs attention"
                value={String((payload?.metrics.pendingFulfillment ?? 0) + (payload?.metrics.paymentAttention ?? 0))}
                detail="Pending domain fulfillment plus non-success payment states."
                icon={<LockKeyhole className="h-5 w-5" />}
              />
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
              <Card className="border-[#e5dfd1] shadow-none">
                <CardHeader>
                  <CardTitle>Recent clients</CardTitle>
                  <CardDescription>The newest client records coming through the live signup flow.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(payload?.recentClients || []).map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="whitespace-normal">
                            <div className="font-medium text-slate-900">{client.companyName || client.fullName}</div>
                            <div className="text-xs text-slate-500">{client.email}</div>
                          </TableCell>
                          <TableCell>{client.planName}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(client.paymentStatus)}>{client.paymentStatus}</Badge>
                          </TableCell>
                          <TableCell>{client.selectedDomain || "Not selected"}</TableCell>
                          <TableCell>{formatDate(client.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-[#e5dfd1] shadow-none">
                <CardHeader>
                  <CardTitle>Operational readiness</CardTitle>
                  <CardDescription>Deployment and access checks for the admin stage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(payload?.readiness || []).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-slate-900">{item.label}</p>
                        <Badge variant={item.ready ? "default" : "outline"}>{item.ready ? "Ready" : "Action needed"}</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
              <Card className="border-[#e5dfd1] shadow-none">
                <CardHeader>
                  <CardTitle>Renewals due soon</CardTitle>
                  <CardDescription>Domains reaching auto-renew in the next 30 days.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(payload?.renewalSchedule || []).length > 0 ? (
                    payload?.renewalSchedule.map((renewal) => (
                      <div key={renewal.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-900">{renewal.companyName}</p>
                            <p className="text-sm text-slate-500">{renewal.email}</p>
                          </div>
                          <Badge variant="secondary">{formatDate(renewal.renewsAt)}</Badge>
                        </div>
                        <p className="mt-3 text-sm text-slate-700">{renewal.domain || "No domain stored yet"}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{renewal.planName}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                      No renewals are due in the next 30 days from the current data snapshot.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-[#e5dfd1] shadow-none">
                <CardHeader>
                  <CardTitle>Subscriptions and payment status</CardTitle>
                  <CardDescription>Latest live records you can use to manage client billing conversations.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Fulfillment</TableHead>
                        <TableHead>Renewal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(payload?.subscriptions || []).map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell className="whitespace-normal">
                            <div className="font-medium text-slate-900">{subscription.companyName}</div>
                            <div className="text-xs text-slate-500">{subscription.email}</div>
                          </TableCell>
                          <TableCell>{subscription.planName}</TableCell>
                          <TableCell>{formatCurrency(subscription.amountZar)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge variant={getStatusVariant(subscription.paymentStatus)}>{subscription.paymentStatus}</Badge>
                              <span className="text-xs text-slate-500">{subscription.paymentReference || "No reference yet"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(subscription.fulfillmentStatus || "outline")}>
                              {subscription.fulfillmentStatus || "not_started"}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(subscription.autoRenewAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-3">
              <InfoPanel
                icon={<Building2 className="h-5 w-5" />}
                title="Clients"
                body="Use this space to track who signed up, what plan they chose, and which domains still need operational follow-through."
              />
              <InfoPanel
                icon={<CreditCard className="h-5 w-5" />}
                title="Invoices and subscriptions"
                body="The next stage can attach invoice records, manual payment actions, upgrade flows, and recurring billing logic to these client profiles."
              />
              <InfoPanel
                icon={<ArrowUpRight className="h-5 w-5" />}
                title="Settings"
                body="This first release already shows whether admin access, Auth0, CORS, and Paystack are production-ready for the dedicated admin subdomain."
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, detail, icon }: { title: string; value: string; detail: string; icon: React.ReactNode }) {
  return (
    <Card className="border-[#e5dfd1] bg-white shadow-none">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardDescription className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{title}</CardDescription>
          <div className="rounded-xl bg-[#eef6da] p-2 text-[#6c9800]">{icon}</div>
        </div>
        <CardTitle className="text-3xl font-black tracking-tight">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-slate-600">{detail}</p>
      </CardContent>
    </Card>
  );
}

function InfoPanel({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <Card className="border-[#e5dfd1] shadow-none">
      <CardHeader>
        <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef6da] text-[#6c9800]">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-slate-600">{body}</p>
      </CardContent>
    </Card>
  );
}

function AdminNotice({
  title,
  message,
  loading = false,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#f6f4ee] px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-[#d7d2c4] bg-white p-8 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.35)] sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#83c406]/25 bg-[#eef6da] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#5f8607]">
          <ShieldCheck className="h-3.5 w-3.5" />
          Three J Media Admin
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{message}</p>

        {loading && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <LoaderCircle className="h-5 w-5 animate-spin text-[#83c406]" />
            <span>Loading workspace…</span>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {actionLabel && onAction && (
            <Button onClick={onAction} className="rounded-xl bg-slate-950 text-white hover:bg-slate-800">
              {actionLabel}
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate("/")} className="rounded-xl border-slate-300">
            Back to site
          </Button>
        </div>
      </div>
    </div>
  );
}
