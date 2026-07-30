---
target: "https://engines.haifengmachinery.com/"
total_score: 27
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 2
timestamp: 2026-07-30T09-58-55Z
slug: engines-haifengmachinery-com
---
⚠️ DEGRADED: single-context (Assessment B sub-agent timed out; Assessment A completed in a separate sub-agent, detector/browser evidence was recovered in-thread)

Target: https://engines.haifengmachinery.com/

**Design Health Score**

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Search is the primary action, but the homepage does not visibly reassure users about loading, suggestions, or recovery until interaction starts. |
| 2 | Match System / Real World | 3 | kWe, kVA, emissions, datasheets, brands, and model names fit the generator buyer/specifier vocabulary. |
| 3 | User Control and Freedom | 3 | Navigation, search, and mobile menu controls are clear enough; homepage has no trapping workflow. |
| 4 | Consistency and Standards | 3 | The Swiss grid system is cohesive, though repeated ruled card blocks make different task types feel too similar. |
| 5 | Error Prevention | 2 | Search and browse entry points do not guide ambiguous intent before submit: brand, model, power band, emissions, package route. |
| 6 | Recognition Rather Than Recall | 3 | Major routes are visible, but long model/brand/facet sections ask users to infer the best path themselves. |
| 7 | Flexibility and Efficiency | 3 | Search-first homepage works for repeat users, but there is no fast path for common power/emissions/package tasks above the fold. |
| 8 | Aesthetic and Minimalist Design | 3 | Disciplined and credible, but the section stack becomes monotonous because catalog, models, packages, brands, and facets share nearly the same visual grammar. |
| 9 | Error Recovery | 2 | Search has fallback behavior in source, but the visible homepage does not preview examples or recovery paths for no/slow/ambiguous results. |
| 10 | Help and Documentation | 3 | Guides exist, but the homepage does not surface “how to choose” guidance at the moment users are deciding what to search or browse. |
| **Total** | | **27/40** | **Acceptable, close to Good: credible foundation, but decision guidance and hierarchy need work.** |

**Design Specificity Verdict**

The homepage is authored, but not yet fully proprietary. The live page clearly belongs to a technical generator-engine reference: oversized data count, hard black rules, tabular stats, grayscale machinery photography, and the blue accent all support a serious industrial database. It would not feel right as a generic SaaS landing page.

The missing layer is Haifeng-specific authority. The page proves scale, but it does not yet prove why Haifeng is the trusted partner to interpret that scale: datasheet confidence, package selection logic, compliance seriousness, and “engine shortlist to generator package” guidance are present in copy, but not yet designed as first-class objects.

**Deterministic Scan**

Source CLI scan was clean:
- `app/page.tsx`: 0 findings.
- `app/layout.tsx`, `components/SiteNav.tsx`, `components/SearchBar.tsx`, `components/CommercialPathways.tsx`: 0 findings.

Browser detector evidence on the live production page found 9 anti-pattern rows on desktop and 11 on mobile. Actionable findings:
- `low-contrast`: `#7a7a80` on white at about 4.3:1, below the 4.5:1 text threshold.
- `line-length`: long rendered text blocks around about 110 and 229 characters per line.
- `heading-rhythm`: repeated brand-card headings such as MTU, Weichai, Waukesha, Detroit Diesel, Yunnei, and others have 16px above vs 28px below, making the heading feel bound to the previous block.

Probable false positives:
- `gradient-text` and `marquee` appeared in browser detector console output, but live DOM verification found `marquee count 0` and `background-clip/bg-clip/gradient count 0`; local source search also found no matching usage in `app`, `components`, or `public`.

**Visual Overlays**

No reliable user-visible overlay is available. Mutable page injection succeeded through Playwright, and the browser detector script ran, but the Impeccable live server failed to start with `Timed out waiting for live server to start`; `live-status` reported no running server and no `.impeccable/live/config.json`. Browser evidence was captured through direct detector injection and screenshots instead.

**Overall Impression**

This is a strong technical reference shell with real discipline. The biggest opportunity is to move from “large database” to “guided engine and package decision system.” Right now the first viewport earns trust, then the page becomes a sequence of similarly weighted grids. It needs clearer paths for known-model search, power/emissions browsing, and commercial package routing.

**What's Working**

