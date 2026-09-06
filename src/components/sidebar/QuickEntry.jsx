import { useMemo, useState } from 'react'
import { useStudy } from '../../store'
import { parseQuickEntry, verseLabel } from '../../lib/quickEntry'
import { Button, Textarea, cx } from '../ui'

const PLACEHOLDER = `v3: Repeated word "grace"
vv5-7 — contrast between flesh and spirit
12, 14: who is "he" here?`

/**
 * Paste a block of verse-keyed notes; each line becomes a tagged sticky note on
 * the canvas beside its verse, joined by a connector arrow.
 */
export default function QuickEntry({ panel }) {
  const [value, setValue] = useState('')
  const submitQuickEntry = useStudy((s) => s.submitQuickEntry)

  const preview = useMemo(() => parseQuickEntry(value), [value])
  const anchored = preview.filter((p) => p.verse != null).length

  const submit = () => {
    if (!value.trim()) return
    const count = submitQuickEntry(panel, value)
    if (count) setValue('')
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50/60 p-2.5">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">
          Quick entry
        </span>
        <span className="text-[11px] text-stone-400">verse-keyed lines → canvas</span>
      </div>

      <Textarea
        rows={3}
        value={value}
        placeholder={PLACEHOLDER}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            submit()
          }
        }}
        className="bg-white text-[13px]"
      />

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1 text-[11px] text-stone-500">
          {preview.length === 0 ? (
            <span className="text-stone-400">One note per line. ⌘↵ to add.</span>
          ) : (
            <span>
              {preview.length} note{preview.length === 1 ? '' : 's'} ·{' '}
              <span className={cx(anchored ? 'text-stone-600' : 'text-amber-700')}>
                {anchored} anchored to verses
              </span>
            </span>
          )}
        </div>
        <Button size="sm" variant="primary" onClick={submit} disabled={!value.trim()}>
          Add to canvas
        </Button>
      </div>

      {preview.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {preview.slice(0, 8).map((p, i) => (
            <span
              key={i}
              className={cx(
                'rounded px-1.5 py-0.5 font-mono text-[10px]',
                p.verse != null
                  ? 'bg-white text-stone-600 ring-1 ring-stone-200'
                  : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
              )}
              title={p.text}
            >
              {p.verse != null ? verseLabel(p.verses) : 'no verse'}
            </span>
          ))}
          {preview.length > 8 && (
            <span className="text-[10px] text-stone-400">+{preview.length - 8} more</span>
          )}
        </div>
      )}
    </div>
  )
}
