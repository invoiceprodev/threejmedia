import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api-client";
import { getPlanById, type PlanId } from "@/lib/plans";
import { navigate } from "@/lib/navigation";

type PlanSignupDialogProps = {
  open: boolean;
  planId: PlanId | null;
  onOpenChange: (open: boolean) => void;
};

type SubmitState = "idle" | "submitting" | "error";

export function PlanSignupDialog({ open, planId, onOpenChange }: PlanSignupDialogProps) {
  const plan = useMemo(() => (planId ? getPlanById(planId) : undefined), [planId]);
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [status, setStatus] = useState<SubmitState>("idle");
  const [message, setMessage] = useState(
    "Create your account and we’ll take you straight to secure Paystack checkout.",
  );

  const resetForm = () => {
    setCompanyName("");
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setPasswordVisible(false);
    setConfirmPasswordVisible(false);
    setStatus("idle");
    setMessage("Create your account and we’ll take you straight to secure Paystack checkout.");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!plan) {
      setStatus("error");
      setMessage("Please select a plan before continuing.");
      return;
    }

    if (password.length < 8) {
      setStatus("error");
      setMessage("Use at least 8 characters for your password.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match yet.");
      return;
    }

    setStatus("submitting");
    setMessage("Creating your account and preparing checkout...");

    try {
      const response = await apiFetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: plan.id,
          companyName: companyName.trim(),
          fullName: fullName.trim(),
          email: email.trim(),
          password,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; authorizationUrl?: string; step?: string; requiresEmailVerification?: boolean; email?: string }
        | null;

      if (!response.ok) {
        console.error("[signup] API error", {
          status: response.status,
          payload,
        });
        throw new Error(payload?.message || "We could not start your signup right now.");
      }

      if (payload?.requiresEmailVerification) {
        setMessage("Account created. Please verify your email before continuing to payment.");
        navigate(`/signup/continue${payload.email ? `?email=${encodeURIComponent(payload.email)}` : ""}`);
        return;
      }

      if (!payload?.authorizationUrl) {
        throw new Error(payload?.message || "We could not start your signup right now.");
      }

      setMessage("Redirecting you to secure checkout...");
      window.location.assign(payload.authorizationUrl);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "We could not start your signup right now.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-[calc(56rem+20px)] overflow-hidden rounded-[2rem] border border-gray-200 bg-white p-0 shadow-2xl"
        showCloseButton={status !== "submitting"}>
        <div className="grid md:grid-cols-[0.82fr_1.18fr]">
          <div className="bg-gray-950 px-6 py-8 sm:px-8 sm:py-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#83c406]/35 bg-[#83c406]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#dff3ab]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure Signup
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">Selected Plan</p>
              <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-white">{plan?.name ?? "Plan"}</h3>
              <p className="mt-2 text-4xl font-extrabold text-[#dff3ab]">{plan?.priceLabel ?? ""}</p>
              <p className="mt-4 text-sm leading-relaxed text-gray-300">
                {plan?.description ?? "Choose the plan that fits your business goals."}
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {plan?.features.slice(0, 4).map((feature) => (
                <div key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#83c406]" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl font-extrabold tracking-tight text-gray-950">
                Set up your account
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-gray-500">
                Enter your company details, create your password, and continue to Paystack.
              </DialogDescription>
            </DialogHeader>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="signup-company-name">Company name</Label>
                <Input
                  id="signup-company-name"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  placeholder="Three J Media"
                  autoComplete="organization"
                  required
                  className="h-11 rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-full-name">Client full names</Label>
                <Input
                  id="signup-full-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="John James Mokoena"
                  autoComplete="name"
                  required
                  className="h-11 rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email address</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                  className="h-11 rounded-xl border-gray-200"
                />
              </div>

              <div className="grid gap-4">
                <PasswordField
                  id="signup-password"
                  label="Password"
                  value={password}
                  visible={passwordVisible}
                  onChange={setPassword}
                  onToggleVisibility={() => setPasswordVisible((current) => !current)}
                />

                <PasswordField
                  id="signup-confirm-password"
                  label="Confirm password"
                  value={confirmPassword}
                  visible={confirmPasswordVisible}
                  onChange={setConfirmPassword}
                  onToggleVisibility={() => setConfirmPasswordVisible((current) => !current)}
                />
              </div>

              <Button
                type="submit"
                disabled={status === "submitting"}
                className="h-12 w-full rounded-xl bg-gray-950 text-white hover:bg-gray-800">
                {status === "submitting" ? "Preparing checkout..." : "Continue to Payment"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <p
              className={`mt-4 text-sm leading-relaxed ${
                status === "error" ? "text-red-600" : "text-gray-500"
              }`}>
              {message}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
};

function PasswordField({ id, label, value, visible, onChange, onToggleVisibility }: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={id.includes("confirm") ? "new-password" : "new-password"}
          required
          minLength={8}
          className="h-11 rounded-xl border-gray-200 pr-11"
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-800"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
