import { useEffect, useState } from "react";
import { Search, Globe, BadgeCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { DomainOrderDialog } from "@/components/landing/domain-order-dialog";

type DomainOption = {
  id: string;
  extension: string;
  name: string;
  description: string;
  price: number;
  currency?: string;
  source?: string;
};

type AvailabilityResult = {
  domain: string;
  available: boolean | null;
  message?: string;
};

const fallbackOptions: DomainOption[] = [
  {
    id: "co-za",
    extension: ".co.za",
    name: ".co.za",
    description: "Best for South African brands and local visibility.",
    price: 150,
    currency: "ZAR",
    source: "fallback",
  },
  {
    id: "com",
    extension: ".com",
    name: ".com",
    description: "The classic global commercial domain extension.",
    price: 280,
    currency: "ZAR",
    source: "fallback",
  },
  {
    id: "org",
    extension: ".org",
    name: ".org",
    description: "Great for communities, foundations, and trust-led brands.",
    price: 150,
    currency: "ZAR",
    source: "fallback",
  },
  {
    id: "net",
    extension: ".net",
    name: ".net",
    description: "A strong alternative when your first choice is taken.",
    price: 360,
    currency: "ZAR",
    source: "fallback",
  },
];

function formatZAR(amount: number) {
  return `R${amount.toLocaleString("en-ZA")}`;
}

function normalizeSearchTerm(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/\..*$/, "")
    .replace(/[^a-z0-9-]/g, "");
}

