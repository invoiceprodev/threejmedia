import { Monitor, Server, Wrench, LayoutTemplate } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const services = [
  {
    icon: Monitor,
    title: "Web Design",
    description: "Beautiful, conversion-focused websites crafted for your brand. Every pixel is intentional.",
  },
  {
    icon: Server,
    title: "Web Hosting",
    description: "Fast, secure South African hosting with 99.9% uptime and daily backups included.",
  },
  {
    icon: Wrench,
    title: "Maintenance",
    description: "We keep your site updated, secure and running smoothly — month after month.",
  },
  {
    icon: LayoutTemplate,
    title: "Landing Pages",
    description: "High-converting landing pages built to capture leads and drive sales fast.",
  },
];

export function ServicesSection() {
  const heading = useScrollAnimation();
  const cards = useScrollAnimation({ threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  return (
    <section id="services" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div
          ref={heading.ref as React.RefObject<HTMLDivElement>}
          className={`text-center mb-10 md:mb-16 transition-all duration-500 ease-out ${
            heading.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-100 text-gray-600 text-xs font-semibold tracking-widest uppercase mb-4 select-none">
            What We Do
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3 md:mb-4">
            Our Services
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Everything you need to build, launch and grow your online presence — under one roof.
          </p>
        </div>

        {/* Cards */}
        <div
          ref={cards.ref as React.RefObject<HTMLDivElement>}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              style={{ transitionDelay: cards.isVisible ? `${index * 100}ms` : "0ms" }}
              className={`group flex flex-col items-start gap-5 rounded-2xl bg-white border border-gray-200 p-6 sm:p-8 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-gray-300 transition-all duration-300 ease-in-out ${
                cards.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              }`}>
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 transition-transform duration-300 ease-in-out group-hover:scale-110">
                <Icon className="w-6 h-6 text-gray-700" strokeWidth={1.75} />
              </div>
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
