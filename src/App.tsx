import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { track } from './lib/track'
import type { MapContent, NodeState } from './lib/types'
import { personalize, getQuestions, minutesSaved } from './lib/personalize'
import type { IntroAnswers } from './lib/personalize'
import { LearningMap } from './components/LearningMap'
import { IntroFlow } from './components/IntroFlow'
import { AutoInsightsReport } from './components/AutoInsightsReport'
import { restoreConsent } from './lib/posthog'
import { Logo } from './components/Logo'
import rawMap from './content/map.json'

const baseMap = rawMap as unknown as MapContent
const INTRO_KEY = 'sw_intro_answers'

/** The guided 3-node preview, in order: knowledge check → simulation → a
 *  text lesson. These are the ONLY openable nodes; everything else on the
 *  map is visible (to show scale) but locked. Finishing all three triggers
 *  the "book a call" conversion prompt. */
const SHOWCASE = ['knowledge-check', 'principles', 'communication'] as const

/** Nodes the knowledge check can test you out of (must NOT be showcase
 *  nodes, so the guided text step is never skipped). */
const SKILL_NODE_ORDER = ['terminology', 'styles'] as const

/** Contact / book-a-demo link (UTM'd for this preview). */
const BOOK_CALL_URL = 'https://hubs.ly/Q04rBJD30'

type IntroState =
  | { phase: 'active' }
  | { phase: 'done'; answers: IntroAnswers | null }

