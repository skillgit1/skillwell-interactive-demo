# CLAUDE CODE BRIEF — Skillwell Interactive Demo ("The Learning Map")

> Paste this file into a fresh Claude Code session (or drop it in the repo root and say
> "read CLAUDE_CODE_BRIEF.md and start Phase 0"). It is the complete build spec.
> Strategic rationale lives in `PROJECT_PLAN.md`; you don't need it to build.

---

## Context

Skillwell (skillwell.com) sells an enterprise learning platform to Fortune-1000 and
higher-ed buyers. Two merged products now present as capabilities of one platform:
**Adapt** (adaptive learning pathways), **Simulate** (immersive branching simulations),
**Verify** (skills reporting/verification). The website has no way to touch the product
before a sales call — just a dated explainer video.

We are building an **ungated, interactive product demo experience** — a "learning map"
— hosted at `demo.skillwell.com`. It simulates a fully-customized Skillwell deployment
for a **fictional enterprise customer**, so prospects feel what *their* deployment would
be like. It is NOT the real product codebase or backend.

Two non-negotiable framing facts drive the whole build:

- **Anonymous-first.** Public website traffic, no login, no opt-in. Nearly all visitors
  are anonymous. All analytics must work on anonymous sessions; identification is a rare
  exception, never an assumption.
- **No design system yet.** We are starting before the real product design system is
  available. Build against a **placeholder theme** structured so the real system can be
  imported later by editing ONE theme file — not by touching components. This is the
  most important architectural constraint in this brief (see §Theming).

---

## Theming & the design-system swap (read first — governs everything)

The real Skillwell **product** design system (not the marketing brand book) will arrive
later. Build so that importing it is a token swap.

**Rules:**
- ALL design decisions live in a single source of truth: `src/theme/tokens.ts` (or CSS
  custom properties in `src/theme/tokens.css`), wired into `tailwind.config` as the
  theme. Semantic names only: `color.surface`, `color.surfaceRaised`, `color.border`,
  `color.textPrimary`, `color.textMuted`, `color.primary`, `color.success`,
  `color.warning`, `color.danger`, `radius.sm|md|lg`, `shadow.card`, `font.sans`,
  `font.display`, plus the type/space scales.
- **Zero hardcoded colors, fonts, radii, shadows, or magic spacing in components.** If a
  component needs a value, it references a token. A grep for hex codes or `px` font sizes
  in `/components` should come back essentially empty.
- Charts, the map, and every UI element read from the same tokens (define a
  `chartPalette` in the theme so Recharts pulls brand colors, not defaults).
- Ship a tasteful, neutral-but-premium **placeholder palette + type** now (think: clean
  enterprise SaaS — a restrained neutral surface set, one confident primary accent,
  Inter or similar). It should look intentional, not "unstyled."
- Document the swap in `README.md`: "To apply the real design system, map these token
  names to their values and replace `tokens.ts`." Keep the token list stable so the
  mapping is 1:1.

Result: today the demo looks polished on the placeholder theme; later, one file update
re-skins the entire app to the real product.

---

## The experience, end to end

1. **Landing moment.** Visitor arrives (homepage CTA: "See it live — no email required").
   One-sentence framing: they're viewing the learning environment of a fictional employee
   (e.g., a new clinical hire at "Meridian Health"), then straight in. A persistent
   "You're exploring a sample deployment" chip stays visible.
