import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { imageAssets } from "@/lib/images";

const portfolioItems = [
  {
    id: 1,
    name: "MHK Group",
    category: "Corporate Identity",
    image: imageAssets.portfolioOne,
  },
  {
    id: 2,
    name: "FinTech Launch",
    category: "Marketing Assets",
    image: imageAssets.portfolioTwo,
  },
  {
    id: 3,
    name: "ThreeJ Media Blog",
    category: "Blog",
    image: imageAssets.portfolioThree,
  },
  {
    id: 4,
    name: "ThreeJ Media Portfolio",
    category: "Business Site",
    image: imageAssets.portfolioFour,
  },
  {
    id: 5,
    name: "ThreeJ Media E-commerce",
    category: "E-commerce",
    image: imageAssets.portfolioFive,
  },
];

const [leftTop, leftBottom, centerItem, rightTop, rightBottom] = portfolioItems;

export function PortfolioSection() {
  const heading = useScrollAnimation();
  const cards = useScrollAnimation({
    threshold: 0.05,
    rootMargin: "0px 0px -40px 0px",
  });

  return (
    <section id="portfolio" className="py-16 md:py-24 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div
          ref={heading.ref as React.RefObject<HTMLDivElement>}
          className={`text-center mb-10 md:mb-14 transition-all duration-500 ease-out ${
            heading.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-5"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-100 text-gray-600 text-xs font-semibold tracking-widest uppercase mb-4 select-none">
            Portfolio
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3 md:mb-4">
            Our Work
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Websites we've built that drive real results — from personal brands
            to growing businesses.
          </p>
        </div>
      </div>

      <div
        ref={cards.ref as React.RefObject<HTMLDivElement>}
        className={`w-full px-4 sm:px-0 transition-all duration-500 ease-out ${
          cards.isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-5"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.1fr_0.8fr_1.1fr]">
          <div className="grid grid-rows-2">
            {[leftTop, leftBottom].map((item, index) => (
              <PortfolioPanel
                key={item.id}
                item={item}
                delay={index}
                landscape
              />
            ))}
          </div>

          <PortfolioPanel item={centerItem} delay={2} center />

          <div className="grid grid-rows-2">
            {[rightTop, rightBottom].map((item, index) => (
              <PortfolioPanel
                key={item.id}
                item={item}
                delay={index + 3}
                landscape
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PortfolioPanel({
  item,
  delay,
  landscape = false,
  center = false,
}: {
  item: (typeof portfolioItems)[number];
  delay: number;
  landscape?: boolean;
  center?: boolean;
}) {
  return (
    <div
      style={{ transitionDelay: `${delay * 100}ms` }}
      className={`
        group relative overflow-hidden bg-gray-900 cursor-pointer
        min-h-[260px] md:min-h-[320px]
        ${landscape ? "lg:min-h-[270px]" : ""}
        ${center ? "lg:min-h-[540px]" : ""}
      `}
    >
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10" />

      <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6 lg:p-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-white font-semibold text-base sm:text-lg">
              {item.name}
            </p>
            <p className="text-[#d7d7d7] text-sm">{item.category}</p>
          </div>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="shrink-0 text-white/80 text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-200 group-hover:text-white"
          >
            View
          </a>
        </div>
      </div>
    </div>
  );
}
