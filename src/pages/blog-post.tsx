import { ArrowLeft, Clock3 } from "lucide-react";
import { MarketingLayout } from "@/components/landing/marketing-layout";
import { Button } from "@/components/ui/button";
import { getBlogPostBySlug } from "@/lib/blog";
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

  usePageSeo({
    title: post ? `${post.title} | Three J Media` : "Blog | Three J Media",
    description: post?.excerpt || "Read practical blog content from Three J Media.",
    path: `/blog/${slug}`,
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
      <article className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_24px_80px_-36px_rgba(15,23,42,0.28)]">
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
            <span>{formatBlogDate(post.publishedAt)}</span>
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              {post.readTime}
            </span>
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
    </MarketingLayout>
  );
}
