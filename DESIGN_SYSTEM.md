# Maymanah Design System

**Codename: "Qandeel" (قنديل — the mosque lantern).**
The governing metaphor for every visual decision: *light through a mosque lattice at night.* Dark, quiet, atmospheric space; warm brass light escaping through geometry; lapis and ivory accents from the Quranic manuscript tradition. Glass surfaces behave like physical panes a lantern shines through — never like gray boxes with blur.

This document is the single source of truth for the redesign. Every phase must conform to it. Anything not covered here defaults to *restraint*.

---

## Part 1 — Audit of the current implementation

### 1.1 Stack & styling approach

| Layer | Current state |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| CSS | Tailwind v4, CSS-first via `@import "tailwindcss"` + `@theme inline` in `app/globals.css` |
| `tailwind.config.ts` | Vestigial — only `content` + `darkMode: "class"`; not loaded by Tailwind v4 unless referenced with `@config` (it isn't). Can be deleted. |
| Theming | CSS custom properties in `globals.css`, triplicated across `:root`, `@media (prefers-color-scheme: dark)`, and `.dark` / `.light` classes (next-themes, class strategy) |
| Fonts | `next/font`: Inter (Latin), Amiri + Noto Naskh Arabic (Arabic). **Bug:** `body` falls back to `font-family: Arial` in globals.css; Inter is applied only in `(home)` layout, so portal/admin/auth render in Arial. |
| Icons | **Two competing systems**: Font Awesome (26 files) and Lucide (21 files), mixed freely — sometimes in the same page. |

### 1.2 Route map

- **`(home)`** — public: `/`, `/about`, `/curriculum`, `/donate`, `/gallery`, `/privacy`, `/terms`. Shares `TopNav` + `Footer`.
- **`(auth)`** — `/login`, `/register`. Bare centered layout.
- **`(portal)`** — authenticated: `/dashboard`, `/courses`, `/courses/[slug]`, `/courses/[slug]/lessons/[lessonId]`, `/mushaf`, `/revision`, `/session/[id]`, `/sessions`, `/settings`, `/students`, `/students/[studentId]`, `/availability`. Shares `PortalNav`.
- **`/admin`** — admin CRUD: course/lesson management, book import. Own `AdminSidebar` + `AdminTopBar`.
- **`/onboarding`** — post-registration flow.
- **`/api/*`** — ~50 route handlers (untouched by this redesign).

### 1.3 Shared primitive inventory

| Primitive | Where | Notes |
|---|---|---|
| `TopNav` (public) | `components/ui/nav.tsx` | Solid bar, inline-styled links |
| `PortalNav` | `components/ui/PortalNav.tsx` | Already uses `backdrop-blur` — the one proto-glass surface |
| `Footer` | `components/ui/footer.tsx` | Icon-in-circle social buttons |
| `CourseCard`, `LeaderBoardCard` | `components/ui/cards.tsx` | Only shared cards |
| `Dropdown`, `Skeleton`, `toast`, `theme-toggle`, `theme-selector` | `components/ui/` | Functional, unstyled-by-system |
| `RichTextEditor`, `QuizEditor`, `MediaPlayer`, `VideoRoom`, `AppointmentControls` | `components/ui/` | Feature components |
| `Mushaf` | `components/Mushaf.tsx` | Quran viewer; one of only **two** files using `dir="rtl"` |
| **Button** | **does not exist** | Every button is inline Tailwind, ~40 unique variants across the app |
| **Input / form field** | **does not exist** | Same — every form styles its own inputs |

### 1.4 Diagnosis — why it reads as templated / AI-generated

1. **Inter + Arial body + default Tailwind grays.** The exact typographic fingerprint of unstyled AI output.
2. **Teal (`#14b8a6`) secondary** — Tailwind's stock teal-500, sitting next to gold with no relationship to any Islamic palette.
3. **Default shadow scale** (`shadow-sm` ×38, `shadow-lg` ×14, `shadow-2xl` ×10) — no designed elevation model.
4. **Two icon libraries** mixed ad hoc — no visual voice.
5. **Zero focus-visible styles, zero `prefers-reduced-motion` handling** anywhere in the codebase.
6. **Arabic as an afterthought**: Amiri is sprinkled on headings, but `dir="rtl"` appears in only 2 files; hadith on the homepage has no `dir`, no `lang="ar"`.
7. **No shared Button/Input** — the biggest structural cost and the reason the app drifts stylistically page by page.
8. Stock moves everywhere: gradient scrims over photos, avatar stacks, icon-in-tinted-circle, `rounded-2xl` on everything.

**Existing assets worth keeping:** the mosque photography (`sunset_mosque.png`, `tower_masjid.png`, `calligraphy.png`), the geometric pattern PNGs (to be replaced by SVG girih, but usable as fallback), reciter portraits, logo.

---

## Part 2 — Design tokens

### 2.1 Color (dark-first; light theme is a derived variant, not the default)

Six named colors. Everything else is an alpha recipe over these.

| Token | Hex | Name & role |
|---|---|---|
| `--layl` | `#0B151B` | **Layl** (ليل, night). The base. A blue-green night tone — darker than slate, warmer than navy; the sky above a courtyard after ʿIshāʾ. Page background. |
| `--layl-deep` | `#060D11` | **Layl-deep.** Wells and recesses: page edges, code blocks, the void behind modals. Also the darkest stop of ambient gradients. |
| `--brass` | `#C6A15B` | **Brass.** Aged brass / muted gold — the lantern metal, not jewelry gold. Reserved for: Arabic calligraphy, primary CTAs, focus rings, active states, thin rules. *Never* for large fills or body text blocks. |
| `--lapis` | `#8FA9D0` | **Lapis.** Drawn from lapis lazuli, the pigment paired with gold in classical Quranic illumination — the historically correct companion to brass. Used for: links, secondary/informational accents, selected-but-not-primary states, chart secondaries. This is the *text-safe* tint; for decorative fills use it at low alpha. |
| `--ivory` | `#EAE6DA` | **Ivory.** Primary text. Warm paper-white, evoking manuscript vellum — never `#FFFFFF`, which glares against Layl. |
| `--sage` | `#93A5A8` | **Sage.** Secondary text and muted UI. A desaturated blue-green pulled from Layl's own hue family, so muted text feels like it *recedes into* the night rather than turning gray. |

Semantic states (success/warning/danger) are re-derived from this palette in Phase 1 — desaturated, dark-compatible versions; not Tailwind's stock green/amber/red.

**Contrast floor (WCAG AA, non-negotiable):**
- `ivory` on `layl` ≈ 14:1 ✓ — default body text.
- `sage` on `layl` ≈ 7:1 ✓ — secondary text.
- `brass` on `layl` ≈ 7.5:1 ✓ — safe for text and small UI.
- `lapis` on `layl` ≈ 7:1 ✓ — safe for links.
- **On glass:** contrast must be measured against the *lightest thing that can appear behind the pane*, not against Layl. Rule: any glass surface that carries text must include a `background-color` floor of at least `rgba(11,21,27,0.55)` (Layl at 55%) beneath its blur, so worst-case contrast for ivory text stays ≥ 7:1. Blur alone is not a contrast strategy.

### 2.2 Glass — the material recipe

Glass here is a physical pane a lantern shines through: it has a tint, a catch-light on its top edge, and depth behind it. Three grades:

```css
/* Grade 1 — "pane": primary cards, panels */
--glass-pane:
  background: rgba(16, 30, 38, 0.55);            /* Layl-tinted, not white-frosted */
  backdrop-filter: blur(16px) saturate(1.4);
  border: 1px solid rgba(234, 230, 218, 0.10);   /* ivory @10% */
  box-shadow:
    inset 0 1px 0 rgba(234, 230, 218, 0.07),     /* inner top catch-light */
    0 12px 32px -8px rgba(6, 13, 17, 0.6);       /* depth into layl-deep */

/* Grade 2 — "veil": nav bars, sticky headers (lighter blur, more transparency) */
--glass-veil:
  background: rgba(11, 21, 27, 0.65);
  backdrop-filter: blur(12px) saturate(1.2);
  border-bottom: 1px solid rgba(234, 230, 218, 0.08);

/* Grade 3 — "lantern": the one glowing element per page (primary CTA card, active session) */
--glass-lantern:
  /* grade 1, plus: */
  border-color: rgba(198, 161, 91, 0.28);         /* brass edge */
  box-shadow:
    inset 0 1px 0 rgba(234, 230, 218, 0.09),
    0 0 48px -16px rgba(198, 161, 91, 0.30),      /* brass light-leak */
    0 12px 32px -8px rgba(6, 13, 17, 0.6);
```

Rules: never white-frosted glass (`bg-white/10` is banned); never glass-on-glass more than two layers deep; the *lantern* grade appears **at most once per viewport**.

**Performance rule:** no more than **3 `backdrop-filter` surfaces in a viewport at once**. Lists of cards use the rgba background floor *without* blur (visually near-identical over Layl); blur is reserved for the nav veil and the one or two panes that actually sit over imagery or pattern. Smooth scroll must be verified on a throttled mobile profile at each phase review.

### 2.3 Elevation & glow scale (replaces all default Tailwind shadows)

| Token | Recipe | Use |
|---|---|---|
| `--shadow-rest` | `0 1px 2px rgba(6,13,17,.5)` | Chips, inputs at rest |
| `--shadow-raise` | `0 8px 24px -8px rgba(6,13,17,.55)` | Cards, dropdowns |
| `--shadow-float` | `0 20px 48px -12px rgba(6,13,17,.65)` | Modals, popovers |
| `--glow-brass` | `0 0 40px -12px rgba(198,161,91,.30)` | Lantern elements, CTA hover |
| `--glow-lapis` | `0 0 32px -12px rgba(143,169,208,.25)` | Informational highlights (rare) |

`shadow-sm` / `shadow-lg` / `shadow-2xl` etc. are **banned** from the codebase after Phase 1.

### 2.4 Typography — three roles

| Role | Face | Why |
|---|---|---|
| **Display** | **El Messiri** (`next/font/google`, variable 400–700) | Designed by Mohamed Gaber to harmonize Latin letterforms with Arabic Naskh sensibility — geometric structure with calligraphic terminals. It makes Latin headlines feel native to an Islamic platform instead of borrowed from a SaaS template. This is the signature voice: page titles, section headings, nav wordmark. |
| **Body** | **IBM Plex Sans** (400/500/600) | A quiet, engineered grotesque that disappears under El Messiri. Chosen over trendier faces because it ships a true Arabic sibling — **IBM Plex Sans Arabic** — giving *UI-level* Arabic strings (buttons, labels, dates) a matched weight and rhythm with the Latin around them. |
| **Quranic Arabic** | **Amiri** (400/700) — kept from current stack | A revival of the Bulaq Press Naskh used for Quran printing; correct choice, currently misused. Rules below. |

**Rejected:** Inter, Poppins, Playfair (AI tells); Marcellus (single weight, too Roman); Cormorant (too fashion-editorial).

**Arabic is a first-class citizen — hard rules:**
- Every Arabic string gets `lang="ar" dir="rtl"`. No exceptions, including single words.
- Quranic/hadith text: Amiri, `line-height: 2`, letter-spacing 0, and **optical size ~125% of surrounding Latin** (Arabic script reads smaller at equal px). Ayah text never truncates with ellipsis.
- UI Arabic (labels, names): IBM Plex Sans Arabic at the same size grade as Latin siblings.
- Numerals inside Arabic passages use Eastern Arabic numerals (`٠١٢٣`) via `font-feature`/locale formatting where content is Quranic; UI numerals stay Western.

**Scale** (fluid, `clamp()`-based, defined fully in Phase 1): display steps use El Messiri with tight tracking; body at 16px/1.6 minimum; small text floor 13px.

### 2.5 Radius, spacing, motion

- Radius: `4 / 10 / 16 / 24px` + the **arch** (see 3.3). `rounded-2xl`-on-everything ends; radius correlates with size (small elements = small radius).
- Spacing: 4px base grid; sections breathe at 96–128px on desktop, 64px mobile.
- Motion: 150ms (micro) / 300ms (panel) / 700ms (ambient), `cubic-bezier(0.22, 1, 0.36, 1)`. Ambient animation (pattern drift, glow pulse) only at <0.15 opacity and **fully disabled under `prefers-reduced-motion: reduce`** — a global CSS gate, not per-component opt-in.

---

## Part 3 — Islamic design vocabulary (the signature layer)

### 3.1 Geometric system: 8-fold girih (khatam)

**One** geometric system app-wide: the 8-pointed star-and-cross (khatam) tessellation — the most load-bearing pattern in Islamic geometry and already echoed in the existing pattern PNGs, giving continuity.

Built **once** as `<GirihField />` (inline SVG, `aria-hidden`, zero requests):
- A true tessellating tile (star + cross unit) exposed as an SVG `<pattern>`.
- Props: `density`, `opacity` (0.03–0.08 — *felt, not seen*), `fade` (radial/linear mask so the pattern dissolves into Layl rather than tiling to the edge), `animate` (barely-perceptible 90s drift; off under reduced-motion).
- Usage: behind hero sections, inside glass panes as a watermark, as a clipping texture on section dividers. Never at legibility-competing opacity, never behind body text at >0.05.

The stroke color is `brass` or `ivory` at low alpha — the pattern is *light on the lattice*, not a wallpaper.

### 3.2 Mashrabiya treatment

Glass cards may carry a **lattice edge** instead of a plain border: a 24–32px tall strip of the girih pattern masked into the card's top or side edge, reading as light entering through a screen. Implemented as one reusable `<Mashrabiya edge="top" />` decoration inside `GlassCard`, used on featured cards only (not every card — the plain pane is the default; the lattice marks importance).

### 3.3 Arch motif — two deliberate placements, no more

The pointed arch (four-centered, Persian profile) appears in exactly two roles:
1. **Image masks** for hero/featured imagery (`clip-path` on a reusable `<ArchFrame />`) — e.g. the homepage hero image, course detail header image.
2. **Modal/dialog crowns** — modals rise with a subtle arch-profiled top edge.

It does not appear on buttons, avatars, cards, or inputs. Radius everywhere else is geometric.

### 3.4 Light behavior

- Ambient page background: Layl with a very soft radial gradient toward `layl-deep` at the edges — the room is darker than the content.
- One brass light source per page (the *lantern* element, 2.2 grade 3).
- Light leaks: 1px brass gradient rules (`transparent → brass/40 → transparent`) as section dividers — the existing homepage already gestures at this; it becomes systematic.
- Hover on glass: the pane brightens by +4% background alpha and the inner catch-light strengthens — like moving closer to the glass. No scale transforms on cards.

---

## Part 4 — Anti-generic guardrails (enforced every phase)

1. **No icon-in-a-tinted-circle feature cards.** Feature communication uses typography, pattern, or photography.
2. **No "01 / 02 / 03" section numbering** unless content is genuinely sequential (e.g. lesson steps).
3. **No emoji in UI copy.** No "✨" anywhere, including empty states.
4. **No stock gradient hero text**, no purple-pink / teal-cyan gradients, no neon. The existing teal secondary is removed entirely.
5. **No default Tailwind shadows** — only the Part 2.3 scale.
6. **One icon system.** Lucide stays (tree-shakable, stroke-consistent, 1.5px stroke to match the line-weight of the girih pattern); Font Awesome is removed. Icons at `sage` by default; brass only when active.
7. **Microcopy**: active voice, warm but plain. "Begin your journey", "Resume Surah Al-Baqarah" — yes. "Unlock your potential", "Elevate your learning" — no. No exclamation marks in system messages.
8. **Boldness budget: one signature element per page** (hero arch, lantern card, or mashrabiya edge). Everything else disciplined.

## Part 5 — Quality floor (acceptance criteria for every phase)

- Responsive to **360px** with no horizontal scroll; glass panes degrade gracefully where `backdrop-filter` is unsupported (the rgba background floor guarantees legibility without blur).
- **Focus:** every interactive element shows `outline: 2px solid var(--brass); outline-offset: 2px` on `:focus-visible`. Defined once globally.
- **`prefers-reduced-motion: reduce`:** all ambient/drift/pulse animation off; transitions collapse to opacity-only.
- **Contrast:** WCAG AA minimum everywhere, measured on glass against worst-case backdrop (2.1 rule). Spot-check with real blur, not mockups.
- **RTL:** all Arabic strings carry `lang="ar" dir="rtl"`; layout containers use logical properties (`ps-`/`pe-`/`ms-`/`me-`) in any component containing Arabic.
- Light theme ships as a derived variant (ivory-paper ground, Layl text, same brass/lapis accents) — dark remains the design target and default. The light variant is built in **Phase 5**; until then the existing next-themes toggle must keep working against remapped tokens in every phase (no phase may break theme switching).

## Part 6 — Primitives to build (Phase 1 scope)

| Component | Replaces |
|---|---|
| `GlassCard` (pane/veil/lantern grades, optional `<Mashrabiya>` edge) | ad-hoc `bg-bg-card border rounded-2xl` divs |
| `Button` (primary=brass, ghost, quiet; sizes sm/md/lg) | ~40 inline variants |
| `Input`, `Select`, `Textarea`, `Field` (label+error) | per-page form styling |
| `GirihField` | `pattern.png` backgrounds |
| `ArchFrame` | ad-hoc rounded image containers |
| `SectionHeading` (El Messiri + brass rule) | repeated heading markup |
| `AyahText` (Amiri, rtl, lang, line-height 2, sizing) | bare Arabic strings |
| Token layer: rewrite `globals.css` vars → Qandeel tokens; new `fonts.ts`; global focus/reduced-motion CSS; delete `tailwind.config.ts` | current triplicated var blocks |
| Remove Font Awesome entirely (swap all usages to Lucide, uninstall packages) | dual icon systems |
| Temporary `/styleguide` route rendering every primitive and state (review gate for Phase 1) | — |

### Phase plan (each phase ends with a review checkpoint)

- **Phase 1 — Foundation:** token layer, fonts, primitives above, global a11y CSS, Font Awesome removal, `tailwind.config.ts` deletion. No page redesigns yet; existing pages keep working on remapped tokens. **Exit criteria:** `/styleguide` renders all three glass grades, every Button and Input variant (including error, disabled, and focus states), GirihField at its allowed opacities, ArchFrame, Mashrabiya edge, SectionHeading, and AyahText with the homepage hadith — reviewed and approved before Phase 2; smooth scroll verified on a throttled mobile profile.
- **Phase 2 — Auth + onboarding:** login, register, onboarding flow.
- **Phase 3 — Public shell:** homepage, nav, footer (the first full expression of Qandeel).
- **Phase 4 — Portal:** dashboard, courses, lessons, mushaf, sessions.
- **Phase 5 — Admin + polish pass:** admin surfaces, empty states, loading skeletons, final a11y sweep, and the **light theme variant** (ivory-paper ground, Layl text, same brass/lapis accents) wired to the existing next-themes toggle.
