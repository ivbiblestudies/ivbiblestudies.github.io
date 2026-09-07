import { layoutPassage } from './textLayout.js'
import { noteHeight } from './noteMetrics.js'

/** Build the first-visit example from the actual fetched translation. */
export function starterStudy(doc) {
  const verses = doc.scripture.primary.verses
  const layout = layoutPassage(verses, doc.style)
  const left = doc.layer.x - 360
  const right = doc.layer.x + doc.style.columnWidth + 60
  const top = doc.layer.y - 60
  const tags = [
    { id: 'demo-context', label: 'Context', hex: '#2563eb' },
    { id: 'demo-announcements', label: 'Announcements', hex: '#ca8a04' },
  ]
  const notes = [
    { id: 'demo-context-note', title: 'Context', tag: 'demo-context', panel: null,
      text: 'Centurion is a Gentile (Non-Jew)\nConsidered unclean for Jew to enter Gentile home',
      x: left, y: top, width: 300, fontScale: 1.2, verses: [1, 2, 3] },
    { id: 'demo-announcements-note', title: 'Announcements', tag: 'demo-announcements', panel: null,
      text: 'Welcome to the study canvas!\nDrag across words to highlight them. Create a connected note from the selection toolbar. Move these notes, follow their arrows, and use the tag filters to explore the study. Easily add multiple notes from your small group with \"Quick Entry\". When you\'re done exploring the demo, press + New study and select your passage and version at the top',
      x: right, y: top, width: 600, fontScale: 1.7, verses: [] },
  ]
  const connectors = []
  const normalize = word => word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
  const range = (verse, phrase) => {
    const verseIndex = verses.findIndex(item => item.verse === verse)
    if (verseIndex < 0) return null
    const words = String(verses[verseIndex].text).split(/\s+/).filter(Boolean).map(normalize)
    const target = phrase.split(/\s+/).map(normalize)
    const start = words.findIndex((_, index) => target.every((word, offset) => words[index + offset] === word))
    return { column: 0, verse, verseIndex,
      ...(start >= 0 ? { startWord: start, endWord: start + target.length - 1 } : {}) }
  }
  const nextY = [top + noteHeight(notes[0]) + 36, top + noteHeight(notes[1]) + 36]
  const examples = [
    ['obs-care', 'observation', null, 'The servant matters to the centurion.', [[2, 'valued highly']], 2, 0],
    ['obs-request', 'observation', 'A request for help', 'The centurion asks Jesus for help.', [[3, 'heard of Jesus']], 3, 0],
    ['obs-worthy', 'observation', null, 'The elders say the centurion deserves help.', [[4, 'deserves']], 4, 0],
    ['obs-authority', 'observation', 'Repetitions', 'Authority & Worthiness', [[7, 'say the word']], 8, 0],
    ['question-faith', 'question', null, 'What does the centurion believe?', [[7, 'my servant will be healed']], 9, 1],
    ['question-messengers', 'question', null, 'Why does the centurion send Jewish elders and friends?', [[6, 'sent friends']], 6, 1],
    ['question-worthiness', 'question', null, 'Does worthiness matter?', [[4, 'deserves']], 5, 1],
    ['question-response', 'question', 'Why is Jesus amazed?', 'Why does Jesus praise this faith?', [[9, 'great faith']], 9, 1],
  ]
  for (const [key, tag, title, text, phrases, arrowVerse, side] of examples) {
    const id = `demo-${key}`
    const note = { id, title, text, tag, panel: tag === 'observation' ? 'observations' : 'questions',
      verses: [...new Set([...phrases.map(([verse]) => verse), arrowVerse])],
      x: side ? right : left + 60, y: nextY[side], width: 220, fontScale: 1 }
    notes.push(note)
    nextY[side] += noteHeight(note) + 32
    for (const [index, [verse, phrase]] of phrases.entries()) {
      const target = range(verse, phrase)
      if (target) connectors.push({ ...target, id: `${id}-highlight-${index}`, noteId: id, style: 'highlight' })
    }
    const target = range(arrowVerse, '')
    if (target) connectors.push({ ...target, id: `${id}-arrow`, noteId: id, style: 'arrow' })
  }
  notes.push({ id: 'demo-application', title: 'Application · Trust and act', tag: 'application', panel: 'application',
    text: 'Where am I relying on my own worthiness instead of trusting Jesus?\nThis week: name one person who needs care, pray for them, and take one practical step to help. What would trusting Jesus’ authority look like in that situation?',
    x: right, y: Math.max(doc.layer.y + layout.height - 140, ...nextY) + 36,
    width: 300, fontScale: 1.2, verses: [7, 9] })
  return { ...doc, title: 'Luke 7 · Faith and authority', notes, connectors, tags,
    ui: { ...doc.ui, tagFilter: ['observation', 'question', 'application', 'none', ...tags.map(tag => tag.id)] } }
}
