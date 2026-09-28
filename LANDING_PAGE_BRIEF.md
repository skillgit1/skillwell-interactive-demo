# Skillwell Landing Page — Build Brief

A self-contained brief for building a paid-traffic landing page for Skillwell. Hand this to a fresh Claude Code project. It captures what Skillwell is, the goal of the page, and the exact design system so the new page matches our existing interactive demo.

---

## 1. What Skillwell is

Skillwell is an enterprise learning platform for corporate L&D and training teams. It was formed by merging two products (ETU and Realizeit), so it combines adaptive learning with immersive simulation.

What it does for a customer:
- Builds custom training content from a company's own material, mapped to a skills taxonomy.
- Generates a live adaptive learning map that rebuilds itself for each individual learner, so people skip what they already know and focus on what they do not.
- Creates immersive, realistic practice simulations that learners run inside the course.
- Produces skills data and analytics so an L&D team can see what is actually working across a cohort.

Audience: L&D leaders, heads of training, and enablement teams at mid-market and enterprise companies. It also serves higher education (Title IX, DEI, and academic topics), but the primary paid-traffic audience is corporate B2B.

The one-line positioning we already use: **"Your industry. Your training. Adapted to your learners."**

There is an existing interactive product demo at **tryskillwell.com**. The main marketing site is **skillwell.com**. The landing page you are building is a new, separate page whose job is to convert paid ad traffic.

---

## 2. What this page is and its single goal

This is a conversion landing page for paid ads (search and social). It is not the product and not the full marketing site.

- **Primary conversion:** book a demo call. The CTA link is `https://hubs.ly/Q04rBJD30` (HubSpot). Open it in the **same tab**.
- **Secondary action (optional):** send people to the interactive demo at `https://tryskillwell.com`.
- Keep it single-purpose. Every section should push toward booking a call. No global nav that lets people wander off. A single logo top-left that links to `https://www.skillwell.com/` is fine.
- Design for ad traffic: fast load, mobile-first, message-matched to the ad, one clear CTA repeated down the page.

Suggested section flow (adapt as needed): hero with headline + primary CTA, a short "what you get" set of pillars, a "how it works" or product-in-action strip, social proof / expert team, and a final CTA. Keep it tight.

---

## 3. Tech stack (match the demo)

- Vite + React 19 + TypeScript
- Tailwind CSS v4 using the `@theme` directive (tokens live in CSS, not a JS config)
- Framer Motion for tasteful entrance animation only
- Font: DM Sans via `@fontsource-variable/dm-sans`
- PostHog for analytics, consent-gated and opt-out by default (only load and capture after consent; never put PII or form data in event properties)
- Deploys as a static site (GitHub Pages friendly, relative asset base)

Keep dependencies minimal. Recharts is used in the demo for the analytics report, but a landing page likely does not need it.

---

## 4. Design system (single source of truth)

Copy this `@theme` block verbatim into the new project's main CSS. These tokens are the design system. Components must reference tokens (via Tailwind utilities like `bg-primary`, `text-ink`, `rounded-btn`) and never hardcode hex values.

