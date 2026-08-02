import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { getReportSkills } from '../lib/reportSkills'
import { track } from '../lib/track'

/**
 * Auto-Insights report — the ADMIN / course-creator analytics view (NOT a
 * learner node). Opens nearly full-page as step 4 of the preview, before the
 * conversion CTA. Rebuilt from the product's report with Skillwell colors and
 * anonymized template data. Charts are custom SVG/divs (no chart lib) so the
 * styling matches the brand exactly.
 */

const BLUE = '#005e8d'
const GREEN = '#00bf80'
const GREEN_LIGHT = '#a7e2cd'
const NEUTRAL = '#dbe0e3'
const POS = '#00a870'
const NEG = '#d43c3c'

// ---- Anonymized template data (numbers only; no real client) --------------
const ENGAGED = 35
const COMPLETED = 24
const COMPLETED_PCT = 68.6
const NOT_PCT = 31.4
const OVER_TIME = [
  { month: "Feb '26", learners: 19 },
  { month: "Mar '26", learners: 0 },
  { month: "Apr '26", learners: 3 },
  { month: "May '26", learners: 2 },
]
// Fixed template scores; skill LABELS come from the visitor's topic.
const FIRST_SCORES = [67.6, 69.6, 72.3, 56.8, 65.0, 68.4, 67.0]
const IMPROVE = [
  { first: 75.0, last: 75.0, delta: 0.0 },
  { first: 80.0, last: 90.0, delta: 10.0 },
  { first: 77.8, last: 77.8, delta: 0.0 },
  { first: 62.5, last: 87.5, delta: 25.0 },
  { first: 75.0, last: 66.7, delta: -8.3 },
  { first: 66.7, last: 66.7, delta: 0.0 },
  { first: 66.7, last: 66.7, delta: 0.0 },
]
const TIME = [
  { label: 'All Attempts', sub: '24 Learners', mins: 18.7 },
  { label: '1 Attempt', sub: '24 Learners', mins: 18.7 },
  { label: '2 Attempts', sub: '1 Learner', mins: 65.1 },
  { label: '3 Attempts', sub: '1 Learner', mins: 316.1 },
  { label: '4+ Attempts', sub: '1 Learner', mins: 341.1 },
]

function Donut({ pct }: { pct: number }) {
  const r = 54
  const c = 2 * Math.PI * r
  const done = (pct / 100) * c
  return (
    <div className="relative grid size-40 place-items-center">
      <svg viewBox="0 0 140 140" className="size-40 -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke={NEUTRAL} strokeWidth="16" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={BLUE}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${done} ${c}`}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-2xl font-bold text-ink">{ENGAGED}</div>
        <div className="text-xs font-medium text-ink-muted">Learners</div>
      </div>
    </div>
  )
}

/** Vertical bars with value labels. */
function VBars({
  data,
  color,
  unit = '',
}: {
  data: { label: string; sub?: string; value: number }[]
  color: string
  unit?: string
}) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex h-52 items-end gap-4 border-b border-line pb-0">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center justify-end gap-2">
          <span className="text-xs font-bold text-ink">
            {d.value}
            {unit}
          </span>
          <div
            className="w-full max-w-[52px] rounded-t-md"
            style={{ height: `${(d.value / max) * 160}px`, minHeight: 2, background: color }}
          />
          <span className="text-center text-[11px] font-medium leading-tight text-ink-soft">
            {d.label}
            {d.sub && <span className="block text-ink-muted">{d.sub}</span>}
          </span>
        </div>
      ))}
    </div>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-5 flex gap-3 rounded-xl border border-oasis/30 bg-oasis/5 p-4">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-oasis/15 text-oasis">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18h6m-5 3h4M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 3Z" />
        </svg>
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-oasis">Why this matters</p>
        <p className="mt-0.5 text-sm leading-relaxed text-ink">{children}</p>
      </div>
    </div>
  )
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-7">
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1 max-w-3xl text-sm text-ink-soft">{desc}</p>
      <div className="mt-5">{children}</div>
    </section>
  )
}

