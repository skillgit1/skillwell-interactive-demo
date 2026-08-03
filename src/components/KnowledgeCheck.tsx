import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { CheckQuestion } from '../lib/personalize'
import { track } from '../lib/track'
import { Icon } from './Icon'

/**
 * The "Determine Knowledge" experience inside the check node overlay.
 * 3 tap-through questions with instant right/wrong feedback, then a
 * result screen. Correct answers verify the matching skill nodes —
 * the caller adapts the map via onFinish(verifiedTags).
 */
export function KnowledgeCheck({
  questions,
  onFinish,
}: {
  questions: CheckQuestion[]
  onFinish: (verifiedTags: string[]) => void
}) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correctTags, setCorrectTags] = useState<string[]>([])
  const [done, setDone] = useState(false)

  useEffect(() => {
    track('knowledge_check_started', { questions: questions.length })
  }, [questions.length])

  const q = questions[index]

  const pick = (optIndex: number) => {
    if (picked !== null) return
    const correct = Boolean(q.options[optIndex].correct)
    setPicked(optIndex)
    track('knowledge_check_answered', { question_index: index, correct })
    if (correct) setCorrectTags((tags) => [...tags, q.skillTag])

    // brief feedback beat, then advance
    setTimeout(() => {
      setPicked(null)
      if (index + 1 < questions.length) {
        setIndex(index + 1)
      } else {
        const finalTags = correct ? [...correctTags, q.skillTag] : correctTags
        track('knowledge_check_completed', {
          correct_count: finalTags.length,
          total: questions.length,
        })
        setCorrectTags(finalTags)
        setDone(true)
      }
    }, 900)
  }

  if (done) {
    const n = correctTags.length
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-node-verified/10 text-node-verified">
          <Icon name="shield" className="size-7" strokeWidth={2.5} />
        </div>
        <h3 className="mt-4 font-display text-xl font-bold text-ink">
          {n === questions.length
            ? 'You knew all of it.'
            : n > 0
              ? `You already know ${n} of ${questions.length} skills.`
              : "Great. Now we know where to start."}
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
          {n > 0
            ? `Skillwell verified ${n} ${n === 1 ? 'skill' : 'skills'} and is adapting your path, so you'll skip what you've already mastered.`
            : 'Skillwell kept your full path so you can build these skills from the ground up, and it keeps adapting as you learn.'}
        </p>
        <button
          type="button"
          onClick={() => onFinish(correctTags)}
          className="mt-5 rounded-btn bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
        >
          See your adapted path
        </button>
      </motion.div>
    )
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-primary">
        Question {index + 1} of {questions.length}
      </p>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <h3 className="mt-3 font-display text-lg font-bold leading-snug text-ink">
            {q.q}
          </h3>
          <div className="mt-4 flex flex-col gap-2.5">
            {q.options.map((o, i) => {
              const isPicked = picked === i
              const showState = picked !== null
              const stateClass = !showState
                ? 'border-line bg-panel hover:border-primary hover:bg-primary-soft'
                : o.correct
                  ? 'border-node-complete bg-node-complete/10 text-ink'
                  : isPicked
                    ? 'border-danger bg-danger/5 text-ink-muted'
                    : 'border-line bg-panel opacity-60'
              return (
                <button
                  key={o.label}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => pick(i)}
                  className={`flex items-center justify-between rounded-btn border px-4 py-3 text-left text-sm font-semibold text-ink transition-all ${stateClass}`}
                >
                  {o.label}
                  {showState && o.correct && (
                    <Icon name="check" className="size-4 text-node-complete" strokeWidth={3} />
                  )}
                </button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="mt-5 flex gap-1.5">
        {questions.map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= index ? 'bg-primary' : 'bg-sunken'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
