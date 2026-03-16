import { ArrowRight, BadgeCheck, Rocket, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/landing/marketing-layout";
import { navigate } from "@/lib/navigation";
import { usePageSeo } from "@/hooks/use-page-seo";

const audiences = [
  "Startup businesses",
  "Personal brands",
  "Bloggers and creators",
  "Influencers and public figures",
  "Small businesses",
  "Entrepreneurs launching new ideas",
];

const principles = ["Fast", "Professional", "Easy to manage", "Designed for growth"];

const reasons = [
  "Modern and responsive website design",
  "Reliable hosting and domain services",
  "Startup-friendly solutions",
  "Personalised support",
  "Built for long-term growth",
];

export default function AboutPage() {
  usePageSeo({
    title: "About Three J Media | South African Digital Studio",
    description:
      "Learn how Three J Media helps startups, creators, influencers, bloggers, and small businesses build credible digital brands online.",
    path: "/about",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "About Three J Media",
      url: "https://threejmedia.co.za/about",
      description:
        "Learn how Three J Media helps startups, creators, influencers, bloggers, and small businesses build credible digital brands online.",
      mainEntity: {
        "@type": "Organization",
        name: "Three J Media",
        url: "https://threejmedia.co.za/",
      },
    },
  });

  return (
    <MarketingLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-black/10 bg-gray-950 text-white shadow-[0_24px_80px_-36px_rgba(15,23,42,0.28)]">
          <div className="px-6 py-10 sm:px-10 sm:py-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#83c406]/35 bg-[#83c406]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#dff3ab]">
              <Sparkles className="h-3.5 w-3.5" />
              About Three J Media
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
              A South African digital studio helping ambitious people build brands online.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-300 sm:text-lg">
              Three J Media is a South African digital studio focused on helping startup businesses, creators,
              influencers, and bloggers build powerful online brands. In today&apos;s digital world, your website is
              more than just a place on the internet. It is the foundation of your brand, credibility, and growth.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-300 sm:text-lg">
              We help businesses and creators turn ideas into professional online platforms that attract audiences,
              generate opportunities, and grow their influence through modern website design, reliable hosting, and
              domain setup without unnecessary technical stress.
            </p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_20px_70px_-38px_rgba(15,23,42,0.25)] sm:p-8">
            <div className="flex items-center gap-3">
              <Rocket className="h-5 w-5 text-[#5d8f00]" />
              <h2 className="text-2xl font-extrabold tracking-tight">Our Mission</h2>
            </div>
            <p className="mt-5 text-base leading-relaxed text-gray-600">
              Our mission is simple: help ambitious people build websites that work for them. Whether you&apos;re
              launching your first business, sharing your voice as a blogger, or building influence around your
              personal brand, we create digital foundations that support real growth.
            </p>
          </section>

          <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_20px_70px_-38px_rgba(15,23,42,0.25)] sm:p-8">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[#5d8f00]" />
              <h2 className="text-2xl font-extrabold tracking-tight">Who We Work With</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {audiences.map((audience) => (
                <div key={audience} className="flex items-start gap-3 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#5d8f00]" />
                  <span>{audience}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_20px_70px_-38px_rgba(15,23,42,0.25)] sm:p-8">
            <h2 className="text-2xl font-extrabold tracking-tight">Our Approach</h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              We believe websites should be practical tools for visibility, credibility, and long-term growth. Every
              build should make it easier for a client to show up professionally and connect with the right audience.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {principles.map((principle) => (
                <div key={principle} className="rounded-2xl bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-800">
                  {principle}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_20px_70px_-38px_rgba(15,23,42,0.25)] sm:p-8">
            <h2 className="text-2xl font-extrabold tracking-tight">Why Choose Three J Media</h2>
            <div className="mt-6 space-y-3">
              {reasons.map((reason) => (
                <div key={reason} className="flex items-start gap-3 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#5d8f00]" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-base leading-relaxed text-gray-600">
              We do not just build websites. We help build digital brands that can grow with confidence over time.
            </p>
          </section>
        </div>

        <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_20px_70px_-38px_rgba(15,23,42,0.25)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">Ready to build your online presence?</h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600">
                Explore our services or go back to the landing page to start with domains, pricing, or your budget.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:w-auto">
              <Button onClick={() => navigate("/services")} className="h-11 rounded-xl bg-gray-950 px-6 text-white hover:bg-black">
                View Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
