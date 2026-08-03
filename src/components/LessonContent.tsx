import { useMemo, useState } from 'react'
import type { ContentBlock, NodeLesson } from '../lib/lessons'
import { Icon } from './Icon'

type Part = 'content' | 'check' | 'review'
const PART_LABEL: Record<Part, string> = {
  content: 'Learning Content',
  check: 'Knowledge Check',
  review: 'Review',
}

/**
 * A node's learning experience as a multi-step flow — Learning Content →
 * Knowledge Check → Review — driven by the left rail and the Next button,
 * styled to match the Skillwell platform. All inside the popup.
 */
export function LessonContent({
  lesson,
  onNext,
}: {
  lesson: NodeLesson
  onNext: () => void
}) {
  const parts = useMemo<Part[]>(
    () => ['content', ...(lesson.quiz ? (['check'] as Part[]) : []), 'review'],
    [lesson.quiz],
  )
  const [idx, setIdx] = useState(0)
  const [maxReached, setMaxReached] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const part = parts[idx]
  const isLast = idx === parts.length - 1
  const nextDisabled = part === 'check' && !submitted

  const goTo = (i: number) => {
    if (i <= maxReached) setIdx(i)
  }
  const handleNext = () => {
    if (isLast) return onNext()
    const n = idx + 1
    setIdx(n)
    setMaxReached((m) => Math.max(m, n))
  }

  return (
    <div className="flex min-h-0 w-full flex-1 overflow-hidden">
      {/* Contents rail */}
      <aside className="hidden w-44 shrink-0 flex-col gap-1.5 border-r border-line bg-sunken/30 p-3 sm:flex">
        {parts.map((p, i) => {
          const active = i === idx
          const done = i < maxReached
          return (
            <button
              key={p}
              type="button"
              onClick={() => goTo(i)}
              disabled={i > maxReached}
              className={`flex items-center gap-2 rounded-md border-l-2 px-3 py-2 text-left text-xs font-semibold transition-colors ${
                active
                  ? 'border-l-primary bg-primary-soft text-primary'
                  : done
                    ? 'border-l-transparent text-ink hover:bg-sunken'
                    : 'border-l-transparent text-ink-muted'
              }`}
            >
              {done && !active ? (
                <span className="grid size-4 shrink-0 place-items-center rounded-full bg-node-complete text-white">
                  <Icon name="check" className="size-2.5" strokeWidth={3} />
                </span>
              ) : (
                <span className="grid size-4 shrink-0 place-items-center rounded-full border border-current text-[9px]">
                  {i + 1}
                </span>
              )}
              {PART_LABEL[p]}
            </button>
          )
        })}
      </aside>

      {/* Main column */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Progress bar */}
        <div className="h-1 w-full bg-sunken">
          <span
            className="block h-full bg-primary transition-all duration-300"
            style={{ width: `${((idx + 1) / parts.length) * 100}%` }}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {part === 'content' && <ContentView lesson={lesson} />}
          {part === 'check' && lesson.quiz && (
            <QuizView
              quiz={lesson.quiz}
              picked={picked}
              submitted={submitted}
              onPick={setPicked}
              onSubmit={() => setSubmitted(true)}
            />
          )}
          {part === 'review' && <ReviewView lesson={lesson} />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line px-6 py-3">
          <span className="text-xs text-ink-muted">
            {PART_LABEL[part]} · {idx + 1} of {parts.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            disabled={nextDisabled}
            className="rounded-btn bg-primary px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLast ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ parts */

function ContentView({ lesson }: { lesson: NodeLesson }) {
  return (
    <>
      <h3 className="font-display text-xl font-bold tracking-tight text-ink">
        {lesson.headline}
      </h3>
      <p className="mt-1 text-sm font-medium text-primary">{lesson.subheadline}</p>
      <div className="mt-4 text-[15px] leading-relaxed text-ink-soft">
        {lesson.blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>
    </>
  )
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'intro':
      return <p className="mb-4">{block.text}</p>
    case 'objectives':
      return (
        <div className="mb-5 rounded-lg border border-line bg-sunken/40 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
            By the end you'll be able to
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {block.items.map((item, j) => (
              <li key={j} className="flex items-start gap-2.5 text-sm text-ink">
                <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-primary text-white">
                  <Icon name="check" className="size-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )
    case 'keypoints':
      return (
        <div className="mb-2">
          {block.items.map((pt, j) => (
            <div key={j} className="mb-4">
              <h4 className="font-display text-base font-bold text-ink">{pt.title}</h4>
              <p className="mt-1">{pt.text}</p>
            </div>
          ))}
        </div>
      )
    case 'callout': {
      const tip = block.variant === 'tip'
      return (
        <div
          className={`mb-5 flex gap-3 rounded-lg border-l-4 p-4 ${
            tip ? 'border-l-primary bg-primary-soft' : 'border-l-warning bg-warning-soft'
          }`}
        >
          <span className={tip ? 'text-primary' : 'text-warning'}>
            <Icon name={tip ? 'lightbulb' : 'flag'} className="size-5" />
          </span>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wide ${tip ? 'text-primary' : 'text-warning'}`}>
              {tip ? 'Tip' : 'Important'}
            </p>
            <p className="mt-0.5 text-sm leading-relaxed text-ink">{block.text}</p>
          </div>
        </div>
      )
    }
    case 'takeaway':
      return (
        <div className="mb-2 rounded-lg bg-navy p-4 text-white">
          <p className="text-xs font-bold uppercase tracking-wide text-white/70">Key takeaway</p>
          <p className="mt-1 text-sm font-medium leading-relaxed">{block.text}</p>
        </div>
      )
    default:
      return null
  }
}

function QuizView({
  quiz,
  picked,
  submitted,
  onPick,
  onSubmit,
}: {
  quiz: NonNullable<NodeLesson['quiz']>
  picked: number | null
  submitted: boolean
  onPick: (i: number) => void
  onSubmit: () => void
}) {
  const correct = picked !== null && quiz.options[picked]?.correct
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-primary">Knowledge check</p>
      <h3 className="mt-2 font-display text-lg font-bold leading-snug text-ink">{quiz.question}</h3>
      <div className="mt-4 flex flex-col gap-2.5">
        {quiz.options.map((o, i) => {
          const chosen = picked === i
          const state = !submitted
            ? chosen
              ? 'border-primary bg-primary-soft text-primary'
              : 'border-line bg-panel hover:border-primary'
            : o.correct
              ? 'border-node-complete bg-node-complete/10 text-ink'
              : chosen
                ? 'border-danger bg-danger/5 text-ink-muted'
                : 'border-line bg-panel opacity-60'
          return (
            <button
              key={o.label}
              type="button"
              disabled={submitted}
              onClick={() => onPick(i)}
              className={`flex items-center justify-between rounded-btn border px-4 py-3 text-left text-sm font-semibold text-ink transition-all ${state}`}
            >
              {o.label}
              {submitted && o.correct && (
                <Icon name="check" className="size-4 text-node-complete" strokeWidth={3} />
              )}
            </button>
          )
        })}
      </div>

      {!submitted ? (
        <button
          type="button"
          disabled={picked === null}
          onClick={onSubmit}
          className="mt-4 rounded-btn bg-navy px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-40"
        >
          Submit answer
        </button>
      ) : (
        <div
          className={`mt-4 rounded-lg p-3 text-sm font-medium ${
            correct ? 'bg-node-complete/10 text-node-complete' : 'bg-warning-soft text-warning'
          }`}
        >
          {correct ? 'Correct. Nicely done.' : 'Not quite. The right answer is highlighted above.'}
        </div>
      )}
    </div>
  )
}

function ReviewView({ lesson }: { lesson: NodeLesson }) {
  const keypoints = lesson.blocks.find((b) => b.type === 'keypoints')
  const takeaway = lesson.blocks.find((b) => b.type === 'takeaway')
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-primary">Review</p>
      <h3 className="mt-2 font-display text-lg font-bold text-ink">Quick recap</h3>
      {keypoints && keypoints.type === 'keypoints' && (
        <ul className="mt-4 flex flex-col gap-3">
          {keypoints.items.map((pt, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                <Icon name="check" className="size-3" strokeWidth={3} />
              </span>
              <span className="text-sm text-ink">
                <span className="font-bold">{pt.title}.</span>{' '}
                <span className="text-ink-soft">{pt.text}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {takeaway && takeaway.type === 'takeaway' && (
        <div className="mt-5 rounded-lg bg-navy p-4 text-white">
          <p className="text-xs font-bold uppercase tracking-wide text-white/70">Key takeaway</p>
          <p className="mt-1 text-sm font-medium leading-relaxed">{takeaway.text}</p>
        </div>
      )}
      <p className="mt-5 text-sm text-ink-soft">
        That completes this activity. Click <span className="font-semibold text-ink">Finish</span> to
        return to your learning map.
      </p>
    </div>
  )
}
