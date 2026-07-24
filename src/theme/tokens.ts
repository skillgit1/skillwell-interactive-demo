/**
 * JS-side accessors for the design tokens defined in `theme.css`.
 *
 * theme.css remains the SINGLE source of truth — this file does NOT
 * duplicate hex values. It exposes the tokens as CSS `var(...)` strings
 * (which Recharts and inline styles accept directly) plus a runtime
 * helper for the rare case a computed value is needed.
 */

/** Ordered palette for charts — pass straight to Recharts fill/stroke. */
export const chartPalette = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-chart-6)',
] as const

/** Named semantic tokens as CSS var strings, for JS consumers. */
export const token = {
  surface: 'var(--color-surface)',
  panel: 'var(--color-panel)',
  sunken: 'var(--color-sunken)',
  line: 'var(--color-line)',
  ink: 'var(--color-ink)',
  inkSoft: 'var(--color-ink-soft)',
  inkMuted: 'var(--color-ink-muted)',
  primary: 'var(--color-primary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  nodeLocked: 'var(--color-node-locked)',
  nodeAvailable: 'var(--color-node-available)',
  nodeComplete: 'var(--color-node-complete)',
  nodeVerified: 'var(--color-node-verified)',
} as const

/**
 * Resolve a CSS custom property to its computed value at runtime.
 * Use only when a raw color string is required (e.g. canvas, gradients).
 */
export function cssVar(name: string): string {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
