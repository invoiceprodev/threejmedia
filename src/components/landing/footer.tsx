import { Twitter, Instagram, Linkedin, Facebook } from "lucide-react";
import { imageAssets } from "@/lib/images";

const navLinks = [
  { label: "Domains", href: "#domains" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Pricing", href: "#pricing" },
  { label: "Newsletter", href: "#newsletter" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Facebook, href: "#", label: "Facebook" },
];

export function Footer() {
  const handleScroll = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-gray-950 border-t border-[#83c406]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col items-center text-center md:flex-row md:items-center md:justify-between md:text-left gap-8">
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

          {/* Social */}
          <div className="flex items-center justify-center gap-3">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                onClick={(e) => e.preventDefault()}
                className="w-9 h-9 rounded-lg bg-[#83c406]/8 hover:bg-[#83c406]/16 border border-[#83c406]/35 flex items-center justify-center text-[#83c406] transition-all duration-200"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[#83c406]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>
            © {new Date().getFullYear()} Three J Media. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="hover:text-gray-400 transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-gray-400 transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
