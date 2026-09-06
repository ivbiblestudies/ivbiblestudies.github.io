import { useEffect, useRef, useState } from 'react'
import { useStudy, PANEL_TAG } from '../../store'
import { tagList, resolveTag } from '../../data/tags'
import { verseLabel } from '../../lib/quickEntry'
import { getCanvasApi } from '../../lib/canvasApi'
import { cx } from '../ui'
import { IconTrash } from '../icons'

const PANEL_FOR_TAG = Object.fromEntries(
  Object.entries(PANEL_TAG).map(([panel, tag]) => [tag, panel]),
)

/** A note in the sidebar. Same object as the sticky note on the canvas. */
export default function NoteCard({ note }) {
  const selectedId = useStudy((s) => s.selectedId)
  const updateNote = useStudy((s) => s.updateNote)
  const removeNote = useStudy((s) => s.removeNote)
  const setSelected = useStudy((s) => s.setSelected)

  const [editing, setEditing] = useState(!note.text && !note.title)
  const [value, setValue] = useState(note.text)
  const [title, setTitle] = useState(note.title || '')
  const ref = useRef(null)
  const customTags = useStudy((s) => s.tags)
  const tag = resolveTag(note.tag, customTags)
  const selected = selectedId === note.id

  useEffect(() => {
    if (editing) ref.current?.focus()
  }, [editing])

  useEffect(() => {
    if (editing) return
    setValue(note.text)
    setTitle(note.title || '')
  }, [note.text, note.title, editing])

  const commit = () => {
    setEditing(false)
    const text = value.trim()
    const heading = title.trim()
    if (text !== note.text || heading !== (note.title || '')) {
      updateNote(note.id, { text, title: heading })
    }
  }

  // Blur only counts when focus leaves the whole card, not when moving between
  // the title and the body.
  const onBlurWithin = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) commit()
  }

  const reveal = () => {
    setSelected(note.id)
    getCanvasApi()?.centerOn?.(note.x, note.y)
  }

  return (
    <div
      className={cx(
        'group relative rounded-lg border bg-white transition-shadow',
        selected ? 'border-stone-400 shadow-sm' : 'border-stone-200 hover:border-stone-300',
      )}
    >
      <span
        className="absolute inset-y-0 left-0 w-[3px] rounded-l-lg"
        style={{ background: tag.hex }}
      />

      <div className="py-2 pl-3 pr-2">
        <div className="mb-1 flex items-center gap-2">
          {note.verses?.length > 0 && (
            <button
              type="button"
              onClick={reveal}
              className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] text-stone-600 hover:bg-stone-200"
              title="Show on canvas"
            >
              {verseLabel(note.verses)}
            </button>
          )}
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: tag.hex }}>
            {tag.label}
          </span>

          <div className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            {tagList(customTags).map((t) => (
              <button
                key={t.id}
                type="button"
                title={`Tag as ${t.label}`}
                onClick={() =>
                  updateNote(note.id, {
                    tag: t.id,
                    panel: PANEL_FOR_TAG[t.id] ?? note.panel,
                  })
                }
                className={cx(
                  'h-3.5 w-3.5 rounded-full border transition-transform hover:scale-110',
                  note.tag === t.id ? 'border-stone-900' : 'border-transparent',
                )}
                style={{ background: t.hex }}
              />
            ))}
            <button
              type="button"
              onClick={() => removeNote(note.id)}
              title="Delete note"
              className="ml-1 rounded p-0.5 text-stone-400 hover:bg-red-50 hover:text-red-600"
            >
              <IconTrash width={13} height={13} />
            </button>
          </div>
        </div>

        {editing ? (
          <div className="space-y-1" onBlur={onBlurWithin}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  ref.current?.focus()
                }
                if (e.key === 'Escape') {
                  setTitle(note.title || '')
                  setEditing(false)
                }
              }}
              placeholder="Title (optional)"
              className="w-full rounded border border-stone-300 px-2 py-1 text-[13px] font-semibold text-stone-900 focus:border-stone-500 focus:outline-none"
            />
            <textarea
              ref={ref}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  commit()
                }
                if (e.key === 'Escape') {
                  setValue(note.text)
                  setEditing(false)
                }
              }}
              rows={2}
              placeholder="Write your note…"
              className="w-full resize-y rounded border border-stone-300 px-2 py-1 text-[13px] leading-snug text-stone-800 focus:border-stone-500 focus:outline-none"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={reveal}
            onDoubleClick={() => setEditing(true)}
            className="block w-full text-left"
          >
            {note.title && (
              <span className="block text-[13px] font-semibold leading-snug text-stone-900">
                {note.title}
              </span>
            )}
            <span
              className={cx(
                'block text-[13px] leading-snug',
                note.title ? 'text-stone-600' : 'text-stone-800',
              )}
            >
              {note.text || (
                !note.title && (
                  <span className="text-stone-400">Empty note — double-click to write</span>
                )
              )}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
