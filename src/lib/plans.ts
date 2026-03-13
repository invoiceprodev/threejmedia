export type PlanId = "starter" | "business-website" | "pro";

export type Plan = {
  id: PlanId;
  name: string;
  priceLabel: string;
  amountZar: number;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
};

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    priceLabel: "R1,999",
    amountZar: 1999,
    description: "Perfect for bloggers and personal brands getting started.",
    features: [
      "1-page website",
      "Mobile responsive",
      "Basic SEO setup",
      "Contact form",
      "1 month free hosting",
      "Email support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    id: "business-website",
    name: "Business Website",
    priceLabel: "R4,999",
    amountZar: 4999,
    description: "The most popular choice for growing small businesses.",
    features: [
      "Up to 5 pages",
      "Mobile responsive",
      "SEO optimised",
      "Contact & lead forms",
      "3 months free hosting",
      "Priority support",
      "Google Analytics setup",
      "Social media links",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "R7,999",
    amountZar: 7999,
    description: "For established businesses that need a full digital presence.",
    features: [
      "Up to 10 pages",
      "Custom design system",
      "Advanced SEO",
      "Blog / CMS setup",
      "6 months free hosting",
      "Dedicated support",
      "Speed optimisation",
      "Monthly maintenance",
    ],
    cta: "Get Started",
    popular: false,
  },
];

export function getPlanById(planId: string) {
  return plans.find((plan) => plan.id === planId);
}
