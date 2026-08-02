/**
 * NODE CONTENT TEMPLATE + DEFAULT LIBRARY
 *
 * A deliberately CONSTRAINED e-learning template so content stays
 * structured and on-brand — never a wall of AI text. Each lesson is:
 *   headline  → subheadline  → an ordered list of typed blocks.
 *
 * Block types (the only shapes allowed):
 *   intro      one framing sentence
 *   objectives "By the end you'll be able to…" (3 items)
 *   keypoints  the teaching meat — 3 titled points
 *   callout    one highlighted tip / important note
 *   takeaway   one closing line to remember
 *
 * Every content node has DEFAULT content authored up front for all four
 * use cases below (instructional-designer written). Industry is woven in
 * via {company} interpolation. If a node/training has no entry, a generic
 * structured lesson is derived so nothing is ever empty.
 */

import { engineFor } from './personalize'

export type ContentBlock =
  | { type: 'intro'; text: string }
  | { type: 'objectives'; items: string[] }
  | { type: 'keypoints'; items: { title: string; text: string }[] }
  | { type: 'callout'; variant: 'tip' | 'important'; text: string }
  | { type: 'takeaway'; text: string }

export interface LessonQuiz {
  question: string
  options: { label: string; correct?: boolean }[]
}

export interface NodeLesson {
  headline: string
  subheadline: string
  blocks: ContentBlock[]
  /** Single-question knowledge check shown as the node's second step. */
  quiz?: LessonQuiz
}

type LessonMap = Record<string, NodeLesson>

