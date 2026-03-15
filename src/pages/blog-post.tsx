import { ArrowLeft, Clock3 } from "lucide-react";
import { MarketingLayout } from "@/components/landing/marketing-layout";
import { Button } from "@/components/ui/button";
import { blogPreviews, getBlogPostBySlug, getRelatedBlogPosts } from "@/lib/blog";
import { navigate } from "@/lib/navigation";
import { usePageSeo } from "@/hooks/use-page-seo";

function formatBlogDate(date: string) {
  return new Date(date).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPostPage({ slug }: { slug: string }) {
  const post = getBlogPostBySlug(slug);
  const relatedPosts = getRelatedBlogPosts(slug);

  usePageSeo({
    title: post ? `${post.title} | Three J Media` : "Blog | Three J Media",
    description: post?.excerpt || "Read practical blog content from Three J Media.",
    path: `/blog/${slug}`,
    ogType: post ? "article" : "website",
    structuredData: post
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          author: {
            "@type": "Person",
            name: post.author,
          },
          publisher: {
            "@type": "Organization",
            name: "Three J Media",
            url: "https://threejmedia.co.za",
          },
          datePublished: post.publishedAt,
          dateModified: post.publishedAt,
          mainEntityOfPage: `https://threejmedia.co.za/blog/${slug}`,
          keywords: post.tags.join(", "),
        }
      : null,
  });

  if (!post) {
    return (
      <MarketingLayout contentClassName="py-16">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-black/10 bg-white p-8 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.28)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Blog</p>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Post not found</h1>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            The article you requested is not available yet.
          </p>
          <Button onClick={() => navigate("/blog")} className="mt-6 h-11 rounded-xl bg-gray-950 text-white hover:bg-black">
            Back to Blog
          </Button>
        </div>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout>
      <div className="mx-auto max-w-5xl space-y-8">
        <article className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_24px_80px_-36px_rgba(15,23,42,0.28)]">
        <div className="border-b border-black/10 bg-gray-950 px-6 py-8 text-white sm:px-10 sm:py-10">
          <button
            onClick={() => navigate("/blog")}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </button>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#dff3ab]">{post.category}</p>
          <h1 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl">{post.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-gray-300">
            <span className="font-medium text-white">{post.author}</span>
            <span>{formatBlogDate(post.publishedAt)}</span>
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              {post.readTime}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#83c406]/30 bg-[#83c406]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#dff3ab]"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(131,196,6,0.24),_transparent_40%),linear-gradient(135deg,_rgba(255,255,255,0.08)_0%,_rgba(255,255,255,0.02)_100%)] p-5">
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2 h-24 rounded-2xl bg-white/10" />
              <div className="h-24 rounded-2xl bg-[#83c406]/20" />
              <div className="h-24 rounded-2xl bg-white/10" />
              <div className="h-16 rounded-2xl bg-[#83c406]/14" />
              <div className="col-span-2 h-16 rounded-2xl bg-white/8" />
              <div className="h-16 rounded-2xl bg-white/12" />
            </div>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <div className="space-y-8">
            {post.sections.map((section, index) => (
              <section key={`${post.slug}-${index}`} className="space-y-4">
                {section.heading ? <h2 className="text-2xl font-extrabold tracking-tight text-gray-950">{section.heading}</h2> : null}
                <div className="space-y-4 text-base leading-relaxed text-gray-700">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets ? (
                  <ul className="space-y-3 pl-5 text-base leading-relaxed text-gray-700">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </div>
        </article>

        <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_20px_70px_-38px_rgba(15,23,42,0.25)] sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Build with intention</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-950">Need a website that supports your brand properly?</h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600">
                Start with your domain, compare packages, or talk to us about a site that helps you look credible and grow online.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => navigate("/#pricing")} className="h-11 rounded-xl bg-gray-950 px-6 text-white hover:bg-black">
                View Pricing
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/#domains")}
                className="h-11 rounded-xl border-black/10 bg-transparent px-6 text-gray-950 hover:bg-gray-50"
              >
                Search Domains
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Keep reading</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-950">Related and upcoming articles</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {relatedPosts.map((relatedPost) => (
              <article
                key={relatedPost.slug}
                className="flex h-full flex-col rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.28)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5d8f00]">{relatedPost.category}</p>
                <h3 className="mt-4 text-xl font-extrabold tracking-tight text-gray-950">{relatedPost.title}</h3>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-600">{relatedPost.excerpt}</p>
                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span className="font-medium text-gray-700">{relatedPost.author}</span>
                  <span>{formatBlogDate(relatedPost.publishedAt)}</span>
                  <span>{relatedPost.readTime}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {relatedPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-black/10 bg-gray-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Button
                  onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                  className="mt-6 h-11 rounded-xl bg-gray-950 px-6 text-white hover:bg-black"
                >
                  Read Article
                </Button>
              </article>
            ))}

            {blogPreviews.slice(0, Math.max(0, 2 - relatedPosts.length)).map((preview) => (
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
