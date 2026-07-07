---
name: Maymanah
description: Quranic Learning Platform — connecting students with expert volunteer teachers worldwide
colors:
  primary: "#b8860b"
  primary-light: "#d4a73a"
  primary-dark: "#8b6914"
  primary-muted: "#f5efe6"
  primary-subtle: "#e8dcc8"
  secondary: "#0d9488"
  secondary-light: "#14b8a6"
  secondary-dark: "#0f766e"
  secondary-muted: "#e6f4f3"
  secondary-subtle: "#cceae8"
  neutral-bg: "#fdfcf8"
  neutral-bg-secondary: "#f5f3ee"
  neutral-bg-elevated: "#ffffff"
  neutral-bg-hover: "#ede9e3"
  text-primary: "#1c1917"
  text-secondary: "#57534e"
  text-tertiary: "#78716c"
  text-muted: "#a8a29e"
  text-inverse: "#ffffff"
  border: "#e7e5e4"
  border-strong: "#d6d3d1"
typography:
  display:
    fontFamily: "Inter, Arial, Helvetica, sans-serif"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: -0.04em
  headline:
    fontFamily: "Inter, Arial, Helvetica, sans-serif"
    fontWeight: 800
    lineHeight: 1.15
  title:
    fontFamily: "Inter, Arial, Helvetica, sans-serif"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Inter, Arial, Helvetica, sans-serif"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, Arial, Helvetica, sans-serif"
    fontWeight: 700
    fontSize: "0.625rem"
    letterSpacing: 0.16em
    textTransform: uppercase
  arabic-display:
    fontFamily: "Amiri, serif"
    fontWeight: 700
  arabic-body:
    fontFamily: "Noto Naskh Arabic, serif"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  section: "64px"
  container: "16px"
  card: "20px"
  gap-sm: "8px"
  gap-md: "16px"
  gap-lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-outline:
    backgroundColor: transparent
    textColor: "{colors.primary-dark}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.primary-dark}"
    padding: "12px 24px"
  button-hero-cta:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.xl}"
    padding: "16px 48px"
  card-default:
    backgroundColor: "{colors.neutral-bg-elevated}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
    border: "1px solid {colors.border}"
  input-default:
    backgroundColor: "{colors.neutral-bg}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    border: "1px solid {colors.border}"
    height: "48px"
  input-focus:
    border: "1px solid {colors.primary}"
---

# Design System: Maymanah

## 1. Overview

**Creative North Star: "The Guided Light"**

Maymanah is a space where the sacred meets the functional. The design exists to serve the transmission of Quranic knowledge — it should feel dignified without being distant, warm without being sentimental, and modern without being trendy. Every interface decision centers on one question: does this make the learning path clearer?

The palette is anchored by a restrained gold (a nod to illumination, both literal and spiritual) on a warm, paper-like ground. Teal provides a quiet secondary register for progress, data, and interactive cues. Typography pairs the clean confidence of Inter (Latin) with the manuscript dignity of Amiri and Noto Naskh Arabic (Arabic) — two worlds, one page.

**Key Characteristics:**
- Warm-grounded, not themed: the faith is in the substance, not the surface ornament
- Generous spacing and clear hierarchy — learning feels unhurried
- Color carries meaning, not decoration
- Portal surfaces feel as considered as the marketing pages
- Flat by default; depth is earned by interactivity

## 2. Colors

The palette works in two modes (light and dark) with equal care. Light mode is warm-paper; dark mode is deep teal-charcoal. The gold carries across both without shifting role.

### Primary