// ------------------------------------------------------------------ LEADERSHIP
const LEADERSHIP: LessonMap = {
  principles: {
    headline: 'The Four Functions of Management',
    subheadline: 'What managers actually do, every day',
    blocks: [
      { type: 'intro', text: 'Great managers at {company} aren’t the busiest people in the room — they’re the ones who plan, organize, lead, and control with intent.' },
      { type: 'objectives', items: [
        'Name the four core functions of management',
        'Recognize which function a given task belongs to',
        'Spot where your team spends too much or too little time',
      ] },
      { type: 'keypoints', items: [
        { title: 'Planning', text: 'Set direction and decide what good looks like before work starts.' },
        { title: 'Organizing', text: 'Match people, tools, and time to the plan so nothing falls through the cracks.' },
        { title: 'Leading', text: 'Motivate and coach — this is where most managers under-invest.' },
        { title: 'Controlling', text: 'Measure results against the plan and adjust early, not at year-end.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'If everything feels like firefighting, you’re heavy on controlling and light on planning. Rebalance.' },
      { type: 'takeaway', text: 'Management is a cycle, not a checklist — you move through all four functions constantly.' },
    ],
  },
  terminology: {
    headline: 'Speak the Language of Management',
    subheadline: 'The vocabulary your team expects you to use',
    blocks: [
      { type: 'intro', text: 'Shared words prevent expensive misunderstandings. These are the terms you’ll use in nearly every conversation at {company}.' },
      { type: 'keypoints', items: [
        { title: 'Delegation', text: 'Handing over ownership of a task — not just the task itself.' },
        { title: 'Accountability', text: 'Being answerable for an outcome, whether or not you did the work.' },
        { title: 'KPI', text: 'A key performance indicator — the number that tells you if you’re on track.' },
        { title: 'One-on-one', text: 'A recurring private conversation that’s about the person, not just the tasks.' },
      ] },
      { type: 'callout', variant: 'important', text: 'Accountability ≠ blame. Holding someone accountable is about clarity of ownership, not fault.' },
      { type: 'takeaway', text: 'When your team uses words the same way you do, decisions get faster.' },
    ],
  },
  styles: {
    headline: 'Match Your Style to the Moment',
    subheadline: 'Directive, coaching, and delegating — and when each lands',
    blocks: [
      { type: 'intro', text: 'The best leaders at {company} flex their approach to the person and the situation instead of defaulting to one gear.' },
      { type: 'objectives', items: [
        'Distinguish directive, coaching, and delegating styles',
        'Read when a situation calls for each',
        'Avoid the trap of leading everyone the same way',
      ] },
      { type: 'keypoints', items: [
        { title: 'Directive', text: 'High guidance. Right for new hires, crises, or high-risk work.' },
        { title: 'Coaching', text: 'Guidance plus questions. Right for capable people who are still growing.' },
        { title: 'Delegating', text: 'Low guidance, high trust. Right for proven performers who want autonomy.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'Over-managing a strong performer reads as distrust. Under-managing a new hire reads as neglect.' },
      { type: 'takeaway', text: 'Style isn’t who you are — it’s a dial you turn to fit the person in front of you.' },
    ],
  },
  communication: {
    headline: 'Feedback People Can Actually Use',
    subheadline: 'Clear, specific, and about the work',
    blocks: [
      { type: 'intro', text: 'Vague feedback is kinder in the moment and useless by Monday. Precise feedback is the fastest way to help someone at {company} improve.' },
      { type: 'keypoints', items: [
        { title: 'Be specific', text: 'Point to the behavior and the moment, not a personality trait.' },
        { title: 'Lead with impact', text: 'Explain what the behavior caused, so it’s clear why it matters.' },
        { title: 'Invite the other side', text: 'Ask “what got in the way?” before you decide what happened.' },
      ] },
      { type: 'callout', variant: 'important', text: 'Feedback delayed is feedback wasted. Say it within a day, not at the next review.' },
      { type: 'takeaway', text: 'Specific + timely + kind beats blunt or vague every single time.' },
    ],
  },
  expectations: {
    headline: 'Set Expectations Before You Need Them',
    subheadline: 'What great looks like, made explicit',
    blocks: [
      { type: 'intro', text: 'Most performance problems at {company} are really unspoken-expectation problems. Name the standard up front and you prevent the hard conversation later.' },
      { type: 'objectives', items: [
        'Define a clear, observable standard for a role',
        'Separate “must-have” outcomes from “nice-to-have” style',
        'Confirm the other person actually agrees to it',
      ] },
      { type: 'keypoints', items: [
        { title: 'Make it observable', text: 'An expectation you can’t see or measure can’t be met — or coached.' },
        { title: 'Agree, don’t announce', text: 'Expectations land when the person commits, not when you declare them.' },
        { title: 'Revisit on change', text: 'New role, new project, new teammate — re-set expectations each time.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'End every kickoff with: “So we’re agreed that success here looks like ___.”' },
      { type: 'takeaway', text: 'Clear expectations are the cheapest performance tool you have.' },
    ],
  },
  'customer-king': {
    headline: 'Put the Customer at the Center',
    subheadline: 'Every decision, traced back to the customer',
    blocks: [
      { type: 'intro', text: 'Teams at {company} that win keep one question on the table: how does this help the customer? Great managers make that reflex, not a poster.' },
      { type: 'keypoints', items: [
        { title: 'Connect the work', text: 'Show each person how their task reaches a real customer.' },
        { title: 'Bring the voice in', text: 'Share actual customer quotes and complaints, not just dashboards.' },
        { title: 'Protect the promise', text: 'When trade-offs appear, weigh them against the customer commitment.' },
      ] },
      { type: 'callout', variant: 'important', text: 'A customer-first culture is built in trade-off moments — that’s when your team learns what you really value.' },
      { type: 'takeaway', text: 'When the customer wins, the metrics tend to follow.' },
    ],
  },
}

// ------------------------------------------------------------------ ONBOARDING
const ONBOARDING: LessonMap = {
  principles: {
    headline: 'Your First 30 Days',
    subheadline: 'How to ramp with intention',
    blocks: [
      { type: 'intro', text: 'Your first month at {company} is about learning how value gets created here — not proving you already know everything.' },
      { type: 'objectives', items: [
        'Know your top priority for week one',
        'Understand how your role creates value',
        'Build the relationships that make the job easier',
      ] },
      { type: 'keypoints', items: [
        { title: 'Learn before changing', text: 'Understand why things work the way they do before you improve them.' },
        { title: 'Ask early', text: 'Questions in week one are expected. In week ten they’re expensive.' },
        { title: 'Find your people', text: 'Your onboarding buddy and teammates are your fastest path to answers.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'Keep a running “questions” doc. Patterns in it show you where the org is confusing — useful feedback later.' },
      { type: 'takeaway', text: 'Ramp fast by getting curious, not by looking busy.' },
    ],
  },
  terminology: {
    headline: 'Who’s Who & Key Terms',
    subheadline: 'The names and words you’ll hear on day one',
    blocks: [
      { type: 'intro', text: 'Every workplace has its own shorthand. Learning {company}’s early saves you from nodding along to things you don’t follow.' },
      { type: 'keypoints', items: [
        { title: 'Your team', text: 'The people you’ll work with daily — learn names and what each owns.' },
        { title: 'Cross-functional partners', text: 'The teams you’ll depend on: who to go to for what.' },
        { title: 'Core systems', text: 'The handful of tools where the real work happens.' },
      ] },
      { type: 'callout', variant: 'important', text: 'When you hear an acronym you don’t know, ask. Everyone did on their first week too.' },
      { type: 'takeaway', text: 'Knowing who does what turns a maze into a map.' },
    ],
  },
  styles: {
    headline: 'Tools & Systems',
    subheadline: 'Where the work actually happens',
    blocks: [
      { type: 'intro', text: 'You don’t need to master every tool at {company} — just the few you’ll touch daily, and where to look when you’re stuck.' },
      { type: 'objectives', items: [
        'Log into and navigate your core systems',
        'Know where documentation and help live',
        'Complete a real task end-to-end',
      ] },
      { type: 'keypoints', items: [
        { title: 'Start narrow', text: 'Learn the 20% of features you’ll use 80% of the time.' },
        { title: 'Bookmark the help', text: 'Know the wiki, the support channel, and who to tag.' },
        { title: 'Do it live', text: 'You learn a system by completing a real task, not by watching a demo.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'Can’t find the right system? Check the team wiki first, then ask your buddy — that order saves everyone time.' },
      { type: 'takeaway', text: 'Confidence with the tools is mostly repetition. It comes fast.' },
    ],
  },
  communication: {
    headline: 'Culture & Values',
    subheadline: 'How things really get done here',
    blocks: [
      { type: 'intro', text: 'Culture at {company} is the unwritten “how we do things.” Reading it early helps you fit in without losing what makes you, you.' },
      { type: 'keypoints', items: [
        { title: 'Watch the norms', text: 'How people meet, message, and disagree tells you what’s valued.' },
        { title: 'Match the channel', text: 'Know when to use chat, email, or a quick call — each carries different weight.' },
        { title: 'Assume good intent', text: 'Most friction early is a norms gap, not a people problem.' },
      ] },
      { type: 'callout', variant: 'important', text: 'When invited to something you don’t understand, ask what your role in it should be — it beats guessing or declining.' },
      { type: 'takeaway', text: 'You belong here — culture is learned, not inherited.' },
    ],
  },
  expectations: {
    headline: 'Role Expectations',
    subheadline: 'What success looks like in your seat',
    blocks: [
      { type: 'intro', text: 'Clarity beats guesswork. Knowing exactly what {company} expects of you removes the anxiety of “am I doing this right?”' },
      { type: 'objectives', items: [
        'Name your 2–3 most important outcomes',
        'Know how your work will be measured',
        'Understand what “great” looks like in 90 days',
      ] },
      { type: 'keypoints', items: [
        { title: 'Outcomes over activity', text: 'You’re measured on results, not hours or busyness.' },
        { title: 'Confirm the priorities', text: 'Ask your manager to rank them so you focus on what matters.' },
        { title: '30-60-90', text: 'Expectations grow in stages — early is about learning, later about owning.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'In your next one-on-one, ask: “What does a great first 90 days look like to you?” Then write it down.' },
      { type: 'takeaway', text: 'When you know the target, hitting it gets a lot simpler.' },
    ],
  },
  'customer-king': {
    headline: 'Working With Customers',
    subheadline: 'Why the customer shapes your role',
    blocks: [
      { type: 'intro', text: 'Even if you never talk to a customer directly, your work at {company} reaches one. Seeing that line makes the job matter more.' },
      { type: 'keypoints', items: [
        { title: 'Trace your impact', text: 'Follow your work downstream until it touches a real customer.' },
        { title: 'Represent them', text: 'In meetings, be the person who asks “what would the customer think?”' },
        { title: 'Small things compound', text: 'The quality of your piece adds up to the customer’s whole experience.' },
      ] },
      { type: 'callout', variant: 'important', text: 'A customer never sees your org chart — they see the sum of everyone’s work, including yours.' },
      { type: 'takeaway', text: 'Do your part well and the customer feels it, even from a distance.' },
    ],
  },
}

// ------------------------------------------------------------------ COMPLIANCE
const COMPLIANCE: LessonMap = {
  principles: {
    headline: 'Why Compliance Matters',
    subheadline: 'Protection, not paperwork',
    blocks: [
      { type: 'intro', text: 'Compliance at {company} exists to protect people, customers, and the business — not to slow you down or generate forms.' },
      { type: 'objectives', items: [
        'Explain the real purpose of a compliance program',
        'Recognize your personal role in it',
        'Know that “I didn’t know” is not a defense',
      ] },
      { type: 'keypoints', items: [
        { title: 'It protects people', text: 'Rules exist because someone, somewhere, got hurt without them.' },
        { title: 'It’s everyone’s job', text: 'Compliance isn’t a department — it’s a daily habit for every employee.' },
        { title: 'It builds trust', text: 'Customers and regulators stay because {company} does the right thing consistently.' },
      ] },
      { type: 'callout', variant: 'important', text: 'When a rule seems pointless, ask why it exists before you route around it — there’s usually a costly story behind it.' },
      { type: 'takeaway', text: 'Compliance is how good intentions become reliable behavior.' },
    ],
  },
  terminology: {
    headline: 'Key Terms & Definitions',
    subheadline: 'The words that carry legal weight',
    blocks: [
      { type: 'intro', text: 'In compliance, precise words matter. Using these correctly at {company} keeps you and your team on solid ground.' },
      { type: 'keypoints', items: [
        { title: 'PII', text: 'Personally identifiable information — data that can identify a specific person.' },
        { title: 'Conflict of interest', text: 'When personal interest could improperly sway a work decision.' },
        { title: 'Escalation', text: 'Routing a concern to the right authority instead of handling it alone.' },
        { title: 'Retention', text: 'How long records must be kept — and when they must be destroyed.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'Not sure if something is PII? Treat it as if it is until you confirm otherwise.' },
      { type: 'takeaway', text: 'The right word signals you understand the risk — and how to handle it.' },
    ],
  },
  styles: {
    headline: 'Key Regulations',
    subheadline: 'The rules that shape your day',
    blocks: [
      { type: 'intro', text: 'You don’t need to be a lawyer — you need to recognize which situations at {company} trigger which obligations.' },
      { type: 'objectives', items: [
        'Recognize the regulations relevant to your role',
        'Know the trigger that makes each one apply',
        'Know where to get help before you act',
      ] },
      { type: 'keypoints', items: [
        { title: 'Know the triggers', text: 'It’s less about memorizing rules, more about spotting when one applies.' },
        { title: 'When in doubt, pause', text: 'A five-minute check beats a violation you can’t undo.' },
        { title: 'Document as you go', text: 'A clear record protects you and shows good-faith effort.' },
      ] },
      { type: 'callout', variant: 'important', text: 'Regulations change. What was fine last year may not be today — rely on current guidance, not memory.' },
      { type: 'takeaway', text: 'Spotting the trigger is 90% of staying compliant.' },
    ],
  },
  communication: {
    headline: 'Reporting Concerns',
    subheadline: 'Speak up, the right way',
    blocks: [
      { type: 'intro', text: 'A concern raised early is a problem prevented. {company} needs people who report in good faith — and protects them when they do.' },
      { type: 'keypoints', items: [
        { title: 'Report when in doubt', text: 'You don’t need proof — a genuine concern is enough to raise.' },
        { title: 'Use the channel', text: 'Go through the proper reporting path, not the rumor mill.' },
        { title: 'Protection is real', text: 'Retaliation against good-faith reporters is itself a serious violation.' },
      ] },
      { type: 'callout', variant: 'important', text: 'Seeing something off and staying silent can make you part of the problem. Reporting is the responsible move.' },
      { type: 'takeaway', text: 'When in doubt, report — early and through the right channel.' },
    ],
  },
  expectations: {
    headline: 'Handling Violations',
    subheadline: 'What to do when something goes wrong',
    blocks: [
      { type: 'intro', text: 'How {company} responds to a violation matters as much as preventing it. A calm, correct response contains the damage.' },
      { type: 'objectives', items: [
        'Know the immediate steps when a violation surfaces',
        'Preserve information instead of “fixing” it quietly',
        'Escalate to the right people without delay',
      ] },
      { type: 'keypoints', items: [
        { title: 'Contain, don’t cover', text: 'Stop the harm — never hide or alter what happened.' },
        { title: 'Preserve the record', text: 'Keep evidence intact; investigators need the real picture.' },
        { title: 'Escalate fast', text: 'The sooner the right team knows, the smaller the consequences.' },
      ] },
      { type: 'callout', variant: 'important', text: 'The cover-up is almost always worse than the violation. Honesty shrinks the problem.' },
      { type: 'takeaway', text: 'Respond quickly, honestly, and through the proper channel.' },
    ],
  },
  'customer-king': {
    headline: 'Data Privacy Essentials',
    subheadline: 'Guarding the information people trust you with',
    blocks: [
      { type: 'intro', text: 'Customers hand {company} their data on trust. Protecting it is one of the most concrete compliance duties you have.' },
      { type: 'keypoints', items: [
        { title: 'Least access', text: 'Only touch the data you actually need to do your job.' },
        { title: 'Right channel', text: 'Never move sensitive data through personal email or unapproved apps.' },
        { title: 'Lock it down', text: 'Screens, passwords, and devices are the front line of privacy.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'A colleague sharing customer data over personal email is a report-it moment — not a look-the-other-way one.' },
      { type: 'takeaway', text: 'Treat every record as if it were your own personal data.' },
    ],
  },
}

// ------------------------------------------------------------------ SALES
const SALES: LessonMap = {
  principles: {
    headline: 'Knowing Your Customer',
    subheadline: 'Sell to the problem, not the product',
    blocks: [
      { type: 'intro', text: 'Top performers at {company} win because they understand the customer’s problem better than the customer expected them to.' },
      { type: 'objectives', items: [
        'Identify the real problem behind a request',
        'Map who is involved in the decision',
        'Lead with the customer’s goals, not your features',
      ] },
      { type: 'keypoints', items: [
        { title: 'Problem first', text: 'The first conversation is about their pain, not your pitch.' },
        { title: 'Know the players', text: 'Understand who decides, who influences, and who signs.' },
        { title: 'Earn the right', text: 'Insight and good questions earn you the next meeting.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'If you’re talking more than you’re listening in a first call, you’re selling too early.' },
      { type: 'takeaway', text: 'Understand the problem deeply and the solution sells itself.' },
    ],
  },
  terminology: {
    headline: 'Your Product, Cold',
    subheadline: 'Know it well enough to make it simple',
    blocks: [
      { type: 'intro', text: 'You can’t sell what you can’t explain simply. Knowing {company}’s offering cold lets you translate features into customer value on the fly.' },
      { type: 'keypoints', items: [
        { title: 'Value, not features', text: 'For every feature, know the customer outcome it creates.' },
        { title: 'Know the edges', text: 'Understand what your product is not for — honesty builds trust.' },
        { title: 'Proof on hand', text: 'Have a story or number ready for each key claim.' },
      ] },
      { type: 'callout', variant: 'important', text: 'A confused prospect never buys. If you can’t explain it simply, you don’t know it well enough yet.' },
      { type: 'takeaway', text: 'Deep product knowledge is what makes you sound effortless.' },
    ],
  },
  styles: {
    headline: 'Discovery Skills',
    subheadline: 'The questions that uncover the deal',
    blocks: [
      { type: 'intro', text: 'Discovery is where deals at {company} are really won. Great questions surface needs the customer hadn’t put into words.' },
      { type: 'objectives', items: [
        'Ask open-ended questions that open a conversation',
        'Uncover the cost of the customer’s status quo',
        'Listen for what’s said and what’s avoided',
      ] },
      { type: 'keypoints', items: [
        { title: 'Open, not yes/no', text: 'Ask questions that can’t be answered in one word.' },
        { title: 'Quantify the pain', text: 'Help the customer put a number on the problem’s cost.' },
        { title: 'Silence is a tool', text: 'After a good question, wait. The best answers come in the pause.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'The best discovery questions are open-ended and about their goals — not about your product.' },
      { type: 'takeaway', text: 'He who asks the best questions controls the conversation.' },
    ],
  },
  communication: {
    headline: 'Handling Objections',
    subheadline: 'Turn “no” into “tell me more”',
    blocks: [
      { type: 'intro', text: 'Objections aren’t rejection — they’re requests for information. Top reps at {company} lean in instead of flinching.' },
      { type: 'keypoints', items: [
        { title: 'Get curious', text: 'Ask what’s behind the objection before you answer it.' },
        { title: 'Don’t discount reflexively', text: '“Too expensive” is often about value, not price.' },
        { title: 'Acknowledge, then address', text: 'Show you heard them before you respond.' },
      ] },
      { type: 'callout', variant: 'important', text: 'When you hear “it’s too expensive,” ask what they’re comparing it to — the answer reframes the whole conversation.' },
      { type: 'takeaway', text: 'Every objection handled well moves the deal forward, not back.' },
    ],
  },
  expectations: {
    headline: 'Expectations of Top Performers',
    subheadline: 'What separates good from great',
    blocks: [
      { type: 'intro', text: 'The top reps at {company} aren’t lucky — they run a disciplined process and hold themselves to it every week.' },
      { type: 'objectives', items: [
        'Know the activities that actually drive pipeline',
        'Set the next meeting on every call',
        'Give prospects a reason to show up next time',
      ] },
      { type: 'keypoints', items: [
        { title: 'Always advance', text: 'Every conversation ends with a scheduled next step.' },
        { title: 'Create a reason', text: 'Give the prospect something valuable to return for.' },
        { title: 'Run the process', text: 'Consistency beats heroics — trust the steps.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'Never end a call without the next one booked. “I’ll follow up” is where deals go to die.' },
      { type: 'takeaway', text: 'Great selling is a discipline you repeat, not a talent you’re born with.' },
    ],
  },
  'customer-king': {
    headline: 'Closing With Confidence',
    subheadline: 'Ask for the business — clearly',
    blocks: [
      { type: 'intro', text: 'A great process at {company} deserves a clear ask. Closing isn’t pressure — it’s helping the customer make the decision they came for.' },
      { type: 'keypoints', items: [
        { title: 'Earn the close', text: 'If you’ve done discovery well, the close is a natural next step.' },
        { title: 'Ask directly', text: 'State the next step plainly instead of hoping they raise it.' },
        { title: 'Silence after the ask', text: 'Make the request, then let them answer — don’t talk past it.' },
      ] },
      { type: 'callout', variant: 'important', text: 'A soft, unclear ask confuses buyers. Confidence in the close signals confidence in the value.' },
      { type: 'takeaway', text: 'If you’ve helped them all the way here, asking for the business is a service.' },
    ],
  },
}

// Lighter "activity / checkpoint" templates (practice, milestone, verify).
function activityLesson(kind: 'practice' | 'milestone' | 'verify', title: string): NodeLesson {
  if (kind === 'practice')
    return {
      headline: title,
      subheadline: 'Apply what you just learned',
      blocks: [
        { type: 'intro', text: 'Short, realistic scenarios put the concepts to work — because you learn a skill by using it, not reading about it.' },
        { type: 'keypoints', items: [
          { title: 'Decide fast', text: 'Each scenario asks you to choose the best next move.' },
          { title: 'See the why', text: 'You get instant feedback on what worked and what didn’t.' },
          { title: 'No penalty', text: 'This is practice — mistakes here are exactly the point.' },
        ] },
        { type: 'takeaway', text: 'Reps in a safe space build the instinct you’ll use for real.' },
      ],
    }
  if (kind === 'milestone')
    return {
      headline: title,
      subheadline: 'A checkpoint before the applied work',
      blocks: [
        { type: 'intro', text: 'This milestone confirms the foundations are solid before you move into the hands-on half of the path.' },
        { type: 'keypoints', items: [
          { title: 'Pull it together', text: 'Connect the ideas from the last few activities into one picture.' },
          { title: 'Spot the gaps', text: 'If something feels shaky, this is the moment to revisit it.' },
          { title: 'Unlock what’s next', text: 'Clearing the checkpoint opens the applied simulations ahead.' },
        ] },
        { type: 'takeaway', text: 'Checkpoints keep the path honest — you advance because you’re ready.' },
      ],
    }
  return {
    headline: title,
    subheadline: 'Prove the skill — not the seat time',
    blocks: [
      { type: 'intro', text: 'Skillwell verifies skills, not hours. Passing this check certifies these skills against the taxonomy for your records.' },
      { type: 'keypoints', items: [
        { title: 'Skill, verified', text: 'You demonstrate the ability — the system records it as proven.' },
        { title: 'Feeds the data', text: 'Verified skills roll up to the dashboards your L&D team sees.' },
        { title: 'Portable proof', text: 'Certified skills follow the learner, not just the course.' },
      ] },
      { type: 'takeaway', text: 'Verified skills are the point — everything else is just the path to them.' },
    ],
  }
}

const BY_TRAINING: Record<string, LessonMap> = {
  leadership: LEADERSHIP,
  onboarding: ONBOARDING,
  compliance: COMPLIANCE,
  sales: SALES,
}

// One knowledge-check question per core lesson (the node's second step).
const Q = (question: string, correct: string, ...wrong: string[]): LessonQuiz => ({
  question,
  options: [{ label: correct, correct: true }, ...wrong.map((label) => ({ label }))],
})

const QUIZZES: Record<string, Record<string, LessonQuiz>> = {
  leadership: {
    principles: Q('Which is one of the four functions of management?', 'Planning and setting direction', 'Doing every task yourself', 'Avoiding hard conversations'),
    terminology: Q('What does accountability mean?', 'Being answerable for an outcome', 'Assigning blame to someone', 'Doing all the work yourself'),
    styles: Q('A proven performer who wants autonomy is best led with which style?', 'Delegating', 'Directive', 'Constant supervision'),
    communication: Q('What makes feedback most useful?', 'Specific and timely', 'Vague and delayed', 'Saved for the annual review'),
    expectations: Q('The best expectations are…', 'Observable and agreed to', 'Left unspoken', 'Announced once, then forgotten'),
    'customer-king': Q('A customer-first culture is really built…', 'In trade-off moments', 'On a poster in the break room', 'Only by the sales team'),
  },
  onboarding: {
    principles: Q('Your top priority in your first week is…', 'Learning how your role creates value', 'Reorganizing team processes', 'Keeping your head down'),
    terminology: Q('When you hear an acronym you don’t know, you should…', 'Ask what it means', 'Nod along', 'Avoid the topic'),
    styles: Q('The fastest way to learn a new system is…', 'Complete a real task in it', 'Watch a demo once', 'Read every manual first'),
    communication: Q('Early friction with team norms is usually…', 'A norms gap, not a people problem', 'A sign you don’t belong', 'Something to ignore forever'),
    expectations: Q('You’ll mainly be measured on…', 'Outcomes', 'Hours logged', 'Looking busy'),
    'customer-king': Q('Even behind the scenes, your work…', 'Reaches a real customer', 'Never really matters', 'Is only about your team'),
  },
  compliance: {
    principles: Q('Compliance programs primarily exist to…', 'Protect people, customers, and the business', 'Create paperwork', 'Slow projects down'),
    terminology: Q('If you’re unsure whether data is PII, you should…', 'Treat it as PII until you confirm', 'Assume it isn’t', 'Share it freely'),
    styles: Q('Staying compliant is mostly about…', 'Spotting when a rule applies', 'Memorizing every regulation', 'Ignoring rule changes'),
    communication: Q('You should report a concern when…', 'You have a genuine, good-faith concern', 'Only with hard proof', 'Never — it’s not your job'),
    expectations: Q('When a violation surfaces, you should…', 'Contain it and preserve the record', 'Quietly fix it yourself', 'Delete the evidence'),
    'customer-king': Q('Sensitive customer data should move through…', 'Approved channels only', 'Your personal email', 'Whatever app is convenient'),
  },
  sales: {
    principles: Q('A first sales conversation should focus on…', 'The customer’s problem', 'Every product feature', 'Sending the contract'),
    terminology: Q('If you can’t explain your product simply…', 'You don’t know it well enough yet', 'The customer is the problem', 'You should add more jargon'),
    styles: Q('The best discovery questions are…', 'Open-ended and about their goals', 'Yes/no questions', 'All about your product'),
    communication: Q('When you hear “it’s too expensive,” first…', 'Ask what they’re comparing it to', 'Offer a discount', 'End the call'),
    expectations: Q('Every sales call should end with…', 'A scheduled next step', 'A vague “I’ll follow up”', 'Nothing in particular'),
    'customer-king': Q('A strong close is…', 'A clear, direct ask', 'A vague hint', 'Never mentioning next steps'),
  },
}

const ACTIVITY_KIND: Record<string, 'practice' | 'milestone' | 'verify'> = {
  'practice-quiz': 'practice',
  milestone: 'milestone',
  'final-assessment': 'verify',
}

function interpolate(lesson: NodeLesson, company: string): NodeLesson {
  const fix = (s: string) => s.replace(/\{company\}/g, company)
  return {
    headline: fix(lesson.headline),
    subheadline: fix(lesson.subheadline),
    blocks: lesson.blocks.map((b): ContentBlock => {
      switch (b.type) {
        case 'intro':
          return { type: 'intro', text: fix(b.text) }
        case 'callout':
          return { type: 'callout', variant: b.variant, text: fix(b.text) }
        case 'takeaway':
          return { type: 'takeaway', text: fix(b.text) }
        case 'objectives':
          return { type: 'objectives', items: b.items.map(fix) }
        case 'keypoints':
          return { type: 'keypoints', items: b.items.map((i) => ({ title: fix(i.title), text: fix(i.text) })) }
      }
    }),
  }
}

/**
 * Resolve the default lesson for a node. `title` is the (already
 * personalized) node title, used for activity headings and as a fallback.
 */
export function getLesson(
  training: string,
  nodeId: string,
  company: string,
  title: string,
): NodeLesson {
  const engine = engineFor(training)
  const map = BY_TRAINING[engine] ?? LEADERSHIP
  const quiz = QUIZZES[engine]?.[nodeId] ?? QUIZZES.leadership[nodeId]
  const authored = map[nodeId]
  if (authored) {
    const lesson = interpolate(authored, company)
    return quiz ? { ...lesson, quiz } : lesson
  }

  const kind = ACTIVITY_KIND[nodeId]
  if (kind) return interpolate(activityLesson(kind, title), company)

  // Generic structured fallback so nothing is ever empty.
  return interpolate(
    {
      headline: title,
      subheadline: 'A guided learning activity',
      blocks: [
        { type: 'intro', text: `This activity builds a core skill for your path at {company}.` },
        { type: 'takeaway', text: 'Work through it at your pace — Skillwell adapts as you go.' },
      ],
    },
    company,
  )
}
