import type { ReactNode } from "react";
import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";

type MarketingLayoutProps = {
  children: ReactNode;
  contentClassName?: string;
};

export function MarketingLayout({ children, contentClassName = "" }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f7f4ec] text-gray-950">
      <Navbar />
      <main className={`px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28 ${contentClassName}`.trim()}>{children}</main>
      <Footer />
    </div>
  );
}
