import type { MapContent } from './types'

/**
 * Personalization engine for the intro flow + knowledge check.
 *
 * The intro's two taps (industry + training type) exist to prove breadth:
 * Skillwell works in ANY industry and can build ANY type of training.
 * They retitle the course, scenario, and node labels so the map feels
 * built for the visitor. Content only, since the graph structure stays
 * identical, which keeps this maintainable.
 *
 * The knowledge check ("Determine Knowledge" node) is the learner-side
 * adaptivity demo: each question maps to a skillTag; correct answers
 * flip matching nodes to "verified" (tested out) and the path adapts.
 */

export interface IntroAnswers {
  industry: string
  training: string
  /** Name of an uploaded training document (client-side only, since the file
   *  itself never leaves the browser; we use the name to theme the map). */
  fileName?: string | null
}

export interface CheckQuestion {
  q: string
  /** skillTag of the map node this question verifies. */
  skillTag: string
  options: { label: string; correct?: boolean }[]
}

export interface Industry {
  id: string
  label: string
  company: string
  /** Higher Ed is a distinct buyer, rendered apart from the corporate grid. */
  higherEd?: boolean
}

export const INDUSTRIES: Industry[] = [
  { id: 'technology', label: 'Technology', company: 'Coreline Software' },
  { id: 'healthcare', label: 'Healthcare', company: 'Meridian Health' },
  { id: 'retail', label: 'Retail', company: 'Northgate Retail Group' },
  { id: 'professional', label: 'Professional Services', company: 'Halcyon Advisory' },
  { id: 'pharma', label: 'Pharma', company: 'Vantia Pharma' },
  { id: 'other', label: 'Other', company: 'Atlas Industries' },
]

/** Rendered separately with an "Academic" badge, not a normal industry tile. */
export const HIGHER_ED_INDUSTRY: Industry = {
  id: 'highered',
  label: 'Higher Education',
  company: 'Lakeview University',
  higherEd: true,
}

/**
 * A selectable training. `engine` points at one of the four fully-authored
 * content sets (leadership/onboarding/compliance/sales); new course types
 * (DEI, higher-ed) reuse the closest engine and override the course
 * name/description so the map reads correctly. Dedicated content for these
 * can be authored later without changing this wiring.
 */
export interface TrainingOption {
  id: string
  label: string
  engine: 'leadership' | 'onboarding' | 'compliance' | 'sales'
  group?: string
  course?: string
  description?: string
}

export const CORPORATE_TRAININGS: TrainingOption[] = [
  { id: 'leadership', label: 'Leadership', engine: 'leadership' },
  { id: 'compliance', label: 'Compliance & Risk', engine: 'compliance' },
  { id: 'sales', label: 'Sales & Customer Service', engine: 'sales' },
  { id: 'onboarding', label: 'Onboarding', engine: 'onboarding' },
  {
    id: 'dei',
    label: 'Diversity, Equity, and Inclusion',
    engine: 'compliance',
    group: 'People & Culture',
    course: 'Diversity, Equity & Inclusion',
    description:
      "In this course, you'll build the awareness and everyday habits that make {company} a place where everyone can contribute and do their best work.",
  },
]

