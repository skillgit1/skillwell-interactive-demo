# Placeholders — swap list before launch

Running list of everything built with placeholder assets/content and how to swap
in the real thing. Keep this current as items are resolved.

| # | Placeholder | Real asset needed | How to swap |
|---|---|---|---|
| 1 | **Logo** — SVG recreation in `src/components/Logo.tsx` (teal globe mark + text wordmark) | Official Skillwell logo file (SVG preferred) | Drop into `/public/skillwell-logo.svg`, replace `Logo.tsx` body with `<img src="/skillwell-logo.svg" alt="Skillwell" className="h-7" />` |
| 2 | **Theme palette** — colors eyeballed from product screenshots in `src/theme/theme.css` | Product design system tokens (from UX team) | Map real values onto the token names in `theme.css` `@theme` block — one-file swap, see README |
| 3 | **Typography** — Inter/system stack | Real product font files + names | Update `--font-sans` / `--font-display` in `theme.css`, add `@font-face` or font files to `/public` |
| 4 | **Sim node** — placeholder overlay ("builds in Phase 2") | Embed URL for a hosted Skillwell Simulate sim + whether it emits postMessage events | Phase 2 work: iframe embed in `NodeOverlay` |
| 5 | **Reporting node** — placeholder overlay | Screenshot of the real admin/skills dashboard (rebuild target) + plausible dataset | Phase 2 work: Recharts dashboard fed by `src/content/reports/` |
| 6 | **Personalization copy** — course/node titles per industry × training in `src/lib/personalize.ts` | Marketing review of all combinations | Edit the `TRAINING_CONTENT` table + `INDUSTRIES` company names |
| 7 | **PostHog** — `track()` logs to console only | PostHog project key | Phase 4: init client, call `setAnalyticsSink()` (see `src/lib/track.ts`) |
| 8 | **Fictional companies** — Meridian Health, Northgate Retail Group, Beacon Financial, Coreline Software, Lakeview University, Atlas Industries | Legal/brand check that none collide with real customers or trademarks | Edit `INDUSTRIES` in `src/lib/personalize.ts` |