2. **Adaptive intro (the wow — Phase 3).** Optional 3-question mini-assessment ("How
   familiar are you with X?"). On answer, the map visibly reconfigures: some nodes flip to
   "Verified — skipped for you", the path re-draws, an estimated-completion counter drops
   (e.g., "6h 10m → 2h 25m"). Skippable; skipping shows the default map.
3. **The map.** A spatial learning-journey map (desktop): nodes connected by a pathway,
   pan/zoom, grouped into stages (Foundations → Practice → Applied → Verified). Node
   states: locked / available / in-progress / completed / verified-skipped. Clicking a
   node opens its experience in an overlay panel.
4. **Node experiences** (each a component behind a shared overlay shell):
   - **Sim node** — an **embedded existing Skillwell Simulate simulation** (iframe of a
     hosted sim; get the embed URL at Phase 0). The shell wraps it with framing copy and a
     completion CTA. Cross-origin iframes hide in-sim clicks, so track `sim_opened`,
     dwell, and `sim_closed` from the parent; if the embed emits `postMessage`, bridge
     those into the schema. Fallback if no embeddable sim exists: a video-driven branching
     player (clip → decision → clip → feedback, 3–6 clips).
   - **Reporting node** — flips to the ADMIN view: skills dashboard with a skill-gap
     heatmap, cohort progress over time, verification scores. "What your L&D team sees."
     Interactive filters (cohort, skill group) — shallow interactivity still reads as real.
   - **Use-case node** — a story card: the fictional company's problem, what was
     customized, outcome stats. Short, skimmable.
   - **Learner-path nodes** — lightweight content stubs that make the map feel real and
     serve as the nodes that get skipped by the adaptive intro.
   - **CTA node** — end of path: "Want this built for your team? Book a working session."
     Plus a persistent, non-intrusive CTA in the shell chrome.
5. **Soft-gates (never walls).** Optional email capture at high-intent moments ("Email me
   my personalized map", "Send this report as a PDF"). Everything is explorable without an
   email.
6. **Mobile** gets a **vertical journey/stepper** — same content and events, linear
   layout, full-screen node experiences. A distinct layout branch chosen by viewport, not
   squeezed-down map CSS.

---

## Fidelity strategy — replicate the platform WITHOUT the codebase

We deliberately do NOT use the production codebase (welded to auth/backend/live data; a
maintenance trap). This is a standalone artifact that *looks and feels* like the product.
Once the design system arrives it drives the look (§Theming); until then, screenshots are
the visual reference.

**Every screen picks ONE of three fidelity tiers:**
1. **Rebuild as a live interactive component** — ONLY the screens that must feel real: the
   learning map and the reporting/admin dashboard. Built from theme tokens, screenshots as
   layout reference. This is where the wow lives.
2. **Static screenshot in a themed frame** — peripheral screens nobody interacts with
   (settings, catalog, profile). Do NOT rebuild these.
3. **Real embed via iframe** — the sims.

When unsure which tier a screen needs, ask. Over-rebuilding peripheral screens is the main
way this project wastes time. Never invent product UI — request a screenshot instead.

---

## Tech stack (decided — don't relitigate)

- **Vite + React + TypeScript + Tailwind CSS + Framer Motion**
- **Theme:** single `tokens` source wired into `tailwind.config`; no hardcoded design
  values in components (§Theming).
- **Map:** SVG-based custom rendering (nodes/edges/pan/zoom). ~15–25 curated nodes — not a
  generic graph. React Flow acceptable only if custom SVG gets unwieldy.
- **Charts:** Recharts, colored from `theme.chartPalette`.
- **Analytics:** PostHog JS SDK behind a typed `track()` helper — product analytics
  (funnels, trends, dwell) AND **session replay** (same project, no second tool like
  Clarity). Anonymous by default; `identify()` only on soft-gate. **Consent-gated:** no
  cookies / replay paused until the visitor accepts the banner, then start. No pre-consent
  tracking.
- **Sims:** iframe embeds of existing hosted Simulate sims; any fallback video via native
  `<video>` + poster.
- **Repo:** private GitHub; Vercel/Cloudflare Pages auto-deploys `main` to
  `demo.skillwell.com`, preview URLs per branch.
- **No backend for v1.** Content and any token/link config resolve from static JSON.
- All demo content in `/content` as JSON (map structure, node copy, datasets, sim scripts)
  so non-engineers can edit copy without touching components.

---

## Content model (source of truth in `/content`)

```ts
// map.json
type NodeType = 'sim' | 'report' | 'usecase' | 'content' | 'cta';
type NodeState = 'locked' | 'available' | 'completed' | 'verified_skipped';

interface MapNode {
  id: string;
  type: NodeType;
  title: string;
  subtitle?: string;
  stage: string;              // e.g. "foundations"
  position: { x: number; y: number };
  edges: string[];            // ids of next nodes
  skillTags: string[];        // drives adaptive skipping
  estMinutes: number;         // drives the time counter
  payloadRef: string;         // file in /content/nodes/
}

// assessment.json — 3 questions; each answer maps to skillTags to mark verified
// sims/<id>.json — embed url + framing copy; (fallback player: clips[] with decisions)
// reports/<id>.json — datasets for heatmap / cohort progress / verification charts
// tokens.json — OPTIONAL rep links: { "<token>": { repName, prospectFirstName?, highlightNodeIds? } }
```

---

## Analytics

**Anonymous-first.** Every event works without a known identity (keyed by PostHog's
anonymous ID). Every event carries: `session_id`, `device` (desktop|mobile), `token`
(only if a rep link was used), `variant`.

| Event | Properties |
|---|---|
| `demo_opened` | referrer, utm_* |
| `assessment_started` / `assessment_completed` | answers, nodes_skipped, minutes_saved |
| `node_opened` / `node_closed` | node_id, node_type, stage, order_index, dwell_s |
| `sim_opened` / `sim_closed` | sim_id, dwell_s |
| `sim_decision` / `sim_completed` (only if embed emits postMessage) | sim_id, choice_id, duration_s |
| `report_viewed` / `report_filtered` | report_id, filter |
| `soft_gate_shown` / `soft_gate_submitted` | gate_id |
| `cta_clicked` | cta_id, node_id? |
| `session_depth` (heartbeat/unload) | nodes_opened_count, total_time_s |

**Dashboard (Phase 4 deliverable):** a pinned PostHog dashboard "Skillwell Demo" with
tiles for sessions/day, avg time on demo, node open/close counts + avg dwell per node, the
open→sim→CTA funnel, desktop vs mobile split, and form submissions/day. Document each
tile's config in `README.md` so marketing can recreate/tweak.

**HubSpot (optional, Phase 4):** because traffic is anonymous, HubSpot only matters when a
visitor submits a soft-gate email. On that event, `posthog.identify()` and (if confirmed)
push the contact + demo activity to the HubSpot contact timeline via the native
integration or a small serverless function. Do NOT try to embed PostHog charts inside a
HubSpot dashboard — HubSpot only renders its own objects. Keep the two dashboards separate.

---

## Design direction

- Feel like a **premium enterprise SaaS product UI**, not a marketing page: all visuals
  from theme tokens, real product-grade density in reporting views, motion 200–300ms and
  purposeful. Reference feel: Linear, Sana, Figma-grade polish.
- The map should feel alive: subtle idle animation on the current node, path-drawing
  animation on reconfigure, satisfying overlay open/close.
- Single theme mode (light or dark) — decide at Phase 0 or default to light on the
  placeholder theme; don't build both.
- Accessibility: keyboard-navigable overlays, captions on any sim video, respect
  `prefers-reduced-motion`.

---

## Guardrails

- **Fictional customer only.** No real customer names/brands inside the experience.
- **No fictional capabilities.** Idealized-but-achievable only; flag doubtful items for PM
  sign-off rather than inventing.
- **No login, no hard gates, no cookie-wall.** Anonymous-first; PostHog consent-gated.
- **No production codebase, backend, or real customer data.** Theme + screenshots + iframe
  embeds only.
- **No hardcoded design values.** Everything through theme tokens (§Theming).
- **Performance:** first meaningful paint < 2s on hotel wifi; lazy-load video/charts; this
  page IS the product impression.

---

## Phases — work one at a time; each ends runnable and demoable

**Phase 0 — Intake + scaffold.**
Ask the human for what's available (don't block on any of it — start with placeholders and
track gaps in `PLACEHOLDERS.md`):
- Fictional scenario (vertical + company name). *If none given, default to "Meridian
  Health — onboarding 4,000 clinical hires."*
- Embed URL(s) for one/two Simulate sims + whether the embed emits postMessage. *If none,
  use the fallback video player with placeholder clips.*
- PostHog project key. *If none, wire `track()` to console for now.*
- Private GitHub repo location and confirmation of `demo.skillwell.com`.
- Design system: **not expected yet** — build the placeholder theme (§Theming).
Then scaffold: Vite + React + TS + Tailwind, the `tokens` theme file with a polished
placeholder palette/type, folder structure (`/components`, `/content`, `/theme`), and the
typed `track()` helper.
*Done when:* the app boots with a themed shell and the token file is the single source of
design truth.

**Phase 1 — Skeleton + map (desktop).** Layout shell, map rendered from `map.json` with
pan/zoom, node states, overlay shell open/close, `track()` firing events. ~15 placeholder
nodes.
*Done when:* a visitor can pan the map and open/close every node type's empty shell.

**Phase 2 — Node experiences.** Sim embed shell (iframe + framing + dwell tracking,
postMessage bridge if available), reporting dashboard (3 charts + filters from JSON,
colored from theme), use-case cards, CTA node.
*Done when:* the full journey is playable start-to-finish with placeholder content.

**Phase 3 — Adaptive intro.** Assessment flow, map reconfiguration animation,
minutes-saved counter, "verified — skipped" node treatment, skippable.
*Done when:* different answers produce visibly different maps.

**Phase 4 — Instrumentation + dashboard.** Full event schema to PostHog, session replay
enabled, consent-gated config, the pinned "Skillwell Demo" dashboard built and documented,
soft-gate email capture → `identify()`. HubSpot push and rep token links are OPTIONAL —
build only if the human confirms now.
*Done when:* a PostHog funnel + dashboard show a real anonymous session end-to-end, with
replay recording after consent.

**Phase 5 — Mobile.** Vertical journey layout, full-screen node experiences, same events
with `device: mobile`.
*Done when:* the full journey works on a 390px viewport with no horizontal scroll.

**Phase 6 — Polish + ship.** Motion pass, a11y pass, Lighthouse ≥ 90 performance, error
states, OG/social cards, deploy config + DNS instructions, `README.md` for marketing (edit
content JSON + the design-system swap procedure).
*Done when:* deployed to production URL and a cold visitor can complete the journey.

**Phase 7 (post-launch, separate) — AI guide.** In-demo chat (Claude API via a minimal
serverless proxy) grounded in the node the visitor is viewing. Don't start without explicit
go-ahead.

**Design-system import (whenever it arrives, any time after Phase 1).** Map the real
tokens onto the names in `tokens.ts` and replace the file. Because no component hardcodes
values, this re-skins the whole app in one change. Visually QA, adjust the chart palette,
done.

---

## Working agreement for the Claude Code session

- Verify each phase in a browser (screenshot/preview) before calling it done.
- Keep components dumb; content in JSON, design in tokens. A marketer edits copy and a
  designer swaps the theme without touching component code.
- Commit per phase with clear messages; maintain `PLACEHOLDERS.md` and `README.md`.
- When a product-fidelity question comes up, ask for a screenshot rather than inventing UI.
- Never hardcode a color, font, radius, shadow, or magic spacing value in a component.