- **Illuminated Gold** (#b8860b): The anchor. Used for primary CTAs, active nav states, progress, and the moment of attention. Never decorative — always functional. In dark mode it brightens to #d4a73a to hold contrast on the darker ground.
- **Gold Dark** (#8b6914 / dark: #b8922e): Hover states for primary buttons.
- **Gold Light** (#d4a73a / dark: #e5b94a): Subtle highlights and hover accent.
- **Gold Muted** (#f5efe6 / dark: #2a2418): Background wash for selected cards, active nav items. Low enough chroma to not compete.
- **Gold Subtle** (#e8dcc8 / dark: #3d3220): Dividers and secondary borders in gold-tinted contexts.

### Secondary

- **Quiet Teal** (#0d9488 / dark: #14b8a6): Progress indicators, secondary badges, data viz accents. Sits below gold in hierarchy; used when gold would overstate.
- **Teal Muted** (#e6f4f3 / dark: #1a2e2c): Background wash for teal-tinted states.

### Neutral

- **Warm Paper** (#fdfcf8): Primary background. A true off-white with a barely perceptible warmth toward the gold hue — reads as paper, not paint.
- **Warm Stone** (#f5f3ee): Secondary background for footers, tonal sections.
- **White** (#ffffff): Elevated surfaces — cards, modals, dropdowns.
- **Warm Hover** (#ede9e3): Hover state for interactive elements on neutral surfaces.
- **Ink** (#1c1917): Body text. Near-black with a warm undertone (almost brown-black, not blue-black).
- **Ink Faded** (#57534e): Secondary text. High enough contrast (5.9:1 on warm paper) to remain readable.
- **Ink Muted** (#78716c): Tertiary text, metadata.
- **Ink Ghost** (#a8a29e): Placeholders and disabled text. Maintains 4.5:1 on warm paper.
- **Ink Inverse** (#ffffff): Text on dark and gold surfaces.
- **Warm Line** (#e7e5e4): Default borders at 1px.
- **Warm Line Strong** (#d6d3d1): Stronger borders for active/emphasized edges.

### Semantic

- **Success** (#16a34a), **Warning** (#d97706), **Danger** (#dc2626), **Info** (#2563eb) — each with a muted background variant at 10–15% opacity, used for toast notifications and status indicators.

### Named Rules

**The Gold Discipline.** Gold never exceeds ~10% of any given screen. Its role is directional — call to action, active state, progress milestone. When everything is illuminated, nothing is.

**The Warm Ground Rule.** All background neutrals carry a 0.005–0.015 chroma toward the gold hue (≈45° on the OKLCH hue wheel). This is not a default warm tint — it's a deliberate tie to the brand's own color.

## 3. Typography

**Display Font:** Inter (variable, latin) — clean, confident, geometric.
**Arabic Display Font:** Amiri (400, 700) — inspired by Naskh manuscript tradition.
**Arabic Body Font:** Noto Naskh Arabic (variable) — crisp and readable at small sizes.
**Fallback:** Arial, Helvetica, sans-serif for Latin; serif for Arabic.

**Character:** Inter provides the structure — precise, modern, trustworthy. Amiri provides the soul — classical, warm, humanist. The pairing works because the scripts segment naturally: Latin in Inter, Arabic in Amiri. It's a bilingual system where each script gets the treatment it deserves.

### Hierarchy

- **Display** (Black 900, clamp(2.5rem, 7vw, 5rem), 1.0): Hero headlines only. text-wrap: balance. Letter-spacing never below -0.04em.
- **Headline** (ExtraBold 800, clamp(1.5rem, 4vw, 2.5rem), 1.15): Section headings. text-wrap: balance.
- **Title** (Bold 700, 1.25–1.5rem, 1.3): Card titles, modal headings, subheads.
- **Body** (Regular 400, 0.875–1rem, 1.6): All prose. Capped at 70ch. text-wrap: pretty.
- **Label** (Bold 700, 0.625rem, 1.2, 0.16em tracking, uppercase): Form labels, badge text, metadata.
- **Arabic Display** (Bold 700, matching Latin display scale): Surah names, decorative Arabic quotes.
- **Arabic Body** (variable, 0.875–1rem): Arabic content in lessons, Quran viewer, profile text.

## 4. Elevation

The system is flat by default. Depth is communicated through tonal layering — elevated surfaces are white against warm paper, not shadowed. Shadows exist only as a response to state: hover, focus, dropdown open.

### Shadow Vocabulary

- **Card Rest** (`shadow-sm`): 0 1px 2px 0 rgb(0 0 0 / 0.05). Barely visible; acknowledges the card without lifting it.
- **Card Hover** (`shadow-md`): 0 4px 6px -1px rgb(0 0 0 / 0.1). Appears on interaction.
- **Dropdown** (`shadow-xl`): 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1). Paired with `backdrop-blur-xl` for depth + material feel.

### Named Rules

**The Flat Foundations Rule.** Surfaces at rest have no shadow. Shadows are motion; they appear when something happens.

**The Layered Depth Rule.** Instead of shadows, use background tint for hierarchy: elevated surfaces (cards, modals) sit on white against warm paper. The 2% luminance difference is enough structure without simulated depth.

## 5. Components

### Buttons

- **Shape:** 12px (rounded-xl) standard, 16px (rounded-2xl) hero CTAs, 24px (rounded-3xl) mobile/full-width.
- **Primary:** Gold (#b8860b) background, white text, 12px 24px padding. Hover: gold-dark (#8b6914). Active: scale(0.98). Transition: all 200ms ease-out.
- **Outline:** 1px solid gold-dark/70, transparent background, gold-dark text. Hover: bg-hover (#ede9e3).
- **Ghost/Icon:** No border, icon in text-secondary. Hover: bg-hover ring. Used in portal toolbar.
- **Hero CTA:** 56–64px height, 24px radius, bold 900 weight.
- **Disabled:** opacity-50, cursor-not-allowed.

### Navigation — Public

- **TopNav:** Sticky, 64px, warm paper. Logo left, links center, auth right. Mobile: slide-in drawer from right, 85% width, full-height, rounded pill links.

### Navigation — Portal

- **SideNav:** Fixed left rail, 64px width, expands to 208px on hover (width 200ms ease-out). Active: gold/10 background + left dot.
- **BottomNav:** Mobile only. Fixed bottom, 64px, safe-area padding. 4-5 icon+label items. Active gold.
- **TopNav (Portal):** Fixed top bar, backdrop-blur-md, 80% opacity.

### Cards

- **Course Cards:** 16px radius, white, 1px border, shadow-sm. Image top (16:9), gradient overlay, 20px padding. Gold accent line (32px × 2px). Hover: shadow-md, border gold/30.
- **Leaderboard:** Horizontal flex, 12px radius. Active user: gold/5 bg, gold/20 ring.

### Inputs / Fields

- **Style:** 48px height, 12px radius, 1px border, warm paper bg. Icon inset left.
- **Label:** 10px uppercase tracking-widest bold, stacked above.
- **Focus:** Border shifts to gold.
- **Placeholder:** #a8a29e at 50% opacity. 4.5:1 ratio maintained.
- **Error:** danger border, danger-muted bg.

### Dropdowns / Menus

- **Position:** Fixed/absolute (never clipped). backdrop-blur-xl, shadow-xl. 16px radius. Entry: fade + slide from top, 200ms.

### Toast Notifications

- **Position:** Fixed top-right, z-[100]. 12px radius, 1px colored border, backdrop-blur-sm. Auto-dismiss 5s.

## 6. Do's and Don'ts

### Do:
- **Do** use gold as the one accent that earns attention. One button, one active link, one progress bar.
- **Do** keep backgrounds warm-toned toward the gold hue.
- **Do** let typography carry the hierarchy — weight + size before color.
- **Do** use teal for secondary data indicators when gold would overstate.
- **Do** keep surfaces flat at rest. Shadows appear on interaction only.
- **Do** test every heading at 375px viewport width.
- **Do** handle RTL Arabic gracefully — Amiri for display, Noto Naskh for body.

### Don't:
- **Don't** use gold decoratively — no gold text, no gold borders on non-interactive elements.
- **Don't** apply gradient text anywhere.
- **Don't** use glassmorphism as default. Blurred backdrops are for overlays only.
- **Don't** use border-left or border-right >1px as colored stripes.
- **Don't** use tiny uppercase tracked eyebrows above every section.
- **Don't** use numbered section markers (01 · 02 · 03) as default scaffolding.
- **Don't** ship muted gray body text. ≥4.5:1 against its background.
- **Don't** animate layout properties. Use transform/opacity only.
- **Don't** gate content visibility on class-triggered transitions.
- **Don't** over-theme with green domes, clip-art mosques, or heavy arabesques.
- **Don't** use SaaS-cream corporate tool aesthetic.
- **Don't** gamify or use juvenile design patterns.
