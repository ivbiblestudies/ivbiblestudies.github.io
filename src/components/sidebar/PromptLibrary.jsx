import { useEffect, useRef, useState } from 'react'
import { PROMPT_LIBRARY } from '../../data/prompts'
import { cx } from '../ui'
import { IconSparkle } from '../icons'

/**
 * Classic inductive prompts. Picking one drops it into the panel's writing area
 * so the student answers it in place rather than staring at a blank box.
 */
export default function PromptLibrary({ panel, onPick }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const library = PROMPT_LIBRARY[panel]

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!library) return null

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cx(
          'inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-2 text-xs font-medium transition-colors',
          open
            ? 'border-stone-400 bg-stone-100 text-stone-900'
            : 'border-stone-300 bg-white text-stone-600 hover:border-stone-400 hover:text-stone-900',
        )}
      >
        <IconSparkle width={13} height={13} />
        Study prompts
      </button>

      {open && (
        <div className="animate-fade-in absolute right-0 z-40 mt-1.5 w-[300px] overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl shadow-stone-900/10">
          <div className="border-b border-stone-100 px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-400">
              {library.title}
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto scroll-slim py-1">
            {library.groups.map((group) => (
              <div key={group.name} className="px-1 py-1">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.09em] text-stone-400">
                  {group.name}
                </div>
                {group.items.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      onPick(item)
                      setOpen(false)
                    }}
                    className="block w-full rounded-md px-2 py-1.5 text-left text-[13px] leading-snug text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                  >
                    {item}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
