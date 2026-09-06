// Second passage provider: bolls.life.
//
// bible-api.com only carries public-domain texts, so NIV, ESV, NASB and friends
// need another source. bolls.life exposes a keyless, CORS-enabled JSON endpoint
// per chapter, which is the only shape of API that can work from a static page
// with no backend to hide a key in.
//
// It serves whole chapters, so verse ranges are sliced here.

import { parseReference, formatReference } from '../data/books'

const ENDPOINT = 'https://bolls.life/get-text'

export class BollsError extends Error {}

/**
 * bolls marks section headings and poetic line breaks with the same <br/>.
 * Line breaks must survive as spaces; headings are noise on a manuscript. A
 * leading segment is treated as a heading only when it looks like one: short,
 * capitalized, and with no sentence punctuation anywhere in it.
 */
function cleanVerseText(raw) {
  const segments = String(raw || '').split(/<br\s*\/?>/i)

  if (segments.length > 1) {
    const first = segments[0].trim()
    const words = first.split(/\s+/).filter(Boolean)
    const looksLikeHeading =
      first.length > 0 &&
      first.length < 60 &&
      words.length <= 8 &&
      /^[A-Z0-9]/.test(first) &&
      !/[.,;:!?"'’”]/.test(first)
    if (looksLikeHeading && segments.slice(1).join(' ').trim()) segments.shift()
  }

  return segments
    .join(' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchChapter(translation, bookId, chapter) {
  let res
  try {
    res = await fetch(`${ENDPOINT}/${encodeURIComponent(translation)}/${bookId}/${chapter}/`)
  } catch {
    throw new BollsError(
      'Could not reach bolls.life. Check your connection, or paste the text in manually.',
    )
  }
  if (!res.ok) throw new BollsError(`bolls.life returned ${res.status} for that passage.`)

  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) {
    throw new BollsError(`No text came back for chapter ${chapter}.`)
  }
  return data.map((v) => ({
    chapter,
    verse: v.verse,
    text: cleanVerseText(v.text),
  }))
}

/**
 * @param {string} reference e.g. "John 3:16-18", "Romans 8", "1 Cor 13:1-13"
 * @param {string} translation a bolls translation key (NIV, ESV, NASB, ...)
 */
export async function fetchBollsPassage(reference, translation) {
  const parsed = parseReference(reference)
  if (!parsed) {
    throw new BollsError(
      `Couldn't read "${reference}" as a reference. Try something like "John 3:16-18".`,
    )
  }

  const { book, start, end } = parsed
  const firstChapter = start.chapter
  const lastChapter = Math.max(start.chapter, end.chapter)
  if (lastChapter - firstChapter > 5) {
    throw new BollsError('That range is too long — fetch at most six chapters at a time.')
  }

  const chapters = []
  for (let c = firstChapter; c <= lastChapter; c++) {
    chapters.push(await fetchChapter(translation, book.id, c))
  }

  let verses = chapters.flat()

  // Trim the ends of the range when specific verses were asked for.
  if (start.verse != null) {
    verses = verses.filter(
      (v) => v.chapter > firstChapter || v.verse >= start.verse,
    )
  }
  if (end.verse != null) {
    verses = verses.filter((v) => v.chapter < lastChapter || v.verse <= end.verse)
  }

  if (!verses.length) {
    throw new BollsError(`No verses matched "${reference}".`)
  }

  return {
    reference: formatReference(parsed),
    verses,
  }
}
