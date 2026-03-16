import { useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { DomainSearchSection } from "@/components/landing/domain-search-section";
import { NewsletterSection } from "@/components/landing/newsletter-section";
import { PortfolioSection } from "@/components/landing/portfolio-section";
import { WhyChooseUsSection } from "@/components/landing/why-choose-us-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { BudgetWizard } from "@/components/landing/budget-wizard";
import { PlanSignupDialog } from "@/components/landing/plan-signup-dialog";
import { type PlanId } from "@/lib/plans";
import { usePageSeo } from "@/hooks/use-page-seo";

export default function LandingPage() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId | null>(null);

  usePageSeo({
    title: "Three J Media | Web Design, Domains and Hosting in South Africa",
    description:
      "Three J Media builds websites, manages domains, and provides hosting and launch support for South African businesses ready to grow online.",
    path: "/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Three J Media",
      url: "https://threejmedia.co.za/",
      description:
        "Three J Media builds websites, manages domains, and provides hosting and launch support for South African businesses ready to grow online.",
      publisher: {
        "@type": "Organization",
        name: "Three J Media",
        url: "https://threejmedia.co.za/",
      },
    },
  });

  const handleSelectPlan = (planId: PlanId) => {
    setSelectedPlanId(planId);
    setSignupOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main>
        <HeroSection onOpenWizard={() => setWizardOpen(true)} />

        <DomainSearchSection onOpenWizard={() => setWizardOpen(true)} />

        <PricingSection onSelectPlan={handleSelectPlan} />

        <NewsletterSection />

        <PortfolioSection />

        <WhyChooseUsSection />

        <TestimonialsSection />

        <CTASection />
      </main>

      <Footer />

      <BudgetWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
      <PlanSignupDialog open={signupOpen} planId={selectedPlanId} onOpenChange={setSignupOpen} />
    </div>
  );
}
