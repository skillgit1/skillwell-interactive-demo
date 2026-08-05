/**
 * SIMULATION CONFIG
 *
 * Each sim node shows an intro screen (thumbnail + objectives + Start),
 * then embeds a live Skillwell Simulate scenario.
 *
 * SWAP THE REAL LINKS HERE (or later via the settings editor, same as the
 * industries): set `embedUrl` to a hosted Simulate URL. While it's null,
 * the Start button shows a branded placeholder instead of an iframe.
 */

import { engineFor } from './personalize'

export interface SimContent {
  intro: string
  objectives: string[]
  /** Live Skillwell Simulate embed URL. null = show placeholder for now. */
  embedUrl: string | null
}

// The live "try a simulation" experience, a multi-industry example sim.
// V1 uses this single URL for every sim node; swap per-scenario links later.
//
// This is the shareable DISTRIBUTION link (dlink). It carries its own access
// token, so a logged-out visitor can open it without an account: it bootstraps
// a guest session and redirects to sim.jsf. The bare sim.jsf / runSimulation.jsf
// URLs require an existing SSO session and would lock a demo visitor out.
export const DEFAULT_SIM_EMBED: string | null =
  'https://marketplace.skillsims.com/etu/dlink.jsf?linkid=808148d7-dd49-48cb-a965-6862dcac1677&submissionGuid=e5a5b61d-121b-4f79-8013-4e99355430da'

// Can the sim URL be shown INSIDE an iframe? The current marketplace URL
// CANNOT: it redirects to a logon page and relies on session cookies that
// browsers refuse to send in a cross-origin frame (renders blank). So V1
// launches it in a new tab. When the product team provides an embeddable /
// guest-accessible URL (or embed code), set this to true and it renders
// in the popup like every other node, with no other change needed.
export const SIM_EMBEDDABLE = false

type SimMap = Record<string, Omit<SimContent, 'embedUrl'>>

const SIMS: Record<string, SimMap> = {
  leadership: {
    'feedback-sim': {
      intro:
        'Step into a coaching conversation with a virtual team member. What you say shapes how the conversation unfolds, and how they respond.',
      objectives: [
        'Deliver specific, behavior-based feedback',
        'Keep the conversation constructive under pressure',
      ],
    },
    'customer-sim': {
      intro:
        'A difficult conversation is unfolding in real time. Read the situation, choose your response, and see where it leads.',
      objectives: [
        'Stay calm and lead a high-stakes conversation',
        'Reach a resolution that protects the relationship',
      ],
    },
  },
  onboarding: {
    'feedback-sim': {
      intro:
        'It’s your first real conversation with your manager. Practice showing up prepared, curious, and clear about what you need.',
      objectives: [
        'Ask the right questions early in a new role',
        'Clarify expectations without hesitation',
      ],
    },
    'customer-sim': {
      intro:
        'A first-week situation calls for judgment. Work through it and see how a strong new hire handles the moment.',
      objectives: [
        'Apply company values to a real decision',
        'Know when to act and when to ask',
      ],
    },
  },
  compliance: {
    'feedback-sim': {
      intro:
        'You’ve spotted something that doesn’t look right. Practice raising a concern the right way, through the right channel.',
      objectives: [
        'Recognize a reportable situation',
        'Escalate a concern clearly and in good faith',
      ],
    },
    'customer-sim': {
      intro:
        'A compliance scenario is playing out. Make the calls, and see how your choices affect the outcome and the record.',
      objectives: [
        'Identify types of ethics and compliance concerns that need to be reported',
        'Use appropriate channels to report ethics and compliance concerns',
      ],
    },
  },
  sales: {
    'feedback-sim': {
      intro:
        'The phone’s ringing and you’ve got seconds to earn the conversation. Practice opening a cold call that doesn’t get hung up on.',
      objectives: [
        'Open with relevance, not a pitch',
        'Earn the next few minutes of their time',
      ],
    },
    'customer-sim': {
      intro:
        'A tough customer is pushing back. Handle the objections, keep the deal alive, and guide them toward a decision.',
      objectives: [
        'Handle objections without discounting reflexively',
        'Advance the deal to a clear next step',
      ],
    },
  },
}

// Generic "example simulation", shown for the showcase sim node and any
// sim without a specific scenario. Deliberately multi-industry for V1.
const EXAMPLE_SIM = {
  intro:
    'With Skillwell Simulate, you build immersive, realistic practice simulations in a few clicks with AI, and learners experience them right inside the course. Below is a complete example simulation (a generic one, for this preview). Click to open it.',
  objectives: [
    'Experience an immersive, branching simulation first-hand',
    'See how your choices change the outcome',
  ],
}

export function getSim(training: string, nodeId: string): SimContent {
  const map = SIMS[engineFor(training)] ?? SIMS.leadership
  const base = map[nodeId] ?? EXAMPLE_SIM
  return { ...base, embedUrl: DEFAULT_SIM_EMBED }
}
