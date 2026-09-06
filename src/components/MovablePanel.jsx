import { useLayoutEffect, useRef, useState } from 'react'

/** Pointer capture keeps mouse, pen and touch drags attached to the handle. */
export default function MovablePanel({ children, label, onHide, hidden = false, docked = false, onDock, width = 60, resizable = false }) {
  const ref = useRef(null)
  const drag = useRef(null)
  const [position, setPosition] = useState(null)
  const [panelWidth, setPanelWidth] = useState(width)
  const clamp = (x, y) => {
    const parent = ref.current?.parentElement
    const node = ref.current
    return { x: Math.max(0, Math.min(x, (parent?.clientWidth || 0) - (node?.offsetWidth || 0))),
      y: Math.max(0, Math.min(y, (parent?.clientHeight || 0) - Math.min(node?.offsetHeight || 0, parent?.clientHeight || 0))) }
  }
  useLayoutEffect(() => {
    setPosition(p => p ? clamp(p.x, p.y) : p)
  }, [panelWidth, hidden])
  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => setPosition(p => p ? clamp(p.x, p.y) : p))
    observer.observe(ref.current.parentElement)
    return () => observer.disconnect()
  }, [])
  const start = (event, resize = false) => {
    if (event.button !== 0) return
    const box = ref.current.getBoundingClientRect(), parent = ref.current.parentElement.getBoundingClientRect()
    drag.current = { x: event.clientX, y: event.clientY, left: box.left - parent.left, top: box.top - parent.top, width: box.width, resize }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
  }
  const move = event => {
    const d = drag.current
    if (!d) return
    if (d.resize) setPanelWidth(Math.max(260, Math.min(640, ref.current.parentElement.clientWidth - 40, d.width + d.x - event.clientX)))
    else setPosition(clamp(d.left + event.clientX - d.x, d.top + event.clientY - d.y))
  }
  const floating = !docked || position !== null
  return <section ref={ref} aria-label={label}
    className={`movable-panel ${floating ? 'panel-floating' : 'panel-docked'} ${resizable ? 'study-panel' : 'tool-panel'}`}
    style={{ width: panelWidth, display: hidden ? 'none' : undefined, ...(position ? { left: position.x, top: position.y, right: 'auto' } : {}) }}>
    <div className="flex shrink-0 items-center gap-1 border-b border-stone-200 bg-white p-1">
      <button type="button" aria-label={`Move ${label}`} title={`Drag to move ${label}; arrow keys also move it`}
        className="min-w-0 flex-1 cursor-grab touch-none rounded px-1 py-1 text-xs text-stone-500 hover:bg-stone-100 active:cursor-grabbing"
        onPointerDown={e => start(e)} onPointerMove={move} onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }}
        onKeyDown={e => {
          const delta = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }[e.key]
          if (!delta) return
          e.preventDefault(); e.stopPropagation()
          setPosition(clamp((position?.x ?? ref.current.offsetLeft) + delta[0], (position?.y ?? ref.current.offsetTop) + delta[1]))
        }}>⠿ {resizable ? label : ''}</button>
      {resizable && position && <button type="button" className="rounded px-2 py-1 text-xs hover:bg-stone-100" onClick={() => { setPosition(null); onDock?.() }}>Dock</button>}
      <button type="button" aria-label={`Hide ${label}`} title={`Hide ${label}`} className="rounded px-1.5 py-1 text-sm hover:bg-stone-100" onClick={onHide}>×</button>
    </div>
    <div className="min-h-0 flex-1">{children}</div>
    {resizable && <div role="separator" aria-label="Resize study panel" aria-orientation="vertical" aria-valuemin={260} aria-valuemax={640} aria-valuenow={Math.round(panelWidth)} tabIndex={0}
      className="absolute inset-y-0 -left-1 z-10 w-2 cursor-col-resize touch-none hover:bg-teal-500/30 focus:bg-teal-500/30"
      onPointerDown={e => start(e, true)} onPointerMove={move} onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }}
      onKeyDown={e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); setPanelWidth(w => Math.max(260, Math.min(640, w + (e.key === 'ArrowLeft' ? 20 : -20)))) } }} />}
  </section>
}
