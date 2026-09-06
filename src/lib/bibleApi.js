// Passage loading. Everything here runs in the browser against keyless,
// CORS-enabled endpoints; there is no backend and no API key anywhere.

import { findTranslation, translationName } from '../data/translations'
import { fetchBollsPassage, BollsError } from './bolls'

const ENDPOINT = 'https://bible-api.com/'

export class BibleApiError extends Error {}

/** bible-api.com — public-domain translations, parses references server-side. */
async function fetchFromBibleApi(reference, translation) {
  const url = `${ENDPOINT}${encodeURIComponent(reference)}?translation=${encodeURIComponent(
    translation,
  )}`

  let res
  try {
    res = await fetch(url)
  } catch {
    throw new BibleApiError(
      'Could not reach bible-api.com. Check your connection, or paste the text in manually.',
    )
  }

  if (res.status === 404) {
    throw new BibleApiError(
      `bible-api.com does not recognize "${reference}". Try "John 1:1-14".`,
    )
  }
  if (!res.ok) {
    throw new BibleApiError(`bible-api.com returned ${res.status}. Try again in a moment.`)
  }

  const data = await res.json()
  if (!data || !Array.isArray(data.verses) || data.verses.length === 0) {
    throw new BibleApiError(`No verses came back for "${reference}".`)
  }

  return {
    reference: data.reference || reference,
    verses: data.verses.map((v) => ({
      chapter: v.chapter,
      verse: v.verse,
      // The API pads verse text with newlines and double spaces.
      text: String(v.text || '').replace(/\s+/g, ' ').trim(),
    })),
  }
}

/**
 * When a passage spans more than one chapter, plain verse numbers repeat. Give
 * those verses a "3:16"-style label so the canvas stays readable.
 */
function labelVerses(verses) {
  const chapters = new Set(verses.map((v) => v.chapter).filter((c) => c != null))
  if (chapters.size <= 1) return verses
  return verses.map((v) => ({ ...v, label: `${v.chapter}:${v.verse}` }))
}

/**
 * Fetch a passage from whichever provider carries the requested translation.
 *
 * @param {string} reference e.g. "John 1:1-14", "Romans 8", "Ps 23"
 * @param {string} translation a translation id from src/data/translations.js
 */
export async function fetchPassage(reference, translation) {
  const ref = String(reference || '').trim()
  if (!ref) throw new BibleApiError('Enter a passage reference first.')

  const meta = findTranslation(translation)
  const source = meta?.source || 'bible-api'

  try {
    const result =
      source === 'bolls'
        ? await fetchBollsPassage(ref, translation)
        : await fetchFromBibleApi(ref, translation)

    return {
      reference: result.reference,
      translation,
      translationName: translationName(translation),
      verses: labelVerses(result.verses),
    }
  } catch (err) {
    // Present one error type upward, whichever provider failed.
    if (err instanceof BollsError) throw new BibleApiError(err.message)
    throw err
  }
}

/**
 * Turn pasted text into the same verse shape the providers return.
 *
 * Accepts either one verse per line ("1 In the beginning...") or a single
 * flowing paragraph with inline numbers ("1 In the beginning... 2 The same...").
 * Text with no numbers at all becomes a single verse 1.
 */
export function parsePastedText(raw) {
  const text = String(raw || '').replace(/\r\n?/g, '\n').trim()
  if (!text) return []

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const lineNumbered = lines.filter((l) => /^\[?\d{1,3}\]?[.):\s]/.test(l))

  // Prefer line-based parsing when most lines are numbered — it respects the
  // author's own line breaks.
  if (lines.length > 1 && lineNumbered.length >= Math.ceil(lines.length * 0.6)) {
    const verses = []
    for (const line of lines) {
      const m = line.match(/^\[?(\d{1,3})\]?[.):\s]\s*(.*)$/)
      if (m) {
        verses.push({ verse: Number(m[1]), text: m[2].trim() })
      } else if (verses.length) {
        verses[verses.length - 1].text += ' ' + line
      } else {
        verses.push({ verse: 1, text: line })
      }
    }
    return verses.filter((v) => v.text)
  }

  // Otherwise split a flowing block on inline verse numbers.
  const flat = lines.join(' ')
  const parts = flat.split(/(?:^|\s)\[?(\d{1,3})\]?[.):]?\s+/)
  if (parts.length >= 3) {
    const verses = []
    // parts[0] is any text preceding the first number.
    if (parts[0].trim()) verses.push({ verse: 1, text: parts[0].trim() })
    for (let i = 1; i < parts.length - 1; i += 2) {
      const n = Number(parts[i])
      const body = String(parts[i + 1] || '').trim()
      if (body) verses.push({ verse: n, text: body })
    }
    if (verses.length) return verses
  }

  return [{ verse: 1, text: flat }]
}
