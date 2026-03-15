import { Instagram, Facebook } from "lucide-react";
import { imageAssets } from "@/lib/images";
import { navigate } from "@/lib/navigation";

const navLinks = [
  { label: "Domains", href: "#domains" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Pricing", href: "#pricing" },
  { label: "Newsletter", href: "#newsletter" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/threejmedia", label: "Instagram" },
  { icon: Facebook, href: "https://www.facebook.com/threejmedia", label: "Facebook" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/legal/privacy-policy" },
  { label: "Terms of Service", href: "/legal/terms-of-service" },
  { label: "Refund Policy", href: "/legal/refund-policy" },
  { label: "Cookie Policy", href: "/legal/cookie-policy" },
  { label: "Acceptable Use", href: "/legal/acceptable-use" },
  { label: "Data Processing Agreement", href: "/legal/data-processing-agreement" },
  { label: "Service Level Agreement", href: "/legal/service-level-agreement" },
  { label: "EULA", href: "/legal/eula" },
];

export function Footer() {
  const handleScroll = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-gray-950 border-t border-[#83c406]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:items-start md:justify-between md:text-left">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <img
                src={imageAssets.logo}
                alt="Three J Media"
                className="h-10 w-auto shrink-0"
              />
            </div>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              Premium web design and hosting for South African businesses,
              creators and startups.
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:justify-start">
            {navLinks.map(({ label, href }) => (
              <button
                key={label}
                onClick={() => handleScroll(href)}
                className="text-gray-400 hover:text-[#83c406] text-sm font-medium transition-colors duration-200"
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex max-w-md flex-col items-center gap-5 md:items-end">
            <div className="flex items-center justify-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#83c406]/35 bg-[#83c406]/8 text-[#83c406] transition-all duration-200 hover:bg-[#83c406]/16"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Legal</p>
              <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {legalLinks.map(({ label, href }) => (
                  <button
                    key={label}
                    onClick={() => navigate(href)}
                    className="text-left text-sm text-gray-400 transition-colors duration-200 hover:text-[#83c406]"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[#83c406]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>
            © {new Date().getFullYear()} Three J Media. All rights reserved.
          </p>
          <p>Built for South African businesses, creators, and startups.</p>
        </div>
      </div>
    </footer>
  );
}
