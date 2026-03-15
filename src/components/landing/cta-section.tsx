import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutGrid } from "lucide-react";

export function CTASection() {
  const handleScroll = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-gray-950 py-16 md:py-24 lg:py-28 scroll-mt-24">
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#83c406 1px, transparent 1px), linear-gradient(90deg, #83c406 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#83c406]/35 bg-[#83c406]/10 text-[#d6ef9a] text-xs font-semibold tracking-widest uppercase mb-8 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#83c406] animate-pulse" />
          Let's Build Something Great
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-white mb-5 md:mb-6">
          Ready To Launch Your
          <br />
          Website?
        </h2>

        {/* Subheading */}
        <p className="text-base sm:text-lg md:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-8 md:mb-10">
          Join hundreds of South African businesses growing online with{" "}
          <span className="text-gray-200 font-semibold">Three J Media.</span> Get a stunning, high-performance website
          live in as little as <span className="text-gray-200 font-semibold">14 days.</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={() => handleScroll("#pricing")}
            className="group w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-100 border-0 shadow-lg transition-all duration-300 font-bold px-8 md:px-10 text-base min-h-[44px] h-12 md:h-14 rounded-xl">
            Get Started Today
            <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => handleScroll("#pricing")}
            className="group w-full sm:w-auto border border-[#83c406]/45 bg-transparent hover:bg-[#83c406]/12 text-[#dff3ab] hover:text-[#eff8d4] transition-all duration-300 font-semibold px-8 md:px-10 text-base min-h-[44px] h-12 md:h-14 rounded-xl">
            <LayoutGrid className="mr-2 w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            View Pricing
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 text-sm text-gray-500">
          {[{ label: "No hidden fees" }, { label: "14-day delivery" }, { label: "Local SA support" }].map(
            ({ label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gray-500" />
                <span>{label}</span>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
