import { useCallback, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react'

export interface Transform {
  x: number
  y: number
  scale: number
}

const MIN_SCALE = 0.4
const MAX_SCALE = 1.6

/**
 * Lightweight pan/zoom for the learning-map canvas.
 * - drag to pan
 * - wheel / trackpad pinch to zoom toward the cursor
 * - zoomBy / reset for the control buttons
 */
export function usePanZoom(initial: Transform) {
  const [t, setT] = useState<Transform>(initial)
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  const clamp = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      // ignore drags that start on interactive elements (nodes/buttons)
      if ((e.target as HTMLElement).closest('[data-node],[data-nodrag]')) return
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      drag.current = { x: e.clientX, y: e.clientY, tx: t.x, ty: t.y }
      setDragging(true)
    },
    [t.x, t.y],
  )

  const onPointerMove = useCallback((e: ReactPointerEvent) => {
    if (!drag.current) return
    setT((prev) => ({
      ...prev,
      x: drag.current!.tx + (e.clientX - drag.current!.x),
      y: drag.current!.ty + (e.clientY - drag.current!.y),
    }))
  }, [])

  const onPointerUp = useCallback(() => {
    drag.current = null
    setDragging(false)
  }, [])

  const onWheel = useCallback((e: ReactWheelEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    setT((prev) => {
      const factor = Math.exp(-e.deltaY * 0.0015)
      const scale = clamp(prev.scale * factor)
      const k = scale / prev.scale
      // keep the point under the cursor fixed
      return {
        scale,
        x: cx - (cx - prev.x) * k,
        y: cy - (cy - prev.y) * k,
      }
    })
  }, [])

  const zoomBy = useCallback((factor: number) => {
    setT((prev) => {
      const scale = clamp(prev.scale * factor)
      return { ...prev, scale }
    })
  }, [])

  const reset = useCallback(() => setT(initial), [initial])

  return {
    t,
    dragging,
    reset,
    zoomBy,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onWheel },
  }
}