```css
@import "tailwindcss";
@import "@fontsource-variable/dm-sans";

@theme {
  /* Typography — DM Sans */
  --font-sans: "DM Sans Variable", "DM Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-display: "DM Sans Variable", "DM Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;

  /* Brand palette */
  --color-sand: #efe8d7;           /* Base sand            */
  --color-oasis: #00bf80;          /* Oasis green          */
  --color-ocean: #004853;          /* Ocean deep green     */
  --color-lime: #a8e101;           /* Lime                 */
  --color-sky: #0dc9fe;            /* Sky blue             */
  --color-accent-orange: #f0781f;  /* ETU heritage accent  */

  /* Neutral ramp (cool-tinted) */
  --color-neutral-50: #f6f7f8;
  --color-neutral-100: #eef0f1;
  --color-neutral-200: #e1e5e6;
  --color-neutral-300: #c9cfd1;
  --color-neutral-400: #9aa4a8;
  --color-neutral-500: #6c777b;
  --color-neutral-600: #4b565a;
  --color-neutral-700: #33403f;
  --color-neutral-900: #16211f;

  /* Surfaces */
  --color-surface: #f6f7f8;        /* page background      */
  --color-panel: #ffffff;          /* cards / raised       */
  --color-sunken: #eef0f1;         /* insets, tracks       */
  --color-navy: #004853;           /* deep feature panels  */
  --color-navy-deep: #00333c;

  /* Lines */
  --color-line: #e1e5e6;
  --color-line-strong: #c9cfd1;

  /* Text (ink) */
  --color-ink: #16211f;            /* primary text         */
  --color-ink-soft: #4b565a;       /* secondary text       */
  --color-ink-muted: #808b8f;      /* captions             */
  --color-ink-inverse: #ffffff;    /* text on dark fills   */

  /* Primary = Platform Blue */
  --color-primary: #005e8d;
  --color-primary-hover: #004a70;
  --color-primary-soft: #e6f0f6;

  /* Semantic / status */
  --color-success: #23a566;
  --color-success-soft: #dcf1e6;
  --color-warning: #e2a13c;
  --color-warning-soft: #fbeecf;
  --color-danger: #d43c3c;
  --color-info: #005e8d;
  --color-info-soft: #d9edfb;

  /* Chart palette */
  --color-chart-1: #005e8d;
  --color-chart-2: #00bf80;
  --color-chart-3: #0dc9fe;
  --color-chart-4: #a8e101;
  --color-chart-5: #004853;
  --color-chart-6: #e0930f;

  /* Radii — buttons are 6px, cards 8 to 12px */
  --radius-btn: 6px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Elevation */
  --shadow-card: 0 1px 2px rgba(16, 41, 46, 0.05), 0 4px 12px rgba(16, 41, 46, 0.07);
  --shadow-overlay: 0 12px 40px rgba(16, 41, 46, 0.2);
}

:root { color-scheme: light; }
body {
  background: var(--color-surface);
  color: var(--color-ink);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

### Color usage rules
- **Platform Blue `#005e8d` is the main product accent.** Primary buttons, links, active states, key highlights.
- **Ocean `#004853` / navy-deep `#00333c`** are for deep feature panels and dark bars (for example an "admin" or contrast strip). White text on these.
- **Oasis `#00bf80`, Lime, Sky, Sand, Orange** are supporting brand accents. Use sparingly, mostly in illustration, data, or small highlights. Do not turn the page into a rainbow. The page reads as calm near-white surfaces, dark cool-neutral text, and Platform Blue action.
- Page background is `--color-surface` (near white `#f6f7f8`), cards are white `--color-panel` with a `--color-line` border and `--shadow-card`.

### Typography
- Typeface: DM Sans everywhere (both body and display use it).
- Approximate scale in use: display 31, then 20, 16, 15 body, 14, 12.
- Headings: `font-display`, semibold to bold, tight tracking (`tracking-tight`), color `--color-ink`.
- Body: `--color-ink-soft`, relaxed line height.
- Eyebrow / kicker label pattern: `text-xs font-bold uppercase tracking-widest text-primary`.

### Spacing and radii
- Spacing scale is Tailwind default (4, 8, 12, 16, 20, 24, 32, 40, 48, 56).
- **All buttons use the 6px button radius (`rounded-btn`).** Cards use 8 to 16px (`rounded-md` to `rounded-xl`, commonly `rounded-2xl` for large cards).

---

## 5. Component conventions (from the demo)

Reproduce these patterns so the page feels like the same product.

- **Primary button:** `rounded-btn bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover`. For a big CTA, step up padding (`px-6 py-3`, `font-bold`) and often add a right-arrow icon.
- **Secondary button:** white/panel background, `border border-line`, `text-ink`, hover raises the border to `border-primary` and tints background `bg-primary-soft`.
- **Card:** `rounded-2xl border border-line bg-panel shadow-[var(--shadow-card)]` with generous internal padding.
- **Eyebrow label:** small, bold, uppercase, wide tracking, Platform Blue (see typography above).
- **Checklist item:** a small Oasis/success check icon in a soft circle, followed by short benefit text.
- **Dark feature strip / bar:** `bg-navy` (Ocean) with white text, used to make one moment feel distinct.
- Motion: subtle fade-and-rise on entrance (opacity 0 to 1, y 8 to 16px), 0.2 to 0.25s ease-out. Respect `prefers-reduced-motion`.
- Icons: simple line icons (stroke `currentColor`, 2 to 2.5 stroke width), no heavy icon library needed.

