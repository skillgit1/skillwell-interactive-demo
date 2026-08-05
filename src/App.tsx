import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { track } from './lib/track'
import type { MapContent, NodeState } from './lib/types'
import { personalize, getQuestions, minutesSaved, uniqueSkillCount, findIndustry, findTraining } from './lib/personalize'
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

type Banner = 'built' | 'adapted' | null

function loadIntroState(): { intro: IntroState; banner: Banner } {
  try {
    const raw = sessionStorage.getItem(INTRO_KEY)
    if (raw) return { intro: { phase: 'done', answers: JSON.parse(raw) }, banner: null }
  } catch {
    /* ignore */
  }
  return { intro: { phase: 'active' }, banner: null }
}

export default function App() {
  const initial = useMemo(loadIntroState, [])
  const [intro, setIntro] = useState<IntroState>(initial.intro)
  const [banner, setBanner] = useState<Banner>(initial.banner)
  /** Runtime node-state overrides from the knowledge check (tested-out skills). */
  const [overrides, setOverrides] = useState<Record<string, NodeState> | null>(null)
  /** Progress through the guided 3-node showcase (0..3). */
  const [showcaseStep, setShowcaseStep] = useState(0)
  /** After all 3 nodes: show the admin insights report, then the CTA. */
  const [postPreview, setPostPreview] = useState<'insights' | 'convert' | null>(null)

  useEffect(() => {
    // If this browser consented on a prior visit, re-arm tracking before the
    // first event (the intro is session-gated and may not re-render).
    restoreConsent()
    track('demo_opened', { referrer: document.referrer || 'direct' })
  }, [])

  // Banners are one-time nudges — auto-dismiss so they never clutter.
  useEffect(() => {
    if (!banner) return
    const id = setTimeout(() => setBanner(null), 7000)
    return () => clearTimeout(id)
  }, [banner])

  const finishIntro = useCallback((answers: IntroAnswers | null) => {
    try {
      sessionStorage.setItem(INTRO_KEY, JSON.stringify(answers))
    } catch {
      /* ignore */
    }
    setIntro({ phase: 'done', answers })
    if (answers) setBanner('built')
  }, [])

  const restartIntro = useCallback(() => {
    try {
      sessionStorage.removeItem(INTRO_KEY)
    } catch {
      /* ignore */
    }
    setOverrides(null)
    setBanner(null)
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
      setBanner('adapted')
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

  const industryLabel = findIndustry(answers?.industry ?? null)?.label
  const trainingLabel = findTraining(answers?.training ?? null)?.label
  const verifiedCount = map.nodes.filter((n) => n.state === 'verified').length
  const saved = minutesSaved(map)

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

            {/* Story banners */}
            <AnimatePresence>
              {banner === 'built' && (
                <BannerCard key="built" onDismiss={() => setBanner(null)} cta="Got it">
                  {answers?.fileName ? (
                    <>
                      <p className="text-sm font-semibold">
                        Built from your document, automatically.
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-white/85">
                        Skillwell read “{answers.fileName}”, matched{' '}
                        {uniqueSkillCount(map)} skills to its skills taxonomy, and
                        assembled this adaptive path with its AI-powered skills
                        development system. Now see the learner side: start with the
                        knowledge check.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold">
                        Built for {industryLabel} · {trainingLabel}, in seconds.
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-white/85">
                        Skillwell builds any type of training, for any industry. Now see
                        the learner side: start with the knowledge check and watch this
                        path adapt to you.
                      </p>
                    </>
                  )}
                </BannerCard>
              )}
              {banner === 'adapted' && (
                <BannerCard key="adapted" onDismiss={() => setBanner(null)} cta="Keep exploring">
                  <p className="text-sm font-semibold">
                    Your path just adapted. This is Skillwell working.
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-white/85">
                    {verifiedCount > 0
                      ? `You tested out of ${verifiedCount} ${verifiedCount === 1 ? 'activity' : 'activities'} (~${formatSaved(saved)} of seat time). Teal nodes are verified skills, and this keeps happening as real learners progress.`
                      : 'Your full path is ready, and Skillwell will keep adapting it as you demonstrate skills along the way.'}
                  </p>
                </BannerCard>
              )}
            </AnimatePresence>

            <LearningMap
              content={map}
              questions={questions}
              onCheckComplete={handleCheckComplete}
              training={answers?.training ?? 'leadership'}
              openableIds={openableIds}
              onNodeDone={handleNodeDone}
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
          This is our simplest, self-guided build. On a quick call we can show you
          simulations built for your team, how a learner's path adapts to them in real
          time, and the designers who build it all with you. That is the part a preview
          cannot capture.
        </p>
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
      </motion.div>
    </div>
  )
}

function BannerCard({
  children,
  onDismiss,
  cta,
}: {
  children: React.ReactNode
  onDismiss: () => void
  cta: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: 0.35, duration: 0.35, ease: 'easeOut' }}
      className="absolute left-1/2 top-14 z-10 w-full max-w-md -translate-x-1/2"
    >
      <div className="rounded-xl bg-suggest p-4 text-white shadow-[var(--shadow-overlay)]">
        {children}
        <button
          type="button"
          onClick={onDismiss}
          className="mt-3 rounded-btn bg-white px-3 py-1.5 text-xs font-bold text-suggest transition-colors hover:bg-white/90"
        >
          {cta}
        </button>
      </div>
    </motion.div>
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
