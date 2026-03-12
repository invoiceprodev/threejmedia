import { useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { ServicesSection } from "@/components/landing/services-section";
import { NewsletterSection } from "@/components/landing/newsletter-section";
import { PortfolioSection } from "@/components/landing/portfolio-section";
import { WhyChooseUsSection } from "@/components/landing/why-choose-us-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { BudgetWizard } from "@/components/landing/budget-wizard";

export default function LandingPage() {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main>
        <HeroSection onOpenWizard={() => setWizardOpen(true)} />

        <ServicesSection />

        <PricingSection />

        <NewsletterSection />

        <PortfolioSection />

        <WhyChooseUsSection />

        <TestimonialsSection />

        <CTASection />
      </main>

      <Footer />

      <BudgetWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
}
