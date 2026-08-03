import type { MapNode as MapNodeType } from '../lib/types'
import { Icon } from './Icon'

const NODE_SIZE = 64

/** The circular badge for a node, styled per state to match the product UI. */
function NodeCircle({ state, active }: { state: MapNodeType['state']; active: boolean }) {
  const base = 'grid size-full place-items-center rounded-full transition-transform duration-200'
  const scale = active ? 'scale-110' : 'group-hover:scale-105'

  if (state === 'completed') {
    return (
      <span className={`${base} ${scale} bg-node-complete text-white`}>
        <Icon name="check" className="size-7" strokeWidth={3} />
      </span>
    )
  }
  if (state === 'verified') {
    return (
      <span className={`${base} ${scale} bg-node-verified text-white`}>
        <Icon name="shield" className="size-6" strokeWidth={2.5} />
      </span>
    )
  }
  if (state === 'current') {
    return (
      <span
        className={`${base} ${scale} border-[3px] border-primary bg-white ${active ? 'ring-4 ring-primary/15' : ''}`}
      >
        <span className="size-4 rounded-full bg-primary" />
      </span>
    )
  }
  if (state === 'available') {
    return (
      <span className={`${base} ${scale} border-2 border-primary bg-white`}>
        <span className="size-2.5 rounded-full bg-primary/70" />
      </span>
    )
  }
  // locked
  return (
    <span className={`${base} ${scale} border-2 border-dashed border-node-locked bg-white text-node-locked`}>
      <Icon name="lock" className="size-6" strokeWidth={2} />
    </span>
  )
}

/**
 * A single map node. The BUTTON is sized to the circle and centered exactly
 * on node.position, so edges (which target node.position) hit the circle
 * center. The label hangs below via absolute positioning, so it never
 * shifts the circle's center.
 */
export function MapNode({
  node,
  active,
  onClick,
}: {
  node: MapNodeType
  active: boolean
  onClick: () => void
}) {
  const isLocked = node.state === 'locked'
  return (
    <button
      data-node
      type="button"
      onClick={onClick}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: NODE_SIZE,
        height: NODE_SIZE,
        transform: 'translate(-50%, -50%)',
      }}
      className="group absolute focus:outline-none"
      aria-label={`${node.title}, ${node.state}`}
    >
      <NodeCircle state={node.state} active={active} />

      {/* Label hangs below the circle; absolute so it doesn't move the center */}
      <span className="absolute left-1/2 top-full mt-2.5 flex w-max -translate-x-1/2 flex-col items-center">
        <span
          className={[
            'max-w-[150px] rounded-md border bg-panel px-2.5 py-1 text-center text-xs font-medium leading-tight shadow-[0_1px_2px_rgba(15,23,41,0.06)]',
            active ? 'border-primary text-ink' : 'border-line',
            isLocked ? 'text-ink-muted' : 'text-ink',
          ].join(' ')}
        >
          {node.title}
        </span>
        {node.state === 'current' && (
          <span className="mt-1 flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-white shadow-[0_1px_2px_rgba(15,23,41,0.1)]">
            <Icon name="target" className="size-3" strokeWidth={2.5} />
            Next step
          </span>
        )}
        {node.state === 'verified' && (
          <span className="mt-1 rounded-md bg-node-verified/10 px-2 py-0.5 text-[11px] font-semibold text-node-verified">
            Tested out
          </span>
        )}
      </span>
    </button>
  )
}
