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

export const WHITEBOARD_PROMPT = `Convert the attached whiteboard picture into an editable Bible-study recap. Return ONLY valid JSON, with no commentary. Use schema version 1 and follow the layout principles of the attached example Use attached example JSON files only as references for layout and structure. Do not copy their study content. The requirements below take precedence over conflicting examples. 1. TRANSCRIPTION AND ACCURACY Transcribe all legible whiteboard content faithfully and verbatim. Preserve wording, abbreviations, punctuation, and question marks. Mark unclear words as [illegible]. Never invent observations, questions, conclusions, applications, scripture connections, or missing content. Do not add outside theological interpretations. Create separate notes for individual points, questions, and ideas. Combine content only when the whiteboard clearly groups it. Preserve visible logical relationships, contrasts, sequences, and groupings. Do not repeat section headings inside note text. Categorize notes by meaning, regardless of their physical location. 2. SCRIPTURE — ALWAYS NIV Use the New International Version (NIV) exclusively for scripture passage text. Explicitly set BOTH scripture.primary.translation and scripture.secondary.translation to "NIV". This is required even when secondary is unused. Set primary.loadedTranslation to "New International Version" when verified NIV verse text is included; otherwise use "". If a passage reference is provided or clearly identifiable, set scripture.reference and primary.loadedReference to that reference. If unknown, set both to "". Populate primary.verses only with verified NIV text. Each verse object must contain: - chapter: positive integer - verse: positive integer - text: string containing that verse’s NIV text Keep verses in passage order. Do not include verse numbers in text. For passages spanning multiple chapters, optionally include label as a string such as "3:16". Never mix translations, relabel another translation as NIV, or reconstruct uncertain text from memory. If verified NIV passage text is unavailable, use primary.verses: [] and connectors: []. Preserve whiteboard quotations faithfully in note text, even if their wording differs from NIV. The displayed scripture passage must still use verified NIV. Use primary.mode: "api" for verified standard NIV passage text. Use "custom" only for explicitly supplied or transcribed scripture that has been verified as NIV. In custom mode, populate customText with that NIV text. Otherwise customText must be "". Include scripture.parallel: false. Include the unused secondary slot explicitly: { "mode": "api", "translation": "NIV", "loadedReference": "", "loadedTranslation": "", "customText": "", "verses": [] } Import stores supplied verse text; setting mode to "api" does not automatically fetch missing verses. 3. JSON STRUCTURE AND DEFAULTS Use exactly these top-level fields: v, title, scripture, style, layer, shapes, notes, connectors, tags, panels. Set v to the number 1 and title to a short string. Use this structure as the starting template, replacing content as supported by the whiteboard: { "v": 1, "title": "Whiteboard recap", "scripture": { "reference": "", "parallel": false, "primary": { "mode": "api", "translation": "NIV", "loadedReference": "", "loadedTranslation": "", "customText": "", "verses": [] }, "secondary": { "mode": "api", "translation": "NIV", "loadedReference": "", "loadedTranslation": "", "customText": "", "verses": [] } }, "style": { "fontFamily": "Literata", "fontSize": 19, "lineHeight": 1.9, "letterSpacing": 0, "wordSpacing": 4, "verseSpacing": 10, "columnWidth": 790, "verseOnNewLine": true, "showVerseNumbers": true, "textColor": "#1c1917" }, "layer": { "x": 160, "y": 140, "gap": 72 }, "shapes": [], "notes": [], "connectors": [], "tags": [], "panels": { "observations": "", "questions": "", "summary": "", "application": "" } } Use compatible typography values from supplied examples when appropriate. Scripture width is style.columnWidth, not layer.width. Keep numeric fields as finite JSON numbers, never strings. fontSize, lineHeight, and columnWidth must each be at least 0.1. Boolean fields must be true or false. Use shapes: []. Do not include ui, viewport, tool state, loading state, undo history, or other application state. 4. NOTES, TAGS, AND PANELS Every note must contain: - id: unique nonempty string - title: string; use "" if no meaningful title - text: faithful whiteboard transcription - tag: built-in tag ID or declared custom tag ID - panel: "observations", "questions", "summary", "application", or null - verses: array of genuinely related positive integer verse numbers, or [] - x: finite number - y: finite number - width: finite number at least 1 Optional fontScale must be a finite number at least 0.1. Built-in tag IDs are: observation, question, application, none. Use observation for observations, question for questions, application for applications, and none for summaries unless a suitable custom tag is defined. Custom tags must contain: - id: unique nonempty string - label: plain, nonempty string - hex: six-digit hexadecimal color string, such as "#0284c7" Example: {"id":"t_context","label":"Context","hex":"#0284c7"} Do not redeclare built-in tags or use their IDs for custom tags. Never reference an undeclared custom tag. If no custom tags are needed, use tags: []. IDs must be unique ACROSS ALL notes, shapes, connectors, and custom tags, not merely within each array. Prefer prefixes such as n1, c1, and t_context. Assign panels by meaning, independently of canvas position. Context and announcements may use panel: null. Populate panels.observations, panels.questions, panels.summary, and panels.application with the corresponding compiled whiteboard content. Every panel value must be a string. Use "" for absent content. Encode actual line breaks inside JSON strings as \n. Do not use \n when a displayed line break is intended. Do not invent summary or application content to fill empty panels. 5. SPATIAL LAYOUT Create an organic, balanced study canvas with central scripture at x=160, y=140 and width 790. Distribute observations, questions, context, and applications on both sides of the passage. Do not put observations on one side and questions on the other. Category determines tag and panel, not position. Place related observations and questions near one another and approximately level with their referenced verses. Use multiple horizontal lanes and irregular but intentional positioning, rather than aligned vertical lists. Vary note widths approximately between 180 and 350 according to content length. Suggested flexible regions: - Far left: x=-480 to -260 - Inner left: x=-250 to -80 - Scripture: x=160 to 950 - Inner right: x=990 to 1190 - Far right: x=1200 to 1450 - Context/header notes: above the passage - Summary/application notes: below the passage or in spacious outer regions These are starting regions, not mandatory columns. Check each note’s full bounds: a left-side note’s x plus width must remain outside the scripture with a generous gap. Widen the canvas placement as necessary. Estimate note height from text length, wrapping, title, and width. Leave at least 20–30 pixels between neighboring note boundaries. Notes must not overlap scripture or other notes. Estimate verse positions from passage length, wrapping, and typography. Earlier verses should be higher and later verses lower. Place notes referencing multiple verses near the middle of that section. Do not assume scripture ends at y=900. Longer passages extend farther down the canvas. Top notes must fit entirely above scripture. When enough observations and questions exist, ensure both sides contain a mixture. Do not invent notes to achieve visual balance. 6. VERSE CONNECTIONS — PRECISE HIGHLIGHTS ONLY Use word-level highlight connectors exclusively. Never create arrow connectors or arrow shapes. For each note with a clearly identifiable textual anchor, create one or more connectors containing: - id: globally unique nonempty string - noteId: existing note ID - column: 0 - verse: actual positive integer verse number - verseIndex: zero-based index in primary.verses - startWord: zero-based inclusive word index - endWord: zero-based inclusive word index - style: "highlight" Calculate word indices from the EXACT stored verse text using: verse.text.trim().split(/\s+/) Require: 0 <= startWord <= endWord < token count. verseIndex is the verse’s ARRAY POSITION, not verse number minus one. For a passage beginning at verse 7, its first stored verse has verseIndex: 0. For multiple chapters, use verseIndex to distinguish repeated verse numbers. Each connector’s verse must equal primary.verses[verseIndex].verse. Highlight the shortest meaningful phrase directly supporting the note. For repetitions, contrasts, or parallels, create separate connectors for the relevant phrases in each applicable verse. For questions, highlight the words or action prompting the question. One note may have multiple connectors. Multiple notes may highlight different phrases in one verse. Never guess indices or add unsupported connections. If there is no clear textual anchor, omit that note’s connectors. If primary.verses is empty, connectors must be []. notes[].verses records related verse numbers but does not replace precise highlight connectors. Use unique IDs across notes, shapes, connectors, and custom tags. Omit UI/app state unless needed. Ensure strict, valid JSON output only`
