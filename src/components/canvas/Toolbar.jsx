import { useEffect, useRef, useState } from 'react'
import { useStudy } from '../../store'
import { tagList, resolveTag, TAG_PALETTE } from '../../data/tags'
import { cx } from '../ui'
import MovablePanel from '../MovablePanel'
import {
  IconCursor,
  IconBox,
  IconCircle,
  IconEllipse,
  IconTriangle,
  IconDiamond,
  IconHighlighter,
  IconArrow,
  IconText,
  IconNote,
} from '../icons'

const TOOLS = [
  { id: 'select', label: 'Select / move', key: 'V', Icon: IconCursor },
  { id: 'box', label: 'Draw box', key: 'B', Icon: IconBox },
  { id: 'circle', label: 'Draw circle', key: 'C', Icon: IconCircle },
  { id: 'ellipse', label: 'Draw ellipse', key: 'E', Icon: IconEllipse },
  { id: 'triangle', label: 'Draw triangle', key: 'R', Icon: IconTriangle },
  { id: 'diamond', label: 'Draw diamond', key: 'D', Icon: IconDiamond },
  { id: 'highlight', label: 'Highlighter', key: 'G', Icon: IconHighlighter },
  { id: 'arrow', label: 'Arrow', key: 'A', Icon: IconArrow },
  { id: 'text', label: 'Add text', key: 'T', Icon: IconText },
  { id: 'note', label: 'Sticky note', key: 'N', Icon: IconNote },
]

const SWATCHES = [
  '#0f766e',
  '#7c3aed',
  '#c2410c',
  '#b91c1c',
  '#1d4ed8',
  '#a16207',
  '#1c1917',
  '#fbbf24',
]

/** Small popover anchored to the right of a rail button. */
function Flyout({ open, onClose, children, label }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      ref={ref}
      aria-label={label}
      className="tool-flyout animate-fade-in absolute left-[calc(100%+8px)] top-0 z-30 rounded-xl border border-stone-200 bg-white p-2 shadow-xl shadow-stone-900/10"
    >
      {children}
    </div>
  )
}

/**
 * The annotation rail. Docked to the left edge of the canvas rather than
 * floating over the bottom, so it is always on screen at any window size.
 */
