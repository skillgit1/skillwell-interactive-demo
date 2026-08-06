import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { INDUSTRIES, HIGHER_ED_INDUSTRY, trainingsFor, findIndustry, findTraining } from '../lib/personalize'
import type { IntroAnswers } from '../lib/personalize'
import { track } from '../lib/track'
import { grantConsent } from '../lib/posthog'
import { moderateUpload } from '../lib/moderateUpload'
import { Icon } from './Icon'

type Step = 'welcome' | 'industry' | 'training' | 'upload' | 'flagged' | 'building'

const STEPS: Step[] = ['welcome', 'industry', 'training', 'upload']

/** The three build beats shown while the map populates. Deliberately paced so
 *  the visitor reads each one before the map is revealed. */
const BUILD_STEPS = [
  'Personalizing your learning map',
  'Populating your custom content',
  'Building the most effective learning paths',
]

/**
 * Intro flow: welcome → industry → training → optional content upload →
 * build. Light cards over the blurred learning map. No forms, no email,
 * every step skippable, auto-advances on tap. The uploaded file NEVER
 * leaves the browser — only its name themes the demo.
 */
export function IntroFlow({
  onDone,
}: {
  onDone: (answers: IntroAnswers | null) => void
}) {
  const [step, setStep] = useState<Step>('welcome')
  const [industry, setIndustry] = useState<string | null>(null)
  const [training, setTraining] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [stage, setStage] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [flagMessage, setFlagMessage] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  // Paced build: advance through the three steps (~1.2s each) so the visitor
  // reads them, hold on a "ready" beat, then reveal the map.
  useEffect(() => {
    if (step !== 'building') return
    const answers: IntroAnswers = {
      industry: industry ?? 'other',
      training: training ?? 'leadership',
      fileName,
    }
    if (stage < BUILD_STEPS.length) {
      const id = setTimeout(() => setStage(stage + 1), 1200)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => onDone(answers), 1500)
    return () => clearTimeout(id)
  }, [step, stage, fileName, industry, training, onDone])

  const skip = () => {
    // Entering the demo (even via skip) is the consent action — see the
    // fine-print disclaimer on the welcome card.
    grantConsent()
    track('intro_completed', { skipped: true })
    onDone(null)
  }

  // human-readable labels for analytics (so the dashboard shows words, not ids)
  const industryLabel = (id: string | null) => findIndustry(id)?.label ?? 'Unknown'
  const trainingLabel = (id: string | null) => findTraining(id)?.label ?? 'Unknown'

  const completeProps = (uploaded: boolean) => ({
    skipped: false,
    industry: industry ?? 'other',
    industry_label: industryLabel(industry),
    training: training ?? 'leadership',
    training_label: trainingLabel(training),
    uploaded_file: uploaded,
  })

  const acceptFile = (f: File | undefined | null) => {
    if (!f) return
    const fileType = f.name.split('.').pop()?.toLowerCase() ?? 'unknown'

    // Moderation guard — block explicit/malware uploads, allow legit training.
    const verdict = moderateUpload(f)
    if (!verdict.ok) {
      track('content_flagged', { category: verdict.category, file_type: fileType })
      setFlagMessage(verdict.message)
      setStep('flagged')
      return
    }

    setFileName(f.name)
    track('content_uploaded', { file_type: fileType, file_size_kb: Math.round(f.size / 1024) })
    track('intro_completed', completeProps(true))
    setStep('building')
  }

  const finishWithoutFile = () => {
    track('intro_completed', completeProps(false))
    setStep('building')
  }

  const card =
    'w-full max-w-lg rounded-2xl bg-panel p-8 shadow-[var(--shadow-overlay)] border border-line text-center'

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            className={card}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Skillwell Preview Demo
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink">
              Your industry. Your training. Adapted to your learners.
            </h2>
            <p className="mt-4 text-[15px] font-medium leading-relaxed text-ink">
              In under 5 minutes, you'll see how Skillwell creates unique training content, a
              live learning map, realistic simulations, and tracks the learner skills data
              behind it.
            </p>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-ink-soft">
              <svg viewBox="0 0 24 24" className="size-4 text-oasis" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              No Account or Card Needed
            </p>
            <button
              type="button"
              onClick={() => {
                // Starting the demo is the consent action (see the fine-print bar).
                grantConsent()
                track('intro_started', {})
                setStep('industry')
              }}
              className="mt-5 w-full rounded-btn bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
            >
              Personalize my demo
            </button>
            <button
              type="button"
              onClick={skip}
              className="mt-3 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
            >
              Skip to the example demo
            </button>
          </motion.div>
        )}

        {step === 'industry' && (
          <IndustryCard
            key="industry"
            cardClass={card}
            onPick={(id) => {
              track('intro_industry_selected', { industry: id, industry_label: industryLabel(id) })
              setIndustry(id)
              setStep('training')
            }}
            onSkip={skip}
          />
        )}

        {step === 'training' && (
          <QuestionCard
            key="training"
            cardClass={card}
            kicker="Question 2 of 2"
            question={
              industry === 'highered'
                ? 'Which course do you want to see?'
                : 'What kind of training do you want to see?'
            }
            subcopy={
              industry === 'highered'
                ? 'Common courses institutions run on Skillwell. Pick one to preview.'
                : 'If you can teach it, Skillwell can build and adapt it. These are just a few favorites.'
            }
            options={trainingsFor(industry).map((t) => ({ id: t.id, label: t.label }))}
            onPick={(id) => {
              track('intro_training_selected', { training: id, training_label: trainingLabel(id) })
              setTraining(id)
              setStep('upload')
            }}
            onSkip={skip}
          />
        )}

        {step === 'upload' && (
          <motion.div
            key="upload"
            className={card}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Optional, but this is the magic
            </p>
            <h2 className="mt-3 font-display text-xl font-bold tracking-tight text-ink">
              Have existing training content?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Drop in a training manual, a syllabus, or any course document.
              Skillwell automatically populates your learning map in a few clicks,
              using our skills taxonomy and AI-powered skills development system.
            </p>

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
              className={`mt-5 grid w-full place-items-center gap-1 rounded-lg border-2 border-dashed px-6 py-8 transition-colors ${
                dragOver
                  ? 'border-primary bg-primary-soft'
                  : 'border-line-strong bg-sunken/40 hover:border-primary hover:bg-primary-soft'
              }`}
            >
              <span className="grid size-10 place-items-center rounded-full bg-primary-soft text-primary">
                <Icon name="clipboard" className="size-5" />
              </span>
              <span className="mt-1 text-sm font-bold text-ink">
                Drop your document here or click to browse
              </span>
              <span className="text-xs text-ink-muted">
                Training manual · syllabus · course doc, and it stays in your browser, never uploaded
              </span>
            </button>

            <button
              type="button"
              onClick={finishWithoutFile}
              className="mt-4 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
            >
              No file handy? Build me a sample course
            </button>
          </motion.div>
        )}

        {step === 'flagged' && (
          <motion.div
            key="flagged"
            className={card}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-warning-soft text-warning">
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4m0 4h.01M10.3 3.86l-8.06 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.76-3.14l-8.06-14a2 2 0 0 0-3.4 0Z" />
              </svg>
            </div>
            <h2 className="mt-4 font-display text-xl font-bold tracking-tight text-ink">
              Let's use an example instead
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
              {flagMessage}
            </p>
            <button
              type="button"
              onClick={finishWithoutFile}
              className="mt-6 w-full rounded-btn bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
            >
              See an example learning map
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('upload')
                setTimeout(() => fileInput.current?.click(), 50)
              }}
              className="mt-3 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
            >
              Upload a different file
            </button>
          </motion.div>
        )}

        {step === 'building' && (
          <motion.div
            key="building"
            className={card}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {stage < BUILD_STEPS.length ? (
              <>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                  Building your demo
                </p>
                <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-ink">
                  Creating your personalized learning experience
                </h2>
                {fileName && (
                  <p className="mt-1 truncate text-sm text-ink-soft">From “{fileName}”</p>
                )}
                <ul className="mx-auto mt-6 flex max-w-xs flex-col gap-3.5 text-left">
                  {BUILD_STEPS.map((label, i) => {
                    const done = stage > i
                    const current = stage === i
                    return (
                      <li key={label} className="flex items-center gap-3">
                        <span
                          className={`grid size-6 shrink-0 place-items-center rounded-full transition-colors ${
                            done
                              ? 'bg-oasis text-white'
                              : current
                                ? 'bg-primary-soft text-primary'
                                : 'bg-sunken text-ink-muted'
                          }`}
                        >
                          {done ? (
                            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          ) : current ? (
                            <motion.span
                              className="size-3 rounded-full border-2 border-primary/30 border-t-primary"
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                            />
                          ) : (
                            <span className="size-1.5 rounded-full bg-current opacity-60" />
                          )}
                        </span>
                        <span
                          className={`text-sm font-medium transition-colors ${
                            done || current ? 'text-ink' : 'text-ink-muted'
                          }`}
                        >
                          {label}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.div
                  className="mx-auto grid size-14 place-items-center rounded-full bg-oasis text-white"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 15 }}
                >
                  <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </motion.div>
                <h2 className="mt-4 font-display text-xl font-bold tracking-tight text-ink">
                  Your personalized learning demo is ready
                </h2>
                <p className="mt-2 text-sm text-ink-soft">
                  Here is the adaptive map we built for you.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* progress dots */}
      {step !== 'building' && (
        <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`size-1.5 rounded-full transition-colors ${
                STEPS.indexOf(step) >= i ? 'bg-primary' : 'bg-line-strong'
              }`}
            />
          ))}
        </div>
      )}

      {/* Thin fine-print bar (Claude-notif style): consent on welcome, data
          handling on the upload step. Deliberately tiny and out of the way. */}
      {step === 'welcome' && (
        <FinePrintBar>
          By continuing you agree to cookies and session analytics that help us improve this
          preview. No personal account is created.
        </FinePrintBar>
      )}
      {step === 'upload' && (
        <FinePrintBar>
          Your file never leaves your browser. We don't use it to train our AI, and nothing is
          stored after this preview ends.
        </FinePrintBar>
      )}
    </div>
  )
}

