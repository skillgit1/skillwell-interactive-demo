import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { MapNode } from '../lib/types'
import type { CheckQuestion } from '../lib/personalize'
import { track } from '../lib/track'
import { getLesson, type NodeLesson } from '../lib/lessons'
import { Icon } from './Icon'
import { KnowledgeCheck } from './KnowledgeCheck'
import { LessonContent } from './LessonContent'
import { NodeSim } from './NodeSim'

const TYPE_LABEL: Record<MapNode['type'], string> = {
  check: 'Knowledge check',
  content: 'Learning activity',
  sim: 'Simulation',
  report: 'Skills dashboard',
  usecase: 'Use case',
  cta: 'Next step',
}

/**
 * Overlay shell that opens when a node is clicked. Phase 1 shows a
 * type-specific placeholder; Phase 2 swaps in the real node experiences
 * (sim embed, reporting dashboard, etc.). Fires node_opened / node_closed.
 */
export function NodeOverlay({
  node,
  onClose,
  questions,
  onCheckComplete,
  onNodeDone,
  training,
  company,
  knownTags,
}: {
  node: MapNode | null
  onClose: () => void
  /** Knowledge-check questions for the visitor's chosen training type. */
  questions: CheckQuestion[]
  /** Fired when the knowledge check finishes; caller adapts the map. */
  onCheckComplete: (verifiedTags: string[]) => void
  /** Fired when a sim/text showcase node is finished; advances the sequence. */
  onNodeDone: (nodeId: string) => void
  /** Chosen training id — selects the default lesson library. */
  training: string
  /** Personalized company name for {company} interpolation. */
  company: string
  /** Skills answered correctly in the check — their lesson quiz is skipped so a
   *  correctly-answered question never repeats inside a lesson. */
  knownTags: string[]
}) {
  const openedAt = useRef<number>(0)
  // On touch devices a tap fires a synthesized "ghost" click ~300ms later at the
  // same screen point. The control that opened this overlay (e.g. the popover's
  // Start button) often sits where the backdrop now is, so that ghost click would
  // instantly dismiss the overlay. Ignore backdrop clicks until it settles.
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!node) return
    openedAt.current = performance.now()
    setArmed(false)
    const armId = setTimeout(() => setArmed(true), 400)
    track('node_opened', {
      node_id: node.id,
      node_type: node.type,
      stage: node.stage,
    })
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(armId)
      window.removeEventListener('keydown', onKey)
    }
  }, [node, onClose])

  const close = () => {
    if (node) {
      track('node_closed', {
        node_id: node.id,
        node_type: node.type,
        dwell_s: Math.round((performance.now() - openedAt.current) / 1000),
      })
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          className="fixed inset-0 z-30 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-navy-deep/40 backdrop-blur-sm"
            onClick={() => armed && close()}
          />
          <motion.div
            className={`relative z-10 flex max-h-[88vh] w-full flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-[var(--shadow-overlay)] ${
              node.type === 'content' ? 'max-w-3xl' : 'max-w-2xl'
            }`}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary">
                  <Icon name={node.icon} className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    {TYPE_LABEL[node.type]}
                  </p>
                  <h2 className="font-display text-lg font-semibold text-ink">
                    {node.title}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-sunken hover:text-ink"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>

            {node.type === 'content' ? (
              // full-bleed: LessonContent owns its own rail, scroll, and footer
              <LessonContent
                lesson={applyKnown(
                  getLesson(training, node.id, company, node.title),
                  node.skillTags,
                  knownTags,
                )}
                onNext={() => {
                  onNodeDone(node.id)
                  close()
                }}
              />
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {node.type === 'check' && node.state !== 'completed' ? (
                  <KnowledgeCheck
                    questions={questions}
                    onFinish={(tags) => {
                      onCheckComplete(tags)
                      onClose()
                    }}
                  />
                ) : node.type === 'check' ? (
                  <div className="grid place-items-center rounded-xl bg-node-complete/10 py-12 text-center">
                    <p className="text-sm font-semibold text-node-complete">
                      Knowledge check complete. Your path has been adapted.
                    </p>
                  </div>
                ) : node.type === 'sim' ? (
                  <NodeSim
                    node={node}
                    training={training}
                    onOpened={() => {
                      onNodeDone(node.id)
                      close()
                    }}
                  />
                ) : node.type === 'cta' ? (
                  <div className="text-center">
                    <p className="text-[15px] leading-relaxed text-ink-soft">{node.blurb}</p>
                    <button
                      type="button"
                      onClick={() => track('cta_clicked', { cta_id: 'node_book_demo' })}
                      className="mt-5 rounded-btn bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
                    >
                      Book a Full Demo
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm leading-relaxed text-ink-soft">{node.blurb}</p>
                    <div className="mt-6 grid place-items-center rounded-xl border border-dashed border-line-strong bg-sunken/50 py-16 text-center">
                      <p className="text-sm font-medium text-ink-muted">
                        {TYPE_LABEL[node.type]} experience builds here next
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Drop a lesson's embedded quiz when the learner already answered this skill's
 *  question correctly in the Determine Knowledge check, so no question repeats. */
function applyKnown(lesson: NodeLesson, skillTags: string[], knownTags: string[]): NodeLesson {
  return skillTags.some((t) => knownTags.includes(t)) ? { ...lesson, quiz: undefined } : lesson
}
