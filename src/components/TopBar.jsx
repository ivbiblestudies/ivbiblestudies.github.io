import { useState } from 'react'
import { useStudy } from '../store'
import { clearLocationState } from '../lib/urlState'
import { Button, Modal, cx } from './ui'
import { IconSettings, IconExport, IconLink, IconUndo, IconRedo, IconPlus } from './icons'

export default function TopBar() {
  const title = useStudy((s) => s.title)
  const setTitle = useStudy((s) => s.setTitle)
  const scripture = useStudy((s) => s.scripture)
  const toggleParallel = useStudy((s) => s.toggleParallel)
  const openSettings = useStudy((s) => s.openSettings)
  const openExport = useStudy((s) => s.openExport)
  const openShare = useStudy((s) => s.openShare)
  const resetDoc = useStudy((s) => s.resetDoc)
  const setNotice = useStudy((s) => s.setNotice)
  const undo = useStudy((s) => s.undo)
  const redo = useStudy((s) => s.redo)
  const canUndo = useStudy((s) => s.past.length > 0)
  const canRedo = useStudy((s) => s.future.length > 0)
  const loading = useStudy((s) => s.loading)
  const hasWork = useStudy((s) => s.notes.length > 0 || s.shapes.length > 0)

  const [confirming, setConfirming] = useState(false)

  const reference = scripture.primary.loadedReference || scripture.reference

  const startNew = () => {
    resetDoc()
    // Drop the old study out of the address bar too, or a reload would restore it.
    clearLocationState()
    setConfirming(false)
    setNotice('Started a new study.')
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-1 border-b border-stone-200 bg-white px-2 sm:gap-3 sm:px-4">
      <Button
        variant="default"
        size="sm"
        onClick={() => (hasWork ? setConfirming(true) : startNew())}
        title="Start a new study"
        className="shrink-0"
      >
        <IconPlus width={14} height={14} />
        New study
      </Button>

      <span className="h-5 w-px bg-stone-200" />

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Study title"
        placeholder="Untitled study"
        className="min-w-0 max-w-[220px] flex-shrink rounded-md px-2 py-1 text-sm font-medium text-stone-800 hover:bg-stone-100 focus:bg-stone-100 focus:outline-none"
      />

      <button
        type="button"
        onClick={() => openSettings(true)}
        className="hidden items-center gap-2 rounded-md border border-stone-200 px-2.5 py-1 text-xs text-stone-600 hover:border-stone-300 hover:text-stone-900 md:flex"
        title="Change the passage"
      >
        <span className="font-medium text-stone-800">{reference}</span>
        <span className="text-stone-400">
          {scripture.primary.loadedTranslation || scripture.primary.translation?.toUpperCase()}
        </span>
        {loading && <span className="animate-pulse text-stone-400">loading…</span>}
      </button>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={toggleParallel}
          aria-pressed={scripture.parallel}
          title="Toggle parallel translation"
          className={cx(
            'hidden h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors sm:flex',
            scripture.parallel
              ? 'border-stone-900 bg-stone-900 text-white'
              : 'border-stone-300 text-stone-600 hover:border-stone-400 hover:text-stone-900',
          )}
        >
          <span className="flex gap-0.5">
            <span className="block h-3 w-1 rounded-[1px] bg-current opacity-90" />
            <span
              className={cx(
                'block h-3 w-1 rounded-[1px] bg-current',
                scripture.parallel ? 'opacity-90' : 'opacity-30',
              )}
            />
          </span>
          Parallel
        </button>

        <span className="mx-1 hidden h-5 w-px bg-stone-200 sm:block" />

        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (⌘Z)"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <IconUndo />
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (⌘⇧Z)"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <IconRedo />
        </button>

        <span className="mx-1 h-5 w-px bg-stone-200" />

        <Button size="sm" variant="ghost" onClick={() => openSettings(true)} title="Settings">
          <IconSettings width={16} height={16} />
          <span className="hidden lg:inline">Settings</span>
        </Button>
        <Button size="sm" variant="ghost" onClick={() => openExport(true)} title="Export">
          <IconExport width={16} height={16} />
          <span className="hidden lg:inline">Export</span>
        </Button>
        <Button size="sm" variant="primary" onClick={() => openShare(true)} title="Share link">
          <IconLink width={16} height={16} />
          Share
        </Button>
      </div>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Start a new study?"
        subtitle="This clears the canvas and every panel."
        width="max-w-md"
        footer={
          <>
            <Button onClick={() => setConfirming(false)}>Cancel</Button>
            <Button variant="primary" onClick={startNew}>
              Start new
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-stone-600">
          The current study lives entirely in this link. If you want to come back to
          it, copy the share link first — otherwise it goes when you start over.
        </p>
      </Modal>
    </header>
  )
}