- The Swiss industrial visual system fits the domain: black hairline rules, tabular numbers, sharp edges, and Yves Klein blue feel serious and engineering-adjacent.
- The first viewport communicates scale immediately: `2,715+` engines, search, and secondary stats make the site useful before it tries to sell.
- Real engine photography gives material proof and prevents the interface from becoming a sterile spreadsheet wrapper.

**Priority Issues**

**[P1] The homepage under-expresses decision support**

Why it matters: first-time buyers and busy specifiers need to know how to begin. A blank search box plus many downstream sections makes the user choose the search strategy before the site has taught one.

Fix: add 2-3 starter paths directly around the hero search, such as “Find by model,” “Browse 500-1,500 kWe,” and “EPA Tier 4 engines.” Keep them as crisp Swiss link controls, not decorative chips.

Suggested command: `$impeccable clarify`

**[P1] Haifeng’s commercial path is visually underpowered**

Why it matters: the package routes are the conversion bridge from reference database to Haifeng inquiry, but they read like another generic grid. The supplier value is easy to skip.

Fix: make package routing a distinct decision band: “Engine shortlist -> package route,” with 3-5 clear buyer outcomes and stronger hierarchy than ordinary browse cards.

Suggested command: `$impeccable layout`

**[P2] Repeated grid sections flatten the page**

Why it matters: Catalog, models, package routes, manufacturers, and facets all share nearly the same bordered-card grammar. Users must keep rereading headings to understand what kind of decision each section supports.

Fix: vary section structures by task: category tiles for database entry, compact ranking/list for models, decision flow for packages, dense text index for brands/facets.

Suggested command: `$impeccable layout`

**[P2] Mobile menu and stacked density create orientation friction**

Why it matters: mobile users see a strong hero, but the menu and stacked card sections quickly crowd the viewport. Important actions are high on the screen, and the long page becomes effortful to scan one-handed.

Fix: give the mobile menu a clearer panel treatment or full-height drawer, tighten repeated card blocks, and keep the highest-value actions near the first two screens.

Suggested command: `$impeccable adapt`

**[P2] Accessibility polish is close but not finished**

Why it matters: the detector found live contrast just below AA for some muted text, plus line-length and heading rhythm issues. These do not break the page, but they reduce scan confidence and readability.

Fix: darken `text-gray-400`/muted text used on white, cap long text containers, and rebalance brand-card heading spacing.

Suggested command: `$impeccable audit`

**Persona Red Flags**

**Jordan (First-Timer):** Jordan sees the scale and understands this is a database, but the first action is still under-specified. The hero says “Search by brand, model, or series,” then the page offers many downstream routes without saying which path fits a user who only knows power range, emissions requirement, or fuel.

**Sam (Accessibility-Dependent User):** Sam benefits from text labels and standard links, but low-contrast muted text on white misses the 4.5:1 target in live detector evidence. Long line lengths also make reading harder at zoom and for cognitive accessibility.

**Casey (Distracted Mobile User):** Casey gets the essential promise in the first mobile viewport, but the page stacks many similar cards after that. The package route and guide/support decisions are buried below repeated database sections, and the primary commercial action is not thumb-zone friendly.

**Alex (Power User):** Alex can use search quickly, but the homepage does not expose expert accelerators: known high-frequency filters, power-band shortcuts near search, datasheet-available paths, comparison shortcuts, or persistent advanced filter entry.

**Minor Observations**

- The live header still uses the `HF Generator Engine Index` mark; local code appears to be moving toward a richer Haifeng logo treatment. The live version is crisp but less brand-specific.
- “High-interest specifications” is accurate but slightly vague; “Frequently searched engine specs” or “Priority engine specs” would scan faster.
- The blue photo overlay is distinctive, but on mobile it hides useful engine detail while the caption competes with the image crop.
- Large card links rely heavily on hover color changes; make link intent more visible for touch and keyboard users.
- The homepage mentions verified ratings, but it does not visibly show source freshness, completeness, datasheet availability, or confidence.

**Questions to Consider**

- Should the homepage optimize first for “I know the model” search, or for “I know the requirement” browsing?
- What visual proof would make an engineer trust the data within five seconds?
- Where should Haifeng become prominent: in the hero, in the package route band, or only after the user shows commercial intent?
- Which section would you remove if the homepage had to be 40% shorter?
