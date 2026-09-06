import { useStudy, PANEL_TAG } from '../../store'
import { tagList } from '../../data/tags'
import { NOTE_WIDTH } from '../../lib/noteMetrics'
import { cx } from '../ui'
import { IconTrash } from '../icons'

const PANEL_FOR_TAG = Object.fromEntries(
  Object.entries(PANEL_TAG).map(([panel, tag]) => [tag, panel]),
)

/** Retag, recolor or delete the selected canvas object. */
export default function SelectionPopover({ bounds }) {
  const selectedId = useStudy((s) => s.selectedId)
  const editingId = useStudy((s) => s.editingId)
  const notes = useStudy((s) => s.notes)
  const shapes = useStudy((s) => s.shapes)
  const vp = useStudy((s) => s.ui.viewport)
  const updateNote = useStudy((s) => s.updateNote)
  const updateShape = useStudy((s) => s.updateShape)
  const setEditing = useStudy((s) => s.setEditing)
  const deleteSelected = useStudy((s) => s.deleteSelected)
  const customTags = useStudy((s) => s.tags)
  const connectors = useStudy((s) => s.connectors)
  const setConnectorStyle = useStudy((s) => s.setConnectorStyle)

  const note = notes.find((n) => n.id === selectedId)
  const shape = shapes.find((s) => s.id === selectedId)
  const target = note || shape
  const linked = note ? connectors.filter((c) => c.noteId === note.id) : []
  const linkStyle = linked[0]?.style === 'highlight' ? 'highlight' : 'arrow'
  if (!target || editingId === selectedId) return null

  const width = note ? note.width || NOTE_WIDTH : shape.width || 180
  // The bar grows with the number of tags and the link toggle, so keep a
  // generous right margin or it clips against the sidebar.
  const barWidth = 220 + tagList(customTags).length * 52 + (note && linked.length ? 130 : 0)
  const left = Math.max(
    8,
    Math.min(
      vp.x + target.x * vp.scale + (width * vp.scale) / 2 - barWidth / 2,
      (bounds?.width || 900) - barWidth - 12,
    ),
  )
  const top = Math.max(8, vp.y + target.y * vp.scale - 52)

  const setTag = (tag) => {
    if (note) updateNote(note.id, { tag, panel: PANEL_FOR_TAG[tag] ?? note.panel })
    else updateShape(shape.id, { tag })
  }

  return (
    <div
      className="animate-fade-in absolute z-30 flex items-center gap-1 rounded-xl border border-stone-200 bg-white/95 p-1 shadow-lg shadow-stone-900/10 backdrop-blur"
      style={{ left, top }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {tagList(customTags).map((t) => {
        const id = t.id
        const active = (target.tag || 'none') === id
        return (
          <button
            key={id}
            type="button"
            title={`Tag as ${t.label}`}
            onClick={() => setTag(id)}
            className={cx(
              'flex h-7 items-center gap-1.5 rounded-lg px-2 text-[11px] font-semibold transition-colors',
              active ? 'text-stone-900' : 'text-stone-400 hover:text-stone-700',
            )}
            style={active ? { background: t.soft } : undefined}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: t.hex }} />
            {t.short}
          </button>
        )
      })}

      <span className="mx-0.5 h-5 w-px bg-stone-200" />

      {note && linked && (
        <>
          <button
            type="button"
            title="Link to the verse with an arrow"
            onClick={() => setConnectorStyle(note.id, 'arrow')}
            className={cx(
              'h-7 rounded-lg px-2 text-[11px] font-semibold transition-colors',
              linkStyle === 'arrow'
                ? 'bg-stone-900 text-white'
                : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900',
            )}
          >
            Arrow
          </button>
          <button
            type="button"
            title="Link to the verse by highlighting it"
            onClick={() => setConnectorStyle(note.id, 'highlight')}
            className={cx(
              'h-7 rounded-lg px-2 text-[11px] font-semibold transition-colors',
              linkStyle === 'highlight'
                ? 'bg-stone-900 text-white'
                : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900',
            )}
          >
            Highlight
          </button>
          <span className="mx-0.5 h-5 w-px bg-stone-200" />
        </>
      )}

      {(note || shape.type === 'text') && (
      <button
        type="button"
        onClick={() => setEditing(selectedId)}
        className="h-7 rounded-lg px-2 text-[11px] font-semibold text-stone-500 hover:bg-stone-100 hover:text-stone-900"
      >
        Edit
      </button>
      )}
      <button
        type="button"
        onClick={deleteSelected}
        title="Delete (Del)"
        className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-600"
      >
        <IconTrash width={15} height={15} />
      </button>
    </div>
  )
}
