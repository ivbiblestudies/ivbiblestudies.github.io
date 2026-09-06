import { useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { useStudy, pickDoc } from '../store'
import { exportCanvasPNG, exportCanvasPDF, exportStudyPDF } from '../lib/exporters'
import { Modal, Button, Segmented, cx } from './ui'

const OPTIONS = [
  {
    id: 'png',
    title: 'Canvas map — PNG',
    body: 'High-resolution image of the whole board, trimmed to your work.',
  },
  {
    id: 'canvas-pdf',
    title: 'Canvas map — PDF',
    body: 'The same map on a single page sized to the artwork.',
  },
  {
    id: 'study-pdf',
    title: 'Full study — multi-page PDF',
    body: 'Cover, the canvas map, then every note and panel as selectable text.',
  },
]

export default function ExportModal() {
  const open = useStudy((s) => s.exportOpen)
  const openExport = useStudy((s) => s.openExport)
  const setNotice = useStudy((s) => s.setNotice)
  const doc = useStudy(useShallow(pickDoc))

  const [choice, setChoice] = useState('study-pdf')
  const [quality, setQuality] = useState(3)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const run = async () => {
    setBusy(true)
    setError(null)
    // Yield a frame so the button paints its busy state before the (synchronous,
    // potentially heavy) rasterization blocks the main thread.
    await new Promise((r) => requestAnimationFrame(() => r()))
    try {
      if (choice === 'png') exportCanvasPNG(doc, { pixelRatio: quality })
      else if (choice === 'canvas-pdf') await exportCanvasPDF(doc, { pixelRatio: Math.min(3, quality) })
      else await exportStudyPDF(doc, { pixelRatio: Math.min(3, quality) })
      setNotice('Export saved to your downloads.')
      openExport(false)
    } catch (err) {
      setError(err?.message || 'Export failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => openExport(false)}
      title="Export"
      subtitle="Everything renders in your browser — nothing is uploaded."
      footer={
        <>
          <Button onClick={() => openExport(false)}>Cancel</Button>
          <Button variant="primary" onClick={run} disabled={busy}>
            {busy ? 'Rendering…' : 'Export'}
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setChoice(opt.id)}
            className={cx(
              'flex w-full gap-3 rounded-xl border p-3 text-left transition-colors',
              choice === opt.id
                ? 'border-stone-900 bg-stone-50'
                : 'border-stone-200 hover:border-stone-300',
            )}
          >
            <span
              className={cx(
                'mt-0.5 h-4 w-4 shrink-0 rounded-full border-[5px] transition-colors',
                choice === opt.id ? 'border-stone-900' : 'border-stone-300',
              )}
            />
            <span>
              <span className="block text-sm font-medium text-stone-900">{opt.title}</span>
              <span className="block text-xs text-stone-500">{opt.body}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-stone-200 px-3 py-2.5">
        <div>
          <div className="text-sm font-medium text-stone-800">Resolution</div>
          <div className="text-xs text-stone-500">Higher is sharper and slower.</div>
        </div>
        <Segmented
          value={quality}
          onChange={setQuality}
          options={[
            { value: 1, label: '1×' },
            { value: 2, label: '2×' },
            { value: 3, label: '3×' },
            { value: 4, label: '4×' },
          ]}
        />
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </Modal>
  )
}
