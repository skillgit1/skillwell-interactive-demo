/**
 * Typed analytics helper — the single choke point for all demo events.
 *
 * Phase 0/1: logs to the console so the event stream is visible during
 * development. Phase 4: initialise PostHog (see initAnalytics) and every
 * existing track() call flows through unchanged — anonymous-first, and
 * gated behind consent.
 *
 * Design rules (see CLAUDE_CODE_BRIEF.md → Analytics):
 *  - Anonymous by default. No identify() until an email soft-gate.
 *  - No tracking before consent. `enableTracking()` flips the gate.
 *  - Every event carries session/device/token/variant automatically.
 */

export type DemoEvent =
  | 'demo_opened'
  | 'intro_started'
  | 'intro_industry_selected'
  | 'intro_training_selected'
  | 'intro_completed'
  | 'content_uploaded'
  | 'content_flagged'
  | 'knowledge_check_started'
  | 'knowledge_check_answered'
  | 'knowledge_check_completed'
  | 'node_opened'
  | 'node_closed'
  | 'insights_viewed'
  | 'sim_opened'
  | 'sim_closed'
  | 'sim_decision'
  | 'sim_completed'
  | 'report_viewed'
  | 'report_filtered'
  | 'soft_gate_shown'
  | 'soft_gate_submitted'
  | 'cta_clicked'
  | 'session_depth'

type Props = Record<string, string | number | boolean | null | undefined>

// --- ambient context attached to every event --------------------------

function getDevice(): 'desktop' | 'mobile' {
  if (typeof window === 'undefined') return 'desktop'
  return window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop'
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr'
  const KEY = 'sw_demo_session'
  let id = sessionStorage.getItem(KEY)
  if (!id) {
    // Not for security — just a per-tab correlation id.
    id = 's_' + Math.abs(hash(String(performance.now()) + navigator.userAgent)).toString(36)
    sessionStorage.setItem(KEY, id)
  }
  return id
}

function getToken(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return new URLSearchParams(window.location.search).get('d') ?? undefined
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return h
}

// --- consent gate + sink ----------------------------------------------

type Sink = { capture: (e: string, p?: Props) => void }

let trackingEnabled = false
let sink: Sink | null = null
// Events fired before consent+sink are ready are buffered, then flushed on
// consent so the session's early events (e.g. demo_opened) aren't lost — but
// nothing is SENT before consent. Capped so a non-consenting session is bounded.
const pending: [DemoEvent, Props][] = []
const PENDING_MAX = 100

function flush() {
  if (!trackingEnabled || !sink) return
  for (const [event, props] of pending) sink.capture(event, props)
  pending.length = 0
}

/** Called from the consent banner once the visitor accepts. */
export function enableTracking() {
  trackingEnabled = true
  flush()
}

/** Wire the PostHog client here (see lib/posthog.ts). */
export function setAnalyticsSink(client: Sink) {
  sink = client
  flush()
}

// --- the one function the whole app calls -----------------------------

export function track(event: DemoEvent, props: Props = {}) {
  const enriched: Props = {
    ...props,
    session_id: getSessionId(),
    device: getDevice(),
    token: getToken(),
    variant: 'default',
  }

  if (trackingEnabled && sink) {
    sink.capture(event, enriched)
    return
  }
  // Not yet consented / initialised — buffer (nothing leaves the browser).
  if (pending.length < PENDING_MAX) pending.push([event, enriched])
  console.debug('[track:pending]', event, enriched)
}
