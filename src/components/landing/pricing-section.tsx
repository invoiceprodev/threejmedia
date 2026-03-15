import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { plans, type PlanId } from "@/lib/plans";

type PricingSectionProps = {
  onSelectPlan: (planId: PlanId) => void;
};

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const heading = useScrollAnimation();
  const cards = useScrollAnimation({
    threshold: 0.05,
    rootMargin: "0px 0px -40px 0px",
  });

  return (
    <section id="pricing" className="py-16 md:py-24 bg-gray-50 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div
          ref={heading.ref as React.RefObject<HTMLDivElement>}
          className={`text-center mb-10 md:mb-16 transition-all duration-500 ease-out ${
            heading.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-5"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-100 text-gray-600 text-xs font-semibold tracking-widest uppercase mb-4 select-none">
            Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3 md:mb-4">
            Our Pricing Plans
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            No hidden fees. No surprises. Just honest pricing for quality South
            African websites.
          </p>
        </div>

        {/* Pricing cards */}
        <div
          ref={cards.ref as React.RefObject<HTMLDivElement>}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start"
        >
          {plans.map(
            ({ id, name, priceLabel, description, features, cta, popular }, index) => (
              <div
                key={name}
                style={{
                  transitionDelay: cards.isVisible ? `${index * 100}ms` : "0ms",
                }}
                className={`relative flex flex-col rounded-2xl transition-all duration-300 ease-in-out ${
                  cards.isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-5"
                } ${
                  popular
                    ? "border border-gray-800 bg-gray-900 text-white shadow-2xl shadow-gray-900/30 md:scale-[1.03]"
                    : "bg-white border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1"
                }`}
              >
                {/* Most Popular badge */}
                {popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 rounded-full bg-white text-gray-900 text-xs font-bold shadow-md border border-gray-200 tracking-wide">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-6 sm:p-8 flex flex-col gap-6 flex-1">
                  {/* Plan header */}
                  <div>
                    <p
                      className={`text-sm font-semibold tracking-widest uppercase mb-1 ${
                        popular ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {name}
                    </p>
                    <p
                      className={`text-4xl font-extrabold tracking-tight mb-2 ${
                        popular ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {priceLabel}
                    </p>
                    <p
                      className={`text-sm leading-relaxed ${
                        popular ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {description}
                    </p>
                  </div>

                  {/* Divider */}
                  <div
                    className={`border-t ${
                      popular ? "border-white/10" : "border-gray-100"
                    }`}
                  />

                  {/* Features */}
                  <ul className="flex flex-col gap-3 flex-1">
                    {features.map((feature, featureIndex) => (
                      <li key={`${id}-${featureIndex}`} className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            popular ? "bg-white/15" : "bg-gray-100"
                          }`}
                        >
                          <Check
                            className={`w-3 h-3 ${
                              popular ? "text-white" : "text-gray-700"
                            }`}
                            strokeWidth={2.5}
                          />
                        </div>
                        <span
                          className={`text-sm leading-relaxed ${
                            popular ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    size="lg"
                    onClick={() => onSelectPlan(id)}
                    className={`w-full font-bold rounded-xl h-12 text-base transition-all duration-200 ${
                      popular
                        ? "bg-white text-gray-900 hover:bg-gray-100 border-0 shadow-lg"
                        : "bg-gray-900 text-white hover:bg-gray-700 border-0"
                    }`}
                  >
                    {cta}
                  </Button>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
