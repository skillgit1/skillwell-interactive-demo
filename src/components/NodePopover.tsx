import type { MapNode } from '../lib/types'
import { Icon } from './Icon'

/**
 * "Your suggested next step" card — solid Skillwell blue with a white
 * Start button, anchored beside the current node. Opens to the left of
 * the node by default; flips to the right when the node is near the
 * left edge of the world (e.g. the Determine Knowledge entry node).
 */
export function NodePopover({
  node,
  onStart,
}: {
  node: MapNode
  onStart: () => void
}) {
  const side: 'left' | 'right' = node.position.x < 460 ? 'right' : 'left'

  return (
    <div
      data-nodrag
      style={
        side === 'left'
          ? {
              left: node.position.x - 70,
              top: node.position.y,
              transform: 'translate(-100%, -50%)',
            }
          : {
              left: node.position.x + 70,
              top: node.position.y,
              transform: 'translate(0, -50%)',
            }
      }
      className="absolute w-72 rounded-2xl bg-suggest p-5 text-left text-white shadow-[var(--shadow-overlay)]"
    >
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/40 px-2.5 py-1 text-xs font-semibold">
        <Icon name="target" className="size-3.5" strokeWidth={2.5} />
        Your suggested next step
      </span>

      <h3 className="mt-3 font-display text-xl font-bold leading-tight">{node.title}</h3>

      <div className="mt-2 flex items-center gap-1.5 text-sm text-white/85">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
        <span>{node.estMinutes} min</span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-white/90">{node.blurb}</p>

      <button
        type="button"
        onClick={onStart}
        className="mt-4 w-full rounded-btn bg-white px-4 py-3 text-sm font-bold text-suggest transition-colors hover:bg-white/90"
      >
        Start
      </button>

      {/* pointer aimed at the node */}
      <span
        className={`absolute top-1/2 size-4 -translate-y-1/2 rotate-45 bg-suggest ${
          side === 'left' ? '-right-2' : '-left-2'
        }`}
      />
    </div>
  )
}
