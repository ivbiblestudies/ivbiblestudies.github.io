// NIV is supplied as one JSON file per book. Vite emits separate lazy-loaded
// chunks so fetching a passage does not download the whole translation.
import { parseReference, formatReference } from '../data/books'

const bookFiles = import.meta.glob(['../../niv/*.json', '!../../niv/Books.json'], { import: 'default' })
const bookLoaders = new Map(
  Object.entries(bookFiles).map(([file, load]) => [
    file.split('/').pop().replace(/\.json$/, '').toLowerCase(), load,
  ]),
)

export class NivError extends Error {}

export async function fetchNivPassage(reference) {
  const parsed = parseReference(reference)
  if (!parsed) {
    throw new NivError(
      `Couldn't read "${reference}" as a reference. Try something like "John 3:16-18".`,
    )
  }

  const { book, start, end } = parsed
  const positiveInteger = value => Number.isSafeInteger(value) && value > 0
  if (!positiveInteger(start.chapter) || !positiveInteger(end.chapter) ||
      (start.verse != null && !positiveInteger(start.verse)) ||
      (end.verse != null && !positiveInteger(end.verse)) ||
      end.chapter < start.chapter ||
      (end.chapter === start.chapter && start.verse != null && end.verse < start.verse)) {
    throw new NivError(`Invalid passage range "${reference}".`)
  }
  if (end.chapter - start.chapter > 5) {
    throw new NivError('That range is too long — fetch at most six chapters at a time.')
  }

  // Case-insensitive lookup maps "Song of Solomon" to "Song Of Solomon.json".
  const load = bookLoaders.get(book.name.toLowerCase())
  if (!load) throw new NivError(`No local NIV text is available for ${book.name}.`)
  let data
  try {
    data = await load()
  } catch {
    throw new NivError(`Could not load the local NIV text for ${book.name}. Try again in a moment.`)
  }

  const verses = []
  for (let chapter = start.chapter; chapter <= end.chapter; chapter++) {
    const entry = data.chapters.find(c => Number(c.chapter) === chapter)
    if (!entry) throw new NivError(`No chapter ${chapter} exists in the local NIV text for ${book.name}.`)
    const chapterVerses = entry.verses.map(v => ({
      chapter,
      verse: Number(v.verse),
      text: v.text.replace(/\s+/g, ' ').trim(),
    }))
    for (const boundary of [start, end]) {
      if (boundary.chapter === chapter && boundary.verse != null &&
          !chapterVerses.some(v => v.verse === boundary.verse)) {
        throw new NivError(`No verse ${chapter}:${boundary.verse} exists in the local NIV text for ${book.name}.`)
      }
    }
    verses.push(...chapterVerses.filter(v =>
      v.text &&
      (chapter !== start.chapter || start.verse == null || v.verse >= start.verse) &&
      (chapter !== end.chapter || end.verse == null || v.verse <= end.verse),
    ))
  }

  // Empty entries keep their original numbering; a wholly empty request fails.
  if (!verses.length) throw new NivError(`No NIV verse text matched "${reference}".`)
  return { reference: formatReference(parsed), verses }
}
