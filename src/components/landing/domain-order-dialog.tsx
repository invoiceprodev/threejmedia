import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api-client";

type DomainOrderMode = "register" | "transfer";

type ContactForm = {
  firstname: string;
  lastname: string;
  companyname: string;
  email: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phonenumber: string;
};

type NameserverForm = {
  ns1: string;
  ns2: string;
  ns3: string;
  ns4: string;
  ns5: string;
};

type AddonsForm = {
  dnsmanagement: boolean;
  emailforwarding: boolean;
  idprotection: boolean;
};

type DomainOrderDialogProps = {
  open: boolean;
  mode: DomainOrderMode;
  domain: string;
  onOpenChange: (open: boolean) => void;
};

const initialContact: ContactForm = {
  firstname: "",
  lastname: "",
  companyname: "",
  email: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postcode: "",
  country: "ZA",
  phonenumber: "",
};

const initialNameservers: NameserverForm = {
  ns1: "",
  ns2: "",
  ns3: "",
  ns4: "",
  ns5: "",
};

const initialAddons: AddonsForm = {
  dnsmanagement: false,
  emailforwarding: false,
  idprotection: false,
};

export function DomainOrderDialog({ open, mode, domain, onOpenChange }: DomainOrderDialogProps) {
  const [contact, setContact] = useState<ContactForm>(initialContact);
  const [nameservers, setNameservers] = useState<NameserverForm>(initialNameservers);
  const [addons, setAddons] = useState<AddonsForm>(initialAddons);
  const [regperiod, setRegperiod] = useState("1");
  const [eppcode, setEppcode] = useState("");
  const [confirmOrder, setConfirmOrder] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(
    "This places a live reseller order with HostAfrica, so review the domain, contacts, and nameservers carefully.",
  );
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) {
      setContact(initialContact);
      setNameservers(initialNameservers);
      setAddons(initialAddons);
      setRegperiod("1");
      setEppcode("");
      setConfirmOrder(false);
      setIsSubmitting(false);
      setSubmitted(false);
      setMessage("This places a live reseller order with HostAfrica, so review the domain, contacts, and nameservers carefully.");
    }
  }, [open]);

  const submitOrder = async (dryRun: boolean) => {
    setIsSubmitting(true);
    setMessage(
      dryRun
        ? "Validating order details without submitting a live reseller order..."
        : mode === "register"
          ? "Submitting live registration order..."
          : "Submitting live transfer order...",
    );

    try {
      const response = await apiFetch(mode === "register" ? "/api/domains/register" : "/api/domains/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain,
          regperiod: Number(regperiod),
          eppcode: mode === "transfer" ? eppcode.trim() : undefined,
          nameservers,
          addons,
          contacts: {
            registrant: {
              ...contact,
              fullname: `${contact.firstname.trim()} ${contact.lastname.trim()}`.trim(),
            },
          },
          confirmOrder,
          dryRun,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string; dryRun?: boolean } | null;

      if (!response.ok) {
        throw new Error(payload?.message || "We could not place the domain order right now.");
      }

      if (dryRun) {
        setMessage(payload?.message || "Dry run passed.");
        return;
      }

      setSubmitted(true);
      setMessage(payload?.message || "Your order has been submitted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not place the domain order right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitOrder(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[94vh] w-[50vw] max-w-[50vw] sm:max-w-[50vw] overflow-y-auto rounded-[32px] border-none bg-[#f8f4ea] p-0 shadow-[0_30px_120px_rgba(15,23,42,0.25)]">
        <div className="grid min-h-full gap-0 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="bg-[#111827] px-6 py-8 text-white sm:px-8">
            <div className="inline-flex rounded-full border border-[#83c406]/35 bg-[#83c406]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#dff3ab]">
              {mode === "register" ? "Live Registration" : "Live Transfer"}
            </div>
            <DialogHeader className="mt-6 text-left">
              <DialogTitle className="text-3xl font-extrabold tracking-tight text-white">
                {domain}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-[#b7c0cf]">
                {mode === "register"
                  ? "We’ll submit this domain registration directly to HostAfrica with the details below."
                  : "We’ll submit this domain transfer to HostAfrica once your current registrar unlocks the domain and provides the EPP code."}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-8 space-y-4 text-sm text-[#d6dde8]">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#93a3bb]">What you need</p>
                <p className="mt-2 leading-relaxed">
                  Primary and secondary nameservers are required. Contact details are applied to registrant, admin,
                  billing, and tech by default.
                </p>
              </div>
              {mode === "transfer" && (
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#93a3bb]">Transfer reminder</p>
                  <p className="mt-2 leading-relaxed">
                    Your domain must be unlocked at the current registrar and you’ll need a valid EPP code before we
                    can complete the transfer.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8 xl:px-12 2xl:px-10">
            {submitted ? (
              <div className="space-y-4">
                <h3 className="text-2xl font-extrabold tracking-tight text-gray-950">Order submitted</h3>
                <p className="text-sm leading-relaxed text-gray-600">{message}</p>
                <Button onClick={() => onOpenChange(false)} className="h-11 rounded-xl bg-gray-950 text-white hover:bg-black">
                  Close
                </Button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <section className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-950">Contact details</h3>
                  <div className="grid gap-4 2xl:grid-cols-2">
                    <Field label="First name" value={contact.firstname} onChange={(value) => setContact((current) => ({ ...current, firstname: value }))} />
                    <Field label="Last name" value={contact.lastname} onChange={(value) => setContact((current) => ({ ...current, lastname: value }))} />
                    <Field label="Company name" value={contact.companyname} onChange={(value) => setContact((current) => ({ ...current, companyname: value }))} />
                    <Field label="Email" type="email" value={contact.email} onChange={(value) => setContact((current) => ({ ...current, email: value }))} />
                    <Field label="Phone number" value={contact.phonenumber} onChange={(value) => setContact((current) => ({ ...current, phonenumber: value }))} />
                    <Field label="Country code" value={contact.country} onChange={(value) => setContact((current) => ({ ...current, country: value.toUpperCase() }))} placeholder="ZA" />
                    <Field label="Address line 1" className="sm:col-span-2" value={contact.address1} onChange={(value) => setContact((current) => ({ ...current, address1: value }))} />
                    <Field label="Address line 2" className="sm:col-span-2" value={contact.address2} onChange={(value) => setContact((current) => ({ ...current, address2: value }))} required={false} />
                    <Field label="City" value={contact.city} onChange={(value) => setContact((current) => ({ ...current, city: value }))} />
                    <Field label="Province / State" value={contact.state} onChange={(value) => setContact((current) => ({ ...current, state: value }))} />
                    <Field label="Postal code" value={contact.postcode} onChange={(value) => setContact((current) => ({ ...current, postcode: value }))} />
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-950">Nameservers</h3>
                  <div className="grid gap-4 2xl:grid-cols-2">
                    <Field label="Primary nameserver" value={nameservers.ns1} onChange={(value) => setNameservers((current) => ({ ...current, ns1: value }))} placeholder="ns1.yourhost.com" />
                    <Field label="Secondary nameserver" value={nameservers.ns2} onChange={(value) => setNameservers((current) => ({ ...current, ns2: value }))} placeholder="ns2.yourhost.com" />
                    <Field label="Nameserver 3" value={nameservers.ns3} onChange={(value) => setNameservers((current) => ({ ...current, ns3: value }))} required={false} />
                    <Field label="Nameserver 4" value={nameservers.ns4} onChange={(value) => setNameservers((current) => ({ ...current, ns4: value }))} required={false} />
                    <Field label="Nameserver 5" value={nameservers.ns5} onChange={(value) => setNameservers((current) => ({ ...current, ns5: value }))} required={false} />
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-950">Order options</h3>
                  <div className="grid gap-4 2xl:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="regperiod">Registration period</Label>
                      <select
                        id="regperiod"
                        value={regperiod}
                        onChange={(event) => setRegperiod(event.target.value)}
                        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none focus:border-[#83c406]">
                        {[1, 2, 3, 4, 5].map((year) => (
                          <option key={year} value={year}>
                            {year} year{year > 1 ? "s" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    {mode === "transfer" && (
                      <Field label="EPP code" value={eppcode} onChange={setEppcode} placeholder="Transfer auth code" />
                    )}
                  </div>

                  <div className="grid gap-3 rounded-2xl border border-black/10 bg-white p-4 sm:grid-cols-3">
                    <AddonCheckbox
                      id="dnsmanagement"
                      label="DNS Management"
                      checked={addons.dnsmanagement}
                      onCheckedChange={(checked) => setAddons((current) => ({ ...current, dnsmanagement: checked }))}
                    />
                    <AddonCheckbox
                      id="emailforwarding"
                      label="Email Forwarding"
                      checked={addons.emailforwarding}
                      onCheckedChange={(checked) => setAddons((current) => ({ ...current, emailforwarding: checked }))}
                    />
                    <AddonCheckbox
                      id="idprotection"
                      label="ID Protection"
                      checked={addons.idprotection}
                      onCheckedChange={(checked) => setAddons((current) => ({ ...current, idprotection: checked }))}
                    />
                  </div>
                </section>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="confirm-live-order"
                      checked={confirmOrder}
                      onCheckedChange={(checked) => setConfirmOrder(checked === true)}
                      className="mt-1 border-amber-500 data-[state=checked]:border-amber-600 data-[state=checked]:bg-amber-600"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="confirm-live-order" className="text-sm font-semibold text-amber-950">
                        I understand this places a live order with HostAfrica
                      </Label>
                      <p className="text-sm leading-relaxed text-amber-900">
                        Double-check the domain name, contact details, and nameservers before submitting.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={() => void submitOrder(true)}
                      className="h-12 w-full rounded-2xl border-gray-400 bg-transparent text-gray-900 hover:bg-gray-100">
                      {isSubmitting ? "Working..." : "Run dry validation"}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !confirmOrder}
                      className="h-12 w-full rounded-2xl bg-gray-950 text-white hover:bg-black disabled:bg-gray-300 disabled:text-gray-500">
                      {isSubmitting
                        ? mode === "register"
                          ? "Submitting registration..."
                          : "Submitting transfer..."
                        : mode === "register"
                          ? "Place live registration order"
                          : "Place live transfer order"}
                    </Button>
                    <p className="text-sm leading-relaxed text-gray-600">{message}</p>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = true,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 border-gray-300 bg-white text-gray-950 focus-visible:ring-[#83c406]/35"
      />
    </div>
  );
}

function AddonCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-[#f8f4ea] p-3">
      <Checkbox id={id} checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} />
      <Label htmlFor={id} className="text-sm font-medium text-gray-800">
        {label}
      </Label>
    </div>
  );
}
