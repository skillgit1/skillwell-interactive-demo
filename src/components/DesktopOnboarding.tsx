import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import {
  INDUSTRIES,
  HIGHER_ED_INDUSTRY,
  HE_WELCOME,
  trainingsFor,
  findIndustry,
  findTraining,
  setUploadContent,
  UPLOAD_TRAINING_ID,
} from '../lib/personalize'
import type { IntroAnswers } from '../lib/personalize'
import { track } from '../lib/track'
import { grantConsent } from '../lib/posthog'
import { moderateUpload } from '../lib/moderateUpload'
import { analyzeUpload } from '../lib/aiUpload'
import { buildPreviewMap, industryLabelFor } from '../lib/previewEngine'
import { useIsDesktop } from '../lib/useIsDesktop'
import { Icon } from './Icon'
import { PreviewMap } from './PreviewMap'

type Step = 'welcome' | 'industry' | 'training' | 'upload' | 'flagged' | 'building'

const BUILD_STEPS = [
  'Locking in your learning map',
  'Populating your custom content',
  'Building the most effective paths',
]

/**
 * Desktop-only, split-screen onboarding: personalization questions on the left,
 * a LIVE preview of the learning map on the right that visibly re-shapes with
 * every answer. Purely a visual/UX layer — the preview map is not clickable
 * (clicking nudges the visitor to finish). When onboarding completes it hands
 * off, via onDone(), to the real interactive map, exactly as before.
 */
