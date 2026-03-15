import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { NavbarAuthActions } from "@/components/landing/navbar-auth-actions";
import { hasAuth0BrowserEnv } from "@/lib/env";
import { imageAssets } from "@/lib/images";
import { navigate } from "@/lib/navigation";

const navLinks = [
  { label: "About", href: "/about", type: "route" as const },
  { label: "Services", href: "/services", type: "route" as const },
  { label: "Blog", href: "/blog", type: "route" as const },
  { label: "Domains", href: "#domains" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHomePage = window.location.pathname === "/";
  const useSolidNav = isScrolled || !isHomePage;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavigate = (href: string) => {
    setMobileOpen(false);

    if (href.startsWith("#")) {
      if (window.location.pathname !== "/") {
        window.location.assign(`/${href}`);
        return;
      }

      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }

    navigate(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        useSolidNav
          ? "bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (!isHomePage) {
                navigate("/");
                return;
              }

              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 select-none"
          >
            <img
              src={imageAssets.logo}
              alt="Three J Media"
              className="h-10 w-auto shrink-0"
            />
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(({ label, href }) => (
              <button
                key={label}
                onClick={() => handleNavigate(href)}
                className={`text-sm font-medium transition-colors duration-200 hover:underline underline-offset-4 ${
                  useSolidNav
                    ? "text-gray-600 hover:text-gray-900"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Desktop auth actions */}
          <div className="hidden md:flex items-center gap-3">
            <NavbarAuthActions />
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              useSolidNav
                ? "text-gray-900 hover:bg-gray-100"
                : "text-white hover:bg-white/10"
            }`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map(({ label, href }) => (
              <button
                key={label}
                onClick={() => handleNavigate(href)}
                className="text-left text-gray-700 hover:text-gray-900 font-medium py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                {label}
              </button>
            ))}
            {hasAuth0BrowserEnv && (
              <button
                onClick={() => navigate("/dashboard")}
                className="mt-2 w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
