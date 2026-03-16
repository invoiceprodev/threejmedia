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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
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

type AdminClientRecord = {
  id: string;
  company_name: string;
  primary_contact_name: string | null;
  primary_email: string;
  primary_phone: string | null;
  status: string;
  source: string;
  updated_at: string;
};

type AdminSubscriptionRecord = {
  id: string;
  client_id: string;
  plan_name: string;
  amount_zar: number;
  status: string;
  billing_cycle: string;
  payment_provider: string;
  payment_reference: string | null;
  renews_at: string | null;
};

type AdminListPayload<T> = {
  message?: string;
  data?: T[];
};

type AdminCreateClientForm = {
  companyName: string;
  primaryContactName: string;
  primaryEmail: string;
  primaryPhone: string;
  status: string;
  source: string;
  notes: string;
};

type AdminCreateSubscriptionForm = {
  clientId: string;
  planId: string;
  planName: string;
  amountZar: string;
  status: string;
  billingCycle: string;
  paymentProvider: string;
  paymentReference: string;
  renewsAt: string;
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
  const [clients, setClients] = useState<AdminClientRecord[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminSubscriptionRecord[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [clientForm, setClientForm] = useState<AdminCreateClientForm>({
    companyName: "",
    primaryContactName: "",
    primaryEmail: "",
    primaryPhone: "",
    status: "active",
    source: "admin_manual",
    notes: "",
  });
  const [subscriptionForm, setSubscriptionForm] = useState<AdminCreateSubscriptionForm>({
    clientId: "",
    planId: "",
    planName: "",
    amountZar: "",
    status: "active",
    billingCycle: "once_off",
    paymentProvider: "paystack",
    paymentReference: "",
    renewsAt: "",
  });
  const [clientFormStatus, setClientFormStatus] = useState<"idle" | "saving" | "error" | "success">("idle");
  const [subscriptionFormStatus, setSubscriptionFormStatus] = useState<"idle" | "saving" | "error" | "success">("idle");
  const [clientFormMessage, setClientFormMessage] = useState("");
  const [subscriptionFormMessage, setSubscriptionFormMessage] = useState("");
  const adminReturnTo = useMemo(() => getAdminReturnTo(), []);
  const clientLookup = useMemo(
    () =>
      new Map(
        clients.map((client) => [
          client.id,
          {
            companyName: client.company_name,
            email: client.primary_email,
          },
        ]),
      ),
    [clients],
  );

  const fetchAdminData = async (signal?: AbortSignal) => {
    const accessToken = await getAccessTokenSilently();
    const idTokenClaims = await getIdTokenClaims();
    const idToken = typeof idTokenClaims?.__raw === "string" ? idTokenClaims.__raw : "";

    if (!idToken) {
      throw new Error("We could not verify your sign-in details. Please sign in again.");
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "X-Auth0-Id-Token": idToken,
    };

    const [overviewResponse, clientsResponse, subscriptionsResponse] = await Promise.all([
      apiFetch("/api/admin/overview", {
        headers,
        signal,
      }),
      apiFetch("/api/admin/clients", {
        headers,
        signal,
      }),
      apiFetch("/api/admin/subscriptions", {
        headers,
        signal,
      }),
    ]);

    const overviewBody = (await overviewResponse.json().catch(() => null)) as AdminOverviewPayload | { message?: string } | null;
    const clientsBody = (await clientsResponse.json().catch(() => null)) as AdminListPayload<AdminClientRecord> | null;
    const subscriptionsBody = (await subscriptionsResponse.json().catch(() => null)) as AdminListPayload<AdminSubscriptionRecord> | null;

    if (!overviewResponse.ok) {
      throw new Error(overviewBody?.message || "We could not load your admin workspace.");
    }

    if (!clientsResponse.ok) {
      throw new Error(clientsBody?.message || "We could not load admin clients.");
    }

    if (!subscriptionsResponse.ok) {
      throw new Error(subscriptionsBody?.message || "We could not load admin subscriptions.");
    }

    setPayload(overviewBody as AdminOverviewPayload);
    setClients(Array.isArray(clientsBody?.data) ? clientsBody.data : []);
    setSubscriptions(Array.isArray(subscriptionsBody?.data) ? subscriptionsBody.data : []);
  };

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
        await fetchAdminData(controller.signal);
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

  const handleCreateClient = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setClientFormStatus("saving");
    setClientFormMessage("Saving client...");

    try {
      const accessToken = await getAccessTokenSilently();
      const idTokenClaims = await getIdTokenClaims();
      const idToken = typeof idTokenClaims?.__raw === "string" ? idTokenClaims.__raw : "";

      if (!idToken) {
        throw new Error("We could not verify your sign-in details. Please sign in again.");
      }

      const response = await apiFetch("/api/admin/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-Auth0-Id-Token": idToken,
        },
        body: JSON.stringify({
          companyName: clientForm.companyName,
          primaryContactName: clientForm.primaryContactName,
          primaryEmail: clientForm.primaryEmail,
          primaryPhone: clientForm.primaryPhone,
          status: clientForm.status,
          source: clientForm.source,
          notes: clientForm.notes,
        }),
      });

      const body = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(body?.message || "We could not create the client.");
      }

      await fetchAdminData();
      setClientForm({
        companyName: "",
        primaryContactName: "",
        primaryEmail: "",
        primaryPhone: "",
        status: "active",
        source: "admin_manual",
        notes: "",
      });
      setClientFormStatus("success");
      setClientFormMessage("Client created successfully.");
    } catch (error) {
      setClientFormStatus("error");
      setClientFormMessage(error instanceof Error ? error.message : "We could not create the client.");
    }
  };

  const handleCreateSubscription = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscriptionFormStatus("saving");
    setSubscriptionFormMessage("Saving subscription...");

    try {
      const accessToken = await getAccessTokenSilently();
      const idTokenClaims = await getIdTokenClaims();
      const idToken = typeof idTokenClaims?.__raw === "string" ? idTokenClaims.__raw : "";

      if (!idToken) {
        throw new Error("We could not verify your sign-in details. Please sign in again.");
      }

      const response = await apiFetch("/api/admin/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-Auth0-Id-Token": idToken,
        },
        body: JSON.stringify({
          clientId: subscriptionForm.clientId,
          planId: subscriptionForm.planId,
          planName: subscriptionForm.planName,
          amountZar: Number(subscriptionForm.amountZar || 0),
          status: subscriptionForm.status,
          billingCycle: subscriptionForm.billingCycle,
          paymentProvider: subscriptionForm.paymentProvider,
          paymentReference: subscriptionForm.paymentReference,
          renewsAt: subscriptionForm.renewsAt ? new Date(subscriptionForm.renewsAt).toISOString() : null,
        }),
      });

      const body = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(body?.message || "We could not create the subscription.");
      }

      await fetchAdminData();
      setSubscriptionForm({
        clientId: "",
        planId: "",
        planName: "",
        amountZar: "",
        status: "active",
        billingCycle: "once_off",
        paymentProvider: "paystack",
        paymentReference: "",
        renewsAt: "",
      });
      setSubscriptionFormStatus("success");
      setSubscriptionFormMessage("Subscription created successfully.");
    } catch (error) {
      setSubscriptionFormStatus("error");
      setSubscriptionFormMessage(error instanceof Error ? error.message : "We could not create the subscription.");
    }
  };

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
                  <CardTitle>Admin clients</CardTitle>
                  <CardDescription>Dedicated customer records from the `admin_clients` table.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.length > 0 ? (
                        clients.slice(0, 10).map((client) => (
                          <TableRow key={client.id}>
                            <TableCell className="whitespace-normal">
                              <div className="font-medium text-slate-900">{client.company_name}</div>
                              <div className="text-xs text-slate-500">{client.primary_email}</div>
                            </TableCell>
                            <TableCell className="whitespace-normal">
                              <div>{client.primary_contact_name || "No contact name"}</div>
                              <div className="text-xs text-slate-500">{client.primary_phone || "No phone number"}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(client.status)}>{client.status}</Badge>
                            </TableCell>
                            <TableCell>{client.source}</TableCell>
                            <TableCell>{formatDate(client.updated_at)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="py-8 text-center text-sm text-slate-500">
                            No records yet in `admin_clients`.
                          </TableCell>
                        </TableRow>
                      )}
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
                  <CardTitle>Admin subscriptions</CardTitle>
                  <CardDescription>Dedicated billing records from the `admin_subscriptions` table.</CardDescription>
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
                      {subscriptions.length > 0 ? (
                        subscriptions.slice(0, 12).map((subscription) => {
                          const client = clientLookup.get(subscription.client_id);

                          return (
                            <TableRow key={subscription.id}>
                              <TableCell className="whitespace-normal">
                                <div className="font-medium text-slate-900">{client?.companyName || "Unknown client"}</div>
                                <div className="text-xs text-slate-500">{client?.email || subscription.client_id}</div>
                              </TableCell>
                              <TableCell>{subscription.plan_name}</TableCell>
                              <TableCell>{formatCurrency(subscription.amount_zar)}</TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Badge variant={getStatusVariant(subscription.status)}>{subscription.status}</Badge>
                                  <span className="text-xs text-slate-500">
                                    {subscription.payment_reference || subscription.billing_cycle}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{subscription.payment_provider}</Badge>
                              </TableCell>
                              <TableCell>{formatDate(subscription.renews_at)}</TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="py-8 text-center text-sm text-slate-500">
                            No records yet in `admin_subscriptions`.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-3">
              <Card className="border-[#e5dfd1] shadow-none lg:col-span-2">
                <CardHeader>
                  <CardTitle>Create client</CardTitle>
                  <CardDescription>Add a dedicated record to `admin_clients`.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateClient}>
                    <div className="space-y-2">
                      <Label htmlFor="client-company-name">Company name</Label>
                      <Input
                        id="client-company-name"
                        value={clientForm.companyName}
                        onChange={(event) => setClientForm((current) => ({ ...current, companyName: event.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-primary-email">Primary email</Label>
                      <Input
                        id="client-primary-email"
                        type="email"
                        value={clientForm.primaryEmail}
                        onChange={(event) => setClientForm((current) => ({ ...current, primaryEmail: event.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-contact-name">Contact name</Label>
                      <Input
                        id="client-contact-name"
                        value={clientForm.primaryContactName}
                        onChange={(event) => setClientForm((current) => ({ ...current, primaryContactName: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-phone">Phone</Label>
                      <Input
                        id="client-phone"
                        value={clientForm.primaryPhone}
                        onChange={(event) => setClientForm((current) => ({ ...current, primaryPhone: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={clientForm.status} onValueChange={(value) => setClientForm((current) => ({ ...current, status: value }))}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-source">Source</Label>
                      <Input
                        id="client-source"
                        value={clientForm.source}
                        onChange={(event) => setClientForm((current) => ({ ...current, source: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="client-notes">Notes</Label>
                      <Textarea
                        id="client-notes"
                        value={clientForm.notes}
                        onChange={(event) => setClientForm((current) => ({ ...current, notes: event.target.value }))}
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center justify-between gap-3">
                      <p className={`text-sm ${clientFormStatus === "error" ? "text-red-600" : "text-slate-500"}`}>{clientFormMessage || "Create the client record first, then attach subscriptions below."}</p>
                      <Button type="submit" disabled={clientFormStatus === "saving"} className="rounded-xl bg-slate-950 text-white hover:bg-slate-800">
                        {clientFormStatus === "saving" ? "Saving..." : "Create client"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-[#e5dfd1] shadow-none">
                <CardHeader>
                  <CardTitle>Create subscription</CardTitle>
                  <CardDescription>Add a dedicated record to `admin_subscriptions`.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleCreateSubscription}>
                    <div className="space-y-2">
                      <Label>Client</Label>
                      <Select
                        value={subscriptionForm.clientId}
                        onValueChange={(value) => setSubscriptionForm((current) => ({ ...current, clientId: value }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.company_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subscription-plan-id">Plan ID</Label>
                      <Input
                        id="subscription-plan-id"
                        value={subscriptionForm.planId}
                        onChange={(event) => setSubscriptionForm((current) => ({ ...current, planId: event.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subscription-plan-name">Plan name</Label>
                      <Input
                        id="subscription-plan-name"
                        value={subscriptionForm.planName}
                        onChange={(event) => setSubscriptionForm((current) => ({ ...current, planName: event.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subscription-amount">Amount ZAR</Label>
                      <Input
                        id="subscription-amount"
                        type="number"
                        min="0"
                        value={subscriptionForm.amountZar}
                        onChange={(event) => setSubscriptionForm((current) => ({ ...current, amountZar: event.target.value }))}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={subscriptionForm.status}
                          onValueChange={(value) => setSubscriptionForm((current) => ({ ...current, status: value }))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="past_due">Past due</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Billing cycle</Label>
                        <Select
                          value={subscriptionForm.billingCycle}
                          onValueChange={(value) => setSubscriptionForm((current) => ({ ...current, billingCycle: value }))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once_off">Once off</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subscription-payment-reference">Payment reference</Label>
                      <Input
                        id="subscription-payment-reference"
                        value={subscriptionForm.paymentReference}
                        onChange={(event) => setSubscriptionForm((current) => ({ ...current, paymentReference: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subscription-renews-at">Renews at</Label>
                      <Input
                        id="subscription-renews-at"
                        type="date"
                        value={subscriptionForm.renewsAt}
                        onChange={(event) => setSubscriptionForm((current) => ({ ...current, renewsAt: event.target.value }))}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className={`text-sm ${subscriptionFormStatus === "error" ? "text-red-600" : "text-slate-500"}`}>{subscriptionFormMessage || "Link the subscription to an existing admin client."}</p>
                      <Button type="submit" disabled={subscriptionFormStatus === "saving"} className="rounded-xl bg-slate-950 text-white hover:bg-slate-800">
                        {subscriptionFormStatus === "saving" ? "Saving..." : "Create subscription"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

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
