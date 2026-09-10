import type { MapContent, NodeState } from './types'
import { personalize, findIndustry } from './personalize'
import rawMap from '../content/map.json'

const baseMap = rawMap as unknown as MapContent

/**
 * The onboarding PREVIEW map engine (desktop split-screen only).
 *
 * This is a purely VISUAL simulation: it re-themes and re-shapes the map on
 * every answer so the visitor sees it "adapt to them" while they personalize.
 * It does NOT drive the real product. Node titles come from the existing
 * personalize() engine; the shape (positions) and states are varied
 * deterministically per answer so each pick visibly reshapes the map. When a
 * real AI backend exists, this can be swapped for a live call without changing
 * the onboarding UX.
 */

const WORLD = { w: 1980, h: 640 }

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

const clampX = (x: number) => Math.max(90, Math.min(WORLD.w - 90, x))
const clampY = (y: number) => Math.max(70, Math.min(WORLD.h - 70, y))

/** Whole-map shape transforms, chosen per answer so the layout visibly changes. */
const SHAPES: ((x: number, y: number) => { x: number; y: number })[] = [
  (x, y) => ({ x, y }), // as authored
  (x, y) => ({ x, y: WORLD.h - y }), // vertical mirror
  (x, y) => ({ x, y: y + Math.sin(x / 260) * 110 }), // wave
  (x, y) => ({ x: 150 + (x - 150) * 0.8, y: y + ((Math.floor(x / 380) % 2) ? -70 : 70) }), // compress + zigzag
  (x, y) => ({ x, y: 320 + (y - 320) * 1.35 }), // vertical spread
]

/** Colorful state cycle so the map looks like a live, adaptive map. */
const STATES: NodeState[] = ['completed', 'verified', 'current', 'available', 'locked', 'locked', 'available']

/**
 * Build a preview map for the current (possibly partial) selections. Safe to
 * call with nulls — it fills sensible defaults so there is always a map to show.
 */
export function buildPreviewMap(
  industryId: string | null,
  trainingId: string | null,
): MapContent {
  const themed = personalize(baseMap, {
    industry: industryId ?? 'other',
    training: trainingId,
    fileName: null,
  })

  const seed = hash(`${industryId ?? '_'}|${trainingId ?? '_'}`)
  const shape = SHAPES[seed % SHAPES.length]

  const nodes = themed.nodes.map((n, i) => {
    const p = shape(n.position.x, n.position.y)
    const jx = (hash(`${n.id}:${seed}`) % 70) - 35
    const jy = (hash(`${n.id}.${seed}`) % 70) - 35
    return {
      ...n,
      position: { x: clampX(p.x + jx), y: clampY(p.y + jy) },
      state: STATES[(seed + i) % STATES.length],
    }
  })

  return { ...themed, nodes }
}

/** Human label for the current industry, for the "Adapting to X" flash. */
export function industryLabelFor(industryId: string | null): string {
  return findIndustry(industryId)?.label ?? 'your industry'
}
