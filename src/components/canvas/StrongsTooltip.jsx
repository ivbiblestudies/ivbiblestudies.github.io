import { useEffect, useRef } from 'react'
import { useStudy } from '../../store'

/**
 * The original-language popover. Anchored to the clicked word in container
 * coordinates and clamped so it never runs off the canvas.
 */
export default function StrongsTooltip({ bounds }) {
  const strongs = useStudy((s) => s.strongs)
  const setStrongs = useStudy((s) => s.setStrongs)
  const ref = useRef(null)

  useEffect(() => {
    if (!strongs) return
    const onKey = (e) => e.key === 'Escape' && setStrongs(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [strongs, setStrongs])

  if (!strongs) return null

  const width = 320
  const left = Math.max(12, Math.min(strongs.x - width / 2, (bounds?.width || 900) - width - 12))
  const top = Math.min(strongs.y + 18, (bounds?.height || 700) - 140)

  return (
    <div
      ref={ref}
      className="animate-fade-in absolute z-30 rounded-xl border border-stone-200 bg-white shadow-xl shadow-stone-900/10"
      style={{ left, top, width }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-2 border-b border-stone-100 px-4 py-2.5">
        <div>
          <div className="font-scripture text-[15px] font-medium text-stone-900" style={{ fontFamily: 'Literata, serif' }}>
            “{strongs.word}”
          </div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-stone-400">
            {strongs.verse != null ? `verse ${strongs.verse} · ` : ''}
            {strongs.found ? `${strongs.entries.length} entr${strongs.entries.length === 1 ? 'y' : 'ies'}` : 'no entry'}
          </div>
        </div>
        <button
          onClick={() => setStrongs(null)}
          className="rounded px-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto scroll-slim px-4 py-3">
        {!strongs.found && (
          <p className="text-xs leading-relaxed text-stone-500">
            This word isn’t in the bundled lexicon, which covers the vocabulary
            that carries most inductive study — key theological terms, connectives
            and repeated words.
          </p>
        )}

        {strongs.entries.map((entry, i) => (
          <div key={entry.strongs} className={i > 0 ? 'mt-3 border-t border-stone-100 pt-3' : ''}>
            <div className="flex items-baseline gap-2">
              <span
                className="text-lg text-stone-900"
                style={{ fontFamily: entry.lang === 'Hebrew' ? 'serif' : 'Literata, serif' }}
                dir={entry.lang === 'Hebrew' ? 'rtl' : 'ltr'}
              >
                {entry.lemma}
              </span>
              <span className="italic text-sm text-stone-600">{entry.translit}</span>
              <span className="ml-auto font-mono text-[10px] text-stone-400">{entry.strongs}</span>
            </div>
            <div className="mt-0.5 text-[11px] uppercase tracking-[0.06em] text-stone-400">
              {entry.lang} · {entry.pos}
            </div>
            <p className="mt-1 text-[13px] leading-snug text-stone-800">{entry.gloss}</p>
            {entry.note && (
              <p className="mt-1 text-xs leading-snug text-stone-500">{entry.note}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