---

## 6. Voice and copy rules (important)

- **Write in full, natural sentences. Avoid em dashes and hyphens as connectors.** Use commas, periods, or restructure the sentence. Overusing dashes is a tell that copy was AI-generated, and we deliberately avoid it. This applies to all user-facing text.
- Benefit-led and concrete, not hypey. Speak to an L&D buyer's outcomes: adapt training to each learner, save time on what they already know, practice with realistic simulations, and prove skill growth with data.
- Reusable lines and proof points already in our voice:
  - Positioning: "Your industry. Your training. Adapted to your learners."
  - Product pillars: custom training content built from your material; a live learning map that adapts to each learner; immersive, realistic simulations; skills data that shows what is actually working.
  - Expert support line: "Skillwell's learning experts help you design custom simulations, build adaptive learning maps, and measure real skill growth."
  - Closing CTA style: "See the full platform by booking a call."
- Primary CTA button text options: "Book a demo", "Book a call", "Book a Full Demo", "See the full platform".

---

## 7. Assets

These live in the demo repo's `public/` folder. Copy the ones you need into the new project.

- `skillwell-logo-horizontal.svg` — primary horizontal wordmark (Ocean green). Use in the header.
- `skillwell-logo.png` — circular Skillwell mark. Also used as the favicon.
- `favicon.png` — the circular mark, for the browser tab.
- `public/team/expert-1.jpg` through `expert-6.jpg` — real headshots of the services/learning experts team, used for social proof (a small row of avatars with the expert-support line).
- `sim-thumbnail.jpg` — a thumbnail used to represent a simulation, if you show product-in-action.

If you show the product visually, the recognizable hero image is the **adaptive learning map**: a node graph of a course where nodes are Completed (green), Tested out (Oasis green), In progress (Platform Blue), or Locked (grey), connected by arrows. That is the signature visual.

---

## 8. Analytics and consent

- Load PostHog only after consent. Default to opt-out. Buffer events until the visitor consents, then flush.
- Track the things that matter for ad performance: page view (post-consent), primary CTA clicks (with a `cta_id` for which button), and any secondary-demo clicks.
- Never place PII, form input, or query-string personal data into event properties or URLs.
- If you run a cookie/consent notice, keep it simple and honest, and make the decline path real if you expect EU or UK traffic.

---

## 9. Do and Don't

Do:
- Match the demo's look: calm near-white surfaces, cool-neutral dark text, Platform Blue action, DM Sans, 6px buttons, soft card shadows.
- Keep it mobile-first and fast. Ad traffic is mostly mobile.
- Repeat the single CTA (book a demo) down the page.
- Keep copy in full sentences with no em dashes.

Don't:
- Don't hardcode hex values in components. Use the tokens.
- Don't add a full site nav or multiple competing CTAs.
- Don't overuse the bright accent colors. They are highlights, not backgrounds.
- Don't claim specific customer names, logos, or metrics unless the team confirms them. Real testimonials and numbers must be provided, not invented.

---

## 10. Quick-start checklist for the new agent

1. Scaffold Vite + React 19 + TypeScript + Tailwind v4.
2. Add DM Sans via `@fontsource-variable/dm-sans` and paste the `@theme` block from section 4 into the main CSS.
3. Copy the logo, favicon, and team headshots from the demo `public/` folder.
4. Build the sections in section 2's flow, using the component conventions in section 5 and the voice rules in section 6.
5. Wire the primary CTA to `https://hubs.ly/Q04rBJD30` (same tab). Optional secondary link to `https://tryskillwell.com`.
6. Add consent-gated PostHog and CTA-click tracking.
7. Verify mobile first, then tablet and desktop. No horizontal overflow at any width.
