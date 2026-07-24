import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { track } from './lib/track'
import type { MapContent, NodeState } from './lib/types'
import { personalize, getQuestions, minutesSaved, uniqueSkillCount, INDUSTRIES, TRAININGS } from './lib/personalize'
import type { IntroAnswers } from './lib/personalize'
import { LearningMap } from './components/LearningMap'
import { IntroFlow } from './components/IntroFlow'
import { Logo } from './components/Logo'
import rawMap from './content/map.json'

const baseMap = rawMap as unknown as MapContent
const INTRO_KEY = 'sw_intro_answers'

/** Early-path nodes the knowledge check can test you out of, in path order.
 *  A correct answer verifies EVERY node sharing that skillTag (e.g. one
 *  fundamentals answer tests out of both foundations activities). */
const SKILL_NODE_ORDER = ['principles', 'terminology', 'styles', 'communication'] as const

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
  /** Runtime node-state overrides from the knowledge check. */
  const [overrides, setOverrides] = useState<Record<string, NodeState> | null>(null)

  useEffect(() => {
    track('demo_opened', { referrer: document.referrer || 'direct' })
  }, [])

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
    setIntro({ phase: 'active' })
  }, [])

  /** The learner-side adaptivity moment: apply knowledge-check results. */
  const handleCheckComplete = useCallback((verifiedTags: string[]) => {
    const next: Record<string, NodeState> = { 'knowledge-check': 'completed' }
    let current: string | null = null
    for (const id of SKILL_NODE_ORDER) {
      const node = baseMap.nodes.find((n) => n.id === id)
      const verified = node?.skillTags.some((t) => verifiedTags.includes(t)) ?? false
      if (verified) {
        next[id] = 'verified'
      } else {
        next[id] = current === null ? 'current' : 'available'
        if (current === null) current = id
      }
    }
    if (current === null) next.expectations = 'current'
    setOverrides(next)
    setBanner('adapted')
  }, [])

  const answers = intro.phase === 'done' ? intro.answers : null

  const map = useMemo(() => {
    const personalized = personalize(baseMap, answers)
    const nodes = personalized.nodes.map((n) =>
      overrides?.[n.id] ? { ...n, state: overrides[n.id] } : n,
    )
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
  }, [answers, overrides])

  const questions = useMemo(() => getQuestions(answers), [answers])
  const { scenario } = map
  const introActive = intro.phase === 'active'

  const industryLabel = INDUSTRIES.find((i) => i.id === answers?.industry)?.label
  const trainingLabel = TRAININGS.find((t) => t.id === answers?.training)?.label
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
            onClick={() => track('cta_clicked', { cta_id: 'header_book_demo' })}
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
                  Drag to explore · click any node
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
                        Built from your document — automatically.
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
                        Built for {industryLabel} · {trainingLabel} — in seconds.
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
                    Your path just adapted — this is Skillwell working.
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-white/85">
                    {verifiedCount > 0
                      ? `You tested out of ${verifiedCount} ${verifiedCount === 1 ? 'activity' : 'activities'} (~${formatSaved(saved)} of seat time). Teal nodes are verified skills — and this keeps happening as real learners progress.`
                      : 'Your full path is ready — Skillwell will keep adapting it as you demonstrate skills along the way.'}
                  </p>
                </BannerCard>
              )}
            </AnimatePresence>

            <LearningMap
              content={map}
              questions={questions}
              onCheckComplete={handleCheckComplete}
            />
          </section>
        </main>

        {/* Intro flow overlay */}
        {introActive && <IntroFlow onDone={finishIntro} />}
      </div>
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
