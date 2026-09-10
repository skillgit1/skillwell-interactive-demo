import posthog from 'posthog-js'
import { enableTracking, setAnalyticsSink } from './track'

/**
 * PostHog wiring. Config per the PostHog project setup (project 530617):
 * anonymous-first (identified_only), autocapture off (we send explicit typed
 * events), and capturing OFF until the visitor consents. On consent we opt in
 * and flip our own tracking gate; every track() call then flows to PostHog.
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

export function initPostHog() {
  if (TRACKING_DISABLED || started || typeof window === 'undefined') return
  started = true

  posthog.init('phc_r5XKDVrufrZTnNmtA2eGAHEaZmZoogXok5pAwajRSxv3', {
    api_host: 'https://us.i.posthog.com',
    cross_subdomain_cookie: true, // share the cookie on .tryskillwell.com so a
    // person is recognized across the apex and the preview subdomain
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    person_profiles: 'identified_only',
    opt_out_capturing_by_default: true,
    session_recording: {
      // Mask typed input if session replay is ever enabled later, so nothing a
      // visitor types can be captured. There are no text inputs today, but this
      // stays safe by default.
      maskAllInputs: true,
    },
  })

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
