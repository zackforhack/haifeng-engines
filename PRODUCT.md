# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are generator buyers and specifiers, engineers, distributors, and SEO visitors researching generator engine specifications. They arrive needing to identify, compare, validate, or shortlist diesel and gas generator engines, alternators, brands, datasheets, power ratings, emissions standards, and related technical guidance.

## Product Purpose

Haifeng Engines is the public technical catalog at `engines.haifengmachinery.com` for generator engine and alternator research. It exists to help visitors search and browse a broad specification database, reach manufacturer and model pages, understand key generator-selection topics, and move from technical research toward relevant Haifeng Machinery package offerings.

Success means users can quickly find credible engine, alternator, brand, guide, comparison, and category pages; trust the catalog as a technical reference; and continue into Haifeng Machinery inquiry or package routes when a shortlist becomes commercial work.

## Positioning

The product should be known for breadth and depth of catalog coverage, the connection between technical specifications and what Haifeng can offer, and strong SEO visibility across engine, alternator, brand, guide, comparison, and facet routes.

## Operating Context

Users evaluate the site while researching generator-set projects, comparing engines by model, brand, fuel, power output, frequency, emissions standard, configuration, origin, and datasheet availability. The site supports search-driven visits, SEO landing pages, catalog browsing, technical guide reading, and movement from an engine shortlist to Haifeng Machinery product and inquiry pages.

## Capabilities and Constraints

- Preserve the existing route and SEO structure, including homepage, engine catalog, engine detail pages, alternator catalog, brand hubs, guide pages, category/facet pages, comparison pages, sitemaps, robots, Open Graph, and `llms.txt` routes.
- Preserve the Supabase-backed data model and runtime catalog behavior for engines, engine PDFs, and alternators.
- Preserve search, filter, sort, browse, datasheet, and internal-linking workflows.
- Do not invent product claims, commercial guarantees, customer proof, benchmark data, specifications, certifications, or availability that are not supported by the catalog or supplied Haifeng materials.
- Treat specifications as engineering reference material and keep appropriate confirmation language when final ratings require manufacturer validation.
- Existing stack is Next.js App Router, React, TypeScript, Tailwind CSS, Supabase, Vercel Analytics, and related SEO/reporting scripts.

## Brand Commitments

- Preserve Haifeng Machinery / Haifeng Power naming and the Haifeng logo.
- Preserve a technical-reference tone: clear, credible, specific, and useful for engineering and purchasing research.
- Future visual work should aim for a clean, professional design quality comparable to Apple product experiences: refined, restrained, precise, and trustworthy. This is a binding preference, not a completed design system.
- Maintain the relationship between the catalog subdomain and the main Haifeng Machinery commercial site.

## Evidence on Hand

- Repository README documents the product, stack, deployment, SEO reporting, and data QA workflows.
- `app/layout.tsx` contains organization and website structured data for Haifeng Machinery, including legal name, contact details, address, social links, and sitelinks search configuration.
- `public/haifeng-logo.png` is the local logo asset currently used in the interface.
- `public/brand-logos/` contains manufacturer logo assets.
- `public/hero/cummins-engine.jpg` and `public/guides/` contain current imagery and guide assets.
- Catalog data is read from Supabase tables including `engines`, `engine_pdfs`, and `alternators`.
- Markdown guide content, SEO opportunity data, metadata routes, sitemap routes, and QA/reporting scripts provide real content and operational evidence.

## Product Principles

1. Make technical research fast: users should reach model, brand, power, emissions, alternator, guide, and datasheet paths with minimal friction.
2. Prefer verified catalog facts over persuasion: design may clarify and elevate the content, but unsupported claims must not be fabricated.
3. Connect specification research to Haifeng’s commercial offering without making the catalog feel like a thin sales page.
4. Protect SEO architecture as product infrastructure: route structure, canonical surfaces, internal links, and metadata are core behavior.
5. Keep the experience clean, professional, and credible for engineering, purchasing, and distributor workflows.

## Accessibility & Inclusion

The product should remain usable for visitors on desktop and mobile, including search-driven mobile visits. Future interface work should preserve semantic routes, readable contrast, keyboard-accessible controls, clear labels, and responsive layouts suitable for technical comparison and reference reading.