export function DomainSearchSection({ onOpenWizard }: { onOpenWizard?: () => void }) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<DomainOption[]>(fallbackOptions);
  const [results, setResults] = useState<Record<string, AvailabilityResult>>({});
  const [statusMessage, setStatusMessage] = useState("Live domain pricing is loading.");
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchedName, setSearchedName] = useState("");
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [orderMode, setOrderMode] = useState<"register" | "transfer">("register");

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      try {
        const response = await apiFetch("/api/domains/extensions");
        const payload = (await response.json().catch(() => null)) as
          | { options?: DomainOption[]; source?: string; warning?: string; configured?: boolean; message?: string }
          | null;

        if (!response.ok) {
          throw new Error(payload?.message || "We could not load domain pricing right now.");
        }

        if (cancelled) {
          return;
        }

        const nextOptions = Array.isArray(payload?.options) && payload.options.length > 0 ? payload.options : fallbackOptions;
        setOptions(nextOptions);

        if (payload?.source === "hostafrica") {
          setStatusMessage("Live reseller pricing is active.");
        } else if (payload?.configured === false) {
          setStatusMessage("Fallback pricing is showing until reseller access is configured.");
        } else if (payload?.warning) {
          setStatusMessage(`${payload.warning} Fallback pricing is showing for now.`);
        } else {
          setStatusMessage("Default pricing is showing for now.");
        }
      } catch (error) {
        if (!cancelled) {
          setOptions(fallbackOptions);
          setStatusMessage(error instanceof Error ? error.message : "We could not load domain pricing right now.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOptions(false);
        }
      }
    }

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = async () => {
    const normalizedQuery = normalizeSearchTerm(query);

    if (!normalizedQuery) {
      setStatusMessage("Enter the name you want, for example threejmedia.");
      return;
    }

    setIsSearching(true);
    setSearchedName(normalizedQuery);
    setStatusMessage(`Checking ${normalizedQuery} across live domain extensions...`);

    try {
      const response = await apiFetch("/api/domains/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: normalizedQuery,
          extensions: options.map((option) => option.extension),
        }),
      });

      const payload = (await response.json().catch(() => null)) as { results?: AvailabilityResult[]; message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message || "We could not check domain availability right now.");
      }

      const nextResults = Object.fromEntries(
        (payload?.results || []).map((result) => {
          const extension = options.find((option) => result.domain.endsWith(option.extension))?.extension;
          return [extension || result.domain, result];
        }),
      );

      setResults(nextResults);
      setStatusMessage(`Availability updated for ${normalizedQuery}.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "We could not check domain availability right now.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenOrder = (domain: string, mode: "register" | "transfer") => {
    setSelectedDomain(domain);
    setOrderMode(mode);
    setOrderDialogOpen(true);
  };

  return (
    <section id="domains" className="relative overflow-hidden bg-[#f5f2e8] py-16 md:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(131,196,6,0.16),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(17,24,39,0.10),_transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-700">
              <Globe className="h-3.5 w-3.5" />
              Domain Search
            </div>
            <h2 className="mt-5 max-w-xl text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl md:text-5xl">
              Search your next domain name with live HostAfrica pricing.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
              Check availability instantly, compare extensions, and move straight into your website quote when you find
              the right fit.
            </p>

            <div className="mt-8 rounded-[28px] border border-black/10 bg-white/80 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleSearch();
                      }
                    }}
                    type="text"
                    placeholder="Type your brand name"
                    className="h-14 w-full rounded-2xl border border-black/10 bg-[#fbfaf6] pl-11 pr-4 text-sm text-gray-950 outline-none transition focus:border-[#83c406]"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => void handleSearch()}
                  disabled={isSearching || isLoadingOptions}
                  className="h-14 rounded-2xl bg-gray-950 px-6 text-white hover:bg-black disabled:bg-gray-300 disabled:text-gray-500">
                  {isSearching ? "Checking..." : "Search domains"}
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span>{statusMessage}</span>
                {searchedName && (
                  <span className="rounded-full bg-[#83c406]/15 px-2.5 py-1 font-semibold text-[#466800]">
                    Search: {searchedName}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-600">
              {["Real-time availability", "Live reseller pricing", "South African domains included"].map((item) => (
                <div key={item} className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-2 shadow-sm">
                  <BadgeCheck className="h-4 w-4 text-[#5d8f00]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {options.map((option) => {
              const result = results[option.extension];
              const domainLabel = searchedName ? `${searchedName}${option.extension}` : option.name;

              return (
                <article
                  key={`${option.extension}-${option.currency || "zar"}`}
                  className="rounded-[28px] border border-black/10 bg-[#111827] p-5 text-white shadow-[0_25px_60px_rgba(17,24,39,0.18)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b6c2d9]">Extension</p>
                      <h3 className="mt-2 text-2xl font-extrabold tracking-tight">{option.name}</h3>
                    </div>
                    <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#dff3ab]">
                      {option.source === "hostafrica" ? "Live" : "Estimate"}
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-[#c5cedd]">{option.description}</p>

                  <div className="mt-6 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#8da0bf]">From</p>
                      <p className="mt-1 text-3xl font-extrabold">{formatZAR(option.price)}</p>
                      <p className="text-xs text-[#8da0bf]">per year</p>
                    </div>
                    <div
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]",
                        result?.available === true
                          ? "bg-[#83c406]/15 text-[#dff3ab]"
                          : result?.available === false
                            ? "bg-white/10 text-[#d6d9df]"
                            : "bg-white/10 text-[#8da0bf]",
                      )}>
                      {result?.available === true ? "Available" : result?.available === false ? "Taken" : "Check now"}
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-white/5 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#8da0bf]">Match</p>
                    <p className="mt-1 truncate text-sm font-semibold text-white">{domainLabel}</p>
                  </div>

                  {searchedName && (
                    <Button
                      type="button"
                      onClick={() => handleOpenOrder(domainLabel, result?.available === false ? "transfer" : "register")}
                      className="mt-5 h-11 w-full rounded-2xl bg-white text-gray-950 hover:bg-[#f5f2e8]">
                      {result?.available === false ? "Transfer this domain" : "Register this domain"}
                    </Button>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-[28px] border border-black/10 bg-white/75 px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="text-sm font-semibold text-gray-950">Found a domain you like?</p>
            <p className="mt-1 text-sm text-gray-600">
              Continue into the quote wizard and we’ll bundle the domain, hosting, and website build together.
            </p>
          </div>
          <Button
            onClick={() => onOpenWizard?.()}
            className="h-12 rounded-2xl bg-[#83c406] px-6 font-bold text-gray-950 hover:bg-[#97dd08]">
            Continue to Website Quote
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <DomainOrderDialog
        open={orderDialogOpen}
        mode={orderMode}
        domain={selectedDomain}
        onOpenChange={setOrderDialogOpen}
      />
    </section>
  );
}
