import { Zap, Smartphone, HeadphonesIcon, TrendingUp } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimised for speed and Core Web Vitals so your site loads instantly and ranks higher on Google.",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Every site is designed to look and perform perfectly on any device — phone, tablet or desktop.",
  },
  {
    icon: HeadphonesIcon,
    title: "Local Support",
    description: "Our South African team is always available to help — no overseas call centres, just real people.",
  },
  {
    icon: TrendingUp,
    title: "Growth Focused",
    description: "We build websites that attract traffic, convert visitors and grow your business over time.",
  },
];

export function WhyChooseUsSection() {
  const heading = useScrollAnimation();
  const cards = useScrollAnimation({ threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  return (
    <section id="why-us" className="py-16 md:py-24 bg-gray-50">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div
          ref={heading.ref as React.RefObject<HTMLDivElement>}
          className={`text-center mb-10 md:mb-16 transition-all duration-500 ease-out ${
            heading.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-100 text-gray-600 text-xs font-semibold tracking-widest uppercase mb-4 select-none">
            Why Three J Media
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3 md:mb-4">
            Why Businesses Choose Three J Media
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            We don't just build websites — we build digital foundations that help South African businesses thrive.
          </p>
        </div>

        {/* Feature cards grid */}
        <div
          ref={cards.ref as React.RefObject<HTMLDivElement>}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              style={{ transitionDelay: cards.isVisible ? `${index * 100}ms` : "0ms" }}
              className={`group flex flex-col gap-5 items-start rounded-2xl bg-white border border-gray-200 p-5 sm:p-6 lg:p-8 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-gray-300 transition-all duration-300 ease-in-out ${
                cards.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              }`}>
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-100 shrink-0 transition-transform duration-300 ease-in-out group-hover:scale-110">
                <Icon className="w-6 h-6 text-gray-700" strokeWidth={1.75} />
              </div>

              {/* Text */}
              <div className="flex flex-col gap-2">
                <h3 className="text-gray-900 font-bold text-lg leading-snug">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
