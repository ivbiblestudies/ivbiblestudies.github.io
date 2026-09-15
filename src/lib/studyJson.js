import { emptyDoc, hydrateDoc, pickDoc } from '../store'
import { SCHEMA_VERSION } from './urlState'

export const MAX_JSON_SIZE = 5 * 1024 * 1024
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const check = (ok, path, expected) => { if (!ok) throw new Error(`${path}: expected ${expected}.`) }
const str = (value, path) => check(typeof value === 'string', path, 'text')
const num = (value, path, min = -Infinity) => check(Number.isFinite(value) && value >= min, path, `a number >= ${min}`)
const integer = (value, path, min = 0) => check(Number.isInteger(value) && value >= min, path, `an integer >= ${min}`)

// Validate supplied defaults recursively before hydration; optional fields keep
// their normal app defaults. Only document keys can enter the store.
function validateDefaults(raw, defaults, path = 'study') {
  check(object(raw), path, 'an object')
  for (const [key, value] of Object.entries(raw)) {
    if (!Object.hasOwn(defaults, key)) continue
    const fallback = defaults[key]
    const field = `${path}.${key}`
    if (Array.isArray(fallback)) check(Array.isArray(value), field, 'an array')
    else if (object(fallback)) validateDefaults(value, fallback, field)
    else if (typeof fallback === 'number') num(value, field)
    else check(typeof value === typeof fallback, field, typeof fallback)
  }
}

export function parseStudyJson(text) {
  check(text.length <= MAX_JSON_SIZE, 'JSON', 'a document smaller than 5 MB')
  const clean = text.trim().replace(/^```(?:json)?\s*\n([\s\S]*?)\n```$/i, '$1')
  let raw
  try { raw = JSON.parse(clean) } catch { throw new Error('Invalid JSON. Paste a JSON object or choose a .json file.') }
  check(object(raw), 'study', 'a JSON object')
  check(raw.v === SCHEMA_VERSION, 'study.v', `schema version ${SCHEMA_VERSION}`)
  str(raw.title, 'study.title')
  validateDefaults(raw, emptyDoc())
  const doc = pickDoc(hydrateDoc(raw))
  const ids = new Set()
  for (const name of ['notes', 'shapes', 'connectors', 'tags']) {
    doc[name].forEach((item, index) => {
      const path = `${name}[${index}]`
      check(object(item), path, 'an object')
      check(typeof item.id === 'string' && item.id.length > 0 && !ids.has(item.id), `${path}.id`, 'a unique nonempty ID')
      ids.add(item.id)
    })
  }
  for (const slot of ['primary', 'secondary']) {
    doc.scripture[slot].verses.forEach((verse, i) => {
      check(object(verse), `scripture.${slot}.verses[${i}]`, 'a verse object')
      integer(verse.verse, 'verse.verse', 1)
      str(verse.text, 'verse.text')
    })
  }
  const tags = new Set(['observation', 'question', 'application', 'none', ...doc.tags.map(t => t.id)])
  for (const tag of doc.tags) { str(tag.label, 'tag.label'); str(tag.hex, 'tag.hex') }
  for (const note of doc.notes) {
    str(note.text, 'note.text')
    if (note.title != null) str(note.title, 'note.title')
    num(note.x, 'note.x'); num(note.y, 'note.y')
    if (note.width !== undefined) num(note.width, 'note.width', 1)
    if (note.fontScale !== undefined) num(note.fontScale, 'note.fontScale', 0.1)
    check(note.panel == null || Object.hasOwn(doc.panels, note.panel), 'note.panel', 'a panel name or null')
    if (note.verses !== undefined) {
      check(Array.isArray(note.verses), 'note.verses', 'an array')
      note.verses.forEach(v => integer(v, 'note.verses', 1))
    }
  }
  const range = (anchor, path) => {
    integer(anchor.column ?? 0, `${path}.column`)
    check((anchor.column ?? 0) <= 1, `${path}.column`, '0 or 1')
    integer(anchor.verse, `${path}.verse`, 1)
    const verses = doc.scripture[anchor.column === 1 ? 'secondary' : 'primary'].verses
    const verse = anchor.verseIndex === undefined ? verses.find(v => v.verse === anchor.verse) : verses[anchor.verseIndex]
    check(!!verse, `${path}.verse`, 'a verse present in the scripture')
    if (anchor.verseIndex !== undefined) {
      integer(anchor.verseIndex, `${path}.verseIndex`)
      check(verses[anchor.verseIndex]?.verse === anchor.verse, `${path}.verseIndex`, 'the index of the referenced verse')
    }
    if (anchor.startWord !== undefined || anchor.endWord !== undefined) {
      integer(anchor.startWord, `${path}.startWord`)
      integer(anchor.endWord, `${path}.endWord`, anchor.startWord)
      check(anchor.endWord < verse.text.trim().split(/\s+/).length, `${path}.endWord`, 'a word index within the verse')
    }
  }
  for (const shape of doc.shapes) {
    check(['box', 'circle', 'ellipse', 'triangle', 'diamond', 'highlight', 'arrow', 'text'].includes(shape.type), 'shape.type', 'a supported shape type')
    num(shape.x, 'shape.x'); num(shape.y, 'shape.y')
    str(shape.color, 'shape.color')
    if (!['arrow', 'text'].includes(shape.type)) {
      num(shape.width, 'shape.width', 0)
      num(shape.height, 'shape.height', 0)
    }
    for (const key of ['width', 'height', 'strokeWidth', 'fontSize']) if (shape[key] !== undefined) num(shape[key], `shape.${key}`, 0)
    if (shape.text !== undefined) str(shape.text, 'shape.text')
    if (shape.opacity !== undefined) { num(shape.opacity, 'shape.opacity', 0); check(shape.opacity <= 1, 'shape.opacity', 'a number <= 1') }
    if (shape.type === 'arrow') {
      check(Array.isArray(shape.points) && shape.points.length >= 4 && shape.points.length % 2 === 0, 'shape.points', 'pairs of arrow coordinates')
      shape.points.forEach(p => num(p, 'shape.points'))
    }
    if (shape.wordRange != null) { check(object(shape.wordRange), 'shape.wordRange', 'an object'); range(shape.wordRange, 'shape.wordRange') }
  }
  for (const item of [...doc.notes, ...doc.shapes]) if (item.tag != null) check(tags.has(item.tag), 'tag', 'a built-in or declared tag ID')
  for (const connector of doc.connectors) {
    check(doc.notes.some(n => n.id === connector.noteId), 'connector.noteId', 'an existing note ID')
    check(connector.style === undefined || ['arrow', 'highlight'].includes(connector.style), 'connector.style', 'arrow or highlight')
    range(connector, 'connector')
  }
  for (const key of ['fontSize', 'lineHeight', 'columnWidth']) num(doc.style[key], `style.${key}`, 0.1)
  num(doc.ui.viewport.scale, 'ui.viewport.scale', 0.01)
  doc.ui.openPanels.forEach(p => check(Object.hasOwn(doc.panels, p), 'ui.openPanels', 'panel names'))
  doc.ui.tagFilter.forEach(t => check(tags.has(t), 'ui.tagFilter', 'declared tag IDs'))
  return doc
}