/** Shown only when the visitor picks Higher Education (academic categories). */
export const HIGHER_ED_TRAININGS: TrainingOption[] = [
  {
    id: 'he-mandatory',
    label: 'Mandatory Training',
    engine: 'compliance',
    group: 'Compliance',
    course: 'Mandatory Training',
    description:
      "In this path, students and staff complete the required training at {company}, including Title IX, harassment prevention, and campus safety, in one adaptive experience.",
  },
  {
    id: 'he-stem',
    label: 'STEM',
    engine: 'onboarding',
    group: 'Academics',
    course: 'STEM Foundations',
    description:
      "In this course, students build core skills across science, technology, engineering, and math with adaptive, mastery-based practice tailored to each learner at {company}.",
  },
  {
    id: 'he-social',
    label: 'Social Sciences',
    engine: 'leadership',
    group: 'Academics',
    course: 'Social Sciences',
    description:
      "In this course, students explore human behavior, society, and research methods with adaptive learning tuned to where each student is at {company}.",
  },
  {
    id: 'he-humanities',
    label: 'Humanities',
    engine: 'leadership',
    group: 'Academics',
    course: 'Humanities',
    description:
      "In this course, students engage with literature, history, and critical thinking through personalized, adaptive coursework at {company}.",
  },
  {
    id: 'he-leadership',
    label: 'Leadership & Soft Skills',
    engine: 'leadership',
    group: 'Career Readiness',
    course: 'Leadership & Soft Skills',
    description:
      "In this course, students build the communication, collaboration, and leadership skills that employers and graduate programs value, adaptive to each learner at {company}.",
  },
]

const ALL_TRAININGS = [...CORPORATE_TRAININGS, ...HIGHER_ED_TRAININGS]

/** The training options to show for a given industry (Higher Ed → academic). */
export function trainingsFor(industryId: string | null): TrainingOption[] {
  return industryId === 'highered' ? HIGHER_ED_TRAININGS : CORPORATE_TRAININGS
}

export function findTraining(id: string | null): TrainingOption | undefined {
  return ALL_TRAININGS.find((t) => t.id === id)
}

export function findIndustry(id: string | null): Industry | undefined {
  if (id === 'highered') return HIGHER_ED_INDUSTRY
  return INDUSTRIES.find((i) => i.id === id)
}