export default function Toolbar() {
  const hidden = useStudy((s) => s.ui.toolsHidden)
  const tool = useStudy((s) => s.ui.tool)
  const color = useStudy((s) => s.ui.color)
  const noteTag = useStudy((s) => s.ui.noteTag)
  const setTool = useStudy((s) => s.setTool)
  const setColor = useStudy((s) => s.setColor)
  const setUI = useStudy((s) => s.setUI)
  const customTags = useStudy((s) => s.tags)
  const addTag = useStudy((s) => s.addTag)
  const removeTag = useStudy((s) => s.removeTag)

  const [menu, setMenu] = useState(null) // 'tag' | 'color' | null
  const [newTag, setNewTag] = useState(null) // { label, hex } while creating
  const tags = tagList(customTags)
  const activeTag = resolveTag(noteTag, customTags)

  return (
    <MovablePanel label="Tools" hidden={hidden} width={58} onHide={() => setUI({ toolsHidden: true }, { history: false })}>
      <div className="pointer-events-auto relative flex flex-col items-center gap-1 rounded-2xl border border-stone-200/90 bg-white/95 p-1.5 shadow-xl shadow-stone-900/10 backdrop-blur">
        {TOOLS.map(({ id, label, key, Icon }) => (
          <button
            key={id}
            type="button"
            title={`${label}  (${key})`}
            aria-label={label}
            aria-pressed={tool === id}
            onClick={() => {
              setTool(id)
              setMenu(null)
            }}
            className={cx(
              'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
              tool === id
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
            )}
          >
            <Icon />
          </button>
        ))}

        <span className="my-0.5 h-px w-6 bg-stone-200" />

        {/* Tag applied to whatever you create next. */}
        <div className="relative">
          <button
            type="button"
            title={`New annotations are tagged ${activeTag.label}`}
            aria-label="Tag for new annotations"
            aria-expanded={menu === 'tag'}
            onClick={() => setMenu(menu === 'tag' ? null : 'tag')}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[10px] font-bold transition-colors hover:bg-stone-100"
            style={{ background: activeTag.soft, color: activeTag.hex }}
          >
            {activeTag.short}
          </button>
          <Flyout
            open={menu === 'tag'}
            onClose={() => {
              setMenu(null)
              setNewTag(null)
            }}
            label="Choose a tag"
          >
            <div className="w-52">
              <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-stone-400">
                Tag new annotations
              </div>
              {tags.map((t) => (
                <div key={t.id} className="group/tag flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setUI({ noteTag: t.id }, { history: false })
                      setMenu(null)
                    }}
                    className={cx(
                      'flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors',
                      noteTag === t.id
                        ? 'font-semibold text-stone-900'
                        : 'text-stone-600 hover:bg-stone-100',
                    )}
                    style={noteTag === t.id ? { background: t.soft } : undefined}
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: t.hex }} />
                    <span className="truncate">{t.label}</span>
                  </button>
                  {t.custom && (
                    <button
                      type="button"
                      title={`Delete "${t.label}" — anything using it becomes untagged`}
                      onClick={() => removeTag(t.id)}
                      className="ml-0.5 rounded px-1.5 text-stone-300 opacity-0 hover:text-red-600 group-hover/tag:opacity-100"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <div className="mt-1 border-t border-stone-100 pt-1">
                {newTag ? (
                  <form
                    className="px-1 py-1"
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (!newTag.label.trim()) return
                      addTag(newTag)
                      setNewTag(null)
                      setMenu(null)
                    }}
                  >
                    <input
                      autoFocus
                      value={newTag.label}
                      onChange={(e) => setNewTag({ ...newTag, label: e.target.value })}
                      onKeyDown={(e) => {
                        e.stopPropagation()
                        if (e.key === 'Escape') setNewTag(null)
                      }}
                      placeholder="Announcement, Context…"
                      className="w-full rounded border border-stone-300 px-2 py-1 text-[13px] focus:border-stone-500 focus:outline-none"
                    />
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {TAG_PALETTE.map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          aria-label={`Color ${hex}`}
                          onClick={() => setNewTag({ ...newTag, hex })}
                          className={cx(
                            'h-5 w-5 rounded-full border transition-transform',
                            newTag.hex === hex
                              ? 'scale-110 border-stone-900 ring-2 ring-stone-900/20'
                              : 'border-black/10 hover:scale-105',
                          )}
                          style={{ background: hex }}
                        />
                      ))}
                    </div>
                    <div className="mt-2 flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setNewTag(null)}
                        className="rounded px-2 py-1 text-[12px] text-stone-500 hover:bg-stone-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded bg-stone-900 px-2 py-1 text-[12px] font-medium text-white hover:bg-stone-800"
                      >
                        Add tag
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setNewTag({ label: '', hex: TAG_PALETTE[0] })}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] text-stone-600 hover:bg-stone-100"
                  >
                    <span className="text-stone-400">＋</span> New tag…
                  </button>
                )}
              </div>
            </div>
          </Flyout>
        </div>

        <div className="relative">
          <button
            type="button"
            title="Color"
            aria-label="Annotation color"
            aria-expanded={menu === 'color'}
            onClick={() => setMenu(menu === 'color' ? null : 'color')}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-stone-100"
          >
            <span
              className="h-5 w-5 rounded-full border border-black/10 shadow-inner"
              style={{ background: color }}
            />
          </button>
          <Flyout open={menu === 'color'} onClose={() => setMenu(null)} label="Choose a color">
            <div className="w-[168px]">
              <div className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-stone-400">
                Color
              </div>
              <div className="grid grid-cols-4 gap-1.5 px-1">
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Color ${c}`}
                    title={c}
                    onClick={() => setColor(c)}
                    className={cx(
                      'h-7 w-7 rounded-full border transition-transform',
                      color === c
                        ? 'scale-110 border-stone-900 ring-2 ring-stone-900/20'
                        : 'border-black/10 hover:scale-105',
                    )}
                    style={{ background: c }}
                  />
                ))}
              </div>
              <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5 text-[12px] text-stone-600 hover:bg-stone-100">
                <span
                  className="h-5 w-5 shrink-0 rounded-full border border-stone-300"
                  style={{
                    background:
                      'conic-gradient(#ef4444,#f59e0b,#10b981,#3b82f6,#8b5cf6,#ef4444)',
                  }}
                />
                Custom…
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="sr-only"
                />
              </label>
            </div>
          </Flyout>
        </div>
      </div>
    </MovablePanel>
  )
}