export const serializeStudyJson = state => JSON.stringify(pickDoc(state), null, 2)

const example = {
  v: SCHEMA_VERSION, title: 'Whiteboard recap',
  scripture: { reference: '', primary: { mode: 'custom', loadedReference: '', loadedTranslation: 'Whiteboard transcription', customText: '', verses: [] } },
  notes: [{ id: 'n1', title: 'Main idea', text: 'Replace this with a legible observation from the image.', tag: 'observation', panel: 'observations', verses: [], x: 1020, y: 140, width: 300 }],
  shapes: [], connectors: [], tags: [],
  panels: { observations: '', questions: '', summary: 'Replace this with a concise recap grounded in the whiteboard.', application: '' },
}

export const WHITEBOARD_PROMPT = `Convert the attached whiteboard picture into an editable Bible-study recap. Return ONLY valid JSON, with no commentary. Use schema version 1 and follow the layout principles of the attached example.Transcribe legible content faithfully and verbatim. Mark unclear words as [illegible]; do not invent text, scripture, conclusions, or verse connections. Do not include section titles inside the note content itself. Preserve questions as questions. Put observations, questions, summary, and application into their corresponding panels; use notes for individual points or ideas.If a scripture passage reference is known (either provided or clearly identifiable from the board), populate scripture.reference, primary.loadedReference, and load the corresponding passage text into primary.verses with accurate chapter/verse numbers. If unknown or not visible, keep verses empty and connectors empty.Fields & Schema:v: 1; title: A short recap title.scripture:reference and primary.loadedReference: Passage reference (e.g., "Luke 7:1-10") or empty string.primary.mode: "api" if standard loaded text, or "custom".primary.loadedTranslation: Visible translation label, standard name (e.g., "New International Version"), or "Whiteboard transcription".primary.verses: Array of verse objects [{"chapter": 7, "verse": 1, "text": "..."}].notes: Objects with unique id, title, text, tag, panel, verses (array of related verse numbers), x, y, width.Built-in tags: observation, question, application, none, or custom tag IDs.panel: "observations", "questions", "summary", "application", or null.Canvas Layout & Spatial Distribution:The scripture block occupies the center: x=160, y=140, width=790.  Do not stack all notes in a single column. Distribute notes spatially around the passage canvas mirroring their logical context and relationship to the verses:Left Margins (x: -480 to -100): Place background context, contrast notes, and left-aligned observations or related questions.  Right Columns (x: 1020 to 1400+): Form multiple columns for observations, questions, and applications beside the corresponding verse heights.  Top & Bottom Margins: Place banners, headers, or general takeaways above (y < 140) or below (y > 900) the main text.  Align the y position of notes roughly with the vertical position of the verses they reference, spacing them generously to prevent overlapping.  tags: Optional custom tag definitions (e.g., [{"id":"t_context","label":"Context","hex":"#db2777"}]).connectors: Explicit verse links connecting notes directly to verses or word spans.Example: {"id":"c1","noteId":"n1","column":0,"verse":7,"style":"arrow"}.  style can be "arrow" or "highlight". Optional startWord and endWord are 0-based inclusive token indices in the verse text.  panels: Strings containing compiled text for "observations", "questions", "summary", and "application" (using \\n for line breaks).  Use unique IDs across notes, shapes, connectors, and custom tags. Omit UI/app state unless needed. Ensure strict, valid JSON output only. `
