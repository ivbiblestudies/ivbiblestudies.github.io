// Canonical book table. The ids are the standard 1-66 ordering, which is also
// what bolls.life uses for its `bookid` path segment.

const B = (id, name, ...aliases) => ({ id, name, aliases })

export const BOOKS = [
  B(1, 'Genesis', 'gen', 'ge', 'gn'),
  B(2, 'Exodus', 'exo', 'ex', 'exod'),
  B(3, 'Leviticus', 'lev', 'le', 'lv'),
  B(4, 'Numbers', 'num', 'nu', 'nm', 'nb'),
  B(5, 'Deuteronomy', 'deut', 'deu', 'dt'),
  B(6, 'Joshua', 'josh', 'jos', 'jsh'),
  B(7, 'Judges', 'judg', 'jdg', 'jg'),
  B(8, 'Ruth', 'rth', 'ru'),
  B(9, '1 Samuel', '1sam', '1sa', '1s', 'first samuel', 'i samuel'),
  B(10, '2 Samuel', '2sam', '2sa', '2s', 'second samuel', 'ii samuel'),
  B(11, '1 Kings', '1kings', '1kgs', '1ki', '1k', 'i kings'),
  B(12, '2 Kings', '2kings', '2kgs', '2ki', '2k', 'ii kings'),
  B(13, '1 Chronicles', '1chron', '1chr', '1ch', 'i chronicles'),
  B(14, '2 Chronicles', '2chron', '2chr', '2ch', 'ii chronicles'),
  B(15, 'Ezra', 'ezr'),
  B(16, 'Nehemiah', 'neh', 'ne'),
  B(17, 'Esther', 'esth', 'est', 'es'),
  B(18, 'Job', 'jb'),
  B(19, 'Psalms', 'psalm', 'psa', 'ps', 'pss', 'psalms'),
  B(20, 'Proverbs', 'prov', 'pro', 'prv', 'pr'),
  B(21, 'Ecclesiastes', 'eccles', 'eccl', 'ecc', 'ec', 'qoh'),
  B(22, 'Song of Solomon', 'song', 'sos', 'song of songs', 'canticles', 'cant'),
  B(23, 'Isaiah', 'isa', 'is'),
  B(24, 'Jeremiah', 'jer', 'je'),
  B(25, 'Lamentations', 'lam', 'la'),
  B(26, 'Ezekiel', 'ezek', 'eze', 'ezk'),
  B(27, 'Daniel', 'dan', 'da', 'dn'),
  B(28, 'Hosea', 'hos', 'ho'),
  B(29, 'Joel', 'joe', 'jl'),
  B(30, 'Amos', 'amo', 'am'),
  B(31, 'Obadiah', 'obad', 'oba', 'ob'),
  B(32, 'Jonah', 'jon', 'jnh'),
  B(33, 'Micah', 'mic', 'mc'),
  B(34, 'Nahum', 'nah', 'na'),
  B(35, 'Habakkuk', 'hab', 'hb'),
  B(36, 'Zephaniah', 'zeph', 'zep', 'zp'),
  B(37, 'Haggai', 'hag', 'hg'),
  B(38, 'Zechariah', 'zech', 'zec', 'zc'),
  B(39, 'Malachi', 'mal', 'ml'),
  B(40, 'Matthew', 'matt', 'mat', 'mt'),
  B(41, 'Mark', 'mrk', 'mk', 'mr'),
  B(42, 'Luke', 'luk', 'lk'),
  B(43, 'John', 'jhn', 'jn', 'joh'),
  B(44, 'Acts', 'act', 'ac'),
  B(45, 'Romans', 'rom', 'ro', 'rm'),
  B(46, '1 Corinthians', '1cor', '1co', 'i corinthians'),
  B(47, '2 Corinthians', '2cor', '2co', 'ii corinthians'),
  B(48, 'Galatians', 'gal', 'ga'),
  B(49, 'Ephesians', 'eph', 'ep'),
  B(50, 'Philippians', 'phil', 'php', 'pp'),
  B(51, 'Colossians', 'col', 'co'),
  B(52, '1 Thessalonians', '1thess', '1thes', '1th', 'i thessalonians'),
  B(53, '2 Thessalonians', '2thess', '2thes', '2th', 'ii thessalonians'),
  B(54, '1 Timothy', '1tim', '1ti', 'i timothy'),
  B(55, '2 Timothy', '2tim', '2ti', 'ii timothy'),
  B(56, 'Titus', 'tit', 'ti'),
  B(57, 'Philemon', 'philem', 'phlm', 'pm'),
  B(58, 'Hebrews', 'heb', 'hb'),
  B(59, 'James', 'jas', 'jm'),
  B(60, '1 Peter', '1pet', '1pe', '1pt', 'i peter'),
  B(61, '2 Peter', '2pet', '2pe', '2pt', 'ii peter'),
  B(62, '1 John', '1jn', '1jo', '1joh', 'i john'),
  B(63, '2 John', '2jn', '2jo', '2joh', 'ii john'),
  B(64, '3 John', '3jn', '3jo', '3joh', 'iii john'),
  B(65, 'Jude', 'jud', 'jde'),
  B(66, 'Revelation', 'rev', 're', 'apocalypse', 'revelations'),
]

