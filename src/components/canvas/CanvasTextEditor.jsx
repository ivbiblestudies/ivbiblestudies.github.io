import { useEffect, useRef, useState } from 'react'
import { useStudy } from '../../store'
import {
  NOTE_PADDING,
  NOTE_FONT_SIZE,
  NOTE_TITLE_SIZE,
  NOTE_LINE_HEIGHT,
  NOTE_HEADER,
  noteWidth,
  noteHeight,
} from '../../lib/noteMetrics'
import { tagOf } from '../../data/tags'

/**
 * Editing text on a canvas is the one thing Konva can't do: it has no caret. So
 * while a note or text object is being edited we float real form fields over the
 * node, matched to its font and transform.
 */
export default function CanvasTextEditor() {
  const editingId = useStudy((s) => s.editingId)
  const notes = useStudy((s) => s.notes)
  const shapes = useStudy((s) => s.shapes)
  const vp = useStudy((s) => s.ui.viewport)
  const updateNote = useStudy((s) => s.updateNote)
  const updateShape = useStudy((s) => s.updateShape)
  const removeNote = useStudy((s) => s.removeNote)
  const removeShape = useStudy((s) => s.removeShape)
  const setEditing = useStudy((s) => s.setEditing)

  const note = notes.find((n) => n.id === editingId)
  const shape = shapes.find((s) => s.id === editingId)
  const target = note || shape

  const [value, setValue] = useState('')
  const [title, setTitle] = useState('')
  const bodyRef = useRef(null)

  useEffect(() => {
    if (!target) return
    setValue(target.text || '')
    setTitle(target.title || '')
    const t = setTimeout(() => {
      bodyRef.current?.focus()
      bodyRef.current?.select()
    }, 10)
    return () => clearTimeout(t)
  }, [editingId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!target) return null

  const commit = () => {
    const text = value.trim()
    const heading = title.trim()
    if (note) {
      // A brand-new note with nothing in it is a misclick, not a note.
      if (!text && !heading) removeNote(note.id)
      else updateNote(note.id, { text, title: heading })
    } else if (shape) {
      if (!text) removeShape(shape.id)
      else updateShape(shape.id, { text })
    }
    setEditing(null)
  }

  const onKeyDown = (e) => {
    e.stopPropagation()
    if (e.key === 'Escape') {
      e.preventDefault()
      setEditing(null)
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      commit()
    }
  }

  // --- text shapes: a single bare textarea --------------------------------
  if (shape) {
    return (
      <textarea
        ref={bodyRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        placeholder="Type…"
        className="absolute z-40 resize-none overflow-hidden rounded-md border-2 border-stone-900/70 p-1 shadow-lg outline-none"
        style={{
          left: vp.x + shape.x * vp.scale,
          top: vp.y + shape.y * vp.scale,
          width: (shape.width || 240) * vp.scale,
          fontSize: (shape.fontSize || 18) * vp.scale,
          lineHeight: 1.35,
          fontFamily: 'Inter, sans-serif',
          color: shape.color,
          background: 'rgba(255,255,255,0.92)',
        }}
        spellCheck
      />
    )
  }

  // --- sticky notes: optional title above the body -------------------------
  const width = noteWidth(note)
  const tag = tagOf(note.tag)
  const scale = vp.scale
  const innerWidth = (width - NOTE_PADDING * 2) * scale

  return (
    <div
      className="absolute z-40 rounded-md border-2 border-stone-900/70 shadow-lg"
      style={{
        left: vp.x + note.x * scale,
        top: vp.y + note.y * scale,
        width: width * scale,
        minHeight: noteHeight({ ...note, title, text: value }) * scale,
        background: tag.soft,
        paddingTop: (NOTE_HEADER + NOTE_PADDING - 8) * scale,
        paddingLeft: NOTE_PADDING * scale,
        paddingRight: NOTE_PADDING * scale,
        paddingBottom: NOTE_PADDING * scale,
      }}
      // Commit once focus leaves the whole editor, not when moving between the
      // title and the body.
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) commit()
      }}
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
            e.preventDefault()
            bodyRef.current?.focus()
            return
          }
          onKeyDown(e)
        }}
        placeholder="Title (optional)"
        className="block w-full bg-transparent font-semibold text-stone-900 outline-none placeholder:font-normal placeholder:text-stone-500/70"
        style={{
          width: innerWidth,
          fontSize: NOTE_TITLE_SIZE * scale,
          lineHeight: 1.3,
          fontFamily: 'Inter, sans-serif',
        }}
      />
      <textarea
        ref={bodyRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Write your note…"
        rows={2}
        className="block w-full resize-none bg-transparent text-stone-900 outline-none placeholder:text-stone-500/70"
        style={{
          width: innerWidth,
          marginTop: 4 * scale,
          fontSize: NOTE_FONT_SIZE * scale,
          lineHeight: NOTE_LINE_HEIGHT,
          fontFamily: 'Inter, sans-serif',
          minHeight: NOTE_FONT_SIZE * NOTE_LINE_HEIGHT * 2 * scale,
        }}
        spellCheck
      />
    </div>
  )
}
