import {
  NOTE_MIN_WIDTH, NOTE_MAX_WIDTH, MIN_SCALE, MAX_SCALE,
  noteWidth, noteHeight, noteScale, noteContentHeight,
} from './noteMetrics.js'

/** Handle coordinates are relative to the note at the start of the drag. */
export function resizeNoteBox(note, ax, ay, hx, hy) {
  const width = noteWidth(note)
  const height = noteHeight(note)
  const vertical = ax === 0.5
  const horizontal = ay === 0.5
  let w = Math.min(NOTE_MAX_WIDTH, Math.max(NOTE_MIN_WIDTH, ax === 0 ? width - hx : hx))
  let fontScale = noteScale(note)
  let h

  if (vertical) {
    const target = Math.max(0, ay === 0 ? height - hy : hy)
    w = width
    h = Math.max(target, noteContentHeight(note))
  } else if (horizontal) {
    h = noteContentHeight({ ...note, width: w })
  } else {
    fontScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, fontScale * w / width))
    h = Math.max(noteContentHeight({ ...note, width: w, fontScale }), ay === 0 ? height - hy : hy)
  }

  return {
    x: ax === 0 ? note.x + width - w : note.x,
    y: ay === 0 ? note.y + height - h : note.y,
    width: w, height: h, fontScale,
  }
}