/** The content engine (fully-authored set) backing a training id. */
export function engineFor(trainingId: string): string {
  return findTraining(trainingId)?.engine ?? 'leadership'
}

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
      "In this course, you'll ramp into your new role, learning the systems, the culture, and the conversations that matter in your first 30 days at {company}.",
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
      "In this course, you'll build the judgment to spot, handle, and report risk with confidence, grounded in real scenarios from {company}.",
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
          { label: 'Ignore it, since it is not your problem' },
          { label: 'Confront them publicly' },
        ],
      },
      {
        q: "You're unsure whether something needs to be reported. Best move?",
        skillTag: 'communication',
        options: [
          { label: 'Ask, and report when in doubt', correct: true },
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
      "In this course, you'll explore the fundamentals of management at {company}. An important part of the management task is leading people, which means setting expectations, coaching, and putting the customer at the center of every decision.",
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
      "In this course, you'll sharpen the skills that win and keep customers at {company}: discovery, objection handling, and closing with confidence.",
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

  // ===== Dedicated topic content (keyed by training id) ====================
  // These topics used to borrow an engine above. They now carry their own
  // node titles and knowledge-check questions so the map reads as built for
  // the visitor's exact course. Lesson bodies live in lessons.ts.

  dei: {
    group: 'People & Culture',
    course: 'Diversity, Equity & Inclusion',
    description:
      "In this course, you'll build the awareness and everyday habits that make {company} a place where everyone can contribute and do their best work.",
    nodeTitles: {
      principles: 'Why Inclusion Matters',
      terminology: 'Key Terms in DEI',
      styles: 'Understanding Bias',
      communication: 'Inclusive Conversations',
      'practice-quiz': 'Scenario Practice: Everyday Moments',
      'feedback-sim': 'Responding to Bias Sim',
      expectations: 'Being an Active Ally',
      milestone: 'Checkpoint: Inclusive Habits',
      'customer-king': 'Equity in Decisions',
      'customer-sim': 'Difficult Conversation Sim',
      'case-study': 'Case Study: A More Inclusive Team',
      'final-assessment': 'Verify: Inclusion Essentials',
    },
    questions: [
      {
        q: 'What is the goal of an inclusive workplace?',
        skillTag: 'fundamentals',
        options: [
          { label: 'Everyone can contribute and do their best work', correct: true },
          { label: 'Everyone thinks the same way' },
          { label: 'Disagreement is avoided at all costs' },
        ],
      },
      {
        q: 'A colleague is repeatedly talked over in meetings. A good response is…',
        skillTag: 'leadership',
        options: [
          { label: 'Invite them back in: “I want to hear the rest of your point”', correct: true },
          { label: 'Say nothing, since it is not your place' },
          { label: 'Bring it up as a joke afterward' },
        ],
      },
      {
        q: 'A coworker says a comment made them uncomfortable. You…',
        skillTag: 'communication',
        options: [
          { label: 'Listen, thank them, and reflect on it', correct: true },
          { label: 'Explain why they misunderstood' },
          { label: 'Change the subject quickly' },
        ],
      },
    ],
  },

  'he-mandatory': {
    group: 'Compliance',
    course: 'Mandatory Training',
    description:
      "In this path, students and staff complete {company}'s required training, including Title IX, harassment prevention, and campus safety, in one adaptive experience.",
    nodeTitles: {
      principles: 'Your Rights and Responsibilities',
      terminology: 'Key Terms and Definitions',
      styles: 'Recognizing Prohibited Conduct',
      communication: 'How to Report',
      'practice-quiz': 'Scenario Practice: What Would You Do',
      'feedback-sim': 'Reporting Conversation Sim',
      expectations: 'Supporting Someone Who Discloses',
      milestone: 'Checkpoint: Campus Safety Basics',
      'customer-king': 'Confidentiality and Privacy',
      'customer-sim': 'Support Conversation Sim',
      'case-study': 'Case Study: A Report Done Right',
      'final-assessment': 'Verify: Mandatory Training',
    },
    questions: [
      {
        q: 'What does Title IX primarily protect people from?',
        skillTag: 'fundamentals',
        options: [
          { label: 'Sex-based discrimination in education', correct: true },
          { label: 'Late tuition payments' },
          { label: 'Parking violations' },
        ],
      },
      {
        q: 'You think a fellow student may have experienced harassment. A responsible first step is…',
        skillTag: 'leadership',
        options: [
          { label: 'Share the campus reporting and support resources', correct: true },
          { label: 'Investigate it yourself' },
          { label: 'Assume someone else will help' },
        ],
      },
      {
        q: 'Someone discloses an incident to you. You should…',
        skillTag: 'communication',
        options: [
          { label: 'Listen without judgment and respect their privacy', correct: true },
          { label: 'Repeat it widely so it gets handled' },
          { label: 'Tell them to forget about it' },
        ],
      },
    ],
  },

  'he-stem': {
    group: 'Academics',
    course: 'STEM Foundations',
    description:
      'In this course, students build core skills across science, technology, engineering, and math with adaptive, mastery-based practice tuned to each learner at {company}.',
    nodeTitles: {
      principles: 'How Scientists Think',
      terminology: 'Core Concepts and Notation',
      styles: 'Reasoning with Numbers',
      communication: 'Explaining Your Work',
      'practice-quiz': 'Practice Set: Problem Solving',
      'feedback-sim': 'Lab Partner Sim',
      expectations: 'Designing an Experiment',
      milestone: 'Checkpoint: Foundations Secured',
      'customer-king': 'Interpreting Data',
      'customer-sim': 'Peer Review Sim',
      'case-study': 'Case Study: From Question to Finding',
      'final-assessment': 'Verify: STEM Foundations',
    },
    questions: [
      {
        q: 'What is the first step in the scientific method?',
        skillTag: 'fundamentals',
        options: [
          { label: 'Ask a clear, testable question', correct: true },
          { label: 'Publish the results' },
          { label: 'Assume the conclusion' },
        ],
      },
      {
        q: 'Your experiment gives an unexpected result. The best response is…',
        skillTag: 'leadership',
        options: [
          { label: 'Check your method, then investigate why', correct: true },
          { label: 'Ignore the result' },
          { label: 'Change the data to fit' },
        ],
      },
      {
        q: 'The clearest way to present a finding is to…',
        skillTag: 'communication',
        options: [
          { label: 'Show the evidence and explain what it means', correct: true },
          { label: 'State the conclusion with no support' },
          { label: 'Use as much jargon as possible' },
        ],
      },
    ],
  },

  'he-social': {
    group: 'Academics',
    course: 'Social Sciences',
    description:
      'In this course, students explore human behavior, society, and research methods with adaptive learning tuned to where each student is at {company}.',
    nodeTitles: {
      principles: 'How Social Scientists Think',
      terminology: 'Key Concepts and Theories',
      styles: 'Research Methods',
      communication: 'Making an Argument from Evidence',
      'practice-quiz': 'Practice: Reading the Evidence',
      'feedback-sim': 'Seminar Discussion Sim',
      expectations: 'Analyzing Society and Systems',
      milestone: 'Checkpoint: Thinking Like a Researcher',
      'customer-king': 'Interpreting Human Behavior',
      'customer-sim': 'Interview Practice Sim',
      'case-study': 'Case Study: A Study Under the Microscope',
      'final-assessment': 'Verify: Social Sciences',
    },
    questions: [
      {
        q: 'What do the social sciences study?',
        skillTag: 'fundamentals',
        options: [
          { label: 'Human behavior, society, and how people interact', correct: true },
          { label: 'Only historical dates' },
          { label: 'The physical properties of matter' },
        ],
      },
      {
        q: 'A study shows two things happen together. You can conclude…',
        skillTag: 'leadership',
        options: [
          { label: 'They are correlated, which does not prove one caused the other', correct: true },
          { label: 'One definitely caused the other' },
          { label: 'Nothing can ever be learned' },
        ],
      },
      {
        q: 'A strong social science argument relies on…',
        skillTag: 'communication',
        options: [
          { label: 'Evidence and sound reasoning', correct: true },
          { label: 'Personal opinion alone' },
          { label: 'The loudest voice in the room' },
        ],
      },
    ],
  },

  'he-humanities': {
    group: 'Academics',
    course: 'Humanities',
    description:
      'In this course, students engage with literature, history, and critical thinking through personalized, adaptive coursework at {company}.',
    nodeTitles: {
      principles: 'Why the Humanities Matter',
      terminology: 'Key Terms in Reading and History',
      styles: 'Reading Closely',
      communication: 'Building an Argument',
      'practice-quiz': 'Practice: Analyze a Passage',
      'feedback-sim': 'Seminar Discussion Sim',
      expectations: 'Writing with Clarity and Voice',
      milestone: 'Checkpoint: Critical Reader',
      'customer-king': 'Ideas in Their Context',
      'customer-sim': 'Peer Feedback Sim',
      'case-study': 'Case Study: Reading Between the Lines',
      'final-assessment': 'Verify: Humanities',
    },
    questions: [
      {
        q: 'Close reading means…',
        skillTag: 'fundamentals',
        options: [
          { label: 'Paying careful attention to the details of a text', correct: true },
          { label: 'Reading as fast as possible' },
          { label: 'Skimming only for the summary' },
        ],
      },
      {
        q: 'A strong interpretation of a text is one that…',
        skillTag: 'leadership',
        options: [
          { label: 'Is supported by evidence from the text itself', correct: true },
          { label: 'Simply sounds impressive' },
          { label: 'Ignores what the text actually says' },
        ],
      },
      {
        q: 'A clear written argument begins with…',
        skillTag: 'communication',
        options: [
          { label: 'A clear thesis the rest of the essay supports', correct: true },
          { label: 'As many quotes as possible' },
          { label: 'A summary of everything you read' },
        ],
      },
    ],
  },

  'he-leadership': {
    group: 'Career Readiness',
    course: 'Leadership & Soft Skills',
    description:
      'In this course, students build the communication, collaboration, and leadership skills that employers and graduate programs value, adaptive to each learner at {company}.',
    nodeTitles: {
      principles: 'What Employers Actually Value',
      terminology: 'The Language of the Workplace',
      styles: 'Working on a Team',
      communication: 'Communicating with Impact',
      'practice-quiz': 'Practice: Real Workplace Moments',
      'feedback-sim': 'Interview Practice Sim',
      expectations: 'Managing Time and Priorities',
      milestone: 'Checkpoint: Ready for the Workplace',
      'customer-king': 'Leading and Influencing Others',
      'customer-sim': 'Difficult Conversation Sim',
      'case-study': 'Case Study: From Classroom to Career',
      'final-assessment': 'Verify: Leadership and Soft Skills',
    },
    questions: [
      {
        q: 'Employers say the most valuable graduate skills are…',
        skillTag: 'fundamentals',
        options: [
          { label: 'Communication, teamwork, and problem solving', correct: true },
          { label: 'Memorizing facts' },
          { label: 'Working alone at all times' },
        ],
      },
      {
        q: 'A teammate is not carrying their share of a group project. A mature response is…',
        skillTag: 'leadership',
        options: [
          { label: 'Talk with them directly and honestly', correct: true },
          { label: 'Complain to everyone else' },
          { label: 'Do all the work silently' },
        ],
      },
      {
        q: 'The most effective communicators…',
        skillTag: 'communication',
        options: [
          { label: 'Listen as much as they speak', correct: true },
          { label: 'Talk the most in every room' },
          { label: 'Avoid asking questions' },
        ],
      },
    ],
  },
}

function engineContentFor(trainingId: string | null): TrainingContent {
  const id = trainingId ?? ''
  // Prefer content authored for the exact topic; fall back to its engine.
  return TRAINING_CONTENT[id] ?? TRAINING_CONTENT[engineFor(id)] ?? TRAINING_CONTENT.leadership
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

/** Apply intro answers to the base map content. Pure, returns a new object. */
export function personalize(base: MapContent, answers: IntroAnswers | null): MapContent {
  if (!answers) return base
  const industry = findIndustry(answers.industry) ?? INDUSTRIES[INDUSTRIES.length - 1]
  const option = findTraining(answers.training)
  const engine = engineContentFor(answers.training)

  const baseCourse = option?.course ?? engine.course
  const baseDesc = option?.description ?? engine.description
  const group = option?.group ?? engine.group

  // We can't read the uploaded file on the static site (no AI backend), and raw
  // filenames are unreliable ("images (1).png", "101.png"), so we never name the
  // course after the file. An upload maps to the chosen topic's authored content.
  // Truly reading the file → moderating it → naming and building a content-exact
  // map is the AI upload pipeline (needs a backend that holds the Claude key).
  const course = baseCourse
  const description = baseDesc.replace(/\{company\}/g, industry.company)
  const nodeTitles = engine.nodeTitles

  return {
    scenario: {
      ...base.scenario,
      company: industry.company,
      course,
      breadcrumb: ['Dashboard', group, course],
      description,
    },
    nodes: base.nodes.map((n) => ({
      ...n,
      // Sim nodes stay generic, since the example sim is not topic-specific, so we
      // never relabel them with the course topic. Content nodes get retitled.
      title: n.type === 'sim' ? n.title : nodeTitles[n.id] ?? n.title,
    })),
  }
}

/** Knowledge-check questions for the visitor's chosen training type. */
export function getQuestions(answers: IntroAnswers | null): CheckQuestion[] {
  return engineContentFor(answers?.training ?? null).questions
}

/** Seat time saved by tested-out (verified) activities, in minutes. */
export function minutesSaved(content: MapContent): number {
  return content.nodes
    .filter((n) => n.state === 'verified')
    .reduce((sum, n) => sum + n.estMinutes, 0)
}
