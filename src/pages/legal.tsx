import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navigate } from "@/lib/navigation";
import { imageAssets } from "@/lib/images";

type LegalSection = {
  heading: string;
  body: string[];
};

type LegalDocument = {
  title: string;
  summary: string;
  updated: string;
  sections: LegalSection[];
};

export const legalDocuments: Record<string, LegalDocument> = {
  "/legal/privacy-policy": {
    title: "Privacy Policy",
    summary: "How Three J Media collects, uses, stores, and protects personal information across our website, customer onboarding, and service delivery flows.",
    updated: "March 15, 2026",
    sections: [
      {
        heading: "Information We Collect",
        body: [
          "We collect information you provide directly to us, including your name, company details, email address, domain preferences, billing references, and onboarding information needed to deliver website, hosting, and domain services.",
          "We may also collect technical information such as browser type, device information, page visits, and usage events when you interact with our website or customer dashboard.",
        ],
      },
      {
        heading: "How We Use Information",
        body: [
          "We use personal information to respond to enquiries, prepare quotes, create accounts, process payments, provision services, register domains, provide support, and improve the quality of our services.",
          "We may use contact details to send important service notices, onboarding updates, renewal reminders, and limited marketing communications where lawful and appropriate.",
        ],
      },
      {
        heading: "Sharing and Retention",
        body: [
          "We only share information with service providers and infrastructure partners that are necessary to deliver our services, including payment processors, authentication providers, email providers, hosting infrastructure, domain registrar systems, and analytics tools.",
          "We retain information for as long as reasonably necessary to operate accounts, comply with legal obligations, maintain service records, resolve disputes, and enforce our agreements.",
        ],
      },
    ],
  },
  "/legal/terms-of-service": {
    title: "Terms of Service",
    summary: "The main rules governing use of the Three J Media website, digital products, and client service arrangements.",
    updated: "March 15, 2026",
    sections: [
      {
        heading: "Use of Services",
        body: [
          "By using our website or purchasing our services, you agree to use them lawfully, provide accurate information, and cooperate with reasonable onboarding, content, and verification requirements.",
          "You remain responsible for the accuracy of materials, content, credentials, and instructions you provide to us during a project or service relationship.",
        ],
      },
      {
        heading: "Quotes, Scope, and Delivery",
        body: [
          "Quotes, packages, and timelines are based on the agreed scope at the time of purchase. Any additional requirements, revisions beyond scope, or delayed client feedback may affect timelines and pricing.",
          "We reserve the right to pause delivery where required information, approvals, access, or payments are outstanding.",
        ],
      },
      {
        heading: "Accounts and Enforcement",
        body: [
          "You are responsible for safeguarding account credentials and for activity that occurs under your account. We may suspend or restrict access where necessary to prevent abuse, fraud, security risk, or contractual breach.",
          "These terms are intended as a practical operating agreement and may be updated from time to time to reflect changes in our services, legal requirements, or infrastructure.",
        ],
      },
    ],
  },
  "/legal/refund-policy": {
    title: "Refund Policy",
    summary: "How refunds, cancellations, and non-refundable service components are handled across web, hosting, and domain services.",
    updated: "March 15, 2026",
    sections: [
      {
        heading: "Project and Service Payments",
        body: [
          "Website project work typically begins once payment is confirmed. Fees for completed work, consumed time, custom strategy, setup labour, and already-delivered assets are generally non-refundable.",
          "If a cancellation occurs before meaningful delivery starts, we may review the matter in good faith and determine whether a partial refund is appropriate after deducting administrative and setup costs.",
        ],
      },
      {
        heading: "Domains and Third-Party Charges",
        body: [
          "Domain registrations, renewals, and transfers are usually non-refundable once submitted because they involve third-party registrar systems and immediate allocation or processing.",
          "Where a domain is included in a package for the first year, that inclusion forms part of the purchased package value and is not treated as a separate recurring charge until renewal time.",
        ],
      },
      {
        heading: "Hosting and Renewals",
        body: [
          "Recurring hosting, maintenance, and renewal services may be cancelled before the next billing cycle, but charges already incurred for the active service period are generally not refunded unless required by law or agreed otherwise in writing.",
        ],
      },
    ],
  },
  "/legal/cookie-policy": {
    title: "Cookie Policy",
    summary: "How cookies and similar technologies may be used to improve functionality, analytics, and service reliability.",
    updated: "March 15, 2026",
    sections: [
      {
        heading: "What Cookies Are Used For",
        body: [
          "Cookies and similar technologies may be used to remember preferences, support secure sign-in, understand traffic patterns, improve performance, and measure the effectiveness of pages or campaigns.",
          "Some cookies are essential for website operation, while others are used to improve usability, analytics, or service diagnostics.",
        ],
      },
      {
        heading: "Managing Preferences",
        body: [
          "You can usually manage cookies through your browser settings, including blocking, deleting, or restricting them. Disabling certain cookies may affect sign-in, forms, preferences, or other interactive website features.",
        ],
      },
    ],
  },
  "/legal/acceptable-use": {
    title: "Acceptable Use Policy",
    summary: "Rules designed to keep our platform, hosting environments, and client systems lawful, stable, and secure.",
    updated: "March 15, 2026",
    sections: [
      {
        heading: "Prohibited Conduct",
        body: [
          "You may not use our services to distribute malware, host illegal content, infringe intellectual property rights, impersonate others, send spam, harass users, or interfere with networks, systems, or third-party services.",
          "Any attempt to bypass security controls, abuse registrar or hosting infrastructure, scrape protected systems, or overload shared resources may result in suspension or termination.",
        ],
      },
      {
        heading: "Enforcement",
        body: [
          "We may investigate suspected misuse, restrict access, remove harmful content, cooperate with lawful requests, and take proportionate action to protect our customers, partners, and infrastructure.",
        ],
      },
    ],
  },
  "/legal/data-processing-agreement": {
    title: "Data Processing Agreement",
    summary: "Baseline terms for cases where Three J Media processes personal information on behalf of a customer while delivering contracted services.",
    updated: "March 15, 2026",
    sections: [
      {
        heading: "Roles and Scope",
        body: [
          "Where applicable, the customer acts as the controller of customer-submitted personal data and Three J Media acts as a processor only to the extent necessary to provide the contracted services.",
          "Processing activities may include hosting, website maintenance, backups, support workflows, analytics configuration, account provisioning, and related technical administration.",
        ],
      },
      {
        heading: "Security and Subprocessors",
        body: [
          "We implement reasonable technical and organisational measures to protect personal data and may use carefully selected subprocessors where needed to operate infrastructure, email, authentication, hosting, domain, and billing systems.",
          "Customers remain responsible for ensuring they have a lawful basis for submitting personal information into the systems we help them operate.",
        ],
      },
    ],
  },
  "/legal/service-level-agreement": {
    title: "Service Level Agreement",
    summary: "Operational expectations for availability, support response, maintenance windows, and incident handling.",
    updated: "March 15, 2026",
    sections: [
      {
        heading: "Support and Availability",
        body: [
          "We aim to provide commercially reasonable uptime and timely support for covered hosting and maintenance services, subject to scheduled maintenance, upstream outages, force majeure events, and dependencies outside our direct control.",
          "Response times may vary based on plan level, issue severity, business hours, and whether the issue concerns active production impact or a routine request.",
        ],
      },
      {
        heading: "Limitations",
        body: [
          "This SLA is intended as a service commitment summary rather than a guarantee of uninterrupted availability. Third-party outages, registrar delays, client-side code changes, and external network conditions are outside our direct control.",
        ],
      },
    ],
  },
  "/legal/eula": {
    title: "EULA",
    summary: "License terms for any proprietary templates, code, assets, dashboards, or software components made available by Three J Media.",
    updated: "March 15, 2026",
    sections: [
      {
        heading: "License Grant",
        body: [
          "Subject to payment and compliance with our terms, we grant customers a limited, non-exclusive, non-transferable right to use the deliverables and software components provided as part of the purchased service.",
          "Unless expressly agreed otherwise, source assets, internal tools, proprietary frameworks, and reusable system components remain the property of Three J Media or its licensors.",
        ],
      },
      {
        heading: "Restrictions",
        body: [
          "You may not resell, sublicense, reverse engineer, copy, or redistribute proprietary software components outside the scope of your agreement without written permission.",
          "Third-party libraries, plugins, fonts, and integrations remain subject to their own license terms where applicable.",
        ],
      },
    ],
  },
};

