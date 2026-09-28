import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import type { MapContent, MapNode } from '../lib/types'
import { usePanZoom } from '../lib/usePanZoom'
import { MapNode as MapNodeView } from './MapNode'

const WORLD = { w: 1980, h: 640 }
const NODE_R = 34

/** Straight connector trimmed to each circle's edge (mirrors LearningMap). */
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

/**
 * The onboarding PREVIEW map (desktop split-screen only). Shows the same map
 * visuals as the real product, pans/zooms, and visibly re-shapes with a
 * pulse + shimmer whenever `content` changes (a new answer). It is NOT
 * interactive: clicking a node calls onBlockedInteract() so the visitor is
 * nudged to finish personalizing first. The real, clickable map only appears
 * after onboarding completes.
 */
export function PreviewMap({
  content,
  adaptingLabel,
  onBlockedInteract,
  initialTransform = { x: 40, y: 40, scale: 0.6 },
}: {
  content: MapContent
  /** "Adapting to Healthcare…" flash shown briefly after each answer. */
  adaptingLabel: string | null
  /** Fired when the visitor tries to click a node before finishing onboarding. */
  onBlockedInteract: () => void
  /** Starting pan/zoom. Small screens use a lower scale so more of the map (and
   *  its adaptation) is visible in a short preview. */
  initialTransform?: { x: number; y: number; scale: number }
}) {
  const { nodes } = content
  const byId = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes])
  const canvasRef = useRef<HTMLDivElement>(null)
  const { t, dragging, handlers } = usePanZoom(initialTransform, WORLD)

  const controls = useAnimationControls()
  const [sweep, setSweep] = useState(0)

  // Pulse the map + replay the shimmer sweep every time the content changes.
  useEffect(() => {
    controls.start({
      opacity: [0.3, 1],
      filter: ['blur(5px)', 'blur(0px)'],
      transition: { duration: 0.55, ease: 'easeOut' },
    })
    setSweep((s) => s + 1)
  }, [content, controls])

  const edges = useMemo(() => {
    const list: { id: string; x1: number; y1: number; x2: number; y2: number }[] = []
    for (const n of nodes) {
      for (const targetId of n.edges) {
        const target = byId[targetId]
        if (!target) continue
        list.push({ id: `${n.id}->${targetId}`, ...straightEdge(n, target) })
      }
    }
    return list
  }, [nodes, byId])

  return (
    <div className="relative h-full overflow-hidden bg-[radial-gradient(circle_at_1px_1px,var(--color-line)_1px,transparent_0)] [background-size:22px_22px]">
      <div
        ref={canvasRef}
        className={`relative h-full w-full touch-none select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        {...handlers}
      >
        <motion.div animate={controls} className="absolute inset-0">
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              width: WORLD.w,
              height: WORLD.h,
              transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`,
            }}
          >
            <svg width={WORLD.w} height={WORLD.h} className="absolute left-0 top-0 overflow-visible" aria-hidden="true">
              <defs>
                <marker id="preview-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0 0 L10 5 L0 10 z" fill="var(--color-edge)" />
                </marker>
              </defs>
              {edges.map((e) => (
                <line key={e.id} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} strokeWidth={2} stroke="var(--color-edge)" markerEnd="url(#preview-arrow)" />
              ))}
            </svg>

            {nodes.map((n) => (
              <MapNodeView key={n.id} node={n} active={false} onClick={onBlockedInteract} />
            ))}
          </div>
        </motion.div>

        {/* Shimmer sweep, replayed on each adapt */}
        <motion.div
          key={sweep}
          className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          initial={{ x: '-40%', opacity: 0.9 }}
          animate={{ x: '340%', opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>

      {/* "Adapting to X" flash */}
      <AnimatePresence>
        {adaptingLabel && (
          <motion.div
            key={adaptingLabel}
            className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-card)]"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <span className="mr-2 inline-block size-2 animate-pulse rounded-full bg-oasis align-middle" />
            {adaptingLabel}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute left-4 top-4 flex items-center gap-4 rounded-lg border border-line bg-panel/90 px-3 py-2 text-xs text-ink-soft backdrop-blur">
        <Legend color="bg-node-complete" label="Completed" />
        <Legend color="bg-node-verified" label="Tested out" />
        <Legend color="bg-primary" label="In progress" />
        <Legend color="bg-node-locked" label="Locked" />
      </div>

      {/* Preview watermark */}
      <div className="pointer-events-none absolute bottom-4 right-4 rounded-full border border-line bg-panel/90 px-3 py-1.5 text-xs font-semibold text-ink-muted backdrop-blur">
        Live preview
      </div>
    </div>
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
