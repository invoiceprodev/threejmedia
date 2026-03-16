# Project: Web Design & Hosting Agency Landing Page

## Overview

A modern, premium, conversion-focused landing page for a South African web design and hosting agency serving startups, bloggers, influencers and small businesses. The design is minimal, mobile-first and built to convert visitors into clients.

## Current Implementation Notes

- HostAfrica reseller integration is now wired for live TLD pricing, domain lookup, registration, and transfer flows.
- Landing page includes a customer-facing domain search section backed by the reseller API.
- Domain order dialog supports dry-run validation before any live HostAfrica order is submitted.
- First admin workspace is now implemented at `/admin` and can become the home page for `admin.threejmedia.co.za`.
- Admin stage 1 currently reads live signup and payment records from Supabase, protects access with Auth0, and restricts entry by `ADMIN_ALLOWED_EMAILS`.
- Mobile dialog width issues have been fixed across the budget wizard, plan signup, and domain order flows.
- Follow-up UI task: revisit the domain order dialog width and input layout on desktop, as the popup still feels a bit narrow for comfortable entry on some screen sizes.
- Follow-up backend task for tomorrow: debug `POST /api/domain-fulfillment/submit` on Railway. Current `curl` request shape is correct, but `https://api.threejmedia.co.za/api/domain-fulfillment/submit` returned `502 Application failed to respond` during deployment/runtime verification.
- Tomorrow checks: confirm Railway deploy completed, verify `/health`, verify `DOMAIN_FULFILLMENT_ADMIN_TOKEN` is present in Railway, inspect Railway logs for the fulfillment submit route, then retry the dry run with `uifmasters.co.za`.

## Next Product Stage

- Phase 5 should expand the admin workspace into proper business operations resources:
  - clients
  - invoices
  - subscriptions
  - client notes
  - settings
- Recommended implementation path:
  - add dedicated Supabase tables instead of deriving everything from `client_signups`
  - expose protected admin CRUD endpoints from the Railway API
  - evolve `/admin` into the primary operations surface for `admin.threejmedia.co.za`
- Progress so far:
  - `admin_clients` SQL schema added
  - `admin_subscriptions` SQL schema added
  - protected `GET/POST /api/admin/clients` added
  - protected `GET/POST /api/admin/subscriptions` added

<phase number="1" title="Core Landing Page – Hero, Services, Pricing & Footer">

Deliver a fully functional landing page skeleton with the most conversion-critical sections so the brand and offer are immediately clear.

#### Key Features

- Full-width hero section with gradient, headline, subheadline, CTAs and placeholder image
- Services section (Web Design, Hosting, Maintenance, Landing Pages)
- Pricing section with 3 tiers (Starter R1,999 / Business R4,999 Most Popular / Pro R7,999)
- Footer with nav links, social icons and copyright

#### Tasks

- [x] Set up page layout and navigation header with logo and nav links
- [x] Build Hero section with gradient background, headline, subheadline, CTA buttons and placeholder visuals
- [x] Build Services section with 4 feature cards
- [x] Build Pricing section with 3 cards (highlight "Business Website" as Most Popular)
- [x] Build Footer with links, social icons and copyright

#### Notes

- Data source: Static/hardcoded content (no backend needed)
- Brand: South African agency, premium SaaS aesthetic
- Colors: Dark gradient hero, clean white sections, accent color for CTA buttons
- All sections must be fully responsive (mobile-first)
- Services are now surfaced as dedicated hero slides instead of a standalone section.

</phase>

<phase number="2" title="Social Proof – Portfolio, Creators & Testimonials">

Add trust-building sections that showcase past work, creator clients and client testimonials.

#### Key Features

- "Trusted By Creators" section with avatar cards for 4 influencers
- Portfolio grid with hover animation revealing "View Project"
- "Why Choose Us" 4-feature card section
- Testimonials section with client quote cards

#### Tasks

- [ ] Build "Trusted By South African Creators" section with avatar placeholder cards (iamthandolwethu, dineo_zonke, thobi_rose, koolarney)
- [x] Build Portfolio section with grid layout, hosted images, project name, category and hover overlay
- [x] Build "Why Choose Us" section with 4 feature cards (Fast, Mobile First, Local Support, Growth Focused)
- [x] Build Testimonials section with quote cards including client name and role
- [x] Add final CTA section (Ready To Launch Your Website?) with two action buttons

</phase>

<phase number="3" title="Polish – Animations, Accessibility & Performance">

Refine the page with smooth animations, scroll effects and final visual polish.

#### Tasks

- [x] Add smooth scroll-in animations for section headings and cards
- [x] Add hover micro-animations to all cards (services, pricing, portfolio)
- [ ] Improve mobile spacing and typography across all sections
- [x] Add smooth scroll behaviour for nav anchor links
- [ ] Final visual QA pass: spacing, shadows, color consistency

</phase>

<phase number="4" title="Budget Builder – Interactive Price Estimator">

Replace hero CTAs with a single "Create for Your Budget" button that opens a multi-step interactive form helping visitors build a custom quote based on the features they need.

#### Key Features

- Single "Create for Your Budget" CTA in hero (replaces existing two buttons)
- Multi-step form wizard (modal or dedicated page) guiding users through feature selection
- Running price total that updates live as features are toggled
- Final summary screen showing selected features, total price and a call-to-action

#### Tasks

- [x] Replace hero CTA buttons with single "Create for Your Budget" button
- [x] Build multi-step budget wizard with the following steps:
  - Step 1: Website Type (Landing Page R1,999 / Business Website R4,999 / E-commerce R7,999)
  - Step 2: Add-on Features (toggle cards) — Blog (+R500), Online Store (+R2,000), Booking System (+R1,500), SEO Setup (+R800), Logo Design (+R1,200), Monthly Maintenance (+R699/mo)
  - Step 3: Hosting Plan (Basic R99/mo / Standard R199/mo / Premium R399/mo)
  - Step 4: Domain extension selection with live lookup support
  - Step 5: Summary — shows selected items, live price total and "Get My Custom Quote" CTA
- [x] Live price total in a sticky/persistent bar updating as user makes selections
- [x] "Get My Custom Quote" final step with name + email fields to capture lead

#### Notes

- Pricing remains static, while domain extension data and availability now use live reseller endpoints
- Open as a full-screen modal or slide-over panel from the hero CTA
- Show step progress indicator
- All prices in ZAR (R)
- Mobile-first, large tap targets on all toggle cards

</phase>
