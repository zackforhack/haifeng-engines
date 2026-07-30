---
name: Haifeng Engines
description: Clean technical catalog system for generator engine research
colors:
  haifeng-blue: "#002fa7"
  haifeng-blue-deep: "#001f70"
  catalog-paper: "#f7f7f8"
  surface-white: "#ffffff"
  ink: "#111111"
  body-text: "#2e2e31"
  muted-text: "#47474c"
  secondary-text: "#5b5b60"
  quiet-text: "#696970"
  line: "#d8d8dc"
  quiet-line: "#e8e8ea"
  wash-blue: "#f1f4fc"
  wash-neutral: "#eeeeef"
typography:
  display:
    fontFamily: "\"Segoe UI\", \"Helvetica Neue\", Arial, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 4.25vw, 2.875rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "0"
  headline:
    fontFamily: "\"Segoe UI\", \"Helvetica Neue\", Arial, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 2vw, 1.875rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0"
  title:
    fontFamily: "\"Segoe UI\", \"Helvetica Neue\", Arial, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "0"
  body:
    fontFamily: "\"Segoe UI\", \"Helvetica Neue\", Arial, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0"
  label:
    fontFamily: "\"Segoe UI\", \"Helvetica Neue\", Arial, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0"
rounded:
  none: "0"
  sm: "2px"
  md: "3px"
  lg: "4px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  section-mobile: "40px"
  section-desktop: "56px"
components:
  button-primary:
    backgroundColor: "{colors.haifeng-blue}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.none}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.haifeng-blue-deep}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.none}"
    padding: "14px 24px"
  input-search:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "14px 16px"
  card-catalog:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "16px"
  nav-active:
    backgroundColor: "{colors.wash-blue}"
    textColor: "{colors.haifeng-blue}"
    rounded: "{rounded.none}"
    padding: "0 20px"
  segmented-selected:
    backgroundColor: "{colors.haifeng-blue}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.none}"
    padding: "6px 8px"
---

# Design System: Haifeng Engines

## Overview

**Creative North Star: "Precision Catalog"**

Haifeng Engines currently uses a restrained, technical catalog system: off-white paper, white working surfaces, black structural rules, and one disciplined Haifeng blue accent. The experience should feel professional, engineered, and quiet enough for specification research while still clearly connected to Haifeng Machinery.

The system is closer to a clean industrial reference index than to a marketing brochure. It values exact names, counts, datasheets, model paths, and comparison surfaces. The Apple-like aspiration in PRODUCT.md means future work should raise polish through clarity, spacing, restraint, and material precision, not through invented claims, decorative chrome, or softened technical detail.

**Key Characteristics:**
- Flat, line-driven surfaces with no default shadow vocabulary.
- One accent color used for action, active state, and technical emphasis.
- Dense but orderly catalog layouts built on borders, tables, grids, and search.
- Professional UI typography with tabular numerals and no letter-spacing effects.
- Product truth, route clarity, and SEO architecture remain visible in the interface.

## Colors

The palette is a restrained technical reference palette: cool paper, white surfaces, black lines, gray text, and Haifeng blue as the only saturated signal.

### Primary
- **Haifeng Blue**: Primary brand and action color. Use for active navigation, primary submit buttons, important links, count emphasis, and selected controls.
- **Deep Haifeng Blue**: Hover and pressed action state. Use sparingly as a state color, not a second accent.

### Neutral
- **Catalog Paper**: Page background and broad reading canvas.
- **Surface White**: Inputs, cards, tables, header, footer, and dropdown surfaces.
- **Ink**: Primary text, strong borders, page titles, and high-importance labels.
- **Body Text**: Dense descriptive content and technical reading text.
- **Muted Text**: Secondary explanations and supporting copy.
- **Secondary Text**: Metadata, captions, and less prominent details.
- **Quiet Text**: Disabled or low-priority technical metadata; use only when contrast remains readable.
- **Line**: Standard dividers, table borders, card separators, and form outlines.
- **Quiet Line**: Subtle internal separators.
- **Blue Wash**: Hover fills and active navigation backgrounds.
- **Neutral Wash**: Status backgrounds and quiet technical badges when no semantic color is required.

### Named Rules

**The One Blue Rule.** Haifeng Blue is the only saturated interface color. Do not add extra decorative accent hues unless product truth requires a semantic distinction.

**The Reference Contrast Rule.** Muted text is still technical content; secondary copy must remain readable, especially on mobile and in dense table/card contexts.

## Typography

**Display Font:** Segoe UI with Helvetica Neue, Arial, system-ui fallbacks
**Body Font:** Segoe UI with Helvetica Neue, Arial, system-ui fallbacks
**Label/Mono Font:** Same stack; the product does not use monospace as a technical costume.

**Character:** The typography is pragmatic, UI-native, and precise. It should support fast scanning of model numbers, brands, ratings, and route labels without editorial flourish.

### Hierarchy
- **Display** (700, clamp 2.25rem-2.875rem, 1.04 line-height): Homepage and major catalog page titles.
- **Headline** (700, clamp 1.5rem-1.875rem, 1.2 line-height): Section titles and major page blocks.
- **Title** (700, 1rem, 1.35 line-height): Card titles, model names, group headers, and compact component headings.
- **Body** (400, 1rem, 1.55 line-height): Descriptive copy and longer reading passages. Keep measures near 60ch unless the text is a dense table/list.
- **Label** (700, 0.8125rem, uppercase where used): Section indexes, catalog labels, selected states, and small navigational signals.

