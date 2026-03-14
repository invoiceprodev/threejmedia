import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WebsiteType {
  id: string;
  name: string;
  description: string;
  price: number;
  tag?: string;
}

interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  monthly?: boolean;
}

interface HostingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
}

interface DomainOption {
  id: string;
  name: string;
  description: string;
  price: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const WEBSITE_TYPES: WebsiteType[] = [
  {
    id: "landing",
    name: "Landing Page",
    description: "Single-page site focused on one offer or campaign. Perfect for launches.",
    price: 1999,
  },
  {
    id: "business",
    name: "Business Website",
    description: "Multi-page professional site with about, services, contact & more.",
    price: 4999,
    tag: "Most Popular",
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    description: "Full online store with product listings, cart and payment integration.",
    price: 7999,
  },
];

const ADDONS: Addon[] = [
  {
    id: "blog",
    name: "Blog",
    description: "Share articles, updates and attract organic traffic.",
    price: 500,
  },
  {
    id: "store",
    name: "Online Store",
    description: "Product catalogue, cart and checkout flow.",
    price: 2000,
  },
  {
    id: "booking",
    name: "Booking System",
    description: "Allow clients to schedule appointments online.",
    price: 1500,
  },
  {
    id: "seo",
    name: "SEO Setup",
    description: "Meta tags, sitemap, structured data and speed optimisation.",
    price: 800,
  },
  {
    id: "logo",
    name: "Logo Design",
    description: "Custom logo and brand mark delivered in all formats.",
    price: 1200,
  },
  {
    id: "maintenance",
    name: "Monthly Maintenance",
    description: "Updates, backups, uptime monitoring and support.",
    price: 699,
    monthly: true,
  },
];

const HOSTING_PLANS: HostingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Great for personal sites and simple landing pages.",
    price: 99,
    features: ["5 GB storage", "Free SSL", "1 website"],
  },
  {
    id: "standard",
    name: "Standard",
    description: "Ideal for growing businesses with moderate traffic.",
    price: 199,
    features: ["20 GB storage", "Free SSL", "3 websites", "Daily backups"],
  },
  {
    id: "premium",
    name: "Premium",
    description: "High-traffic stores and business-critical applications.",
    price: 399,
    features: ["100 GB storage", "Free SSL", "Unlimited sites", "Priority support", "CDN included"],
  },
];

