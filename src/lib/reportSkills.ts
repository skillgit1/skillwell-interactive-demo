/**
 * Measured skills shown in the Auto-Insights report, pre-baked per training
 * topic so the report feels built for the visitor's course. The first entry
 * is always "Overall Performance"; the next six are topic-specific.
 *
 * Keyed by the exact training id (so DEI and each Higher-Ed topic get their
 * own skills even though their lesson content aliases to a shared engine).
 * When a document is uploaded, AI can regenerate this list from the content —
 * everything downstream (the report charts) just reads getReportSkills().
 */
const REPORT_SKILLS: Record<string, string[]> = {
  // ---- Corporate ----------------------------------------------------------
  leadership: [
    'Overall Performance',
    'Set Clear Expectations',
    'Deliver Constructive Feedback',
    'Coach and Develop Others',
    'Adapt Your Leadership Style',
    'Navigate Difficult Conversations',
    'Put the Customer First',
  ],
  onboarding: [
    'Overall Performance',
    'Ask the Right Questions Early',
    'Navigate Tools and Systems',
    'Apply Company Values',
    'Communicate Across the Team',
    'Understand Your Role’s Impact',
    'Build Key Relationships',
  ],
  compliance: [
    'Overall Performance',
    'Recognize Reportable Situations',
    'Apply Key Regulations Correctly',
    'Escalate Concerns Appropriately',
    'Protect Sensitive Data',
    'Handle Violations Responsibly',
    'Act with Integrity Under Pressure',
  ],
  sales: [
    'Overall Performance',
    'Uncover the Customer’s Problem',
    'Ask Effective Discovery Questions',
    'Handle Objections',
    'Communicate Value',
    'Advance to a Clear Next Step',
    'Close with Confidence',
  ],
  dei: [
    'Overall Performance',
    'Recognize Bias in the Moment',
    'Foster Inclusive Conversations',
    'Respond to Microaggressions',
    'Create Psychological Safety',
    'Support Equitable Decisions',
    'Act as an Effective Ally',
  ],
  // ---- Higher Education ---------------------------------------------------
  'he-mandatory': [
    'Overall Performance',
    'Understand Title IX Rights & Duties',
    'Recognize Reportable Conduct',
    'Use Reporting Channels Correctly',
    'Support Affected Individuals',
    'Maintain Confidentiality',
    'Foster a Safe Campus Climate',
  ],
  'he-stem': [
    'Overall Performance',
    'Apply Core Concepts',
    'Reason Quantitatively',
    'Design and Run Experiments',
    'Interpret Data and Results',
    'Solve Problems Systematically',
    'Communicate Technical Findings',
  ],
  'he-social': [
    'Overall Performance',
    'Apply Social Science Theory',
    'Evaluate Evidence Critically',
    'Design Sound Research',
    'Interpret Human Behavior',
    'Analyze Society and Systems',
    'Communicate Findings Clearly',
  ],
  'he-humanities': [
    'Overall Performance',
    'Read Closely and Critically',
    'Construct a Clear Argument',
    'Analyze Texts in Context',
    'Situate Ideas Historically',
    'Engage Diverse Perspectives',
    'Write with Clarity and Voice',
  ],
  'he-leadership': [
    'Overall Performance',
    'Communicate with Impact',
    'Collaborate Effectively',
    'Think Critically',
    'Manage Time and Priorities',
    'Lead and Influence Others',
    'Adapt and Solve Problems',
  ],
}

export function getReportSkills(training: string): string[] {
  return REPORT_SKILLS[training] ?? REPORT_SKILLS.leadership
}