### Named Rules

**The Numeral Precision Rule.** Preserve tabular numerals for counts, ratings, and technical measurements so dense catalog data aligns optically.

**The No Costume Mono Rule.** Use the system sans for technical UI unless actual code or fixed-width data requires a mono face.

## Layout

The layout is max-width constrained at 1440px with 16px mobile gutters, 24px tablet gutters, and 32px desktop gutters. Catalog pages use a visible column grid on major hero surfaces, then switch into bordered lists, tables, and repeated item grids.

Spacing is compact but deliberate: mobile sections commonly use 40px vertical rhythm and desktop sections use 56px. The system prefers strong top borders to introduce new content groups, smaller spacing between related labels and headings, and larger spacing before distinct work areas.

Responsive behavior should preserve task speed: mobile catalogs collapse filters, expose search early, and use cards for scanability; desktop can use side filters, tables, and comparison matrices because the horizontal space supports them.

## Elevation & Depth

The system is flat by default. Depth is conveyed through hierarchy, whitespace, black structural rules, white working surfaces, active-state fills, and hover washes rather than shadow. Existing global rules neutralize common shadow utilities, so shadows should not appear unless a new design direction explicitly establishes a depth language.

### Named Rules

**The Flat Reference Rule.** A card at rest is a bordered or divided surface, not a lifted object. Use lines and spacing before using shadow.

## Shapes

The current form language is squared, precise, and low-radius. Large rounded cards and pill-shaped containers are intentionally flattened: 2px-4px is the normal radius range, and many core controls use square corners.

Borders are the main shape-defining device. Strong black borders frame search, major separators, and selected structure; quiet gray borders divide dense content. Statuses and badges may use small radii, but the overall system should avoid plush, rounded SaaS surfaces.

## Components

### Buttons

- **Shape:** Square by default (0px radius), with small icon buttons using minimal 2px-4px rounding only when inherited from utility classes.
- **Primary:** Haifeng Blue background, white text, black border when attached to search/input structures.
- **Hover / Focus:** Deep Haifeng Blue or Blue Wash depending on whether the element is filled or text/link based. Preserve visible focus outlines from browser defaults or explicit focus styles.
- **Secondary / Ghost:** White background, black or Line border, Haifeng Blue text on hover or inactive view toggles.

### Chips

- **Style:** Compact labels and status badges use Neutral Wash or Blue Wash with small radii. They should remain subordinate to model names and ratings.
- **State:** Selected controls use Haifeng Blue fill with white text; unselected controls stay white with Haifeng Blue text or gray border.

### Cards / Containers

- **Corner Style:** Square or nearly square.
- **Background:** Surface White on Catalog Paper.
- **Shadow Strategy:** No default shadows.
- **Border:** Bottom/right borders for catalog grids, strong top borders for groups, Line for internal separation.
- **Internal Padding:** Dense cards use 16px; larger catalog cards can use 20px.

### Inputs / Fields

- **Style:** White background, black or Line border, square corners, clear placeholder text, and generous enough vertical padding for mobile.
- **Focus:** Border color shifts to Haifeng Blue where implemented; otherwise preserve clear outline behavior.
- **Search:** Search is a signature input: icon at left, primary action block at right, suggestions in a white bordered dropdown.

### Navigation

Desktop navigation is a horizontal border-divided bar inside a sticky white header. Active routes use Blue Wash and Haifeng Blue text. The contact action is a filled Haifeng Blue block. Mobile navigation uses a bordered icon button and a fixed white dropdown panel below the 72px header, with active links using the same Blue Wash treatment.

### Signature Components

**Engine Cards:** Compact white technical records with brand, model, status, 50/60Hz ratings, displacement, cylinders, emissions, origin, and discontinued year when present. They are scan-first, not promotional.

**Engine Matrix Table:** Desktop comparison matrix grouped by representative kWe bands and brand. It uses small but readable type, black range rules, gray internal dividers, and compact emissions badges.

**Commercial Pathways:** A bridge component from technical shortlist to Haifeng package routes. It keeps the same line system and uses row-like links rather than marketing cards.

**Segmented Filters:** Filter toggles use white backgrounds, gray divider lines, an outline frame, and a Haifeng Blue selected state. They should read as compact controls, not nested cards.

## Do's and Don'ts

### Do:
- **Do** preserve Haifeng Blue as the single primary action and active-state color.
- **Do** use exact catalog facts, model names, power ranges, and route labels as design material.
- **Do** keep mobile catalog paths fast: search, filters, result count, and cards should appear without forcing a dense desktop table.
- **Do** use borders, spacing, and typographic hierarchy to create structure before introducing decorative effects.
- **Do** maintain clean professional restraint when pursuing the Apple-like direction: precision, clarity, and polish over spectacle.

### Don't:
- **Don't** invent claims, certifications, customers, benchmarks, or availability to make a design feel more persuasive.
- **Don't** replace catalog architecture with generic landing-page sections that hide routes, filters, or technical depth.
- **Don't** add extra accent colors, gradients, decorative shadows, or rounded card-heavy SaaS styling unless a future approved visual direction explicitly changes the system.
- **Don't** use monospace, badges, charts, or icons as technical decoration when real specification content is available.
- **Don't** weaken SEO-critical internal links, category hubs, or structured routes for purely visual simplification.
