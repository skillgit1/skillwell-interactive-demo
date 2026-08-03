/**
 * Upload moderation guard.
 *
 * The demo keeps the uploaded file entirely in the browser (never uploaded),
 * so this guard inspects what we actually have — the file NAME and TYPE — to
 * catch obviously inappropriate uploads (pornography, malware/executables).
 * In the real product this is where a server-side AI moderation pass would
 * run on the extracted text; the shape here (ok / reason) is built to swap.
 *
 * DESIGN INTENT (per product): only block genuinely disallowed content.
 * Legitimate corporate training on sensitive topics — sexual harassment,
 * workplace safety, DEI, substance abuse, violence prevention — MUST pass.
 * So we match explicit-adult and malware signals, and deliberately allow the
 * professional-training vocabulary around sensitive subjects.
 */

export type ModerationResult =
  | { ok: true }
  | { ok: false; category: 'adult' | 'malware'; message: string }

// Explicit adult-content signals. Intentionally narrow — these are terms that
// don't appear in legitimate corporate/higher-ed training filenames.
const ADULT_TERMS = [
  'porn',
  'porno',
  'pornhub',
  'xxx',
  'xvideos',
  'nsfw',
  'hentai',
  'onlyfans',
  'camgirl',
  'escort',
  'fetish',
  'nudes',
  'nude-pics',
  'sextape',
  'erotica',
  'erotic-photos',
]

// Malware / executable signals: dangerous extensions + common piracy terms.
const MALWARE_EXTS = [
  'exe', 'msi', 'dll', 'bat', 'cmd', 'com', 'scr', 'pif',
  'sh', 'bash', 'ps1', 'vbs', 'jar', 'apk', 'app', 'dmg', 'iso',
]
const MALWARE_TERMS = ['malware', 'virus', 'trojan', 'ransomware', 'keygen', 'crack', 'keylogger', 'rootkit']

// Legit training vocabulary that must NEVER trigger a block, even though it
// touches sensitive subject matter. (Belt-and-suspenders: our adult list
// already avoids these, but this makes the intent explicit and testable.)
const ALLOW_CONTEXT = [
  'harassment',
  'sexual-harassment',
  'sexual harassment',
  'assault',
  'abuse',
  'safety',
  'compliance',
  'dei',
  'diversity',
  'inclusion',
  'violence',
  'substance',
  'anti-harassment',
  'title-ix',
  'title ix',
]

function normalize(name: string): string {
  return name.toLowerCase()
}

function extensionOf(name: string): string {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/)
  return m ? m[1] : ''
}

/** Whole-word-ish match so "assess" doesn't hit "ass", etc. */
function containsTerm(haystack: string, term: string): boolean {
  const t = term.replace(/[-\s]/g, '[-_ ]?')
  return new RegExp(`(^|[^a-z])${t}([^a-z]|$)`, 'i').test(haystack)
}

export function moderateUpload(file: File): ModerationResult {
  const name = normalize(file.name)
  const ext = extensionOf(name)

  // 1) Malware / executable file types — block regardless of name.
  if (MALWARE_EXTS.includes(ext) || MALWARE_TERMS.some((t) => containsTerm(name, t))) {
    return {
      ok: false,
      category: 'malware',
      message:
        "That file type can't be processed here. Upload a document (PDF, Word, PowerPoint, or text), or skip and explore an example learning map.",
    }
  }

  // 2) Explicit adult content — but never block legitimate sensitive-topic training.
  const looksAllowed = ALLOW_CONTEXT.some((t) => containsTerm(name, t))
  const looksAdult = ADULT_TERMS.some((t) => containsTerm(name, t))
  if (looksAdult && !looksAllowed) {
    return {
      ok: false,
      category: 'adult',
      message:
        "It looks like your upload doesn't align with our content guidelines, so we didn't personalize with it. You can still click through to explore an example learning map.",
    }
  }

  return { ok: true }
}