export function AutoInsightsReport({
  company,
  course,
  training,
  onContinue,
  onClose,
}: {
  company: string
  course: string
  /** Training id — selects the pre-baked, topic-specific measured skills. */
  training: string
  onContinue: () => void
  onClose: () => void
}) {
  const skills = getReportSkills(training)
  const skillsFirst = skills.map((skill, i) => ({ skill, score: FIRST_SCORES[i] }))
  const improvements = skills.map((skill, i) => ({ skill, ...IMPROVE[i] }))

  useEffect(() => {
    track('insights_viewed', { training })
  }, [training])

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-stretch justify-center p-3 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-navy-deep/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative z-10 flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-panel shadow-[var(--shadow-overlay)]"
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {/* ADMIN banner — deliberately different from the learner overlays */}
        <div className="flex items-center justify-between gap-4 bg-navy px-6 py-3 text-white">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-white/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wide">
              Admin view
            </span>
            <span className="text-sm font-medium text-white/90">
              Auto-Insights — what your L&amp;D team sees, <span className="font-bold">not the learner</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Scrollable report */}
        <div className="flex-1 overflow-y-auto bg-surface px-6 py-6 sm:px-10">
          {/* Report header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                Simulation Insights
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink">
                {course}
              </h2>
              <p className="mt-1 text-sm text-ink-soft">{company} · Immersive Simulation</p>
            </div>
            <div className="hidden text-right text-xs text-ink-muted sm:block">
              <p>Report generated: Jun 1, 2026</p>
              <p>Data included: Jan 31, 2026 – May 31, 2026</p>
            </div>
          </div>

          <Note>
            This is the <span className="font-bold">course-creator's dashboard</span> — a live view of
            how a whole cohort is performing. Skillwell generates it automatically from every learner's
            simulation attempts.
          </Note>

          {/* Learner Engagement */}
          <Section
            title="Learner Engagement"
            desc="Unique learners who have engaged with the simulation — how many started, completed an attempt, and retried."
          >
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="flex items-center gap-6">
                <Donut pct={COMPLETED_PCT} />
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="size-3 rounded-full" style={{ background: BLUE }} />
                    <span className="font-bold text-ink">Completed</span>
                    <span className="text-ink-muted">{COMPLETED_PCT}% ({COMPLETED})</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="size-3 rounded-full" style={{ background: NEUTRAL }} />
                    <span className="font-bold text-ink">Not completed</span>
                    <span className="text-ink-muted">{NOT_PCT}% (11)</span>
                  </p>
                  <p className="pt-2 text-ink-soft">
                    <span className="font-bold text-ink">{ENGAGED}</span> learners engaged with the
                    simulation.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-line bg-panel p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                  Repeat attempts
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {['2 or more', '3 or more', '4 or more'].map((label) => (
                    <li key={label} className="flex items-center justify-between">
                      <span className="text-ink-soft">{label} attempts</span>
                      <span className="font-bold text-ink">2.9% (1)</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          {/* Engagement over time */}
          <Section
            title="Learner Engagement Over Time"
            desc="Unique learners who complete an attempt, by month of completion."
          >
            <VBars
              data={OVER_TIME.map((d) => ({ label: `${d.month} '24`, value: d.learners }))}
              color={BLUE}
            />
            <Note>
              Engagement spikes at rollout, then tails off. Admins spot the drop-off and re-engage
              learners — <span className="font-bold">before</span> a program quietly stalls.
            </Note>
          </Section>

          {/* Skills Performance: First attempts */}
          <Section
            title="Skills Performance — First Attempts"
            desc="Average skill scores across all learners' first completed attempt. This is the difference between 'they finished the course' and 'they can actually do it.'"
          >
            <div className="space-y-3">
              {skillsFirst.map((s) => (
                <div key={s.skill} className="flex items-center gap-3">
                  <span className="w-56 shrink-0 text-right text-xs font-medium text-ink-soft">
                    {s.skill}
                  </span>
                  <div className="h-5 flex-1 overflow-hidden rounded bg-sunken">
                    <div
                      className="h-full rounded"
                      style={{ width: `${s.score}%`, background: GREEN }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-sm font-bold text-ink">{s.score}%</span>
                </div>
              ))}
            </div>
            <Note>
              This is what makes Skillwell different — we measure <span className="font-bold">demonstrated
              skill</span>, not seat time. A creator sees exactly which skills a cohort has mastered and
              where to intervene.
            </Note>
          </Section>

          {/* Skills Performance: Score improvements */}
          <Section
            title="Skills Performance — Score Improvements"
            desc="For learners who retried: average skill scores on the first attempt vs. the last, and the improvement between them."
          >
            <div className="mb-3 flex items-center gap-4 text-xs font-medium text-ink-soft">
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm" style={{ background: GREEN_LIGHT }} /> First attempt
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm" style={{ background: GREEN }} /> Last attempt
              </span>
            </div>
            <div className="space-y-4">
              {improvements.map((s) => (
                <div key={s.skill} className="flex items-center gap-3">
                  <span className="w-56 shrink-0 text-right text-xs font-medium text-ink-soft">
                    {s.skill}
                  </span>
                  <div className="flex-1 space-y-1">
                    <div className="h-3.5 overflow-hidden rounded bg-sunken">
                      <div className="h-full rounded" style={{ width: `${s.first}%`, background: GREEN_LIGHT }} />
                    </div>
                    <div className="h-3.5 overflow-hidden rounded bg-sunken">
                      <div className="h-full rounded" style={{ width: `${s.last}%`, background: GREEN }} />
                    </div>
                  </div>
                  <span
                    className="w-16 shrink-0 text-right text-sm font-bold"
                    style={{ color: s.delta > 0 ? POS : s.delta < 0 ? NEG : '#8695a8' }}
                  >
                    {s.delta > 0 ? '+' : ''}
                    {s.delta.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
            <Note>
              Retakes prove <span className="font-bold">growth</span>. Skillwell captures the before/after
              on every skill — the clearest way to show ROI on a training program.
            </Note>
          </Section>

          {/* Average time spent */}
          <Section
            title="Average Time Spent"
            desc="Average time learners spent completing their attempts, in task mode."
          >
            <VBars
              data={TIME.map((d) => ({ label: d.label, sub: d.sub, value: d.mins }))}
              color={BLUE}
              unit=""
            />
          </Section>

          {/* Footer CTA within report */}
          <div className="border-t border-line py-7 text-center">
            <p className="text-sm text-ink-soft">
              This report is generated automatically for every Skillwell simulation.
            </p>
            <button
              type="button"
              onClick={onContinue}
              className="mt-4 inline-flex items-center gap-2 rounded-btn bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
            >
              See what your team can build
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
