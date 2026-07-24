import type { MapContent } from './types'

/**
 * Personalization engine for the intro flow + knowledge check.
 *
 * The intro's two taps (industry + training type) exist to prove breadth:
 * Skillwell works in ANY industry and can build ANY type of training.
 * They retitle the course, scenario, and node labels so the map feels
 * built for the visitor. Content-only — the graph structure stays
 * identical, which keeps this maintainable.
 *
 * The knowledge check ("Determine Knowledge" node) is the learner-side
 * adaptivity demo: each question maps to a skillTag; correct answers
 * flip matching nodes to "verified" (tested out) and the path adapts.
 */

export interface IntroAnswers {
  industry: string
  training: string
  /** Name of an uploaded training document (client-side only — the file
   *  itself never leaves the browser; we use the name to theme the map). */
  fileName?: string | null
}

export interface CheckQuestion {
  q: string
  /** skillTag of the map node this question verifies. */
  skillTag: string
  options: { label: string; correct?: boolean }[]
}

export const INDUSTRIES = [
  { id: 'healthcare', label: 'Healthcare', company: 'Meridian Health' },
  { id: 'retail', label: 'Retail', company: 'Northgate Retail Group' },
  { id: 'financial', label: 'Financial Services', company: 'Beacon Financial' },
  { id: 'tech', label: 'Technology', company: 'Coreline Software' },
  { id: 'highered', label: 'Higher Education', company: 'Lakeview University' },
  { id: 'other', label: 'Something else', company: 'Atlas Industries' },
] as const

export const TRAININGS = [
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'compliance', label: 'Compliance & Risk' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'sales', label: 'Sales & Service' },
] as const

interface TrainingContent {
  group: string
  course: string
  description: string
  nodeTitles: Record<string, string>
  questions: CheckQuestion[]
}

const TRAINING_CONTENT: Record<string, TrainingContent> = {
  onboarding: {
    group: 'Onboarding',
    course: 'New Hire Onboarding',
    description:
      "In this course, you'll ramp into your new role — the systems, the culture, and the conversations that matter in your first 30 days at {company}.",
    nodeTitles: {
      principles: 'Your First 30 Days',
      terminology: "Who's Who & Key Terms",
      styles: 'Tools & Systems',
      communication: 'Culture & Values',
      'practice-quiz': 'Scenario Practice: Week One',
      'feedback-sim': 'Meet Your Manager Sim',
      expectations: 'Role Expectations',
      milestone: 'Checkpoint: Ready for Week Two',
      'customer-king': 'Working With Customers',
      'customer-sim': 'First-Week Conversation Sim',
      'case-study': 'Case Study: A Great First Month',
      'final-assessment': 'Verify: Onboarding Essentials',
    },
    questions: [
      {
        q: 'What should be your top priority in your first week?',
        skillTag: 'fundamentals',
        options: [
          { label: 'Learning how your role creates value', correct: true },
          { label: 'Reorganizing team processes' },
          { label: 'Keeping your head down' },
        ],
      },
      {
        q: "You can't find the right system for a task. Best first move?",
        skillTag: 'leadership',
        options: [
          { label: 'Check the team wiki, then ask your buddy', correct: true },
          { label: 'Wait until someone notices' },
          { label: 'Build your own workaround' },
        ],
      },
      {
        q: 'A teammate invites you to a meeting you know nothing about. You…',
        skillTag: 'communication',
        options: [
          { label: 'Ask what your role in it should be', correct: true },
          { label: 'Decline it' },
          { label: 'Attend silently' },
        ],
      },
    ],
  },
  compliance: {
    group: 'Compliance & Risk',
    course: 'Compliance Essentials',
    description:
      "In this course, you'll build the judgment to spot, handle, and report risk with confidence — grounded in real scenarios from {company}.",
    nodeTitles: {
      principles: 'Why Compliance Matters',
      terminology: 'Key Terms & Definitions',
      styles: 'Key Regulations',
      communication: 'Reporting Concerns',
      'practice-quiz': 'Scenario Practice: Spot the Risk',
      'feedback-sim': 'Reporting Conversation Sim',
      expectations: 'Handling Violations',
      milestone: 'Checkpoint: Risk Radar',
      'customer-king': 'Data Privacy Essentials',
      'customer-sim': 'Compliance Scenario Sim',
      'case-study': 'Case Study: A Near Miss',
      'final-assessment': 'Verify: Compliance Essentials',
    },
    questions: [
      {
        q: 'Why do compliance programs exist?',
        skillTag: 'fundamentals',
        options: [
          { label: 'To protect people, customers, and the business', correct: true },
          { label: 'To create paperwork' },
          { label: 'To slow projects down' },
        ],
      },
      {
        q: 'You notice a colleague sharing customer data over personal email. You…',
        skillTag: 'leadership',
        options: [
          { label: 'Report it through the proper channel', correct: true },
          { label: 'Ignore it — not your problem' },
          { label: 'Confront them publicly' },
        ],
      },
      {
        q: "You're unsure whether something needs to be reported. Best move?",
        skillTag: 'communication',
        options: [
          { label: 'Ask — report when in doubt', correct: true },
          { label: 'Assume someone else will' },
          { label: 'Wait for proof first' },
        ],
      },
    ],
  },
  leadership: {
    group: 'Basics of Management',
    course: 'Introduction to Management',
    description:
      "In this course, you'll explore the fundamentals of management at {company}. An important element of the management task is leading people — setting expectations, coaching, and putting the customer at the center of every decision.",
    nodeTitles: {
      principles: 'Principles of Management',
      terminology: "The Manager's Vocabulary",
      styles: 'Leadership Styles',
      communication: 'Communicating Clearly',
      'practice-quiz': 'Scenario Practice: Daily Decisions',
      'feedback-sim': 'Feedback Conversation Sim',
      expectations: 'Expectations of Managers',
      milestone: 'Checkpoint: Your Management Toolkit',
      'customer-king': 'Making the Customer King',
      'customer-sim': 'Difficult Conversation Sim',
      'case-study': 'Case Study: Turning a Team Around',
      'final-assessment': 'Verify: Management Essentials',
    },
    questions: [
      {
        q: 'Which of these is a core function of management?',
        skillTag: 'fundamentals',
        options: [
          { label: 'Planning and setting direction', correct: true },
          { label: 'Doing every task yourself' },
          { label: 'Avoiding hard conversations' },
        ],
      },
      {
        q: 'A high performer wants more autonomy. The best style shift is…',
        skillTag: 'leadership',
        options: [
          { label: 'Delegate more, check in less often', correct: true },
          { label: 'Supervise them more closely' },
          { label: 'Give them someone else’s work' },
        ],
      },
      {
        q: 'A team member misses a deadline. A great first response is…',
        skillTag: 'communication',
        options: [
          { label: 'Ask what got in the way', correct: true },
          { label: 'Escalate to HR immediately' },
          { label: 'Say nothing and reassign their work' },
        ],
      },
    ],
  },
  sales: {
    group: 'Sales & Service',
    course: 'Sales & Service Excellence',
    description:
      "In this course, you'll sharpen the skills that win and keep customers at {company} — discovery, objection handling, and closing with confidence.",
    nodeTitles: {
      principles: 'Knowing Your Customer',
      terminology: 'Your Product, Cold',
      styles: 'Discovery Skills',
      communication: 'Handling Objections',
      'practice-quiz': 'Scenario Practice: Live Calls',
      'feedback-sim': 'Cold Call Sim',
      expectations: 'Expectations of Top Performers',
      milestone: 'Checkpoint: Pipeline Ready',
      'customer-king': 'Closing With Confidence',
      'customer-sim': 'Tough Customer Sim',
      'case-study': 'Case Study: The Saved Deal',
      'final-assessment': 'Verify: Sales Essentials',
    },
    questions: [
      {
        q: 'The main goal of a first sales conversation is to…',
        skillTag: 'fundamentals',
        options: [
          { label: "Understand the customer's problem", correct: true },
          { label: 'Present every feature' },
          { label: 'Send the contract' },
        ],
      },
      {
        q: 'The best discovery questions are…',
        skillTag: 'leadership',
        options: [
          { label: 'Open-ended and about their goals', correct: true },
          { label: 'Yes/no questions' },
          { label: 'About your own product' },
        ],
      },
      {
        q: '“It’s too expensive.” Your first response?',
        skillTag: 'communication',
        options: [
          { label: 'Ask what they’re comparing it to', correct: true },
          { label: 'Offer a discount immediately' },
          { label: 'End the conversation' },
        ],
      },
    ],
  },
}