// "1 Cor.", "I Corinthians", "1st Corinthians" and "1corinthians" all normalize
// to the same key.
const normalize = (raw) =>
  String(raw || '')
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\b(1st|first)\b/g, '1')
    .replace(/\b(2nd|second)\b/g, '2')
    .replace(/\b(3rd|third)\b/g, '3')
    .replace(/^i{1,3}\s+/, (m) => `${m.trim().length} `)
    .replace(/\s+/g, ' ')
    .trim()

const INDEX = new Map()
for (const book of BOOKS) {
  INDEX.set(normalize(book.name), book)
  INDEX.set(normalize(book.name).replace(/\s+/g, ''), book)
  for (const alias of book.aliases) {
    INDEX.set(normalize(alias), book)
    INDEX.set(normalize(alias).replace(/\s+/g, ''), book)
  }
}

export function findBook(name) {
  const key = normalize(name)
  if (INDEX.has(key)) return INDEX.get(key)
  if (INDEX.has(key.replace(/\s+/g, ''))) return INDEX.get(key.replace(/\s+/g, ''))
  // Last resort: a unique prefix match ("Philipp", "Thessalon").
  const matches = BOOKS.filter((b) => normalize(b.name).startsWith(key))
  return matches.length === 1 ? matches[0] : null
}

/**
 * Parse a human reference into something fetchable.
 *
 * Accepts: "John 3", "John 3:16", "John 3:16-18", "John 3-4",
 * "John 3:16-4:2", "1 Cor 13", "Ps 23".
 *
 * @returns {{book, start:{chapter,verse|null}, end:{chapter,verse|null}}|null}
 */
export function parseReference(input) {
  const raw = String(input || '').trim().replace(/\s+/g, ' ')
  if (!raw) return null

  // Split the trailing numeric part off the book name.
  const m = raw.match(/^(.*?)[\s.]*(\d+(?:\s*:\s*\d+)?(?:\s*[-–—]\s*\d+(?:\s*:\s*\d+)?)?)?$/)
  if (!m) return null

  const book = findBook(m[1])
  if (!book) return null

  const range = (m[2] || '').replace(/\s+/g, '')
  if (!range) {
    return { book, start: { chapter: 1, verse: null }, end: { chapter: 1, verse: null } }
  }

  const [fromRaw, toRaw] = range.split(/[-–—]/)
  const parsePart = (part) => {
    if (!part) return null
    const [c, v] = part.split(':')
    return { chapter: Number(c), verse: v != null ? Number(v) : null }
  }

  const start = parsePart(fromRaw)
  if (!start || !start.chapter) return null

  let end
  if (!toRaw) {
    end = { ...start }
  } else if (toRaw.includes(':')) {
    end = parsePart(toRaw)
  } else if (start.verse != null) {
    // "John 3:16-18" — the second number is a verse in the same chapter.
    end = { chapter: start.chapter, verse: Number(toRaw) }
  } else {
    // "John 3-4" — a chapter range.
    end = { chapter: Number(toRaw), verse: null }
  }

  return { book, start, end }
}

/** Render a parsed reference back to a canonical display string. */
export function formatReference(parsed) {
  if (!parsed) return ''
  const { book, start, end } = parsed
  const sameChapter = start.chapter === end.chapter
  if (start.verse == null && end.verse == null) {
    return sameChapter
      ? `${book.name} ${start.chapter}`
      : `${book.name} ${start.chapter}-${end.chapter}`
  }
  if (sameChapter) {
    return start.verse === end.verse
      ? `${book.name} ${start.chapter}:${start.verse}`
      : `${book.name} ${start.chapter}:${start.verse}-${end.verse}`
  }
  return `${book.name} ${start.chapter}:${start.verse ?? 1}-${end.chapter}:${end.verse ?? ''}`.replace(/:$/, '')
}