const DOMAIN_OPTIONS: DomainOption[] = [
  {
    id: "org",
    name: ".org",
    description: "Strong fit for communities, nonprofits and trust-led brands.",
    price: 150,
  },
  {
    id: "coza",
    name: ".co.za",
    description: "Local South African domain for businesses targeting the home market.",
    price: 150,
  },
  {
    id: "com",
    name: ".com",
    description: "The most recognised global domain for commercial brands.",
    price: 280,
  },
  {
    id: "net",
    name: ".net",
    description: "Alternative global extension for networked or digital-first brands.",
    price: 360,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatZAR(amount: number) {
  return `R${amount.toLocaleString("en-ZA")}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            i < current ? "bg-white w-6" : i === current ? "bg-white w-10" : "bg-white/20 w-6",
          )}
        />
      ))}
    </div>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

function Step1({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">What type of website do you need?</h2>
        <p className="text-gray-400 text-sm mt-1">Select one option to get started.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 mt-6">
        {WEBSITE_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            className={cn(
              "relative text-left p-5 rounded-2xl border-2 transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
              selected === type.id
                ? "border-white bg-white text-gray-900"
                : "border-white/15 bg-white/5 text-white hover:border-white/40 hover:bg-white/10",
            )}>
            {type.tag && (
              <span
                className={cn(
                  "absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                  selected === type.id ? "bg-gray-900 text-white" : "bg-white text-gray-900",
                )}>
                {type.tag}
              </span>
            )}

            {selected === type.id && (
              <span className="absolute top-3 left-3 w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </span>
            )}

            <p className={cn("text-xl font-bold mb-1 mt-4", selected === type.id ? "text-gray-900" : "text-white")}>
              {formatZAR(type.price)}
            </p>
            <p className={cn("text-base font-semibold mb-1", selected === type.id ? "text-gray-800" : "text-white")}>
              {type.name}
            </p>
            <p className={cn("text-xs leading-relaxed", selected === type.id ? "text-gray-600" : "text-gray-400")}>
              {type.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

function Step2({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Add-on Features</h2>
        <p className="text-gray-400 text-sm mt-1">Select any extras — or skip to continue.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 mt-6">
        {ADDONS.map((addon) => {
          const active = selected.includes(addon.id);
          return (
            <button
              key={addon.id}
              onClick={() => onToggle(addon.id)}
              className={cn(
                "relative text-left p-5 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
                active
                  ? "border-white bg-white text-gray-900"
                  : "border-white/15 bg-white/5 text-white hover:border-white/40 hover:bg-white/10",
              )}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className={cn("font-semibold text-sm mb-0.5", active ? "text-gray-900" : "text-white")}>
                    {addon.name}
                  </p>
                  <p className={cn("text-xs leading-relaxed", active ? "text-gray-600" : "text-gray-400")}>
                    {addon.description}
                  </p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className={cn("text-sm font-bold", active ? "text-gray-900" : "text-white")}>
                    +{formatZAR(addon.price)}
                    {addon.monthly ? "/mo" : ""}
                  </span>
                  <span
                    className={cn(
                      "mt-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      active ? "bg-gray-900 border-gray-900" : "border-white/30",
                    )}>
                    {active && <Check className="w-3 h-3 text-white" />}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

function Step3({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Choose a Hosting Plan</h2>
        <p className="text-gray-400 text-sm mt-1">All plans include free SSL and managed infrastructure.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 mt-6">
        {HOSTING_PLANS.map((plan) => {
          const active = selected === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => onSelect(plan.id)}
              className={cn(
                "relative text-left p-5 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
                active
                  ? "border-white bg-white text-gray-900"
                  : "border-white/15 bg-white/5 text-white hover:border-white/40 hover:bg-white/10",
              )}>
              {active && (
                <span className="absolute top-3 left-3 w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </span>
              )}
              <p className={cn("text-xl font-bold mb-0.5 mt-4", active ? "text-gray-900" : "text-white")}>
                {formatZAR(plan.price)}
                <span className={cn("text-sm font-normal", active ? "text-gray-600" : "text-gray-400")}>/mo</span>
              </p>
              <p className={cn("font-semibold text-sm mb-2", active ? "text-gray-800" : "text-white")}>{plan.name}</p>
              <p className={cn("text-xs leading-relaxed mb-3", active ? "text-gray-600" : "text-gray-400")}>
                {plan.description}
              </p>
              <ul className="space-y-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5">
                    <Check className={cn("w-3 h-3 shrink-0", active ? "text-gray-700" : "text-gray-400")} />
                    <span className={cn("text-xs", active ? "text-gray-700" : "text-gray-400")}>{f}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────

function Step4({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Choose a Domain Extension</h2>
        <p className="text-gray-400 text-sm mt-1">Pick the domain you want us to register and configure for your site.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 mt-6">
        {DOMAIN_OPTIONS.map((domain) => {
          const active = selected === domain.id;
          return (
            <button
              key={domain.id}
              onClick={() => onSelect(domain.id)}
              className={cn(
                "relative text-left p-5 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
                active
                  ? "border-white bg-white text-gray-900"
                  : "border-white/15 bg-white/5 text-white hover:border-white/40 hover:bg-white/10",
              )}>
              {active && (
                <span className="absolute top-3 left-3 w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </span>
              )}
              <p className={cn("text-xl font-bold mb-1 mt-4", active ? "text-gray-900" : "text-white")}>
                {domain.name}
              </p>
              <p className={cn("text-base font-semibold mb-1", active ? "text-gray-800" : "text-white")}>
                {formatZAR(domain.price)}
                <span className={cn("ml-1 text-sm font-normal", active ? "text-gray-600" : "text-gray-400")}>/yr</span>
              </p>
              <p className={cn("text-xs leading-relaxed", active ? "text-gray-600" : "text-gray-400")}>
                {domain.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 5 Summary ───────────────────────────────────────────────────────────

function Step5({
  websiteTypeId,
  addonIds,
  hostingPlanId,
  domainOptionId,
}: {
  websiteTypeId: string | null;
  addonIds: string[];
  hostingPlanId: string | null;
  domainOptionId: string | null;
}) {
  const website = WEBSITE_TYPES.find((w) => w.id === websiteTypeId);
  const addons = ADDONS.filter((a) => addonIds.includes(a.id));
  const hosting = HOSTING_PLANS.find((h) => h.id === hostingPlanId);
  const domain = DOMAIN_OPTIONS.find((d) => d.id === domainOptionId);

  const onceOff = (website?.price ?? 0) + addons.filter((a) => !a.monthly).reduce((s, a) => s + a.price, 0);
  const monthly = (hosting?.price ?? 0) + addons.filter((a) => a.monthly).reduce((s, a) => s + a.price, 0);
  const yearly = domain?.price ?? 0;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !website || !hosting || !domain) {
      setSubmitMessage("Please complete your details and selections before requesting your quote.");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("Sending your custom quote request...");

    try {
      const response = await apiFetch("/api/budget-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          websiteTypeId: website.id,
          addonIds,
          hostingPlanId: hosting.id,
          domainOptionId: domain.id,
          onceOffTotal: onceOff,
          monthlyTotal: monthly,
          yearlyTotal: yearly,
          summary: {
            websiteTypeName: website.name,
            addonNames: addons.map((addon) => addon.name),
            hostingPlanName: hosting.name,
            domainOptionName: domain.name,
          },
        }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message || "We could not send your custom quote right now.");
      }

      setSubmitted(true);
      setSubmitMessage(payload?.message || "Thanks. Your budget request has been sent.");
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : "We could not send your custom quote right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Your Custom Quote</h2>
        <p className="text-gray-400 text-sm mt-1">Here's a breakdown of your selections.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/10 overflow-hidden">
        {/* Website type */}
        {website && (
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-white text-sm font-semibold">{website.name}</p>
              <p className="text-gray-400 text-xs">One-off build fee</p>
            </div>
            <span className="text-white font-bold">{formatZAR(website.price)}</span>
          </div>
        )}

        {/* Addons */}
        {addons.map((addon) => (
          <div key={addon.id} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-white text-sm font-semibold">{addon.name}</p>
              <p className="text-gray-400 text-xs">{addon.monthly ? "Monthly" : "One-off"}</p>
            </div>
            <span className="text-white font-bold">
              +{formatZAR(addon.price)}
              {addon.monthly ? "/mo" : ""}
            </span>
          </div>
        ))}

        {/* Hosting */}
        {hosting && (
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-white text-sm font-semibold">{hosting.name} Hosting</p>
              <p className="text-gray-400 text-xs">Monthly</p>
            </div>
            <span className="text-white font-bold">{formatZAR(hosting.price)}/mo</span>
          </div>
        )}

        {domain && (
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-white text-sm font-semibold">{domain.name} Domain</p>
              <p className="text-gray-400 text-xs">Annual</p>
            </div>
            <span className="text-white font-bold">{formatZAR(domain.price)}/yr</span>
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-gray-300 text-sm">Once-off total</span>
          <span className="text-white text-xl font-extrabold">{formatZAR(onceOff)}</span>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-gray-300 text-sm">Monthly total</span>
          <span className="text-white text-xl font-extrabold">{formatZAR(monthly)}/mo</span>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-gray-300 text-sm">Annual domain total</span>
          <span className="text-white text-xl font-extrabold">{formatZAR(yearly)}/yr</span>
        </div>
      </div>

      {/* Lead capture / Thank-you */}
      {submitted ? (
        <div className="rounded-2xl border border-white/15 bg-white/5 p-6 flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
            <Check className="w-6 h-6 text-gray-900" />
          </div>
          <p className="text-white text-lg font-bold">Thanks {name.trim()}!</p>
          <p className="text-gray-400 text-sm leading-relaxed">
            {submitMessage || "We'll be in touch shortly with your custom quote."}
          </p>
          <p className="text-gray-500 text-xs">Check your inbox at {email.trim()}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/15 bg-white/5 p-5 space-y-3">
          <p className="text-white font-semibold text-sm">Get your personalised quote by email</p>
          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="lead-name" className="text-gray-400 text-xs font-medium">
                Full Name
              </label>
              <input
                id="lead-name"
                type="text"
                placeholder="e.g. Thabo Nkosi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl bg-white/10 border border-white/15 text-white placeholder-gray-500 text-sm px-4 py-3 focus:outline-none focus:border-white/50 transition"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="lead-email" className="text-gray-400 text-xs font-medium">
                Email Address
              </label>
              <input
                id="lead-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl bg-white/10 border border-white/15 text-white placeholder-gray-500 text-sm px-4 py-3 focus:outline-none focus:border-white/50 transition"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!name.trim() || !email.trim() || isSubmitting}
            className="w-full h-12 rounded-xl bg-black text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Sparkles className="w-4 h-4" />
            {isSubmitting ? "Sending your quote..." : "Get My Custom Quote"}
          </button>
          {submitMessage && <p className="text-center text-xs text-gray-400">{submitMessage}</p>}
          <p className="text-gray-500 text-xs text-center">No spam. We'll be in touch within 24 hours.</p>
        </form>
      )}
    </div>
  );
}

// ─── Sticky Price Bar ─────────────────────────────────────────────────────────

function StickyPriceBar({
  websiteTypeId,
  addonIds,
  hostingPlanId,
  domainOptionId,
}: {
  websiteTypeId: string | null;
  addonIds: string[];
  hostingPlanId: string | null;
  domainOptionId: string | null;
}) {
  const website = WEBSITE_TYPES.find((w) => w.id === websiteTypeId);
  const addons = ADDONS.filter((a) => addonIds.includes(a.id));
  const hosting = HOSTING_PLANS.find((h) => h.id === hostingPlanId);
  const domain = DOMAIN_OPTIONS.find((d) => d.id === domainOptionId);

  const onceOff = (website?.price ?? 0) + addons.filter((a) => !a.monthly).reduce((s, a) => s + a.price, 0);
  const monthly = (hosting?.price ?? 0) + addons.filter((a) => a.monthly).reduce((s, a) => s + a.price, 0);
  const yearly = domain?.price ?? 0;

  return (
    <div className="border-t border-white/10 bg-gray-950/95 backdrop-blur px-5 py-4">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest font-semibold">Once-off</p>
            <p className="text-white text-lg font-extrabold leading-tight">{formatZAR(onceOff)}</p>
          </div>
          <div className="w-px h-8 bg-white/10 hidden sm:block" />
          <div>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest font-semibold">Monthly</p>
            <p className="text-white text-lg font-extrabold leading-tight">{formatZAR(monthly)}/mo</p>
          </div>
          <div className="w-px h-8 bg-white/10 hidden sm:block" />
          <div>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest font-semibold">Domain</p>
            <p className="text-white text-lg font-extrabold leading-tight">{formatZAR(yearly)}/yr</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-[10px]">Live estimate</p>
          <p className="text-gray-400 text-xs">excl. VAT</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

interface BudgetWizardProps {
  open: boolean;
  onClose: () => void;
}

export function BudgetWizard({ open, onClose }: BudgetWizardProps) {
  const [step, setStep] = useState(0); // 0-indexed, 0..4
  const [websiteTypeId, setWebsiteTypeId] = useState<string | null>(null);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [hostingPlanId, setHostingPlanId] = useState<string | null>(null);
  const [domainOptionId, setDomainOptionId] = useState<string | null>(null);

  const TOTAL_STEPS = 5;

  const canNext =
    (step === 0 && websiteTypeId !== null) ||
    step === 1 ||
    (step === 2 && hostingPlanId !== null) ||
    (step === 3 && domainOptionId !== null) ||
    step === 4;

  const toggleAddon = (id: string) =>
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));

  const handleClose = () => {
    onClose();
    // reset after close animation
    setTimeout(() => {
      setStep(0);
      setWebsiteTypeId(null);
      setAddonIds([]);
      setHostingPlanId(null);
      setDomainOptionId(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="max-w-2xl w-full p-0 gap-0 bg-gray-950 border border-white/10 rounded-2xl overflow-hidden flex flex-col [&>button]:hidden"
        style={{ maxHeight: "min(90vh, 800px)" }}>
        <DialogTitle className="sr-only">Budget Wizard</DialogTitle>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/10 shrink-0">
          <div className="flex flex-col gap-2">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">
              Step {step + 1} of {TOTAL_STEPS}
            </p>
            <StepIndicator current={step} total={TOTAL_STEPS} />
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-white/15 bg-white/5 text-gray-400 hover:text-white hover:bg-white/15 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          {step === 0 && <Step1 selected={websiteTypeId} onSelect={setWebsiteTypeId} />}
          {step === 1 && <Step2 selected={addonIds} onToggle={toggleAddon} />}
          {step === 2 && <Step3 selected={hostingPlanId} onSelect={setHostingPlanId} />}
          {step === 3 && <Step4 selected={domainOptionId} onSelect={setDomainOptionId} />}
          {step === 4 && (
            <Step5
              websiteTypeId={websiteTypeId}
              addonIds={addonIds}
              hostingPlanId={hostingPlanId}
              domainOptionId={domainOptionId}
            />
          )}
        </div>

        {/* Navigation */}
        {step < 4 && (
          <div className="px-5 py-4 border-t border-white/10 flex items-center justify-between gap-3 shrink-0 bg-gray-950">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl px-5 h-11 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext}
              className={cn(
                "rounded-xl px-8 h-11 font-semibold transition-all duration-200",
                canNext ? "bg-white text-gray-900 hover:bg-gray-100" : "bg-white/10 text-gray-500 cursor-not-allowed",
              )}>
              {step === 3 ? "See Summary" : "Continue"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Sticky price bar */}
        <StickyPriceBar
          websiteTypeId={websiteTypeId}
          addonIds={addonIds}
          hostingPlanId={hostingPlanId}
          domainOptionId={domainOptionId}
        />
      </DialogContent>
    </Dialog>
  );
}