export function DesktopOnboarding({
  onDone,
  lockIndustry,
}: {
  onDone: (answers: IntroAnswers | null) => void
  /** When set (the /he higher-ed entry), skip the industry question and open on
   *  a higher-ed welcome, then the course picker, locked to this industry. */
  lockIndustry?: string
}) {
  const [step, setStep] = useState<Step>(lockIndustry ? 'welcome' : 'industry')
  const [industry, setIndustry] = useState<string | null>(lockIndustry ?? null)
  const [training, setTraining] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [flagMessage, setFlagMessage] = useState('')
  const [adaptingLabel, setAdaptingLabel] = useState<string | null>(null)
  const [hint, setHint] = useState(false)
  const [stage, setStage] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [aiInFlight, setAiInFlight] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const consented = useRef(false)
  const shake = useAnimationControls()
  const isDesktop = useIsDesktop()

  const previewContent = useMemo(() => buildPreviewMap(industry, training), [industry, training])

  const industryLabel = (id: string | null) => findIndustry(id)?.label ?? 'Unknown'
  const trainingLabel = (id: string | null) => findTraining(id)?.label ?? 'Unknown'

  // Entering the demo (first pick or skip) is the consent action.
  const ensureConsent = () => {
    if (consented.current) return
    consented.current = true
    grantConsent()
    track('intro_started', { surface: 'desktop_split' })
  }

  const flash = (label: string) => {
    setAdaptingLabel(label)
    window.setTimeout(() => setAdaptingLabel((cur) => (cur === label ? null : cur)), 1200)
  }

  // The paced "building" beat before we hand off to the real map.
  useEffect(() => {
    if (step !== 'building') return
    const answers: IntroAnswers = {
      industry: industry ?? 'other',
      training: training ?? 'leadership',
      fileName,
    }
    if (stage < BUILD_STEPS.length) {
      // While the AI reads the uploaded file, hold on the last build step so we
      // never show "ready" before the generated map is in.
      if (aiInFlight && stage >= BUILD_STEPS.length - 1) return
      const id = window.setTimeout(() => setStage((s) => s + 1), 900)
      return () => window.clearTimeout(id)
    }
    if (aiInFlight) return // the AI path calls onDone() itself when it resolves
    const id = window.setTimeout(() => onDone(answers), 1100)
    return () => window.clearTimeout(id)
  }, [step, stage, industry, training, fileName, onDone, aiInFlight])

  const pickIndustry = (id: string) => {
    ensureConsent()
    track('intro_industry_selected', { industry: id, industry_label: industryLabel(id) })
    setIndustry(id)
    flash(`Adapting to ${industryLabelFor(id)}`)
    setStep('training')
  }

  const pickTraining = (id: string) => {
    track('intro_training_selected', { training: id, training_label: trainingLabel(id) })
    setTraining(id)
    flash(`Tailoring to ${trainingLabel(id)}`)
    setStep('upload')
  }

  const skip = () => {
    ensureConsent()
    track('intro_completed', { skipped: true, surface: 'desktop_split' })
    onDone(null)
  }

  const completeProps = (uploaded: boolean) => ({
    skipped: false,
    industry: industry ?? 'other',
    industry_label: industryLabel(industry),
    training: training ?? 'leadership',
    training_label: trainingLabel(training),
    uploaded_file: uploaded,
    surface: 'desktop_split',
  })

  const acceptFile = (f: File | undefined | null) => {
    if (!f) return
    const fileType = f.name.split('.').pop()?.toLowerCase() ?? 'unknown'
    const verdict = moderateUpload(f)
    if (!verdict.ok) {
      track('content_flagged', { category: verdict.category, file_type: fileType })
      setFlagMessage(verdict.message)
      setStep('flagged')
      return
    }
    setFileName(f.name)
    track('content_uploaded', { file_type: fileType, file_size_kb: Math.round(f.size / 1024) })
    setStep('building')
    // Local AI (dev only): read the actual file and build the map from it. Falls
    // back to the chosen topic if there's no key / not a dev build / any error.
    setAiInFlight(true)
    analyzeUpload(f)
      .then((ai) => {
        setUploadContent(ai)
        track('intro_completed', { ...completeProps(true), ai_personalized: !!ai })
        onDone({
          industry: industry ?? 'other',
          training: ai ? UPLOAD_TRAINING_ID : training ?? 'leadership',
          fileName: f.name,
        })
      })
      .catch(() => {
        setUploadContent(null)
        onDone({ industry: industry ?? 'other', training: training ?? 'leadership', fileName: f.name })
      })
  }

  const finishWithoutFile = () => {
    track('intro_completed', completeProps(false))
    setStep('building')
  }

  // Nudge when the visitor tries to click the map before finishing onboarding.
  const nudge = () => {
    setHint(true)
    window.setTimeout(() => setHint(false), 2600)
    shake.start({ x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.4 } })
  }

  const trainings = trainingsFor(industry)

  return (
    // Mobile: questions on top, a small live-preview map below. Desktop: the
    // questions on the left, the map filling the right.
    <div className="flex h-[calc(100dvh-3.5rem)] w-full flex-col lg:flex-row">
      {/* Questions: top on mobile, left rail on desktop */}
      <motion.aside
        animate={shake}
        className="flex w-full flex-1 flex-col overflow-y-auto border-b border-line bg-panel px-5 py-5 lg:w-[380px] lg:flex-none lg:border-b-0 lg:border-r lg:px-6 lg:py-7"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Skillwell Preview Demo</p>

        <div className="mt-5 flex-1">
          <AnimatePresence mode="wait">
            {step === 'welcome' && (
              <StepShell key="welcome" kicker={HE_WELCOME.eyebrow} title={HE_WELCOME.headline} sub={HE_WELCOME.description}>
                <button
                  type="button"
                  onClick={() => {
                    ensureConsent()
                    setStep('training')
                  }}
                  className="w-full rounded-btn bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
                >
                  Personalize my demo
                </button>
                <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
                  <svg viewBox="0 0 24 24" className="size-4 text-oasis" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  No account or card needed
                </p>
              </StepShell>
            )}
            {step === 'industry' && (
              <StepShell key="industry" kicker="Question 1 of 2" title="What industry are you in?" sub="Skillwell powers learning in every industry. Pick yours and watch the map adapt.">
                <div className="grid grid-cols-2 gap-2.5">
                  {INDUSTRIES.map((ind) => (
                    <RailOption key={ind.id} label={ind.label} onClick={() => pickIndustry(ind.id)} />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => pickIndustry(HIGHER_ED_INDUSTRY.id)}
                  className="mt-3 flex w-full items-center gap-3 rounded-lg border border-line bg-sunken/40 px-3 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary-soft"
                >
                  <span className="grid size-9 place-items-center rounded-full bg-primary-soft text-primary">
                    <Icon name="book" className="size-4" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-ink">{HIGHER_ED_INDUSTRY.label}</span>
                    <span className="block text-xs text-ink-muted">Colleges &amp; online universities</span>
                  </span>
                  <span className="rounded-md bg-sunken px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-ink-muted">Academic</span>
                </button>
              </StepShell>
            )}

            {step === 'training' && (
              <StepShell
                key="training"
                kicker={lockIndustry ? 'Higher Education' : 'Question 2 of 2'}
                title={industry === 'highered' ? 'Which course do you want to see?' : 'What kind of training do you want to see?'}
                sub={industry === 'highered' ? 'Common courses institutions run on Skillwell.' : 'If you can teach it, Skillwell can build and adapt it.'}
              >
                <div className="grid grid-cols-1 gap-2.5">
                  {trainings.map((t) => (
                    <RailOption key={t.id} label={t.label} onClick={() => pickTraining(t.id)} />
                  ))}
                </div>
              </StepShell>
            )}

            {step === 'upload' && (
              <StepShell key="upload" kicker="Optional, but this is the magic" title="Have existing training content?" sub="Drop in a manual, syllabus, or course doc, and Skillwell reads it and builds your adaptive map.">
                <input
                  ref={fileInput}
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
                  className="hidden"
                  onChange={(e) => acceptFile(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(true)
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOver(false)
                    acceptFile(e.dataTransfer.files?.[0])
                  }}
                  className={`grid w-full place-items-center gap-1 rounded-lg border-2 border-dashed px-5 py-7 transition-colors ${
                    dragOver ? 'border-primary bg-primary-soft' : 'border-line-strong bg-sunken/40 hover:border-primary hover:bg-primary-soft'
                  }`}
                >
                  <span className="grid size-10 place-items-center rounded-full bg-primary-soft text-primary">
                    <Icon name="clipboard" className="size-5" />
                  </span>
                  <span className="mt-1 text-sm font-bold text-ink">Drop your document or click to browse</span>
                  <span className="text-xs text-ink-muted">Skillwell reads your content to build the map</span>
                </button>
                <button
                  type="button"
                  onClick={finishWithoutFile}
                  className="mt-4 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
                >
                  No file handy? Build me a sample course
                </button>
              </StepShell>
            )}

            {step === 'flagged' && (
              <StepShell key="flagged" kicker="Let's use an example instead" title="That file could not be used" sub={flagMessage}>
                <button
                  type="button"
                  onClick={finishWithoutFile}
                  className="w-full rounded-btn bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
                >
                  See an example learning map
                </button>
              </StepShell>
            )}

            {step === 'building' && (
              <StepShell key="building" kicker="Building your demo" title="Finishing your personalized map" sub={fileName ? `From “${fileName}”` : 'Locking in the adaptive path we built for you.'}>
                <ul className="flex flex-col gap-3.5">
                  {BUILD_STEPS.map((label, i) => {
                    const done = stage > i
                    const current = stage === i
                    return (
                      <li key={label} className="flex items-center gap-3">
                        <span className={`grid size-6 shrink-0 place-items-center rounded-full transition-colors ${done ? 'bg-oasis text-white' : current ? 'bg-primary-soft text-primary' : 'bg-sunken text-ink-muted'}`}>
                          {done ? (
                            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                          ) : current ? (
                            <motion.span className="size-3 rounded-full border-2 border-primary/30 border-t-primary" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
                          ) : (
                            <span className="size-1.5 rounded-full bg-current opacity-60" />
                          )}
                        </span>
                        <span className={`text-sm font-medium ${done || current ? 'text-ink' : 'text-ink-muted'}`}>{label}</span>
                      </li>
                    )
                  })}
                </ul>
              </StepShell>
            )}
          </AnimatePresence>

          {/* Nudge shown when the visitor clicks the preview map too early */}
          <AnimatePresence>
            {hint && (
              <motion.p
                className="mt-5 rounded-lg border border-primary/30 bg-primary-soft px-3 py-2 text-xs font-medium text-primary"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                Finish personalizing and your map becomes fully interactive.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {step !== 'building' && (
          <div className="mt-6 border-t border-line pt-4">
            <button
              type="button"
              onClick={skip}
              className="text-xs font-medium text-ink-muted transition-colors hover:text-ink"
            >
              Skip and just show me the map
            </button>
            <p className="mt-3 text-[11px] leading-snug text-ink-muted">
              By continuing you agree to cookies and session analytics that help us improve this preview. No personal account is created.
            </p>
          </div>
        )}
      </motion.aside>

      {/* The live preview map: a small strip below on mobile, filling the right on desktop */}
      <div className="relative h-[34vh] shrink-0 lg:h-auto lg:flex-1">
        <PreviewMap
          content={previewContent}
          adaptingLabel={adaptingLabel}
          onBlockedInteract={nudge}
          initialTransform={isDesktop ? { x: 40, y: 40, scale: 0.6 } : { x: 14, y: 24, scale: 0.32 }}
        />
      </div>
    </div>
  )
}

function StepShell({
  kicker,
  title,
  sub,
  children,
}: {
  kicker: string
  title: string
  sub: string
  children: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-primary">{kicker}</p>
      <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-ink">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{sub}</p>
      <div className="mt-5">{children}</div>
    </motion.div>
  )
}

function RailOption({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-line bg-panel px-3 py-3 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary-soft hover:text-primary"
    >
      {label}
    </button>
  )
}
