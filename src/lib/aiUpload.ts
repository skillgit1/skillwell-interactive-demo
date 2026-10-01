import type { TrainingContent } from './personalize'

/**
 * LOCAL-ONLY AI personalization for uploads.
 *
 * Calls Claude directly from the browser, using a key from
 * VITE_ANTHROPIC_API_KEY, and ONLY in a dev build (import.meta.env.DEV) so a key
 * can never ship to production. Claude reads the file (PDFs natively) and returns
 * a learning map generated from the actual content. Returns null on any problem,
 * so the caller falls back to the topic-based map.
 *
 * For production, move this exact call behind a small backend that holds the key.
 */

// Sonnet gives the best course quality; swap to 'claude-haiku-4-5-20251001' for speed.
const MODEL = 'claude-sonnet-4-6'

const PROMPT = `You are building a preview "learning map" for the Skillwell demo from an uploaded course document. Read the attached document and return ONLY a JSON object (no prose, no markdown fences) with exactly this shape:

{
  "ok": true,
  "category": "<1-2 word subject area, e.g. Business, Engineering, Nursing>",
  "course": "<the course title, max ~40 characters>",
  "description": "<one sentence describing the course; you may include the literal token {company}>",
  "nodeTitles": {
    "terminology": "<short 2-4 word module title>",
    "styles": "<short module title>",
    "communication": "<short module title>",
    "practice-quiz": "<short practice/activity title>",
    "expectations": "<short module title>",
    "milestone": "<short checkpoint title>",
    "customer-king": "<short applied module title>",
    "final-assessment": "<short 'Verify: ...' title>"
  },
  "questions": [
    { "q": "<question about a core concept from THIS document>", "skillTag": "fundamentals", "options": [ {"label":"<correct answer>","correct":true}, {"label":"<plausible wrong>"}, {"label":"<plausible wrong>"} ] },
    { "q": "<another question>", "skillTag": "leadership", "options": [ {"label":"<correct>","correct":true}, {"label":"<wrong>"}, {"label":"<wrong>"} ] },
    { "q": "<another question>", "skillTag": "communication", "options": [ {"label":"<correct>","correct":true}, {"label":"<wrong>"}, {"label":"<wrong>"} ] }
  ]
}

Rules:
- The node titles must reflect the ACTUAL topics of THIS document, in a sensible learning order. Keep them short.
- The 3 questions test key CONCEPTS or SKILLS taught in the course, not administrative details (email policy, grading, attendance, deadlines). Exactly one correct option each. Keep the skillTags exactly "fundamentals", "leadership", "communication" in that order (they drive the demo's adaptivity, not the wording).
- If the document is not legitimate educational/training material (explicit, harmful, or unrelated junk), return {"ok": false} and nothing else.
Return ONLY the JSON object.`

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.onerror = () => reject(new Error('file read failed'))
    reader.readAsDataURL(file)
  })
}

export async function analyzeUpload(file: File): Promise<TrainingContent | null> {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined
  // Never run outside local dev, and never without a key.
  if (!import.meta.env.DEV || !key) return null

  try {
    const ext = file.name.split('.').pop()?.toLowerCase()
    let content: unknown[]
    if (ext === 'pdf') {
      const data = await fileToBase64(file)
      content = [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } },
        { type: 'text', text: PROMPT },
      ]
    } else if (ext === 'txt' || ext === 'md') {
      const text = (await file.text()).slice(0, 60000)
      content = [{ type: 'text', text: `${PROMPT}\n\nDOCUMENT:\n${text}` }]
    } else {
      return null // unsupported type → topic fallback
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 1500, messages: [{ role: 'user', content }] }),
    })
    if (!res.ok) return null

    const json = await res.json()
    const text: string = json?.content?.[0]?.text ?? ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    const parsed = JSON.parse(match[0])
    if (parsed.ok === false || !parsed.course || !parsed.nodeTitles) return null

    return {
      group: String(parsed.category ?? 'Your Content'),
      course: String(parsed.course).slice(0, 60),
      description: String(
        parsed.description ?? 'An adaptive learning map built from your uploaded content at {company}.',
      ),
      nodeTitles: parsed.nodeTitles,
      questions: Array.isArray(parsed.questions) ? parsed.questions : [],
    }
  } catch {
    return null
  }
}