function loadIntroState(): IntroState {
  try {
    const raw = sessionStorage.getItem(INTRO_KEY)
    if (raw) return { phase: 'done', answers: JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return { phase: 'active' }
}

export default function App() {
  const [intro, setIntro] = useState<IntroState>(loadIntroState)
  /** Runtime node-state overrides from the knowledge check (tested-out skills). */
  const [overrides, setOverrides] = useState<Record<string, NodeState> | null>(null)
  /** Progress through the guided 3-node showcase (0..3). */
  const [showcaseStep, setShowcaseStep] = useState(0)
  /** After all 3 nodes: show the admin insights report, then the CTA. */
  const [postPreview, setPostPreview] = useState<'insights' | 'convert' | null>(null)
  /** The "suggested next step" popover waits until the visitor has had a moment
   *  to read the map + the build banner, so it never covers that context. */
  const [popoverReady, setPopoverReady] = useState(false)

  useEffect(() => {
    // If this browser consented on a prior visit, re-arm tracking before the
    // first event (the intro is session-gated and may not re-render).
    restoreConsent()
    track('demo_opened', { referrer: document.referrer || 'direct' })
  }, [])

  // Hold the Determine Knowledge popover until the visitor has taken in the map
  // (and the learner-view bar) for a few seconds.
  useEffect(() => {
    if (intro.phase === 'active') {
      setPopoverReady(false)
      return
    }
    const id = setTimeout(() => setPopoverReady(true), 4000)
    return () => clearTimeout(id)
  }, [intro.phase])

  const finishIntro = useCallback((answers: IntroAnswers | null) => {
    try {
      sessionStorage.setItem(INTRO_KEY, JSON.stringify(answers))
    } catch {
      /* ignore */
    }
    setIntro({ phase: 'done', answers })
  }, [])

  const restartIntro = useCallback(() => {
    try {
      sessionStorage.removeItem(INTRO_KEY)
    } catch {
      /* ignore */
    }
    setOverrides(null)
    setShowcaseStep(0)
    setPostPreview(null)
    setIntro({ phase: 'active' })
  }, [])

  /** Advance the guided sequence; after the 3rd node, open the admin report. */
  const handleNodeDone = useCallback((nodeId: string) => {
    setShowcaseStep((s) => {
      if (SHOWCASE[s] !== nodeId) return s
      const next = s + 1
      if (next >= SHOWCASE.length) setPostPreview('insights')
      return next
    })
  }, [])

  /** The learner-side adaptivity moment: apply knowledge-check results, then
   *  advance the guided sequence to the simulation. */
  const handleCheckComplete = useCallback(
    (verifiedTags: string[]) => {
      const next: Record<string, NodeState> = {}
      for (const id of SKILL_NODE_ORDER) {
        const node = baseMap.nodes.find((n) => n.id === id)
        if (node?.skillTags.some((t) => verifiedTags.includes(t))) next[id] = 'verified'
      }
      setOverrides(next)
      handleNodeDone('knowledge-check')
    },
    [handleNodeDone],
  )

  const answers = intro.phase === 'done' ? intro.answers : null

  const map = useMemo(() => {
    const personalized = personalize(baseMap, answers)
    const nodes = personalized.nodes.map((n) => {
      const idx = SHOWCASE.indexOf(n.id as (typeof SHOWCASE)[number])
      let state: NodeState
      if (idx !== -1) {
        // Guided showcase node: completed / current / not-yet-reached (locked).
        state = idx < showcaseStep ? 'completed' : idx === showcaseStep ? 'current' : 'locked'
      } else if (overrides?.[n.id]) {
        state = overrides[n.id] // tested-out skill from the check
      } else {
        state = 'locked' // visible for scale, but not part of the 3-node preview
      }
      return { ...n, state }
    })
    const total = nodes.reduce((s, n) => s + n.estMinutes, 0)
    const earned = nodes
      .filter((n) => n.state === 'completed' || n.state === 'verified')
      .reduce((s, n) => s + n.estMinutes, 0)
    return {
      scenario: {
        ...personalized.scenario,
        percentComplete: total ? Math.round((earned / total) * 100) : 0,
      },
      nodes,
    }
  }, [answers, overrides, showcaseStep])

  /** Showcase nodes reached so far are openable; everything else is locked. */
  const openableIds = useMemo(() => SHOWCASE.slice(0, showcaseStep + 1) as string[], [showcaseStep])

  const openBookCall = useCallback((where: string) => {
    track('cta_clicked', { cta_id: where })
    window.open(BOOK_CALL_URL, '_blank', 'noopener,noreferrer')
  }, [])

  const questions = useMemo(() => getQuestions(answers), [answers])
  const { scenario } = map
  const introActive = intro.phase === 'active'

  const verifiedCount = map.nodes.filter((n) => n.state === 'verified').length
  const saved = minutesSaved(map)
  const adapted = overrides !== null

  return (
    <div className="flex min-h-full flex-col">
      {/* Top chrome */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-panel px-6 py-3">
        <Logo />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => openBookCall('header_book_demo')}
            className="rounded-btn bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Book a Full Demo
          </button>
          <div className="grid size-8 place-items-center rounded-full bg-sunken text-sm font-semibold text-ink-soft">
            B
          </div>
        </div>
      </header>

      {/* Everything below blurs while the intro flow is up */}
      <div className="relative flex-1">
        <main
          className={`mx-auto w-full max-w-6xl px-6 py-6 transition-all duration-500 ${
            introActive ? 'pointer-events-none blur-md brightness-95' : ''
          }`}
          aria-hidden={introActive}
        >
          {/* Breadcrumb */}
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-ink-muted">
            {scenario.breadcrumb.map((crumb, i) => (
              <span key={crumb} className="flex items-center gap-1.5">
                <span
                  className={
                    i === scenario.breadcrumb.length - 1 ? 'font-medium text-ink' : ''
                  }
                >
                  {crumb}
                </span>
                {i < scenario.breadcrumb.length - 1 && (
                  <span className="text-line-strong">/</span>
                )}
              </span>
            ))}
          </nav>

          {/* Course header */}
          <div className="mt-4 flex items-start gap-4">
            <ProgressRing percent={scenario.percentComplete} />
            <div className="flex-1">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
                {scenario.course}
              </h1>
              <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-soft">
                {scenario.description}
              </p>
              {answers?.fileName && (
                <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                  <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
                  </svg>
                  Built from your upload: {answers.fileName}
                </span>
              )}
            </div>
          </div>

          {/* The learning map */}
          <section className="relative mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
                Learning map
              </h2>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={restartIntro}
                  className="text-xs font-medium text-primary transition-colors hover:text-primary-hover"
                >
                  Personalize again
                </button>
                <span className="text-xs text-ink-muted">
                  {showcaseStep >= 3 ? 'Preview complete' : 'Follow the highlighted step'}
                </span>
              </div>
            </div>

            {/* Persistent LEARNER-view bar — mirrors the ADMIN bar on the report */}
            <LearnerViewBar adapted={adapted} verifiedCount={verifiedCount} saved={saved} />

            <LearningMap
              content={map}
              questions={questions}
              onCheckComplete={handleCheckComplete}
              training={answers?.training ?? 'leadership'}
              openableIds={openableIds}
              onNodeDone={handleNodeDone}
              showPopover={popoverReady}
            />
          </section>
        </main>

        {/* Intro flow overlay — consent is granted here on first interaction
            (see the fine print on the welcome card). */}
        {introActive && <IntroFlow onDone={finishIntro} />}

        {/* Step 4: admin auto-insights report */}
        <AnimatePresence>
          {!introActive && postPreview === 'insights' && (
            <AutoInsightsReport
              company={scenario.company}
              course={scenario.course}
              training={answers?.training ?? 'leadership'}
              onContinue={() => setPostPreview('convert')}
              onClose={() => setPostPreview('convert')}
            />
          )}
        </AnimatePresence>

        {/* Step 5: conversion prompt */}
        <AnimatePresence>
          {!introActive && postPreview === 'convert' && (
            <ConversionModal
              onBook={() => openBookCall('preview_complete')}
              onDismiss={() => setPostPreview(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/** What a call actually delivers — kept concrete, not salesy. */
const CALL_INCLUDES = [
  'A simulation built around real scenarios from your team',
  'A learning path that adapts to each learner',
  'Skill data that shows what is actually working',
]

/** Services-team headshots for the modal footer, from public/team/. Any
 *  missing file falls back to a neutral avatar, so the row never looks broken. */
const TEAM = Array.from(
  { length: 6 },
  (_, i) => `${import.meta.env.BASE_URL}team/expert-${i + 1}.jpg`,
)

function ConversionModal({
  onBook,
  onDismiss,
}: {
  onBook: () => void
  onDismiss: () => void
}) {
  // Ignore any click in the first moment so the click that opened this modal
  // (e.g. the report's "continue" button) can't immediately dismiss it.
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setArmed(true), 350)
    return () => clearTimeout(id)
  }, [])
  const dismiss = () => armed && onDismiss()

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-deep/40 backdrop-blur-sm" onClick={dismiss} />
      <motion.div
        className="relative z-10 w-full max-w-md rounded-2xl border border-line bg-panel p-8 text-center shadow-[var(--shadow-overlay)]"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink">
          You've seen a glimpse. The best part is on the call.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          The preview shows the basics. A quick call shows what we would actually build
          for you:
        </p>
        <div className="mt-4 space-y-2.5 rounded-xl bg-sunken/50 p-4 text-left">
          {CALL_INCLUDES.map((item) => (
            <div key={item} className="flex items-start gap-2.5">
              <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0 text-oasis" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span className="text-sm leading-snug text-ink">{item}</span>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onBook}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-btn bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
        >
          Book a call to see the full platform
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7M17 7H8M17 7v9" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-3 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
        >
          Keep exploring the preview
        </button>

        {/* Services team — puts real humans behind the CTA */}
        <div className="mt-6 border-t border-line pt-5">
          <div className="flex justify-center -space-x-2.5">
            {TEAM.map((src, i) => (
              <span
                key={i}
                className="grid size-9 place-items-center overflow-hidden rounded-full border-2 border-panel bg-gradient-to-br from-primary-soft to-oasis/25 text-primary/70"
              >
                <svg viewBox="0 0 24 24" className="col-start-1 row-start-1 size-4" fill="currentColor" aria-hidden="true">
                  <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z" />
                </svg>
                <img
                  src={src}
                  alt=""
                  className="col-start-1 row-start-1 h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">Skillwell's learning experts</span> help you
            design custom simulations, build adaptive learning maps, and measure real skill growth.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Persistent bar above the learning map that labels it as the LEARNER view —
 * the deliberate counterpart to the dark "ADMIN VIEW" bar on the Auto-Insights
 * report. Always visible (not a dismissable popup), so the framing lands: this
 * is a live, adaptive preview of what a single learner sees. After the knowledge
 * check it flips to confirm the path adapted.
 */
function LearnerViewBar({
  adapted,
  verifiedCount,
  saved,
}: {
  adapted: boolean
  verifiedCount: number
  saved: number
}) {
  return (
    <div className="mb-3 flex flex-col gap-2 rounded-xl bg-primary px-4 py-3 text-white sm:flex-row sm:items-center sm:gap-3">
      <span className="flex w-fit shrink-0 items-center gap-1.5 rounded-md bg-white/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wide">
        <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        </svg>
        Learner view
      </span>
      {adapted ? (
        <p className="text-sm font-medium leading-snug text-white/95">
          <span className="font-bold">The path just adapted for this learner.</span>{' '}
          {verifiedCount > 0
            ? `Teal nodes are skills they tested out of (~${formatSaved(saved)} saved). Every learner gets a different path.`
            : 'Every learner gets a different path as they demonstrate skills.'}
        </p>
      ) : (
        <p className="text-sm font-medium leading-snug text-white/95">
          <span className="font-bold">This is the learner's view</span> — a live preview of an
          adaptive learning map that rebuilds itself for each individual learner.
        </p>
      )}
    </div>
  )
}

function formatSaved(mins: number): string {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

function ProgressRing({ percent }: { percent: number }) {
  const r = 22
  const c = 2 * Math.PI * r
  const offset = c - (percent / 100) * c
  return (
    <div className="relative grid size-14 shrink-0 place-items-center">
      <svg viewBox="0 0 56 56" className="size-14 -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="var(--color-sunken)" strokeWidth="5" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-xs font-bold text-ink">{percent}%</span>
    </div>
  )
}