/** Ultra-thin fine-print bar pinned to the bottom, styled after Claude's slim
 *  in-chat notifications. Non-blocking and unobtrusive. */
function FinePrintBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 border-t border-line bg-panel/90 px-4 py-2 backdrop-blur-sm">
      <p className="mx-auto max-w-2xl text-center text-[11px] leading-relaxed text-ink-muted">
        {children}
      </p>
    </div>
  )
}

function QuestionCard({
  cardClass,
  kicker,
  question,
  subcopy,
  options,
  onPick,
  onSkip,
}: {
  cardClass: string
  kicker: string
  question: string
  subcopy?: string
  options: { id: string; label: string }[]
  onPick: (id: string) => void
  onSkip: () => void
}) {
  return (
    <motion.div
      className={cardClass}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-primary">{kicker}</p>
      <h2 className="mt-3 font-display text-xl font-bold tracking-tight text-ink">
        {question}
      </h2>
      {subcopy && (
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">{subcopy}</p>
      )}
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onPick(o.id)}
            className="rounded-btn border border-line bg-panel px-4 py-3.5 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary-soft hover:text-primary"
          >
            {o.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="mt-4 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
      >
        Skip and just show me the map
      </button>
    </motion.div>
  )
}

/** Industry step — corporate grid, plus Higher Education set apart with a badge. */
function IndustryCard({
  cardClass,
  onPick,
  onSkip,
}: {
  cardClass: string
  onPick: (id: string) => void
  onSkip: () => void
}) {
  return (
    <motion.div
      className={cardClass}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-primary">Question 1 of 2</p>
      <h2 className="mt-3 font-display text-xl font-bold tracking-tight text-ink">
        What industry are you in?
      </h2>
      <p className="mt-2 text-xs leading-relaxed text-ink-muted">
        Skillwell powers learning in every industry. Pick yours and we'll build the demo around it.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {INDUSTRIES.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onPick(o.id)}
            className="rounded-btn border border-line bg-panel px-4 py-3.5 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary-soft hover:text-primary"
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Higher Ed — set apart as a distinct buyer, not a normal industry tile */}
      <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
        <span className="h-px flex-1 bg-line" />
        Academic institution?
        <span className="h-px flex-1 bg-line" />
      </div>
      <button
        type="button"
        onClick={() => onPick(HIGHER_ED_INDUSTRY.id)}
        className="mt-3 flex w-full items-center gap-3 rounded-btn border border-ocean/30 bg-ocean/5 px-4 py-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-ocean hover:bg-ocean/10"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ocean text-white">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10L12 5 2 10l10 5 10-5Z" />
            <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
          </svg>
        </span>
        <span className="flex-1">
          <span className="block text-sm font-bold text-ink">{HIGHER_ED_INDUSTRY.label}</span>
          <span className="block text-xs text-ink-muted">Colleges & online universities</span>
        </span>
        <span className="rounded-full bg-ocean/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ocean">
          Academic
        </span>
      </button>

      <button
        type="button"
        onClick={onSkip}
        className="mt-4 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
      >
        Skip and just show me the map
      </button>
    </motion.div>
  )
}
