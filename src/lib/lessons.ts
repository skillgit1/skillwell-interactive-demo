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

// ------------------------------------------------------------------ DEI
const DEI: LessonMap = {
  terminology: {
    headline: 'The Words That Shape Inclusion',
    subheadline: 'Shared language for talking about difference',
    blocks: [
      { type: 'intro', text: 'Talking about diversity gets easier when everyone at {company} shares the same definitions. These are the terms you will hear most often.' },
      { type: 'keypoints', items: [
        { title: 'Diversity', text: 'The mix of backgrounds, identities, and perspectives present on a team.' },
        { title: 'Equity', text: 'Giving people what they each need to succeed, which is not always the same thing.' },
        { title: 'Inclusion', text: 'Making sure every person feels welcome, heard, and able to contribute.' },
        { title: 'Belonging', text: 'The feeling of being accepted for who you are, not just present in the room.' },
      ] },
      { type: 'callout', variant: 'important', text: 'Equity and equality are not the same. Equality gives everyone the same thing. Equity gives each person what they need to reach the same starting line.' },
      { type: 'takeaway', text: 'Shared language is the foundation. It lets a team talk about hard topics without talking past each other.' },
    ],
  },
  styles: {
    headline: 'Understanding Bias',
    subheadline: 'How the mind takes shortcuts, and what to do about it',
    blocks: [
      { type: 'intro', text: 'Everyone carries bias. It is the brain making fast judgments to save effort. The goal at {company} is not to feel guilty about it, but to notice it and choose better.' },
      { type: 'objectives', items: [
        'Explain what unconscious bias is',
        'Recognize where bias tends to show up at work',
        'Use simple habits to slow down and check your thinking',
      ] },
      { type: 'keypoints', items: [
        { title: 'It is automatic', text: 'Bias runs in the background. Noticing it is the first act of managing it.' },
        { title: 'It shows up in decisions', text: 'Hiring, feedback, and who gets the big project are common places bias hides.' },
        { title: 'Slow down to check', text: 'When a decision matters, pause and ask what is really driving your judgment.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'Before a hiring or promotion decision, ask yourself whether you would judge this the same way if the person came from a different background.' },
      { type: 'takeaway', text: 'You cannot switch off bias, but you can build habits that keep it from making your decisions for you.' },
    ],
  },
  communication: {
    headline: 'Inclusive Conversations',
    subheadline: 'Talking across difference with care',
    blocks: [
      { type: 'intro', text: 'The way we talk with each other decides whether people at {company} feel included or shut out. Small choices in everyday conversation carry real weight.' },
      { type: 'keypoints', items: [
        { title: 'Listen first', text: 'Give people room to finish. Being heard is what makes someone feel they belong.' },
        { title: 'Assume good intent, name the impact', text: 'Most harm is unintentional. You can address the effect without attacking the person.' },
        { title: 'Get comfortable being corrected', text: 'When someone tells you a word landed badly, thank them and adjust.' },
      ] },
      { type: 'callout', variant: 'important', text: 'When someone shares that a comment hurt, the goal is not to prove you meant well. The goal is to understand and do better next time.' },
      { type: 'takeaway', text: 'Inclusive conversation is a skill. It grows every time you choose curiosity over defensiveness.' },
    ],
  },
  expectations: {
    headline: 'Being an Active Ally',
    subheadline: 'Turning good intentions into action',
    blocks: [
      { type: 'intro', text: 'Inclusion at {company} is built by people who act, not just people who agree. An ally uses their voice and position to support others.' },
      { type: 'objectives', items: [
        'Describe what allyship looks like day to day',
        'Speak up when you see someone excluded',
        'Share credit and opportunity, not just support',
      ] },
      { type: 'keypoints', items: [
        { title: 'Use your voice', text: 'Interrupt a biased comment or redirect a meeting so quieter voices are heard.' },
        { title: 'Share the platform', text: 'Point attention and credit toward people who are often overlooked.' },
        { title: 'Follow, do not assume', text: 'Ask what support people actually want rather than deciding for them.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'A simple ally move: in your next meeting, credit an idea back to the person who first said it.' },
      { type: 'takeaway', text: 'Allyship is a set of everyday actions, not a title you claim.' },
    ],
  },
  'customer-king': {
    headline: 'Equity in Decisions',
    subheadline: 'Fairness built into how choices get made',
    blocks: [
      { type: 'intro', text: 'The fairest teams at {company} do not rely on good intentions alone. They build fairness into how decisions actually get made.' },
      { type: 'keypoints', items: [
        { title: 'Use clear criteria', text: 'Decide what good looks like before you evaluate people, not after.' },
        { title: 'Check who is missing', text: 'Ask whose perspective is absent from the decision before you finalize it.' },
        { title: 'Look at the pattern', text: 'One fair decision is good. Fair patterns over time are the real goal.' },
      ] },
      { type: 'callout', variant: 'important', text: 'Equity is not about lowering the bar. It is about making sure the bar is the same for everyone and that everyone has a real shot at clearing it.' },
      { type: 'takeaway', text: 'When fairness is built into the process, you do not have to rely on remembering to be fair.' },
    ],
  },
}

// ------------------------------------------------------------------ MANDATORY (TITLE IX)
const HE_MANDATORY: LessonMap = {
  terminology: {
    headline: 'Key Terms and Definitions',
    subheadline: 'The language of Title IX and campus safety',
    blocks: [
      { type: 'intro', text: 'Required training uses specific words for good reason. Knowing them helps you understand your rights and act correctly at {company}.' },
      { type: 'keypoints', items: [
        { title: 'Title IX', text: 'A federal law that protects people from sex-based discrimination in education programs.' },
        { title: 'Consent', text: 'A clear and voluntary agreement. It can be withdrawn at any time.' },
        { title: 'Mandated reporter', text: 'A staff member who is required to report certain disclosures to the right office.' },
        { title: 'Retaliation', text: 'Punishing someone for reporting a concern, which is itself prohibited.' },
      ] },
      { type: 'callout', variant: 'important', text: 'If you are unsure whether you are a mandated reporter, ask. The answer shapes what you must do with a disclosure.' },
      { type: 'takeaway', text: 'Clear definitions protect everyone, because they remove doubt about what the rules actually mean.' },
    ],
  },
  styles: {
    headline: 'Recognizing Prohibited Conduct',
    subheadline: 'Knowing what crosses the line',
    blocks: [
      { type: 'intro', text: 'You do not need to be an investigator. You need to recognize when something may violate policy at {company} so you know to act.' },
      { type: 'objectives', items: [
        'Identify the main categories of prohibited conduct',
        'Understand why power and consent matter',
        'Know that you do not have to be certain to raise a concern',
      ] },
      { type: 'keypoints', items: [
        { title: 'Harassment', text: 'Unwelcome conduct that interferes with someone learning or working.' },
        { title: 'Discrimination', text: 'Treating someone unfairly because of a protected characteristic.' },
        { title: 'Abuse of power', text: 'Using authority or position to pressure someone is never acceptable.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'You are not judging guilt. You are noticing that something may be wrong and passing it to people trained to look into it.' },
      { type: 'takeaway', text: 'Recognizing the signs is the part that belongs to all of us. The rest belongs to the experts.' },
    ],
  },
  communication: {
    headline: 'How to Report',
    subheadline: 'Getting a concern to the right place',
    blocks: [
      { type: 'intro', text: 'A concern only helps if it reaches the right office. {company} has clear channels so nothing important gets lost.' },
      { type: 'keypoints', items: [
        { title: 'Know the channels', text: 'The Title IX office, campus safety, and confidential resources each serve a role.' },
        { title: 'Report in good faith', text: 'You do not need proof. A genuine concern is enough to raise.' },
        { title: 'Confidential help exists', text: 'Some resources can support a person without triggering a formal report.' },
      ] },
      { type: 'callout', variant: 'important', text: 'Reporting in good faith is protected. No one should face retaliation for raising a genuine concern.' },
      { type: 'takeaway', text: 'When in doubt, reach out. The office you contact will guide the next step.' },
    ],
  },
  expectations: {
    headline: 'Supporting Someone Who Discloses',
    subheadline: 'How to respond when someone trusts you',
    blocks: [
      { type: 'intro', text: 'How you respond in the first moment matters. A calm, kind response helps someone at {company} feel safe enough to get help.' },
      { type: 'objectives', items: [
        'Respond with care when someone shares a difficult experience',
        'Avoid promises you cannot keep about confidentiality',
        'Connect the person to the right resources',
      ] },
      { type: 'keypoints', items: [
        { title: 'Listen and believe', text: 'Your job is to support, not to interrogate or judge.' },
        { title: 'Be honest about reporting', text: 'If you are a mandated reporter, say so kindly before they share more.' },
        { title: 'Point to resources', text: 'Connect them with the offices trained to help. You do not carry this alone.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'A simple, steady response works well: “Thank you for telling me. Let me help you find the right support.”' },
      { type: 'takeaway', text: 'You do not need the perfect words. You need to listen and help them reach real support.' },
    ],
  },
  'customer-king': {
    headline: 'Confidentiality and Privacy',
    subheadline: 'Protecting people when it counts most',
    blocks: [
      { type: 'intro', text: 'When someone shares something sensitive, their privacy is part of their safety. Handling it with care is a duty everyone at {company} shares.' },
      { type: 'keypoints', items: [
        { title: 'Share only as needed', text: 'Pass information to the right office, not to friends or the rumor mill.' },
        { title: 'Protect the record', text: 'Sensitive details belong in secure, official channels.' },
        { title: 'Respect their choices', text: 'Where policy allows, let the person guide how much moves forward.' },
      ] },
      { type: 'callout', variant: 'important', text: 'Gossip is a second harm. Protecting privacy is how you protect the person.' },
      { type: 'takeaway', text: 'Handle every disclosure the way you would want your own handled.' },
    ],
  },
}

// ------------------------------------------------------------------ STEM
const HE_STEM: LessonMap = {
  terminology: {
    headline: 'Core Concepts and Notation',
    subheadline: 'The shared language of science and math',
    blocks: [
      { type: 'intro', text: 'Every STEM field runs on precise language. Getting comfortable with it early makes everything that follows at {company} easier.' },
      { type: 'keypoints', items: [
        { title: 'Variable', text: 'A symbol that stands in for a value that can change.' },
        { title: 'Hypothesis', text: 'A testable prediction you make before running an experiment.' },
        { title: 'Units', text: 'The labels that give a number meaning, such as meters or seconds.' },
        { title: 'Model', text: 'A simplified version of the world used to make predictions.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'Always carry your units through a calculation. A number without a unit is usually an answer without meaning.' },
      { type: 'takeaway', text: 'Precise terms are not busywork. They are how scientists avoid expensive misunderstandings.' },
    ],
  },
  styles: {
    headline: 'Reasoning with Numbers',
    subheadline: 'Thinking quantitatively with confidence',
    blocks: [
      { type: 'intro', text: 'Quantitative reasoning is less about arithmetic and more about knowing what a number is telling you. It is a skill you will use in every STEM course at {company}.' },
      { type: 'objectives', items: [
        'Estimate an answer before you calculate',
        'Judge whether a result is reasonable',
        'Read what a number actually represents',
      ] },
      { type: 'keypoints', items: [
        { title: 'Estimate first', text: 'A rough guess tells you if your final answer is in the right range.' },
        { title: 'Check the size', text: 'Ask if the result is too big or too small to make sense.' },
        { title: 'Mind the meaning', text: 'A number answers a question. Keep the question in view.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'If a calculation gives a person a height of 40 meters, trust your estimate over the calculator. You made an error somewhere.' },
      { type: 'takeaway', text: 'Good quantitative thinkers sanity check every answer before they trust it.' },
    ],
  },
  communication: {
    headline: 'Explaining Your Work',
    subheadline: 'Making technical ideas clear to others',
    blocks: [
      { type: 'intro', text: 'A finding no one understands has little value. Learning to explain your work clearly is part of doing science well at {company}.' },
      { type: 'keypoints', items: [
        { title: 'Show your reasoning', text: 'Walk through how you got there, not just the final answer.' },
        { title: 'Match your audience', text: 'Explain to a classmate differently than to an expert.' },
        { title: 'Let the evidence lead', text: 'State what the data shows before you state your opinion about it.' },
      ] },
      { type: 'callout', variant: 'important', text: 'If you cannot explain your method simply, it is worth asking whether you fully understand it yet.' },
      { type: 'takeaway', text: 'Clear explanation is proof that you truly understand, not just that you got the answer.' },
    ],
  },
  expectations: {
    headline: 'Designing an Experiment',
    subheadline: 'Asking a question the right way',
    blocks: [
      { type: 'intro', text: 'A good experiment is designed before any data is collected. The design is what makes the results trustworthy at {company} and beyond.' },
      { type: 'objectives', items: [
        'State a clear, testable question',
        'Identify what you will change and what you will measure',
        'Control the factors that could confuse your result',
      ] },
      { type: 'keypoints', items: [
        { title: 'One thing at a time', text: 'Change a single variable so you know what caused the effect.' },
        { title: 'Use a control', text: 'Compare against a baseline so your result means something.' },
        { title: 'Plan the measurement', text: 'Decide how you will measure before you start, not after.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'If you cannot say what would prove your hypothesis wrong, it is not yet a testable question.' },
      { type: 'takeaway', text: 'The quality of your answer depends on the quality of your design.' },
    ],
  },
  'customer-king': {
    headline: 'Interpreting Data',
    subheadline: 'Reading results without fooling yourself',
    blocks: [
      { type: 'intro', text: 'Collecting data is only half the work. Reading it honestly is where good scientists at {company} separate signal from noise.' },
      { type: 'keypoints', items: [
        { title: 'Correlation is not cause', text: 'Two things moving together does not prove one caused the other.' },
        { title: 'Look for other explanations', text: 'Ask what else could account for the result you see.' },
        { title: 'Respect uncertainty', text: 'Every measurement has error. Report it honestly.' },
      ] },
      { type: 'callout', variant: 'important', text: 'The most common mistake is seeing the result you hoped for. Guard against it by looking for reasons you might be wrong.' },
      { type: 'takeaway', text: 'Honest interpretation is what makes data worth collecting in the first place.' },
    ],
  },
}

// ------------------------------------------------------------------ SOCIAL SCIENCES
const HE_SOCIAL: LessonMap = {
  terminology: {
    headline: 'Key Concepts and Theories',
    subheadline: 'The building blocks of social science',
    blocks: [
      { type: 'intro', text: 'Social scientists use shared concepts to study how people and societies work. Knowing them helps you follow the conversation at {company}.' },
      { type: 'keypoints', items: [
        { title: 'Theory', text: 'A tested explanation for how or why something happens.' },
        { title: 'Variable', text: 'A factor that can change and that researchers measure or compare.' },
        { title: 'Sample', text: 'The group actually studied, meant to represent a larger population.' },
        { title: 'Bias', text: 'Anything that skews a study away from an accurate picture.' },
      ] },
      { type: 'callout', variant: 'important', text: 'A theory in science is not a guess. It is an explanation supported by a body of evidence.' },
      { type: 'takeaway', text: 'These concepts are the tools you use to ask sharper questions about human behavior.' },
    ],
  },
  styles: {
    headline: 'Research Methods',
    subheadline: 'How social scientists gather evidence',
    blocks: [
      { type: 'intro', text: 'The method a researcher chooses shapes what they can learn. Understanding the main methods helps you judge any study you read at {company}.' },
      { type: 'objectives', items: [
        'Tell the difference between qualitative and quantitative methods',
        'Match a method to the question it can answer',
        'Spot the limits of each approach',
      ] },
      { type: 'keypoints', items: [
        { title: 'Surveys', text: 'Reach many people quickly, but depend on honest and clear answers.' },
        { title: 'Interviews', text: 'Go deep with fewer people to understand the why behind behavior.' },
        { title: 'Observation', text: 'Watch behavior as it happens, without relying on what people report.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'Ask what a study cannot tell you. Every method has a blind spot, and naming it is a sign of careful thinking.' },
      { type: 'takeaway', text: 'The right method depends entirely on the question you are trying to answer.' },
    ],
  },
  communication: {
    headline: 'Making an Argument from Evidence',
    subheadline: 'Claims that hold up to scrutiny',
    blocks: [
      { type: 'intro', text: 'In the social sciences, an argument is only as strong as the evidence behind it. Learning to build one carefully is central to the work at {company}.' },
      { type: 'keypoints', items: [
        { title: 'Start with a claim', text: 'State clearly what you believe to be true.' },
        { title: 'Back it with evidence', text: 'Support the claim with data, studies, or documented observation.' },
        { title: 'Address the counterview', text: 'A strong argument takes the other side seriously and responds to it.' },
      ] },
      { type: 'callout', variant: 'important', text: 'An argument that ignores the best objection is weaker for it. Engaging the counterview is what makes yours persuasive.' },
      { type: 'takeaway', text: 'Evidence and honest reasoning, not volume or confidence, are what win a social science argument.' },
    ],
  },
  expectations: {
    headline: 'Analyzing Society and Systems',
    subheadline: 'Seeing the structures behind behavior',
    blocks: [
      { type: 'intro', text: 'Individual choices happen inside larger systems. Social science trains you to see both at {company}, the person and the structure around them.' },
      { type: 'objectives', items: [
        'Explain how institutions shape individual behavior',
        'Move between the individual and the system in your analysis',
        'Avoid explaining everything by personal choice alone',
      ] },
      { type: 'keypoints', items: [
        { title: 'Zoom out', text: 'Ask what rules, incentives, and history shape the behavior you see.' },
        { title: 'Zoom in', text: 'Remember that systems are made of real people making real choices.' },
        { title: 'Hold both', text: 'The strongest analysis connects the individual to the structure.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'When a pattern repeats across many people, look for a systemic cause before blaming individual choices.' },
      { type: 'takeaway', text: 'Good social analysis keeps both the person and the system in view at once.' },
    ],
  },
  'customer-king': {
    headline: 'Interpreting Human Behavior',
    subheadline: 'Explaining what people do, carefully',
    blocks: [
      { type: 'intro', text: 'People are complex, and easy explanations are often wrong. Careful interpretation is the heart of social science at {company}.' },
      { type: 'keypoints', items: [
        { title: 'Resist the easy story', text: 'The first explanation that feels right is not always the correct one.' },
        { title: 'Consider context', text: 'Behavior that seems strange often makes sense once you know the setting.' },
        { title: 'Stay open to revision', text: 'New evidence should be able to change your explanation.' },
      ] },
      { type: 'callout', variant: 'important', text: 'Beware of judging a whole group by a single story. Good social science looks at patterns, not anecdotes.' },
      { type: 'takeaway', text: 'Understanding people well means holding your explanations loosely enough to update them.' },
    ],
  },
}

// ------------------------------------------------------------------ HUMANITIES
const HE_HUMANITIES: LessonMap = {
  terminology: {
    headline: 'Key Terms in Reading and History',
    subheadline: 'The vocabulary of close study',
    blocks: [
      { type: 'intro', text: 'The humanities have their own toolkit of terms. Knowing them lets you discuss a text or an era with precision at {company}.' },
      { type: 'keypoints', items: [
        { title: 'Theme', text: 'The underlying idea a work explores, beyond its plot or events.' },
        { title: 'Context', text: 'The historical and cultural setting that shaped a work.' },
        { title: 'Primary source', text: 'A firsthand record from the time being studied.' },
        { title: 'Interpretation', text: 'A supported reading of what a work means.' },
      ] },
      { type: 'callout', variant: 'important', text: 'A primary source comes from the moment itself. A secondary source is someone later writing about it. Know which you are reading.' },
      { type: 'takeaway', text: 'These terms turn a vague reaction to a text into a clear, shareable observation.' },
    ],
  },
  styles: {
    headline: 'Reading Closely',
    subheadline: 'Slowing down to see what a text really says',
    blocks: [
      { type: 'intro', text: 'Close reading is the core skill of the humanities. It means paying careful attention to the details of a text at {company}, not rushing to the summary.' },
      { type: 'objectives', items: [
        'Notice word choice, structure, and tone',
        'Ask why an author made a specific choice',
        'Support a reading with evidence from the text',
      ] },
      { type: 'keypoints', items: [
        { title: 'Read for detail', text: 'The meaning often lives in a single word or an unexpected image.' },
        { title: 'Ask why', text: 'Treat every choice as deliberate and ask what it accomplishes.' },
        { title: 'Point to the text', text: 'Ground every claim in a specific line or passage.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'When a passage surprises you, slow down. Surprise is usually a sign that something meaningful is happening.' },
      { type: 'takeaway', text: 'Close reading rewards patience. The careful reader sees what the fast reader misses.' },
    ],
  },
  communication: {
    headline: 'Building an Argument',
    subheadline: 'From a reading to a claim you can defend',
    blocks: [
      { type: 'intro', text: 'An interpretation becomes an argument when you can defend it with evidence. This is the writing at the center of the humanities at {company}.' },
      { type: 'keypoints', items: [
        { title: 'Lead with a thesis', text: 'State your central claim clearly and early.' },
        { title: 'Quote with purpose', text: 'Use evidence from the text to support each point, not to fill space.' },
        { title: 'Explain the link', text: 'Show how each piece of evidence supports your claim.' },
      ] },
      { type: 'callout', variant: 'important', text: 'A quote does not prove your point on its own. Your explanation of the quote is what does the work.' },
      { type: 'takeaway', text: 'A strong essay is a clear claim, well supported, explained with care.' },
    ],
  },
  expectations: {
    headline: 'Writing with Clarity and Voice',
    subheadline: 'Saying it clearly, and sounding like you',
    blocks: [
      { type: 'intro', text: 'Clear writing is a gift to your reader. Finding your own voice is what makes the writing worth reading at {company}.' },
      { type: 'objectives', items: [
        'Write sentences a reader can follow the first time',
        'Cut words that do not earn their place',
        'Let your own perspective come through',
      ] },
      { type: 'keypoints', items: [
        { title: 'Clarity first', text: 'If a sentence confuses you, it will confuse your reader too.' },
        { title: 'Cut the clutter', text: 'Strong writing removes every word that does not add meaning.' },
        { title: 'Find your voice', text: 'Say it the way only you would. Honesty reads as voice.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'Read your draft aloud. The places you stumble are the places a reader will too.' },
      { type: 'takeaway', text: 'Clarity and voice are not opposites. The clearest writing usually sounds the most human.' },
    ],
  },
  'customer-king': {
    headline: 'Ideas in Their Context',
    subheadline: 'Understanding a work in its time',
    blocks: [
      { type: 'intro', text: 'No text stands alone. Reading a work in its historical and cultural context is how you understand what it truly meant at {company} and to its first audience.' },
      { type: 'keypoints', items: [
        { title: 'Know the moment', text: 'Ask what was happening when the work was made.' },
        { title: 'Mind the audience', text: 'A work was written for someone. Who, and why, changes its meaning.' },
        { title: 'Judge from knowledge', text: 'Understand a past work on its own terms before you evaluate it by today’s.' },
      ] },
      { type: 'callout', variant: 'important', text: 'Understanding context is not the same as excusing everything in a work. It means you judge from knowledge, not assumption.' },
      { type: 'takeaway', text: 'Context turns a confusing old text into a window on the people who made it.' },
    ],
  },
}

// ------------------------------------------------------------------ LEADERSHIP & SOFT SKILLS
const HE_LEADERSHIP: LessonMap = {
  terminology: {
    headline: 'The Language of the Workplace',
    subheadline: 'Terms that carry you from campus to career',
    blocks: [
      { type: 'intro', text: 'The workplace has its own vocabulary. Knowing it early helps you sound prepared and understand what is expected at {company}.' },
      { type: 'keypoints', items: [
        { title: 'Initiative', text: 'Doing what needs doing without being asked.' },
        { title: 'Accountability', text: 'Owning your results, whether they went well or not.' },
        { title: 'Feedback', text: 'Information about your work meant to help you improve.' },
        { title: 'Professionalism', text: 'Showing up reliable, respectful, and ready to contribute.' },
      ] },
      { type: 'callout', variant: 'important', text: 'Feedback is not criticism of you as a person. It is information about the work, and the best professionals ask for it.' },
      { type: 'takeaway', text: 'Speaking the language of work is the first step to being trusted with real responsibility.' },
    ],
  },
  styles: {
    headline: 'Working on a Team',
    subheadline: 'Getting more done with other people',
    blocks: [
      { type: 'intro', text: 'Almost no real work happens alone. Learning to work well on a team is one of the skills employers value most at {company}.' },
      { type: 'objectives', items: [
        'Do your share and communicate your progress',
        'Handle disagreement without making it personal',
        'Help the group succeed, not just yourself',
      ] },
      { type: 'keypoints', items: [
        { title: 'Be reliable', text: 'Do what you said you would, by when you said you would.' },
        { title: 'Communicate early', text: 'Raise problems while there is still time to solve them.' },
        { title: 'Share the credit', text: 'Strong teammates make the whole group look good.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'When a teammate is not pulling their weight, talk with them directly and early. It works better than complaining to others.' },
      { type: 'takeaway', text: 'Being someone others want on their team is a career advantage that lasts.' },
    ],
  },
  communication: {
    headline: 'Communicating with Impact',
    subheadline: 'Being understood, and being trusted',
    blocks: [
      { type: 'intro', text: 'Good ideas only matter if others understand them. Clear communication is what turns your thinking into influence at {company}.' },
      { type: 'keypoints', items: [
        { title: 'Listen first', text: 'The best communicators listen as much as they speak.' },
        { title: 'Get to the point', text: 'Say what matters early, then add the detail.' },
        { title: 'Read the room', text: 'Adjust your message to the person in front of you.' },
      ] },
      { type: 'callout', variant: 'important', text: 'Talking the most does not make you the strongest communicator. Being understood does.' },
      { type: 'takeaway', text: 'Clear, honest communication is how trust and opportunity are built.' },
    ],
  },
  expectations: {
    headline: 'Managing Time and Priorities',
    subheadline: 'Doing the right things, not just more things',
    blocks: [
      { type: 'intro', text: 'Everyone has the same hours. The people who thrive at {company} are the ones who spend them on what matters most.' },
      { type: 'objectives', items: [
        'Tell the difference between urgent and important',
        'Plan your week before it plans you',
        'Protect time for the work that moves the needle',
      ] },
      { type: 'keypoints', items: [
        { title: 'Important over urgent', text: 'Not everything loud is worth your attention.' },
        { title: 'Plan ahead', text: 'A few minutes of planning saves hours of scrambling.' },
        { title: 'Finish what matters', text: 'Progress on the key task beats motion on many small ones.' },
      ] },
      { type: 'callout', variant: 'tip', text: 'Start each week by naming the two or three outcomes that would make it a success. Protect the time to reach them.' },
      { type: 'takeaway', text: 'Managing your time is really about choosing your priorities on purpose.' },
    ],
  },
  'customer-king': {
    headline: 'Leading and Influencing Others',
    subheadline: 'Leadership without a title',
    blocks: [
      { type: 'intro', text: 'You do not need a title to lead. Influence at {company} comes from how you show up and how you treat people.' },
      { type: 'keypoints', items: [
        { title: 'Lead by example', text: 'People follow what you do far more than what you say.' },
        { title: 'Build trust', text: 'Keep your word in small things and people will trust you with big ones.' },
        { title: 'Bring people with you', text: 'Explain the why so others choose to join, rather than being pushed.' },
      ] },
      { type: 'callout', variant: 'important', text: 'Real influence is earned through consistency and respect, not demanded through authority.' },
      { type: 'takeaway', text: 'The habits you build now are the leadership you will be known for later.' },
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
  // Dedicated topic content (keyed by training id, preferred over the engine).
  dei: DEI,
  'he-mandatory': HE_MANDATORY,
  'he-stem': HE_STEM,
  'he-social': HE_SOCIAL,
  'he-humanities': HE_HUMANITIES,
  'he-leadership': HE_LEADERSHIP,
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
  dei: {
    terminology: Q('Equity is best described as…', 'Giving each person what they need to succeed', 'Giving everyone the exact same thing', 'Treating differences as unimportant'),
    styles: Q('Unconscious bias is…', 'An automatic mental shortcut everyone has', 'A problem only some people have', 'Something you can fully switch off'),
    communication: Q('When someone says a comment hurt them, you should…', 'Listen, thank them, and reflect', 'Explain why they are wrong', 'Change the subject'),
    expectations: Q('An active ally…', 'Takes action to support others', 'Agrees quietly and moves on', 'Waits to be asked every time'),
    'customer-king': Q('The best way to make fair decisions is to…', 'Set clear criteria before you evaluate', 'Decide first and justify later', 'Trust your gut every time'),
  },
  'he-mandatory': {
    terminology: Q('Title IX primarily protects people from…', 'Sex-based discrimination in education', 'Late tuition payments', 'Parking violations'),
    styles: Q('If you think you have seen prohibited conduct, you should…', 'Raise it, even without being certain', 'Only act with full proof', 'Investigate it yourself'),
    communication: Q('You can raise a concern…', 'In good faith, without proof', 'Only if you witnessed everything', 'Only if an official asks you'),
    expectations: Q('When someone discloses to you, a good first response is…', 'Listen, believe, and point to support', 'Ask for evidence right away', 'Tell them to move on'),
    'customer-king': Q('Sensitive information should be shared…', 'Only with the right office, as needed', 'With anyone who asks', 'On social media to warn others'),
  },
  'he-stem': {
    terminology: Q('A hypothesis is…', 'A testable prediction made before an experiment', 'A proven fact', 'A final conclusion'),
    styles: Q('Before calculating, a good habit is to…', 'Estimate the answer first', 'Trust the calculator completely', 'Skip checking the result'),
    communication: Q('The clearest way to present a finding is to…', 'Show the evidence and your reasoning', 'State a conclusion with no support', 'Use as much jargon as possible'),
    expectations: Q('A well-designed experiment changes…', 'One variable at a time', 'Everything at once', 'Nothing at all'),
    'customer-king': Q('Two things happening together shows…', 'Correlation, which does not prove cause', 'That one caused the other', 'That nothing can be learned'),
  },
  'he-social': {
    terminology: Q('In science, a theory is…', 'An explanation supported by evidence', 'A wild guess', 'A personal opinion'),
    styles: Q('Interviews are most useful when you want to…', 'Understand the why behind behavior', 'Survey thousands quickly', 'Avoid talking to people'),
    communication: Q('A strong argument also…', 'Responds to the opposing view', 'Ignores any disagreement', 'Relies on confidence alone'),
    expectations: Q('When a pattern repeats across many people, you should…', 'Look for a systemic cause', 'Blame each individual', 'Ignore it'),
    'customer-king': Q('Careful interpretation of behavior means…', 'Staying open to revising your explanation', 'Trusting your first impression', 'Judging a group by one story'),
  },
  'he-humanities': {
    terminology: Q('A primary source is…', 'A firsthand record from the time studied', 'A modern summary', 'A personal opinion'),
    styles: Q('Close reading means…', 'Paying careful attention to detail', 'Reading as fast as you can', 'Skimming for the summary'),
    communication: Q('In an essay, a quote…', 'Needs your explanation to do its work', 'Proves the point on its own', 'Is only there to fill space'),
    expectations: Q('A good way to catch unclear writing is to…', 'Read your draft aloud', 'Add longer words', 'Never revise'),
    'customer-king': Q('Reading a work in context means…', 'Understanding the time it was made in', 'Ignoring when it was written', 'Judging it only by today’s views'),
  },
  'he-leadership': {
    terminology: Q('Taking initiative means…', 'Doing what needs doing without being asked', 'Waiting for instructions', 'Avoiding extra work'),
    styles: Q('If a teammate is not pulling their weight, the mature move is to…', 'Talk with them directly and early', 'Complain to everyone else', 'Do all the work silently'),
    communication: Q('The most effective communicators…', 'Listen as much as they speak', 'Talk the most in the room', 'Avoid questions'),
    expectations: Q('Good time management is mostly about…', 'Choosing the important over the merely urgent', 'Doing as many tasks as possible', 'Reacting to whatever is loudest'),
    'customer-king': Q('Real influence comes from…', 'Consistency and respect', 'A job title alone', 'Telling people what to do'),
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
  // Prefer content authored for the exact topic; fall back to its engine.
  const map = BY_TRAINING[training] ?? BY_TRAINING[engine] ?? LEADERSHIP
  const quiz =
    QUIZZES[training]?.[nodeId] ?? QUIZZES[engine]?.[nodeId] ?? QUIZZES.leadership[nodeId]
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
