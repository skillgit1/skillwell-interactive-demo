import posthog from 'posthog-js'
import { enableTracking, setAnalyticsSink } from './track'

/**
 * PostHog wiring. A $pageview is captured for every visitor on load
 * (anonymous, cookie-based, no PII). Person profiles are created only on
 * explicit identify (person_profiles: 'identified_only'). The cross-subdomain
 * cookie links sessions across tryskillwell.com and preview.tryskillwell.com.
 * Our own typed events still flow through track() behind its consent gate;
 * the consent / opt-in / identify functions below are unchanged.
 */

let started = false

const CONSENT_KEY = 'sw_consent'

/**
 * Staging (tryskillwell.com/staging/) must never be tracked, so experiments
 * can't pollute production analytics or the landing to demo funnel. Every
 * entry point below no-ops there: PostHog never initializes, no sink is wired,
 * and no event is ever sent (track() just buffers harmlessly).
 */
const TRACKING_DISABLED =
  typeof window !== 'undefined' && window.location.pathname.startsWith('/staging')

/**
 * Which entry of this demo the visitor landed on. /he is the higher-ed entry
 * (tryskillwell.com/he); everything else is the primary demo. Same domain, same
 * PostHog project, same person cookie, so /he still rolls up into the overall
 * numbers — this just lets you FILTER or BREAK DOWN by entry inside PostHog.
 */
function demoVariant(): 'he' | 'primary' {
  if (typeof window === 'undefined') return 'primary'
  return window.location.pathname.split('/').filter(Boolean).includes('he') ? 'he' : 'primary'
}

export function initPostHog() {
  if (TRACKING_DISABLED || started || typeof window === 'undefined') return
  started = true

  posthog.init('phc_r5XKDVrufrZTnNmtA2eGAHEaZmZoogXok5pAwajRSxv3', {
    api_host: 'https://us.i.posthog.com',
    capture_pageview: true, // fire $pageview for every visitor on load
    person_profiles: 'identified_only', // no person profile until identify()
    cross_subdomain_cookie: true, // link tryskillwell.com <-> preview.tryskillwell.com
  })

  // Tag every event (custom, autocapture, and all but the very first $pageview)
  // with the entry so /he is one filter away in PostHog. Registered as a super
  // property, so nothing downstream has to pass it. The initial $pageview is
  // still distinguishable by its $current_url (/he), so no /he visit is missed.
  posthog.register({ demo_variant: demoVariant() })

  // Route all of our typed events through PostHog (only sends once consented).
  setAnalyticsSink({ capture: (event, props) => posthog.capture(event, props) })
}

/**
 * Visitor entered the demo — start capturing + replay. Consent is implied by
 * continuing (see the fine print on the intro welcome card); we persist it so a
 * reload mid-session re-arms tracking without re-showing the intro.
 */
export function grantConsent() {
  if (TRACKING_DISABLED) return
  if (!started) initPostHog()
  posthog.opt_in_capturing()
  enableTracking()
  try {
    localStorage.setItem(CONSENT_KEY, 'granted')
  } catch {
    /* ignore */
  }
}

/**
 * Re-arm tracking on load if this browser already consented in a prior visit,
 * so events flow even when the intro (session-gated) doesn't re-render.
 */
export function restoreConsent() {
  if (TRACKING_DISABLED) return
  try {
    if (localStorage.getItem(CONSENT_KEY) === 'granted') grantConsent()
  } catch {
    /* ignore */
  }
}

/** Visitor declined — do not load or capture anything. */
export function denyConsent() {
  if (started) posthog.opt_out_capturing()
}

/**
 * Identify a visitor when they hand over an email (soft-gate) or arrive via a
 * rep link. Anonymous history stitches to this person automatically.
 */
export function identifyVisitor(id: string, props?: Record<string, string>) {
  if (started) posthog.identify(id, props)
}
