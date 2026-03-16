import { ArrowRight, Clock3 } from "lucide-react";
import { MarketingLayout } from "@/components/landing/marketing-layout";
import { Button } from "@/components/ui/button";
import { blogPreviews, getFeaturedBlogPost } from "@/lib/blog";
import { navigate } from "@/lib/navigation";
import { usePageSeo } from "@/hooks/use-page-seo";

function formatBlogDate(date: string) {
  return new Date(date).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const featuredPost = getFeaturedBlogPost();

  usePageSeo({
    title: "Blog | Three J Media",
    description:
      "Read practical articles from Three J Media on websites, branding, domains, and digital growth for startups, creators, and small businesses.",
    path: "/blog",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Three J Media Blog",
      url: "https://threejmedia.co.za/blog",
      description:
        "Read practical articles from Three J Media on websites, branding, domains, and digital growth for startups, creators, and small businesses.",
    },
  });

  return (
    <MarketingLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-black/10 bg-gray-950 text-white shadow-[0_24px_80px_-36px_rgba(15,23,42,0.28)]">
          <div className="px-6 py-10 sm:px-10 sm:py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#dff3ab]">Three J Media Blog</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl">
              Insights for businesses, creators, and brands building online with intention.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-300 sm:text-lg">
              Practical reading for startups, personal brands, bloggers, and service businesses that want to grow with
              a stronger digital foundation.
            </p>
          </div>
        </section>

        {featuredPost && (
          <section className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_20px_70px_-38px_rgba(15,23,42,0.25)] lg:grid lg:grid-cols-[1.25fr_0.75fr]">
            <div className="px-6 py-8 sm:px-8 sm:py-10">
              <div className="inline-flex items-center gap-3 rounded-full bg-[#edf6d4] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#5d8f00]">
                <span>{featuredPost.category}</span>
                <span className="h-1 w-1 rounded-full bg-[#5d8f00]" />
                <span>Latest Post</span>
              </div>
              <h2 className="mt-5 max-w-3xl text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                {featuredPost.title}
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">{featuredPost.excerpt}</p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="font-medium text-gray-700">{featuredPost.author}</span>
                <span>{formatBlogDate(featuredPost.publishedAt)}</span>
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  {featuredPost.readTime}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {featuredPost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#83c406]/25 bg-[#83c406]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#5d8f00]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Button
                onClick={() => navigate(`/blog/${featuredPost.slug}`)}
                className="mt-8 h-11 rounded-xl bg-gray-950 px-6 text-white hover:bg-black"
              >
                Read More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="border-t border-black/10 bg-[#f4f2ea] px-6 py-8 sm:px-8 lg:border-l lg:border-t-0">
              <div className="mb-6 overflow-hidden rounded-[1.5rem] border border-black/8 bg-[radial-gradient(circle_at_top_left,_rgba(131,196,6,0.22),_transparent_42%),linear-gradient(135deg,_#ffffff_0%,_#eef4de_100%)] p-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-16 rounded-2xl bg-white/80 shadow-sm" />
                  <div className="h-16 rounded-2xl bg-[#dff3ab]/80 shadow-sm" />
                  <div className="h-16 rounded-2xl bg-white/80 shadow-sm" />
                  <div className="col-span-2 h-20 rounded-2xl bg-gray-950/85" />
                  <div className="h-20 rounded-2xl bg-white/85" />
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">What you'll find here</p>
              <div className="mt-5 space-y-4">
                {[
                  "Website strategy for startups and small businesses",
                  "Brand-building advice for creators and influencers",
                  "Practical guidance on hosting, domains, and launch planning",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-black/8 bg-white px-4 py-4 text-sm leading-relaxed text-gray-600">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">More from the journal</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl">Next articles in the pipeline</h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {blogPreviews.map((preview) => (
              <article
                key={preview.title}
                className="flex h-full flex-col rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.28)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5d8f00]">{preview.category}</p>
                <h3 className="mt-4 text-xl font-extrabold tracking-tight text-gray-950">{preview.title}</h3>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-600">{preview.excerpt}</p>
                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span className="font-medium text-gray-700">{preview.author}</span>
                  <span>{formatBlogDate(preview.publishedAt)}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {preview.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-black/10 bg-gray-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-6 inline-flex items-center text-sm font-semibold text-gray-400">Coming soon</div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
