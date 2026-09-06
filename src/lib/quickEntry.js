// Parser for the sidebar "quick entry" boxes.
//
// Students type notes far faster than they can place sticky notes by hand, so
// the panels accept a paste-dump like:
//
//   v3: Repeated word "grace"
//   vv. 5-7 — contrast between flesh and spirit
//   12, 14: who is "he" here?
//   No verse number at all — still becomes a note, just unanchored.
//
// Each line becomes one note; the verse numbers decide where on the canvas it
// lands and what the connector arrow points at.

const LEADING_VERSE = new RegExp(
  [
    '^\\s*',
    '(?:vv?\\.?|verses?)?\\s*', // optional v / vv / verse / verses
    '(\\d{1,3}(?:\\s*[-–—]\\s*\\d{1,3})?(?:\\s*,\\s*\\d{1,3}(?:\\s*[-–—]\\s*\\d{1,3})?)*)',
    '\\s*(?::|\\.|\\)|-|–|—|\\u2013|\\s)\\s*',
    '(.*)$',
  ].join(''),
)

function expandRanges(spec) {
  const out = []
  for (const chunk of spec.split(',')) {
    const range = chunk.trim().match(/^(\d{1,3})\s*[-–—]\s*(\d{1,3})$/)
    if (range) {
      const a = Number(range[1])
      const b = Number(range[2])
      if (b >= a && b - a < 200) {
        for (let i = a; i <= b; i++) out.push(i)
      } else {
        out.push(a, b)
      }
      continue
    }
    const single = chunk.trim().match(/^(\d{1,3})$/)
    if (single) out.push(Number(single[1]))
  }
  return [...new Set(out)].sort((a, b) => a - b)
}

/**
 * @param {string} raw multi-line quick-entry text
 * @returns {Array<{text:string, verses:number[], verse:number|null, raw:string}>}
 */
export function parseQuickEntry(raw) {
  const lines = String(raw || '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const notes = []
  for (const line of lines) {
    // Strip bullet markers people paste from other apps.
    const cleaned = line.replace(/^[-*•·]\s+/, '')
    const m = cleaned.match(LEADING_VERSE)

    if (m) {
      const verses = expandRanges(m[1])
      const body = m[2].trim()
      // A bare number with no body is not a note.
      if (verses.length && body) {
        notes.push({ text: body, verses, verse: verses[0], raw: line })
        continue
      }
    }
    notes.push({ text: cleaned, verses: [], verse: null, raw: line })
  }
  return notes
}

/** Human label for a note's verse span: "v3", "vv5-7", "vv3, 9". */
export function verseLabel(verses) {
  if (!verses || verses.length === 0) return ''
  if (verses.length === 1) return `v${verses[0]}`
  const contiguous = verses.every((n, i) => i === 0 || n === verses[i - 1] + 1)
  if (contiguous) return `vv${verses[0]}-${verses[verses.length - 1]}`
  return `vv${verses.join(', ')}`
}
