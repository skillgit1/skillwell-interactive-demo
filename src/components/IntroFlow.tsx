import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { INDUSTRIES, TRAININGS } from '../lib/personalize'
import type { IntroAnswers } from '../lib/personalize'
import { track } from '../lib/track'
import { Icon } from './Icon'

type Step = 'welcome' | 'industry' | 'training' | 'upload' | 'building'

const STEPS: Step[] = ['welcome', 'industry', 'training', 'upload']

/** Staged "AI processing" beats shown while building from an uploaded doc. */
const FILE_STAGES = [
  'Reading your document…',
  'Extracting skills with the Skillwell taxonomy…',
  'Mapping skills to adaptive learning activities…',
  'Assembling your learning map…',
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
  const fileInput = useRef<HTMLInputElement>(null)

  // Build beat: staged messages when a file was provided, quick otherwise.
  useEffect(() => {
    if (step !== 'building') return
    const answers: IntroAnswers = {
      industry: industry ?? 'other',
      training: training ?? 'leadership',
      fileName,
    }
    if (!fileName) {
      const id = setTimeout(() => onDone(answers), 1700)
      return () => clearTimeout(id)
    }
    if (stage < FILE_STAGES.length - 1) {
      const id = setTimeout(() => setStage(stage + 1), 1000)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => onDone(answers), 1100)
    return () => clearTimeout(id)
  }, [step, stage, fileName, industry, training, onDone])

  const skip = () => {
    track('assessment_completed', { skipped: true })
    onDone(null)
  }

  const acceptFile = (f: File | undefined | null) => {
    if (!f) return
    setFileName(f.name)
    track('content_uploaded', {
      ext: f.name.split('.').pop()?.toLowerCase() ?? 'unknown',
      size_kb: Math.round(f.size / 1024),
    })
    track('assessment_completed', {
      industry: industry ?? 'other',
      training: training ?? 'leadership',
      has_file: true,
      skipped: false,
    })
    setStep('building')
  }

  const finishWithoutFile = () => {
    track('assessment_completed', {
      industry: industry ?? 'other',
      training: training ?? 'leadership',
      has_file: false,
      skipped: false,
    })
    setStep('building')
  }

  const card =
    'w-full max-w-lg rounded-2xl bg-panel p-8 shadow-[var(--shadow-overlay)] border border-line text-center'

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
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
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Skillwell demo experience
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink">
              Any industry. Any training. Adapted to every learner.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              In under 5 minutes you'll experience a live learning map, open a
              simulation, and see the skills data behind it. No login, no forms.
            </p>
            <p className="mt-2 text-sm font-medium text-ink">
              Tell us what to build — two quick taps.
            </p>
            <button
              type="button"
              onClick={() => {
                track('assessment_started', {})
                setStep('industry')
              }}
              className="mt-6 w-full rounded-btn bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
            >
              Personalize my demo
            </button>
            <button
              type="button"
              onClick={skip}
              className="mt-3 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
            >
              Skip — just show me the map
            </button>
          </motion.div>
        )}

        {step === 'industry' && (
          <QuestionCard
            key="industry"
            cardClass={card}
            kicker="Question 1 of 2"
            question="What industry are you in?"
            subcopy="Skillwell powers learning in every industry — pick yours and we'll build the demo around it."
            options={INDUSTRIES.map((i) => ({ id: i.id, label: i.label }))}
            onPick={(id) => {
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
            question="What kind of training do you want to see?"
            subcopy="If you can teach it, Skillwell can build and adapt it — these are just four favorites."
            options={TRAININGS.map((t) => ({ id: t.id, label: t.label }))}
            onPick={(id) => {
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
              Optional — but this is the magic
            </p>
            <h2 className="mt-3 font-display text-xl font-bold tracking-tight text-ink">
              Have existing training content?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Drop in a training manual, a syllabus, or any course document.
              Skillwell automatically populates your learning map in a few clicks —
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
                Training manual · syllabus · course doc — stays in your browser, never uploaded
              </span>
            </button>

            <button
              type="button"
              onClick={finishWithoutFile}
              className="mt-4 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
            >
              No file handy — build me a sample course
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
            <div className="mx-auto grid size-12 place-items-center">
              <motion.span
                className="size-10 rounded-full border-[3px] border-primary-soft border-t-primary"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
              />
            </div>
            {fileName ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={stage}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 font-display text-xl font-bold tracking-tight text-ink"
                  >
                    {FILE_STAGES[stage]}
                  </motion.h2>
                </AnimatePresence>
                <p className="mt-2 truncate text-sm text-ink-soft">{fileName}</p>
                <div className="mx-auto mt-4 flex max-w-[200px] gap-1.5">
                  {FILE_STAGES.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= stage ? 'bg-primary' : 'bg-sunken'
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="mt-4 font-display text-xl font-bold tracking-tight text-ink">
                  Building your learning map…
                </h2>
                <p className="mt-2 text-sm text-ink-soft">
                  In the real product, your team builds these in minutes — this one's on us.
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* progress dots */}
      {step !== 'building' && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-1.5">
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
        Skip — just show me the map
      </button>
    </motion.div>
  )
}