export function LegalPage({ pathname }: { pathname: string }) {
  const document = legalDocuments[pathname];

  if (!document) {
    return (
      <div className="min-h-screen bg-[#f7f4ec] px-4 py-16 text-gray-950">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-black/10 bg-white p-8 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.28)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Legal</p>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Document not found</h1>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            The legal document you requested is not available yet.
          </p>
          <Button onClick={() => navigate("/")} className="mt-6 h-11 rounded-xl bg-gray-950 text-white hover:bg-black">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ec] px-4 py-10 text-gray-950 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>

          <img src={imageAssets.logo} alt="Three J Media" className="h-10 w-auto" />
        </div>

        <article className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_24px_80px_-36px_rgba(15,23,42,0.28)]">
          <div className="border-b border-black/10 bg-gray-950 px-6 py-8 text-white sm:px-10 sm:py-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#83c406]/35 bg-[#83c406]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#dff3ab]">
              <FileText className="h-3.5 w-3.5" />
              Legal
            </div>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">{document.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base">{document.summary}</p>
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
              Last updated {document.updated}
            </p>
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <div className="space-y-8">
              {document.sections.map((section) => (
                <section key={section.heading} className="space-y-3">
                  <h2 className="text-xl font-bold tracking-tight text-gray-950">{section.heading}</h2>
                  <div className="space-y-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
