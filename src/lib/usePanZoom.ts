import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react'

export interface Transform {
  x: number
  y: number
  scale: number
}

const MIN_SCALE = 0.4
const MAX_SCALE = 1.6
/** How far past the world edge a gesture may push the map (keeps it in view). */
const PAD = 80

/**
 * Pan/zoom for the learning-map canvas, built for touch first:
 *  - one finger (or mouse drag) pans
 *  - two fingers pinch to zoom toward the pinch midpoint
 *  - wheel / trackpad zooms toward the cursor
 *  - zoomBy / reset drive the on-screen controls
 *
 * The translate is clamped so the map can never be flung fully off-screen
 * (which previously looked like a blank/white canvas on multi-touch).
 * The canvas must set `touch-action: none` so the browser hands us the touches.
 */
export function usePanZoom(initial: Transform, world = { w: 1980, h: 640 }) {
  const [t, setT] = useState<Transform>(initial)
  const [dragging, setDragging] = useState(false)
  const tRef = useRef(t)
  tRef.current = t

  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pan = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)
  const pinch = useRef<{ dist: number; scale: number; wx: number; wy: number } | null>(null)
  const rect = useRef<{ left: number; top: number; width: number; height: number } | null>(null)

  const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))

  const clampAxis = (val: number, view: number, span: number) => {
    if (span <= view) return (view - span) / 2 // world narrower than view → center it
    return Math.min(PAD, Math.max(view - span - PAD, val))
  }
  const clampXY = (x: number, y: number, scale: number) => {
    const r = rect.current
    if (!r) return { x, y }
    return {
      x: clampAxis(x, r.width, world.w * scale),
      y: clampAxis(y, r.height, world.h * scale),
    }
  }

  const startPinch = () => {
    const pts = [...pointers.current.values()]
    const r = rect.current
    if (pts.length < 2 || !r) return
    const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1
    const midX = (pts[0].x + pts[1].x) / 2 - r.left
    const midY = (pts[0].y + pts[1].y) / 2 - r.top
    const cur = tRef.current
    pinch.current = {
      dist,
      scale: cur.scale,
      wx: (midX - cur.x) / cur.scale, // world point under the pinch midpoint
      wy: (midY - cur.y) / cur.scale,
    }
    pan.current = null
    setDragging(true)
  }

  const onPointerDown = (e: ReactPointerEvent) => {
    const el = e.currentTarget as HTMLElement
    rect.current = el.getBoundingClientRect()
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size >= 2) {
      startPinch()
      return
    }
    // A tap that lands on a node/popover should open it, not start a pan.
    if ((e.target as HTMLElement).closest('[data-node],[data-nodrag]')) {
      pan.current = null
      return
    }
    el.setPointerCapture?.(e.pointerId)
    pan.current = { x: e.clientX, y: e.clientY, tx: tRef.current.x, ty: tRef.current.y }
    setDragging(true)
  }

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointers.current.size >= 2 && pinch.current) {
      const pts = [...pointers.current.values()]
      const r = rect.current!
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1
      const midX = (pts[0].x + pts[1].x) / 2 - r.left
      const midY = (pts[0].y + pts[1].y) / 2 - r.top
      const scale = clampScale(pinch.current.scale * (dist / pinch.current.dist))
      const c = clampXY(midX - pinch.current.wx * scale, midY - pinch.current.wy * scale, scale)
      setT({ scale, x: c.x, y: c.y })
      return
    }

    if (pan.current) {
      const p = pan.current
      const scale = tRef.current.scale
      const c = clampXY(p.tx + (e.clientX - p.x), p.ty + (e.clientY - p.y), scale)
      setT((prev) => ({ ...prev, x: c.x, y: c.y }))
    }
  }

  const endPointer = (e: ReactPointerEvent) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinch.current = null
    if (pointers.current.size === 0) {
      pan.current = null
      setDragging(false)
    } else if (pointers.current.size === 1 && !pinch.current) {
      // Lifted one finger after a pinch — hand control to the remaining finger.
      const [pt] = [...pointers.current.values()]
      pan.current = { x: pt.x, y: pt.y, tx: tRef.current.x, ty: tRef.current.y }
    }
  }

  const onWheel = (e: ReactWheelEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    rect.current = r
    const cx = e.clientX - r.left
    const cy = e.clientY - r.top
    setT((prev) => {
      const scale = clampScale(prev.scale * Math.exp(-e.deltaY * 0.0015))
      const k = scale / prev.scale
      const c = clampXY(cx - (cx - prev.x) * k, cy - (cy - prev.y) * k, scale)
      return { scale, x: c.x, y: c.y }
    })
  }

  const zoomBy = (factor: number) => {
    setT((prev) => {
      const scale = clampScale(prev.scale * factor)
      const r = rect.current
      if (!r) return { ...prev, scale }
      const cx = r.width / 2
      const cy = r.height / 2
      const k = scale / prev.scale
      const c = clampXY(cx - (cx - prev.x) * k, cy - (cy - prev.y) * k, scale)
      return { scale, x: c.x, y: c.y }
    })
  }

  const reset = () => setT(initial)

  return {
    t,
    dragging,
    reset,
    zoomBy,
    setTransform: setT,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
      onWheel,
    },
  }
}
