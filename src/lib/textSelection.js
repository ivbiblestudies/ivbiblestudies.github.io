export function selectWords(layout, first, last) {
  const words = layout.words.filter(w => !w.isVerseNum)
  const index = target => words.findIndex(w => w.verseIndex === target.verseIndex && w.wordIndex === target.wordIndex)
  const a = index(first), b = index(last)
  if (a < 0 || b < 0) return { text: '', ranges: [] }
  const selected = words.slice(Math.min(a, b), Math.max(a, b) + 1)
  const ranges = []
  const lines = []
  for (const word of selected) {
    let range = ranges.at(-1)
    if (range?.verseIndex !== word.verseIndex) {
      range = { column: 0, verse: word.verse, verseIndex: word.verseIndex, startWord: word.wordIndex, endWord: word.wordIndex }
      ranges.push(range)
      lines.push([])
    }
    range.endWord = word.wordIndex
    lines.at(-1).push(word.text)
  }
  return { text: lines.map(line => line.join(' ')).join('\n'), ranges }
}

export function nearestWord(layout, point) {
  let nearest = null, distance = Infinity
  for (const word of layout.words) {
    if (word.isVerseNum) continue
    const dx = Math.max(word.x - point.x, 0, point.x - word.x - word.w)
    const dy = Math.max(word.y - point.y, 0, point.y - word.y - word.h)
    const score = dx * dx + dy * dy * 4
    if (score < distance) { nearest = word; distance = score }
  }
  return nearest
}
