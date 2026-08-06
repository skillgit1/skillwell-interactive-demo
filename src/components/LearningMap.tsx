import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { MapContent, MapNode } from '../lib/types'
import type { CheckQuestion } from '../lib/personalize'
import { usePanZoom } from '../lib/usePanZoom'
import { track } from '../lib/track'
import { MapNode as MapNodeView } from './MapNode'
import { NodePopover } from './NodePopover'
import { NodeOverlay } from './NodeOverlay'

const WORLD = { w: 1980, h: 640 }
const NODE_R = 34 // circle radius (32) + small gap

/** Straight connector between two nodes, trimmed to each circle's edge. */
function straightEdge(a: MapNode, b: MapNode) {
  const dx = b.position.x - a.position.x
  const dy = b.position.y - a.position.y
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  return {
    x1: a.position.x + ux * NODE_R,
    y1: a.position.y + uy * NODE_R,
    x2: b.position.x - ux * (NODE_R + 10),
    y2: b.position.y - uy * (NODE_R + 10),
  }
}

export function LearningMap({
  content,
  questions,
  onCheckComplete,
  training,
  openableIds,
  onNodeDone,
  showPopover = true,
}: {
  content: MapContent
  questions: CheckQuestion[]
  onCheckComplete: (verifiedTags: string[]) => void
  /** Chosen training id — selects the default lesson library. */
  training: string
  /** Ids of nodes the visitor may open (the guided showcase so far). */
  openableIds: string[]
  /** Signals a showcase node was finished, so the sequence advances. */
  onNodeDone: (nodeId: string) => void
  /** Gate the "suggested next step" popover until the map context is read. */
  showPopover?: boolean
}) {
  const { nodes } = content
  const byId = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes])
  const current = nodes.find((n) => n.state === 'current') ?? null

  const [openNode, setOpenNode] = useState<MapNode | null>(null)
  const { t, dragging, reset, zoomBy, handlers } = usePanZoom({ x: 26, y: 26, scale: 0.62 })

  const edges = useMemo(() => {
    const list: {
      id: string
      x1: number
      y1: number
      x2: number
      y2: number
      faded: boolean
    }[] = []
    for (const n of nodes) {
      for (const targetId of n.edges) {
        const target = byId[targetId]
        if (!target) continue
        // An edge reads as "traveled" (strong) only when its SOURCE node is
        // done — completed or tested out. Future or not-yet-started paths stay
        // faded, so an arrow never highlights out of a node you haven't finished.
        const traveled = n.state === 'completed' || n.state === 'verified'
        list.push({
          id: `${n.id}->${targetId}`,
          ...straightEdge(n, target),
          faded: !traveled,
        })
      }
    }
    return list
  }, [nodes, byId])

  function handleNodeClick(node: MapNode) {
    // Only the guided showcase nodes are openable; the rest are preview-only.
    if (!openableIds.includes(node.id)) return
    setOpenNode(node)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-[radial-gradient(circle_at_1px_1px,var(--color-line)_1px,transparent_0)] [background-size:22px_22px]">
      {/* Canvas */}
      <div
        className={`relative h-[540px] w-full touch-none select-none ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        {...handlers}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: WORLD.w,
            height: WORLD.h,
            transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`,
          }}
        >
          <svg
            width={WORLD.w}
            height={WORLD.h}
            className="absolute left-0 top-0 overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <marker
                id="arrow-strong"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0 0 L10 5 L0 10 z" fill="var(--color-edge-strong)" />
              </marker>
              <marker
                id="arrow-faded"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0 0 L10 5 L0 10 z" fill="var(--color-edge)" />
              </marker>
            </defs>
            {edges.map((e) => (
              <line
                key={e.id}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                strokeWidth={2}
                stroke={e.faded ? 'var(--color-edge)' : 'var(--color-edge-strong)'}
                markerEnd={`url(#${e.faded ? 'arrow-faded' : 'arrow-strong'})`}
              />
            ))}
          </svg>

          {nodes.map((n) => (
            <MapNodeView
              key={n.id}
              node={n}
              active={openNode?.id === n.id}
              onClick={() => handleNodeClick(n)}
            />
          ))}

          {current && showPopover && (
            <NodePopover node={current} onStart={() => handleNodeClick(current)} />
          )}
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col overflow-hidden rounded-lg border border-line bg-panel shadow-[var(--shadow-card)]">
        <ControlButton label="Zoom in" onClick={() => zoomBy(1.2)}>
          <path d="M12 5v14M5 12h14" />
        </ControlButton>
        <ControlButton label="Zoom out" onClick={() => zoomBy(1 / 1.2)} border>
          <path d="M5 12h14" />
        </ControlButton>
        <ControlButton label="Reset view" onClick={reset} border>
          <path d="M4 9V4h5M20 15v5h-5M20 9V4h-5M4 15v5h5" />
        </ControlButton>
      </div>

      {/* Legend */}
      <div className="absolute left-4 top-4 flex items-center gap-4 rounded-lg border border-line bg-panel/90 px-3 py-2 text-xs text-ink-soft backdrop-blur">
        <Legend color="bg-node-complete" label="Completed" />
        <Legend color="bg-node-verified" label="Tested out" />
        <Legend color="bg-primary" label="In progress" />
        <Legend color="bg-node-locked" label="Locked" />
      </div>

      <NodeOverlay
        node={openNode}
        onClose={() => setOpenNode(null)}
        questions={questions}
        onCheckComplete={onCheckComplete}
        onNodeDone={onNodeDone}
        training={training}
        company={content.scenario.company}
      />
    </div>
  )
}

function ControlButton({
  children,
  label,
  onClick,
  border,
}: {
  children: ReactNode
  label: string
  onClick: () => void
  border?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`grid size-9 place-items-center text-ink-soft transition-colors hover:bg-sunken hover:text-ink ${
        border ? 'border-t border-line' : ''
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-2.5 rounded-full ${color}`} />
      {label}
    </span>
  )
}
