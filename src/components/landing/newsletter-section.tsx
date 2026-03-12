import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export function NewsletterSection() {
  const heading = useScrollAnimation();
  const panel = useScrollAnimation({ threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("Monthly updates only. No spam, no noise, and you can unsubscribe any time.");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitForm();
  };

  const submitForm = async () => {
    if (!name.trim() || !email.trim()) return;

    setStatus("submitting");
    setMessage("Submitting your details...");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to subscribe right now.");
      }

      setStatus("success");
      setMessage(payload?.message || "Thanks. You're on the list.");
      setName("");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to subscribe right now.");
    }
  };

  return (
    <section id="newsletter" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={heading.ref as React.RefObject<HTMLDivElement>}
          className={`text-center mb-10 md:mb-14 transition-all duration-500 ease-out ${
            heading.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 text-xs font-semibold tracking-widest uppercase mb-4 select-none">
            Newsletter
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3 md:mb-4">
            Subscribe To Our Newsletter
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Get website tips, launch advice, and practical digital growth ideas for South African businesses straight
            to your inbox.
          </p>
        </div>

        <div
          ref={panel.ref as React.RefObject<HTMLDivElement>}
          className={`transition-all duration-500 ease-out ${
            panel.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}>
          <div className="relative overflow-hidden rounded-[2rem] border border-gray-200 bg-gray-950 px-6 py-8 sm:px-8 sm:py-10 md:px-12 md:py-12 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.45)]">
            <div
              className="absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at top left, rgba(131, 196, 6, 0.9), transparent 36%), radial-gradient(circle at bottom right, rgba(131, 196, 6, 0.45), transparent 32%)",
              }}
            />

            <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#83c406]/30 bg-[#83c406]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#dff3ab]">
                  <Mail className="h-3.5 w-3.5" />
                  Stay Updated
                </div>
                <h3 className="mt-5 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                  Useful insights.
                  <br />
                  No inbox clutter.
                </h3>
                <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-gray-300">
                  We send occasional updates with design trends, conversion ideas, hosting tips, and examples from the
                  websites we build.
                </p>

                <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-400">
                  {["Website tips", "Growth ideas", "Product updates"].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="newsletter-name" className="mb-2 block text-sm font-medium text-white">
                      Name
                    </label>
                    <Input
                      id="newsletter-name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Your name"
                      required
                      className="h-12 rounded-xl border-white/10 bg-white text-gray-900 placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="newsletter-email" className="mb-2 block text-sm font-medium text-white">
                      Email address
                    </label>
                    <Input
                      id="newsletter-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      required
                      className="h-12 rounded-xl border-white/10 bg-white text-gray-900 placeholder:text-gray-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={status === "submitting"}
                    className="h-12 w-full rounded-xl bg-[#83c406] text-gray-950 hover:bg-[#97d71a] font-bold">
                    {status === "submitting" ? "Submitting..." : "Subscribe Now"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>

                <p
                  className={`mt-4 text-sm leading-relaxed ${
                    status === "error" ? "text-red-300" : status === "success" ? "text-[#dff3ab]" : "text-gray-400"
                  }`}>
                  {message}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