function trainingFor(answers: IntroAnswers | null): TrainingContent {
  return TRAINING_CONTENT[answers?.training ?? ''] ?? TRAINING_CONTENT.leadership
}

/** Turn "Clinical_onboarding-manual v2.pdf" into "Clinical Onboarding Manual V2". */
export function cleanFileName(name: string): string {
  const stem = name.replace(/\.[^.]+$/, '').replace(/[-_.]+/g, ' ').replace(/\s+/g, ' ').trim()
  const titled = stem.replace(/\b\w/g, (c) => c.toUpperCase())
  return titled.length > 48 ? titled.slice(0, 48).trimEnd() + '…' : titled
}

/** Unique skills across the map (what "the taxonomy mapped"), excluding baseline. */
export function uniqueSkillCount(content: MapContent): number {
  const tags = new Set<string>()
  for (const n of content.nodes) for (const t of n.skillTags) if (t !== 'baseline') tags.add(t)
  return tags.size
}

/** Apply intro answers to the base map content. Pure — returns a new object. */
export function personalize(base: MapContent, answers: IntroAnswers | null): MapContent {
  if (!answers) return base
  const industry = INDUSTRIES.find((i) => i.id === answers.industry) ?? INDUSTRIES[5]
  const t = trainingFor(answers)

  const course = answers.fileName ? cleanFileName(answers.fileName) : t.course
  const description = answers.fileName
    ? `Generated automatically from “${answers.fileName}” — Skillwell extracted the skills inside and mapped them to an adaptive path for ${industry.company} using its skills taxonomy.`
    : t.description.replace('{company}', industry.company)

  return {
    scenario: {
      ...base.scenario,
      company: industry.company,
      course,
      breadcrumb: ['Dashboard', t.group, course],
      description,
    },
    nodes: base.nodes.map((n) => ({
      ...n,
      title: t.nodeTitles[n.id] ?? n.title,
    })),
  }
}

/** Knowledge-check questions for the visitor's chosen training type. */
export function getQuestions(answers: IntroAnswers | null): CheckQuestion[] {
  return trainingFor(answers).questions
}

/** Seat time saved by tested-out (verified) activities, in minutes. */
export function minutesSaved(content: MapContent): number {
  return content.nodes
    .filter((n) => n.state === 'verified')
    .reduce((sum, n) => sum + n.estMinutes, 0)
}
