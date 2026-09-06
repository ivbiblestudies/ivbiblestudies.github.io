import { IconZoomIn, IconZoomOut, IconFit } from '../icons'

export default function ZoomControls({ scale, onZoom, onFit }) {
  return (
    <div className="absolute right-4 top-4 z-20 flex items-center gap-1 rounded-xl border border-stone-200/90 bg-white/95 p-1 shadow-lg shadow-stone-900/10 backdrop-blur">
      <button
        type="button"
        onClick={() => onZoom(1 / 1.2)}
        aria-label="Zoom out"
        title="Zoom out"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
      >
        <IconZoomOut />
      </button>
      <span className="w-12 text-center font-mono text-[11px] tabular-nums text-stone-500">
        {Math.round(scale * 100)}%
      </span>
      <button
        type="button"
        onClick={() => onZoom(1.2)}
        aria-label="Zoom in"
        title="Zoom in"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
      >
        <IconZoomIn />
      </button>
      <span className="mx-0.5 h-5 w-px bg-stone-200" />
      <button
        type="button"
        onClick={onFit}
        aria-label="Fit to content"
        title="Fit to content (⇧1)"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
      >
        <IconFit />
      </button>
    </div>
  )
}
