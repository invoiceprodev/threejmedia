import { useState } from "react";
import { ShieldCheck, RefreshCw, KeyRound, ServerCog, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { apiFetch } from "@/lib/api-client";

type NameserverForm = {
  ns1: string;
  ns2: string;
  ns3: string;
  ns4: string;
  ns5: string;
};

const initialNameservers: NameserverForm = {
  ns1: "",
  ns2: "",
  ns3: "",
  ns4: "",
  ns5: "",
};

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function DomainManagementSection() {
  const [domain, setDomain] = useState("");
  const [statusMessage, setStatusMessage] = useState("Load an existing domain to manage post-purchase settings.");
  const [isLoading, setIsLoading] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [information, setInformation] = useState<unknown>(null);
  const [nameservers, setNameservers] = useState<NameserverForm>(initialNameservers);
  const [lockEnabled, setLockEnabled] = useState(false);
  const [eppCode, setEppCode] = useState("");
  const [renewYears, setRenewYears] = useState("1");
  const [dnsJson, setDnsJson] = useState("[]");
  const [contactJson, setContactJson] = useState("{}");
  const [confirmLiveChange, setConfirmLiveChange] = useState(false);

  const normalizedDomain = domain.trim().toLowerCase();

  const loadJsonEndpoint = async (path: string) => {
    const response = await apiFetch(`${path}?domain=${encodeURIComponent(normalizedDomain)}`);
    const payload = (await response.json().catch(() => null)) as { result?: unknown; message?: string } | null;

    if (!response.ok) {
      throw new Error(payload?.message || "We could not load the domain details right now.");
    }

    return payload?.result;
  };

  const handleLoad = async () => {
    if (!normalizedDomain) {
      setStatusMessage("Enter the full domain name first, for example example.co.za.");
      return;
    }

    setIsLoading(true);
    setStatusMessage(`Loading management data for ${normalizedDomain}...`);

    try {
      const [infoResult, nameserverResult, lockResult, dnsResult, contactResult] = await Promise.all([
        loadJsonEndpoint("/api/domains/information"),
        loadJsonEndpoint("/api/domains/nameservers"),
        loadJsonEndpoint("/api/domains/lock"),
        loadJsonEndpoint("/api/domains/dns"),
        loadJsonEndpoint("/api/domains/contact"),
      ]);

      setInformation(infoResult);

      if (nameserverResult && typeof nameserverResult === "object") {
        setNameservers({
          ns1: String((nameserverResult as Record<string, unknown>).ns1 || ""),
          ns2: String((nameserverResult as Record<string, unknown>).ns2 || ""),
          ns3: String((nameserverResult as Record<string, unknown>).ns3 || ""),
          ns4: String((nameserverResult as Record<string, unknown>).ns4 || ""),
          ns5: String((nameserverResult as Record<string, unknown>).ns5 || ""),
        });
      }

      const lockStatus = String(
        (lockResult as Record<string, unknown> | null)?.lockstatus ||
          (lockResult as Record<string, unknown> | null)?.status ||
          "",
      ).toLowerCase();
      setLockEnabled(["locked", "true", "1", "on"].includes(lockStatus));
      setDnsJson(prettyJson(dnsResult ?? []));
      setContactJson(prettyJson(contactResult ?? {}));
      setStatusMessage(`Management data loaded for ${normalizedDomain}.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "We could not load the domain details right now.");
    } finally {
      setIsLoading(false);
    }
  };

  const postJson = async (path: string, body: Record<string, unknown>, successMessage: string) => {
    setIsWorking(true);

    try {
      const response = await apiFetch(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message || "We could not save the change right now.");
      }

      setStatusMessage(payload?.message || successMessage);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "We could not save the change right now.");
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <section id="domain-management" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-700">
            <ServerCog className="h-3.5 w-3.5" />
            Domain Management
          </div>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl md:text-5xl">
            Manage existing domains after purchase.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            Load a domain and work with the main reseller controls: nameservers, registrar lock, EPP code, renewals,
            contact details, and DNS records.
          </p>
        </div>

        <div className="mt-8 rounded-[28px] border border-gray-200 bg-[#faf7ef] p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row">
            <Input
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              placeholder="example.co.za"
              className="h-12 border-gray-300 bg-white text-gray-950"
            />
            <Button
              type="button"
              onClick={() => void handleLoad()}
              disabled={isLoading}
              className="h-12 rounded-xl bg-gray-950 text-white hover:bg-black">
              {isLoading ? "Loading..." : "Load domain"}
            </Button>
          </div>
          <p className="mt-3 text-sm text-gray-600">{statusMessage}</p>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <Panel icon={ShieldCheck} title="Overview">
            <pre className="max-h-80 overflow-auto rounded-2xl bg-gray-950 p-4 text-xs leading-relaxed text-gray-200">
              {prettyJson(information ?? { message: "Load a domain to inspect its current reseller data." })}
            </pre>
          </Panel>

          <Panel icon={ServerCog} title="Nameservers">
            <div className="grid gap-4 lg:grid-cols-2">
              {(["ns1", "ns2", "ns3", "ns4", "ns5"] as const).map((field) => (
                <div key={field}>
                  <Label htmlFor={`manage-${field}`}>{field.toUpperCase()}</Label>
                  <Input
                    id={`manage-${field}`}
                    value={nameservers[field]}
                    onChange={(event) => setNameservers((current) => ({ ...current, [field]: event.target.value }))}
                    className="mt-2 h-10 border-gray-300 bg-white text-gray-950"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isWorking}
                onClick={() =>
                  void postJson(
                    "/api/domains/nameservers",
                    { domain: normalizedDomain, nameservers, dryRun: true },
                    "Nameserver dry run passed.",
                  )
                }>
                Dry run
              </Button>
              <Button
                type="button"
                disabled={isWorking || !confirmLiveChange}
                onClick={() =>
                  void postJson("/api/domains/nameservers", { domain: normalizedDomain, nameservers }, "Nameservers updated.")
                }>
                Save nameservers
              </Button>
            </div>
          </Panel>

          <Panel icon={RefreshCw} title="Renew & Lock">
            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <Label htmlFor="renew-years">Renewal years</Label>
                <select
                  id="renew-years"
                  value={renewYears}
                  onChange={(event) => setRenewYears(event.target.value)}
                  className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none">
                  {[1, 2, 3, 4, 5].map((years) => (
                    <option key={years} value={years}>
                      {years} year{years > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isWorking}
                    onClick={() =>
                      void postJson(
                        "/api/domains/renew",
                        { domain: normalizedDomain, regperiod: Number(renewYears), dryRun: true },
                        "Renewal dry run passed.",
                      )
                    }>
                    Dry run renew
                  </Button>
                  <Button
                    type="button"
                    disabled={isWorking || !confirmLiveChange}
                    onClick={() =>
                      void postJson(
                        "/api/domains/renew",
                        { domain: normalizedDomain, regperiod: Number(renewYears), confirmOrder: true },
                        "Renewal order submitted.",
                      )
                    }>
                    Submit renew
                  </Button>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4">
                  <Checkbox
                    id="lock-domain"
                    checked={lockEnabled}
                    onCheckedChange={(checked) => setLockEnabled(checked === true)}
                  />
                  <div>
                    <Label htmlFor="lock-domain">Registrar lock enabled</Label>
                    <p className="mt-1 text-sm text-gray-600">Toggle the domain lock and save the change when ready.</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isWorking}
                    onClick={() =>
                      void postJson(
                        "/api/domains/lock",
                        { domain: normalizedDomain, lockstatus: lockEnabled, dryRun: true },
                        "Lock status dry run passed.",
                      )
                    }>
                    Dry run lock
                  </Button>
                  <Button
                    type="button"
                    disabled={isWorking || !confirmLiveChange}
                    onClick={() =>
                      void postJson(
                        "/api/domains/lock",
                        { domain: normalizedDomain, lockstatus: lockEnabled },
                        "Lock status updated.",
                      )
                    }>
                    Save lock
                  </Button>
                </div>
              </div>
            </div>
          </Panel>

          <Panel icon={KeyRound} title="EPP Code">
            <Button
              type="button"
              variant="outline"
              disabled={isWorking || isLoading}
              onClick={async () => {
                try {
                  setIsWorking(true);
                  const result = await loadJsonEndpoint("/api/domains/eppcode");
                  const nextCode = String((result as Record<string, unknown> | null)?.eppcode || result || "");
                  setEppCode(nextCode);
                  setStatusMessage(`EPP code fetched for ${normalizedDomain}.`);
                } catch (error) {
                  setStatusMessage(error instanceof Error ? error.message : "We could not fetch the EPP code right now.");
                } finally {
                  setIsWorking(false);
                }
              }}>
              Fetch EPP code
            </Button>
            <Input value={eppCode} readOnly className="mt-4 h-10 border-gray-300 bg-white text-gray-950" />
          </Panel>

          <Panel icon={FileJson} title="DNS Records">
            <textarea
              value={dnsJson}
              onChange={(event) => setDnsJson(event.target.value)}
              className="h-72 w-full rounded-2xl border border-gray-300 bg-white p-4 font-mono text-xs text-gray-950 outline-none"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isWorking}
                onClick={() =>
                  void postJson(
                    "/api/domains/dns",
                    { domain: normalizedDomain, dnsrecords: JSON.parse(dnsJson), dryRun: true },
                    "DNS dry run passed.",
                  )
                }>
                Dry run DNS
              </Button>
              <Button
                type="button"
                disabled={isWorking || !confirmLiveChange}
                onClick={() =>
                  void postJson("/api/domains/dns", { domain: normalizedDomain, dnsrecords: JSON.parse(dnsJson) }, "DNS updated.")
                }>
                Save DNS
              </Button>
            </div>
          </Panel>

          <Panel icon={FileJson} title="Contact Details">
            <textarea
              value={contactJson}
              onChange={(event) => setContactJson(event.target.value)}
              className="h-72 w-full rounded-2xl border border-gray-300 bg-white p-4 font-mono text-xs text-gray-950 outline-none"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isWorking}
                onClick={() =>
                  void postJson(
                    "/api/domains/contact",
                    { domain: normalizedDomain, contactdetails: JSON.parse(contactJson), dryRun: true },
                    "Contact dry run passed.",
                  )
                }>
                Dry run contacts
              </Button>
              <Button
                type="button"
                disabled={isWorking || !confirmLiveChange}
                onClick={() =>
                  void postJson(
                    "/api/domains/contact",
                    { domain: normalizedDomain, contactdetails: JSON.parse(contactJson) },
                    "Contact details updated.",
                  )
                }>
                Save contacts
              </Button>
            </div>
          </Panel>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="confirm-management-change"
              checked={confirmLiveChange}
              onCheckedChange={(checked) => setConfirmLiveChange(checked === true)}
            />
            <div>
              <Label htmlFor="confirm-management-change" className="text-amber-950">
                I understand that non-dry-run actions make live reseller changes
              </Label>
              <p className="mt-1 text-sm text-amber-900">
                Use the dry-run buttons first if you only want to validate payloads before applying changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Panel({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof ShieldCheck;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-[28px] border border-gray-200 bg-[#faf7ef] p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-gray-950 p-3 text-white">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-xl font-bold tracking-tight text-gray-950">{title}</h3>
      </div>
      <div className="mt-5">{children}</div>
    </article>
  );
}
