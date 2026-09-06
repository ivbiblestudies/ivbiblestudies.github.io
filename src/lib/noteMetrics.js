// Sticky-note sizing, shared by the canvas renderer, the inline editor and the
// placement logic in the store, so a note always reserves exactly the space it
// will occupy.
//
// A note carries a `fontScale`: resizing it scales the type with the box, the
// way a text frame scales in a drawing tool, rather than only re-wrapping.

export const NOTE_WIDTH = 190
export const NOTE_MIN_WIDTH = 130
export const NOTE_MAX_WIDTH = 720
export const NOTE_PADDING = 12
export const NOTE_FONT_SIZE = 13
export const NOTE_TITLE_SIZE = 14
export const NOTE_META_SIZE = 9
export const NOTE_LINE_HEIGHT = 1.45
export const NOTE_TITLE_LINE_HEIGHT = 1.3
export const NOTE_TITLE_GAP = 4
export const NOTE_HEADER = 20
export const NOTE_MIN_HEIGHT = 72

export const MIN_SCALE = 0.6
export const MAX_SCALE = 3.5

let mctx = null
function ctx() {
  if (!mctx) mctx = document.createElement('canvas').getContext('2d')
  return mctx
}

export const noteScale = (note) =>
  Math.min(MAX_SCALE, Math.max(MIN_SCALE, note?.fontScale || 1))

export const noteWidth = (note) =>
  Math.min(NOTE_MAX_WIDTH, Math.max(NOTE_MIN_WIDTH, note?.width || NOTE_WIDTH))

/** Every measurement in a note, scaled by its font scale. */
export function noteFontMetrics(note) {
  const s = noteScale(note)
  return {
    scale: s,
    padding: NOTE_PADDING * s,
    header: NOTE_HEADER * s,
    metaSize: NOTE_META_SIZE * s,
    titleSize: NOTE_TITLE_SIZE * s,
    bodySize: NOTE_FONT_SIZE * s,
    titleGap: NOTE_TITLE_GAP * s,
    minHeight: NOTE_MIN_HEIGHT * s,
  }
}

/** Wrap text to a note's inner width. Returns the lines. */
export function wrapNoteText(text, innerWidth, fontSize, weight = 400) {
  const c = ctx()
  c.font = `${weight} ${fontSize}px Inter, system-ui, sans-serif`

  const lines = []
  for (const paragraph of String(text || '').split('\n')) {
    let line = ''
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word
      if (c.measureText(candidate).width > innerWidth && line) {
        lines.push(line)
        line = word
      } else {
        line = candidate
      }
    }
    lines.push(line)
  }
  return lines.length ? lines : ['']
}

const innerWidth = (note) => noteWidth(note) - noteFontMetrics(note).padding * 2

/** Wrapped title lines for a note (empty when it has no title). */
export function noteTitleLines(note) {
  const title = String(note?.title || '').trim()
  if (!title) return []
  return wrapNoteText(title, innerWidth(note), noteFontMetrics(note).titleSize, 600)
}

export const noteBodyLines = (note) =>
  wrapNoteText(note?.text, innerWidth(note), noteFontMetrics(note).bodySize)

/** The height the note's own content needs — its floor when resizing. */
export function noteContentHeight(note) {
  const m = noteFontMetrics(note)
  const titles = noteTitleLines(note)
  const bodies = noteBodyLines(note)
  const titleBlock = titles.length
    ? titles.length * m.titleSize * NOTE_TITLE_LINE_HEIGHT + m.titleGap
    : 0
  return Math.max(
    m.minHeight,
    m.header + m.padding * 2 + titleBlock + bodies.length * m.bodySize * NOTE_LINE_HEIGHT,
  )
}

/**
 * The note's rendered height: whatever the user dragged it to, but never
 * smaller than the text inside it.
 */
export function noteHeight(note) {
  return Math.max(noteContentHeight(note), note?.height || 0)
}
