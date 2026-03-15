import { ArrowRight, BadgeCheck, Globe2, LayoutTemplate, Monitor, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/landing/marketing-layout";
import { navigate } from "@/lib/navigation";
import { usePageSeo } from "@/hooks/use-page-seo";

const services = [
  {
    title: "Website Design",
    icon: Monitor,
    intro:
      "We design modern, responsive websites that represent your brand and communicate your message clearly.",
    bullets: ["Mobile friendly", "Visually engaging", "Easy to navigate", "Optimized for performance"],
    closing:
      "Whether you need a business website, personal brand website, or blog, we create designs that help you stand out online.",
  },
  {
    title: "Website Hosting",
    icon: Server,
    intro:
      "Reliable hosting is essential for any website. Our hosting services help keep your site fast, secure, and accessible to your audience.",
    bullets: ["Fast website performance", "Secure servers", "Regular backups", "Technical support"],
    closing: "This means you can focus on your business while we take care of the technical side.",
  },
  {
    title: "Domain Registration",
    icon: Globe2,
    intro: "Your domain name is your online identity, and we help you secure the right address for your brand.",
    bullets: ["yourbusiness.co.za", "yourbrand.com", "yourname.blog"],
    closing:
      "With domain registration through Three J Media, your website starts with a professional and trusted online address.",
  },
  {
    title: "Blog & Content Platforms",
    icon: LayoutTemplate,
    intro:
      "For influencers, writers, and creators, a blog is one of the most powerful tools for building an audience and owning your platform.",
    bullets: ["Publish content easily", "Grow your audience", "Showcase your expertise", "Build a personal brand"],
    closing: "Your blog becomes your digital home on the internet.",
  },
  {
    title: "Brand Websites for Influencers",
    icon: BadgeCheck,
    intro:
      "Influencers and public figures need more than social media. They need a professional platform they fully control.",
    bullets: ["Showcase partnerships", "Publish content", "Display portfolios", "Connect with audiences"],
    closing: "A website helps turn influence into a long-term brand.",
  },
];

export default function ServicesPage() {
  usePageSeo({
    title: "Services | Three J Media",
    description:
      "Explore website design, hosting, domain registration, blog platforms, and personal brand website services from Three J Media.",
    path: "/services",
  });

  return (
    <MarketingLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-black/10 bg-gray-950 text-white shadow-[0_24px_80px_-36px_rgba(15,23,42,0.28)]">
          <div className="px-6 py-10 sm:px-10 sm:py-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#83c406]/35 bg-[#83c406]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#dff3ab]">
              <LayoutTemplate className="h-3.5 w-3.5" />
              Our Services
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
              Digital services built to help businesses and creators establish a strong online presence.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-300 sm:text-lg">
              Three J Media offers practical digital services for startups, entrepreneurs, bloggers, creators, and
              personal brands that want to launch professionally and grow with confidence online.
            </p>
          </div>
        </section>

        <div className="grid gap-6">
          {services.map(({ title, icon: Icon, intro, bullets, closing }) => (
            <section
              key={title}
              className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_20px_70px_-38px_rgba(15,23,42,0.25)] sm:p-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100">
                  <Icon className="h-5 w-5 text-[#5d8f00]" />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
              </div>
              <p className="mt-5 text-base leading-relaxed text-gray-600">{intro}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {bullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-3 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#5d8f00]" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-base leading-relaxed text-gray-600">{closing}</p>
            </section>
          ))}
        </div>

        <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_20px_70px_-38px_rgba(15,23,42,0.25)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">Need a website that works for your brand?</h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600">
                Start with your domain, compare packages, or build a custom quote that matches your goals.
              </p>
            </div>
            <Button onClick={() => navigate("/")} className="h-11 rounded-xl bg-gray-950 px-6 text-white hover:bg-black">
              Return to Home
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
