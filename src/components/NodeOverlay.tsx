import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { MapNode } from '../lib/types'
import type { CheckQuestion } from '../lib/personalize'
import { track } from '../lib/track'
import { Icon } from './Icon'
import { KnowledgeCheck } from './KnowledgeCheck'

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
}: {
  node: MapNode | null
  onClose: () => void
  /** Knowledge-check questions for the visitor's chosen training type. */
  questions: CheckQuestion[]
  /** Fired when the knowledge check finishes; caller adapts the map. */
  onCheckComplete: (verifiedTags: string[]) => void
}) {
  const openedAt = useRef<number>(0)

  useEffect(() => {
    if (!node) return
    openedAt.current = performance.now()
    track('node_opened', {
      node_id: node.id,
      node_type: node.type,
      stage: node.stage,
    })
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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
            onClick={close}
          />
          <motion.div
            className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-[var(--shadow-overlay)]"
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
                    Knowledge check complete — your path has been adapted.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm leading-relaxed text-ink-soft">{node.blurb}</p>
                  <div className="mt-6 grid place-items-center rounded-xl border border-dashed border-line-strong bg-sunken/50 py-16 text-center">
                    <p className="text-sm font-medium text-ink-muted">
                      {TYPE_LABEL[node.type]} experience builds here in Phase 2
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
