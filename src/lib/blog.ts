export type BlogPostSection = {
  heading?: string;
  paragraphs: string[];
  bullets?: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readTime: string;
  category: string;
  featured?: boolean;
  sections: BlogPostSection[];
};

export type BlogPreview = {
  title: string;
  excerpt: string;
  category: string;
  status: "coming-soon";
};

export const blogPosts: BlogPost[] = [
  {
    slug: "why-every-business-and-personal-brand-should-have-a-website",
    title: "Why Every Business and Personal Brand Should Have a Website",
    excerpt:
      "Social platforms are useful, but your website is the stable digital home that builds trust, supports growth, and gives your brand room to expand on your own terms.",
    publishedAt: "2026-03-15",
    readTime: "5 min read",
    category: "Brand Strategy",
    featured: true,
    sections: [
      {
        paragraphs: [
          "In a world where social media dominates communication, many businesses and creators rely entirely on platforms like Instagram, TikTok, or Facebook to reach their audiences. While these platforms are powerful tools, they should never replace having your own website.",
          "A website remains one of the most important assets any business or personal brand can have.",
        ],
      },
      {
        heading: "Your Website Is Your Digital Home",
        paragraphs: [
          "Social media platforms can change their algorithms, restrict accounts, or even disappear over time. When your entire presence relies on a platform you do not control, your business becomes vulnerable.",
          "A website, on the other hand, belongs to you.",
          "It becomes your permanent online home where people can always find your brand, your work, and your services.",
        ],
      },
      {
        heading: "A Website Builds Credibility",
        paragraphs: [
          "One of the first things people do when they hear about a business is search for it online.",
          "If they find a professional website, it immediately builds trust.",
          "A well-designed website shows that your brand is:",
        ],
        bullets: ["legitimate", "professional", "serious about its work"],
      },
      {
        paragraphs: ["Without a website, potential clients may hesitate to do business with you."],
      },
      {
        heading: "You Control Your Brand",
        paragraphs: [
          "Social media platforms limit how you present your content. A website gives you complete control over your brand.",
          "With a website you can:",
        ],
        bullets: [
          "present your story",
          "display your portfolio",
          "publish articles or blogs",
          "promote your services",
          "collect enquiries from clients",
        ],
      },
      {
        paragraphs: [
          "It allows your audience to understand who you are and what you offer in a deeper way.",
        ],
      },
      {
        heading: "A Website Helps You Get Found Online",
        paragraphs: [
          "Search engines like Google help people discover businesses every day.",
          "When your website is optimized properly, people searching for services you offer can find your brand through search results.",
          "For example, someone searching for:",
        ],
        bullets: ["web design services", "fashion blog", "photography portfolio", "freelance services"],
      },
      {
        paragraphs: [
          "may discover your website through search engines.",
          "This creates opportunities for new audiences and potential clients to find you.",
        ],
      },
      {
        heading: "A Website Creates Business Opportunities",
        paragraphs: [
          "For influencers and creators, a website becomes a professional platform where brands and collaborators can learn more about you.",
          "It can include:",
        ],
        bullets: ["media kits", "brand partnerships", "portfolios", "contact forms", "blog content"],
      },
      {
        paragraphs: [
          "Instead of relying only on social media profiles, you now have a professional digital presence.",
        ],
      },
      {
        heading: "The Long-Term Value of a Website",
        paragraphs: [
          "A website is an investment that grows with your brand.",
          "Over time it becomes:",
        ],
        bullets: [
          "a hub for your content",
          "a place where customers discover your services",
          "a platform that represents your brand professionally",
        ],
      },
      {
        paragraphs: [
          "While social media trends change constantly, a website remains one of the most stable and powerful tools for building a long-term digital presence.",
        ],
      },
      {
        heading: "Final Thoughts",
        paragraphs: [
          "Whether you're a startup business, entrepreneur, influencer, or blogger, having a website is no longer optional.",
          "It is one of the most powerful ways to establish credibility, reach new audiences, and build a lasting brand online.",
          "If you're ready to build your online presence, Three J Media is here to help you bring your vision to life.",
        ],
      },
    ],
  },
];

export const blogPreviews: BlogPreview[] = [
  {
    title: "How Startups Can Launch a Website Without Wasting Time or Budget",
    excerpt:
      "A practical look at the pages, tools, and launch decisions that matter most when you're building your first business site.",
    category: "Startups",
    status: "coming-soon",
  },
  {
    title: "What Makes a Business Website Feel Professional in 2026",
    excerpt:
      "The design, messaging, and trust signals that make visitors take your brand seriously from the first scroll.",
    category: "Web Design",
    status: "coming-soon",
  },
  {
    title: "Why Bloggers and Creators Need a Platform They Actually Own",
    excerpt:
      "Social reach is helpful, but ownership gives creators stability, search visibility, and room to grow beyond one platform.",
    category: "Creators",
    status: "coming-soon",
  },
  {
    title: "Choosing the Right Domain Name for a South African Brand",
    excerpt:
      "A straightforward guide to picking a domain that feels trustworthy, memorable, and ready for long-term growth.",
    category: "Domains",
    status: "coming-soon",
  },
];

export function getFeaturedBlogPost() {
  return blogPosts.find((post) => post.featured) ?? blogPosts[0];
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
