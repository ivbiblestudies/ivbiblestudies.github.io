import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { selectionToolbarPosition } from '../../lib/highlightEditing'

const COLORS = ['#0f766e', '#7c3aed', '#60a5fa', '#f472b6', '#facc15', '#f97316', '#ef4444']

export default function TextSelectionToolbar({ text, color, anchor, bounds, onHighlight, onRemoveHighlight, onNote, onClose }) {
  const toolbar = useRef(null)
  const [toolbarSize, setToolbarSize] = useState({ width: 360, height: 140 })
  const field = useRef(null)
  const [manualCopy, setManualCopy] = useState(false)
  const [message, setMessage] = useState('')
  useLayoutEffect(() => {
    const measure = () => setToolbarSize({ width: toolbar.current.offsetWidth, height: toolbar.current.offsetHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(toolbar.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (manualCopy) { field.current?.focus(); field.current?.select() }
  }, [manualCopy])
  useEffect(() => {
    const copy = event => {
      if (document.activeElement?.matches('input, textarea, [contenteditable="true"]')) return
      event.preventDefault()
      event.clipboardData.setData('text/plain', text)
      setMessage('Copied')
    }
    document.addEventListener('copy', copy)
    return () => document.removeEventListener('copy', copy)
  }, [text])
  return <div ref={toolbar} role="region" aria-label="Selected text actions"
    style={{ ...selectionToolbarPosition(anchor, bounds, toolbarSize), maxHeight: Math.max(80, bounds.height - 24) }}
    className="absolute z-30 w-[360px] max-w-[calc(100%-24px)] overflow-y-auto rounded-xl border border-stone-200 bg-white p-3 shadow-lg">
    {manualCopy && <textarea ref={field} aria-label="Selected scripture" readOnly value={text} rows={2}
      className="mb-2 w-full resize-none rounded border border-stone-200 p-2 text-sm" />}
    <div className="flex flex-wrap items-center gap-2">
      {COLORS.map(value => <button key={value} type="button" aria-label={`Highlight ${value}`}
        aria-pressed={color === value} onClick={() => onHighlight(value)}
        className="h-8 w-8 rounded-full border-2 border-white ring-1 ring-stone-300"
        style={{ background: value, outline: color === value ? '2px solid #292524' : undefined }} />)}
      <button type="button" className="rounded px-2 py-2 text-sm hover:bg-stone-100" onClick={async () => {
        try { await navigator.clipboard.writeText(text); setMessage('Copied') }
        catch { setManualCopy(true); setMessage('Use your device’s Copy command on the selected text.') }
      }}>Copy</button>
      <button type="button" title="Remove highlighting from the selected words" className="rounded px-2 py-2 text-sm hover:bg-stone-100"
        onClick={onRemoveHighlight}>Remove highlight</button>
      <button type="button" className="rounded bg-stone-900 px-3 py-2 text-sm text-white" onClick={onNote}>+ Create note</button>
      <button type="button" className="rounded px-2 py-2 text-sm hover:bg-stone-100" onClick={onClose}>Done</button>
    </div>
    {message && <p role="status" className="mt-2 text-xs text-stone-500">{message}</p>}
  </div>
}
