# Skillwell Interactive Demo — Project Plan & Strategic Analysis

**Owner:** Austin Weatherhead
**Date:** July 15, 2026
**Companion doc:** `CLAUDE_CODE_BRIEF.md` (the build spec for a Claude Code session)

---

## 1. What this project actually is

On the surface: replace the 2018-style explainer video with an ungated, interactive "learning map" of Skillwell Adapt on the website — prospects click through nodes, open a Skillwell Simulate simulation, view admin reporting, read use cases, all instrumented like a funnel.

Underneath: this demo is a **forcing function for the one-platform positioning problem (#2)**. You cannot script this experience without deciding how Adapt and Simulate present as one thing. The architecture you described already *is* the answer:

> **The learning map (Adapt) is the spine. Simulations (Simulate) live inside the nodes. Reporting (Verify) proves it worked.**

That's the unified product narrative, rendered as software instead of a slide. Build the demo and you've built the positioning; the website copy, the sales deck, and the first-call demo can all inherit from it. Treat this as a feature of the project, not a side effect — it's how you get leadership and product to care about a "marketing asset."

## 2. Strategic analysis — gaps in the plan

### Gap 1: "Nobody is converting" isn't a diagnosis yet
Traffic → demo request, demo → stage 3, stage 3 → close are different leaks with different fixes. The website demo primarily moves **top/mid funnel**: lead quality, demo request rate, show rate, deal velocity. If the biggest leak is stage 3 → 4 (your problem #1), the website demo doesn't fix it directly — but it *can* help if you design for it:

- **Personalized demo links as the "reason to show up."** Reps send a tokenized link (`?d=<token>`) after call 2. The prospect explores; the rep reviews their clickstream before call 3 and opens with "you spent four minutes in the compliance reporting view — let's start there." That's the next-meeting hook your reps aren't creating today, and it turns the demo's analytics into sales intelligence, not just marketing vanity metrics.
- **Action:** Before launch, pull the actual funnel stage-conversion numbers from HubSpot so you can attribute what the demo moves. Define success metrics up front (see §6).

### Gap 2: Services-led reality vs. product-led demo (the biggest strategic risk)
Your customers buy customized deployments plus your instructional design experts. The "build a sim in 4 clicks" pitch fails because **enterprises don't want to build sims in 4 clicks — they want proof you can build great sims for them.** A self-serve demo that pitches out-of-the-box product repeats that mistake interactively.

**Resolution: demo the destination, not the SKU.** The demo should be a fully realized, deeply customized deployment for a *fictional* enterprise (e.g., "Meridian Health — onboarding 4,000 clinical hires"). The implicit message: *this is what your build looks like when Skillwell's team is done with you.* That is honest (it's how Disney/Amazon/Merck actually use you), it sells the services attach leadership wants ARR to hide from, and it sidesteps the "our out-of-box product isn't that impressive" problem entirely — because you're never showing out-of-box.

This also mitigates the **letdown risk**: if a slick web demo dramatically outshines the real product, your stage-3 live demos become the disappointment and mid-funnel gets *worse*. A "customized deployment" framing is genuinely better than out-of-box, so the web demo and the live demo stay consistent. Get your best PM to sign off that everything shown is *achievable in a real deployment* — idealized is fine, fictional capability is not.

### Gap 3: The wow moment is adaptivity, and it's missing from the plan
A clickable map is a nicer Storylane. The thing Sana and the AI-coaching companies can't show is your proven adaptive engine. **Open the demo with a 3-question mini-assessment, then visibly reconfigure the map in front of the visitor** — nodes get marked "verified, skipped for you," the path shortens, an estimated-time counter drops from 6 hours to 2.5. Thirty seconds in, the prospect has *felt* adaptive learning save them time. That's the demo Adapt has never had, and it's cheap to build (it's presentation logic, not a real engine).

### Gap 4: Content is the long pole, not code
Claude Code will produce the map shell fast. The schedule risk is entirely in assets and decisions:

| Asset | Owner needed | Notes |
|---|---|---|
| One believable simulation (3–6 short video clips + branching choices) | Product/ID team | Export or screen-record a real Simulate sim, or cut a Synthesia scenario. **Check Synthesia license terms for public marketing use of avatars.** |
| Realistic reporting datasets | You + PM | Fake but plausible: skill-gap heatmap, cohort progress, verification scores |
| Fictional company scenario + all node copy | Marketing | One writer, one voice |
| Brand kit (fonts, colors, logo, product UI screenshots for fidelity) | Marketing/design | The demo must *feel* like the product |
| PM sign-off on capability honesty | Product | Per Gap 2 |

If no one owns this list, the project drifts a quarter. Assign a content owner on day one.

