import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { services } from "@/components/landing/services-section";

const slides = [
  {
    heading: "Web Design That\nConverts.",
    subheading:
      "We build stunning, fast websites tailored for South African startups, bloggers and small businesses. Every pixel crafted with purpose.",
  },
  {
    heading: "Hosting You Can\nRely On.",
    subheading:
      "Lightning-fast, secure hosting with 99.9% uptime. Your website stays online so you can focus on growing your business.",
  },
  {
    heading: "Built for\nGrowth.",
    subheading:
      "From landing pages to full business websites, we build digital experiences that attract visitors and turn them into paying clients.",
  },
  ...services.map((service) => ({
    heading: service.title,
    subheading: service.description,
  })),
];

const AUTOPLAY_INTERVAL = 4500;

export function HeroSection({ onOpenWizard }: { onOpenWizard?: () => void }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const handleScroll = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const goTo = useCallback(
    (index: number, dir: "next" | "prev" = "next") => {
      if (animating) return;
      setDirection(dir);
      setAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        setAnimating(false);
      }, 400);
    },
    [animating],
  );

  const goNext = useCallback(() => {
    goTo((current + 1) % slides.length, "next");
  }, [current, goTo]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length, "prev");
  }, [current, goTo]);

  useEffect(() => {
    const timer = setInterval(goNext, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [goNext]);

  const slide = slides[current];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-950">
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#83c406 1px, transparent 1px), linear-gradient(90deg, #83c406 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Subtle radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-white/[0.03] blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-28 flex flex-col items-center text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#83c406]/35 bg-[#83c406]/10 text-[#d6ef9a] text-xs font-semibold tracking-widest uppercase mb-10 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#83c406] animate-pulse" />
          South African Web Agency
        </div>

        {/* Slide content */}
        <div
          className="w-full min-h-[260px] sm:min-h-[280px] flex flex-col items-center justify-center"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? `translateY(${direction === "next" ? "12px" : "-12px"})` : "translateY(0px)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}>
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight text-white mb-6 whitespace-pre-line">
            {slide.heading.split("\n").map((line, i) => (
              <span key={i}>
                {i === 0 ? line : <span className="text-gray-300">{line}</span>}
                {i < slide.heading.split("\n").length - 1 && <br />}
              </span>
            ))}
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-gray-400 leading-relaxed max-w-2xl mb-0">
            {slide.subheading}
          </p>
        </div>

        {/* CTAs — static across all slides */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => onOpenWizard?.()}
            className="group bg-white text-gray-900 hover:bg-gray-100 border-0 font-bold px-10 h-13 md:h-14 rounded-xl text-base shadow-lg transition-all duration-200">
            <Sparkles className="mr-2 w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            Create for Your Budget
          </Button>
        </div>

        {/* Trust row */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500">
          {["50+ sites launched", "14-day delivery", "Local SA support"].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-gray-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Slider controls */}
        <div className="mt-12 flex items-center gap-6">
          {/* Prev arrow */}
          <button
            onClick={goPrev}
            aria-label="Previous slide"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[#83c406]/35 bg-[#83c406]/8 hover:bg-[#83c406]/16 text-[#b9dc5f] hover:text-[#dff3ab] transition-all duration-200">
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > current ? "next" : "prev")}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? "w-6 h-2 bg-[#83c406]" : "w-2 h-2 bg-[#83c406]/30 hover:bg-[#83c406]/55"
                }`}
              />
            ))}
          </div>

          {/* Next arrow */}
          <button
            onClick={goNext}
            aria-label="Next slide"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[#83c406]/35 bg-[#83c406]/8 hover:bg-[#83c406]/16 text-[#b9dc5f] hover:text-[#dff3ab] transition-all duration-200">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none" />
    </section>
  );
}
