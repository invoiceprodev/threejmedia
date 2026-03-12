import { Star } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const testimonials = [
  {
    quote:
      "Three J Media transformed our online presence completely. Our new website has already doubled our enquiries in the first month alone.",
    name: "Lerato Dlamini",
    role: "Founder, StyleSA",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face",
  },
  {
    quote:
      "Professional, fast and genuinely invested in our growth. Three J Media delivered beyond our expectations — and on time.",
    name: "Sipho Mokoena",
    role: "CEO, Mokoena Consulting",
    avatar: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&h=100&fit=crop&crop=face",
  },
  {
    quote:
      "Our blog went from 0 to 5 000 monthly visitors after the redesign. The mobile experience is absolutely flawless.",
    name: "Ayanda Nkosi",
    role: "Content Creator & Blogger",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=100&h=100&fit=crop&crop=face",
  },
];

function StarRating() {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-gray-700 text-gray-700" />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  const heading = useScrollAnimation();
  const cards = useScrollAnimation({ threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-white">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div
          ref={heading.ref as React.RefObject<HTMLDivElement>}
          className={`text-center mb-10 md:mb-14 transition-all duration-500 ease-out ${
            heading.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-100 text-gray-600 text-xs font-semibold tracking-widest uppercase mb-4 select-none">
            Client Reviews
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3 md:mb-4">
            What Our Clients Say
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Don't just take our word for it — here's what real South African businesses say about working with us.
          </p>
        </div>

        {/* Testimonial cards */}
        <div ref={cards.ref as React.RefObject<HTMLDivElement>} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ quote, name, role, avatar }, index) => (
            <div
              key={name}
              style={{ transitionDelay: cards.isVisible ? `${index * 100}ms` : "0ms" }}
              className={`flex flex-col gap-4 rounded-2xl bg-gray-50 border border-gray-200 p-5 sm:p-7 shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 ease-in-out ${
                cards.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              }`}>
              {/* Stars */}
              <StarRating />

              {/* Quote */}
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed flex-1">"{quote}"</p>

              {/* Divider */}
              <div className="border-t border-gray-200" />

              {/* Client info */}
              <div className="flex items-center gap-3">
                <img
                  src={avatar}
                  alt={name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-200 shrink-0"
                />
                <div>
                  <p className="text-gray-900 font-semibold text-sm leading-tight">{name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