### Gap 5: Placement, tracking, and identity
- **Host at `demo.skillwell.com`**, not embedded in HubSpot pages. The site is on HubSpot CMS; a subdomain with a standalone app is cleaner, faster, and iterable without touching the CMS. Link it hard from the homepage hero and nav ("See it live — no email required"). An iframe embed on a landing page can come later if wanted.
- **Ungated.** No login, no form wall — that's the entire point and the differentiation from your competitors' gated Storylane tours. Use **soft-gates**: "Email me my personalized learning map," "Send me this report as a PDF." Optional, high-intent, and they identify the visitor.
- **Analytics:** PostHog (funnels + session replay + heatmaps, generous free tier) as the event backbone; push identified events into the HubSpot contact timeline via API when a soft-gate or rep token identifies the visitor. Define the event schema before writing code (it's in the brief).

### Gap 6: Mobile is a different product, not a breakpoint
A spatial map with popovers is desktop-native. On mobile, ship a **vertical journey/stepper** — same content, same events, different layout. You flagged this; the plan treats it as its own design deliverable (Phase 5), not responsive CSS.

### Gap 7: Legal/brand hygiene
- Fictional customer only. No Disney/Amazon/Merck names or lookalike branding inside the demo experience (logo walls elsewhere on the site are fine).
- Synthesia avatar licensing for public marketing use (per Gap 4).
- Fake data must be obviously fictional people/names.

### Out of scope here, but on the record (problems #1–#3)
- **#1 Sales process:** call recording is running — good. The fastest wins are a standard discovery framework, booking the next meeting *on* the current call, and a reason-to-return artifact (the personalized demo link is exactly that). Separate project; the demo feeds it.
- **#2 Positioning:** the demo forces the decision (§1). Recommend: one platform, "Skillwell," with *capabilities* (Adapt / Simulate / Verify), never pitched as two products to choose between.
- **#3 Product impressiveness:** you can't out-sleek Sana on front-end polish this quarter. You can out-*prove* them — proven adaptive engine, verified skills data, enterprise deployments. The demo's job is to make "proven" feel modern.

## 3. Engineering feasibility

**Verdict: highly feasible, low technical risk.** No backend required for v1.

| Component | Approach | Risk |
|---|---|---|
| Learning map (pan/zoom, nodes, edges, states) | React + SVG/Canvas, Framer Motion for transitions | Low — well-trodden |
| Sim player | Video-driven branching: play clip → choice buttons → next clip (3–6 clips) | Low code / **medium content** risk |
| Admin reporting views | Recharts + static JSON datasets | Low |
| Adaptive intro assessment | Client-side logic re-scoring node states | Low |
| Tracking | PostHog JS SDK + typed event helper; HubSpot API on identify | Low |
| Personalized rep links | Signed token in query param → config lookup (static JSON per token, or one edge function later) | Low |
| Hosting | Vite + React + TypeScript + Tailwind, deployed on Vercel/Netlify/Cloudflare Pages at `demo.skillwell.com` | Low — one DNS record |
| Mobile variant | Separate vertical-journey layout, shared content/state | Medium design effort, low code risk |

All content lives in JSON/MDX files so marketing can edit copy, swap datasets, and add nodes without engineering.

## 4. Timeline (honest version)

Assumes you driving Claude Code part-time plus one content owner working in parallel.

| Milestone | Elapsed | Gate |
|---|---|---|
| **M0 — Decisions & assets kickoff** | Day 0–3 | Fictional scenario chosen, brand kit collected, sim source identified |
| **M1 — Internal prototype** (desktop map, 3 node types, fake data, basic events) | End of week 2 | Good enough to show leadership and reps; use it to force the positioning conversation |
| **M2 — Content-complete beta** (real sim video, final datasets, all copy, adaptive intro) | Week 3–4 | Content owner is the critical path, not code |
| **M3 — Instrumented + personalized links + soft-gates** | Week 4–5 | PostHog funnels live, HubSpot wired |
| **M4 — Mobile experience + polish + QA** | Week 5–6 | Cross-browser, performance, accessibility pass |
| **M5 — Public launch at demo.skillwell.com** | **Week 6** | Homepage hero links to it |
| Phase 2 (post-launch): AI chat guide (Claude API) that answers questions in-context | +2–3 weeks | This is the "chat, touch, and feel" upgrade nobody else has |

- **2 weeks** to something you can show internally.
- **4–6 weeks** to public v1 *if the content owner exists*.
- **A quarter** if content has no owner — that's the failure mode, not engineering.

## 5. Build phases (mirrors the Claude Code brief)

0. Assets & decisions checklist (human work, gates everything)
1. App skeleton + learning map interaction (desktop)
2. Node experiences: sim player, reporting dashboard, use-case cards, CTA nodes
3. Adaptive intro assessment + live map reconfiguration (the wow)
4. Analytics events, personalized rep links, soft-gate capture → HubSpot
5. Mobile vertical-journey experience
6. Brand polish, performance, QA, deploy
7. (Post-launch) AI guide chat layer

## 6. Success metrics — define before launch

- Demo start rate (% of site visitors who open it) and completion depth (nodes opened per session)
- Sim start → sim completion rate; report-view rate
- Soft-gate conversion (emails captured) and demo → book-a-demo CTA clicks
- Rep-link engagement rate and stage-3 show rate for prospects who received a link vs. not
- Downstream: demo-touched leads' stage-conversion vs. baseline (pull baseline from HubSpot *now*)

## 7. Open questions for you to settle at M0

1. Fictional scenario/vertical for the demo deployment (recommend one that overlaps your best-ROI segment — healthcare onboarding or retail seasonal hiring both demo well)
2. Sim source: export/record a real Simulate sim vs. produce a fresh Synthesia scenario?
3. Who is the content owner?
4. Can you get a DNS record for `demo.skillwell.com` and a PostHog account under a company email?
5. Does leadership sign off on the "customized deployment, not out-of-box" framing? (This is the positioning decision in disguise — have that fight early.)
