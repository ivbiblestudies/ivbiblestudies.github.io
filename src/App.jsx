import { useEffect, useRef, useState } from 'react'
import { useStudy, pickDoc } from './store'
import { readStateFromLocation, clearLocationState, readLocalDraft, saveLocalDraft } from './lib/urlState'
import CanvasStage from './components/canvas/CanvasStage'
import Sidebar from './components/sidebar/Sidebar'
import TopBar from './components/TopBar'
import SettingsModal from './components/SettingsModal'
import ExportModal from './components/ExportModal'
import ShareModal from './components/ShareModal'
import { cx } from './components/ui'
import MovablePanel from './components/MovablePanel'

const TOOL_KEYS = {
  v: 'select',
  h: 'hand',
  b: 'box',
  g: 'highlight',
  a: 'arrow',
  t: 'text',
  n: 'note',
}

function Toast() {
  const notice = useStudy((s) => s.notice)
  const error = useStudy((s) => s.error)
  const setNotice = useStudy((s) => s.setNotice)
  const setError = useStudy((s) => s.setError)
  const message = error || notice

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => {
      setNotice(null)
      setError(null)
    }, 4200)
    return () => clearTimeout(t)
  }, [message, setNotice, setError])

  if (!message) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-50 flex justify-center px-4">
      <div
        role="status"
        className={cx(
          'animate-fade-in pointer-events-auto max-w-md rounded-lg border px-3.5 py-2 text-sm shadow-lg',
          error
            ? 'border-red-200 bg-red-50 text-red-800'
            : 'border-stone-200 bg-white text-stone-700',
        )}
        onClick={() => {
          setNotice(null)
          setError(null)
        }}
      >
        {message}
      </div>
    </div>
  )
}

export default function App() {
  const toolsHidden = useStudy((s) => !!s.ui.toolsHidden)
  const studyHidden = useStudy((s) => !!s.ui.studyHidden)
  const setUI = useStudy((s) => s.setUI)
  const loadDoc = useStudy((s) => s.loadDoc)
  const loadPassage = useStudy((s) => s.loadPassage)
  const undo = useStudy((s) => s.undo)
  const redo = useStudy((s) => s.redo)
  const setTool = useStudy((s) => s.setTool)
  const setSelected = useStudy((s) => s.setSelected)
  const deleteSelected = useStudy((s) => s.deleteSelected)
  const editingId = useStudy((s) => s.editingId)

  const initialSnapshot = useRef(null)
  const [hydrated, setHydrated] = useState(false)

  // Rebuild a shared study before the first paint of real content.
  useEffect(() => {
    let cancelled = false
    let unsubscribe
    // Share one decode promise across StrictMode's effect setup/cleanup cycle.
    if (!initialSnapshot.current) initialSnapshot.current = readStateFromLocation()
    let warned = false
    let saveTimer
    let pendingState
    const flushSave = () => {
      clearTimeout(saveTimer)
      if (!pendingState) return
      const state = pendingState
      pendingState = null
      if (!saveLocalDraft(pickDoc(state)) && !warned) {
        warned = true
        state.setNotice('Browser storage is unavailable or full. Copy a share link before leaving to keep this study.')
      }
    }
    const save = (state, previous) => {
      const doc = pickDoc(state)
      if (previous && Object.keys(doc).every((key) => state[key] === previous[key])) return
      pendingState = state
      clearTimeout(saveTimer)
      saveTimer = setTimeout(flushSave, 400)
    }
    const onVisibility = () => { if (document.visibilityState === 'hidden') flushSave() }
    window.addEventListener('pagehide', flushSave)
    document.addEventListener('visibilitychange', onVisibility)
    initialSnapshot.current.then((shared) => {
      if (cancelled) return
      const hadSharedPayload = new URLSearchParams(window.location.hash.slice(1)).has('s') ||
        new URLSearchParams(window.location.search).has('s')
      const draft = shared || readLocalDraft()
      if (draft) loadDoc(draft, { shared: !!shared })
      const primary = useStudy.getState().scripture.primary
      if (primary.mode === 'api' && !primary.verses?.length) loadPassage('primary')
      clearLocationState()
      if (hadSharedPayload && !shared) {
        useStudy.getState().setNotice('The shared link could not be opened. Your local draft was kept. Try the link in a current browser.')
      }
      save(useStudy.getState())
      unsubscribe = useStudy.subscribe(save)
      setHydrated(true)
    })
    return () => {
      cancelled = true
      unsubscribe?.()
      flushSave()
      window.removeEventListener('pagehide', flushSave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [loadDoc, loadPassage])

  // Global shortcuts.
  useEffect(() => {
    const onKey = (e) => {
      if (!hydrated) return
      const tag = e.target?.tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable
      const mod = e.metaKey || e.ctrlKey

      if (mod && e.key.toLowerCase() === 'z') {
        if (typing) return
        e.preventDefault()
        e.shiftKey ? redo() : undo()
        return
      }
      if (mod && e.key.toLowerCase() === 'y') {
        if (typing) return
        e.preventDefault()
        redo()
        return
      }
      if (typing || mod) return

      if (e.key === 'Escape') {
        setSelected(null)
        return
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !editingId) {
        e.preventDefault()
        deleteSelected()
        return
      }
      const tool = TOOL_KEYS[e.key.toLowerCase()]
      if (tool) setTool(tool)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, setTool, setSelected, deleteSelected, editingId, hydrated])

  if (!hydrated) return <div role="status" className="flex h-full items-center justify-center text-sm text-stone-500">Opening study…</div>

  return (
    <div className="flex h-full flex-col bg-stone-100">
      <TopBar />
      <div className="flex shrink-0 items-center justify-between border-b border-stone-200 bg-white px-3 py-1">
        <button type="button" aria-expanded={!toolsHidden} className="rounded px-2 py-1 text-xs text-stone-600 hover:bg-stone-100" onClick={() => setUI({ toolsHidden: !toolsHidden }, { history: false })}>{toolsHidden ? 'Show tools' : 'Hide tools'}</button>
        <button type="button" aria-expanded={!studyHidden} className="rounded px-2 py-1 text-xs text-stone-600 hover:bg-stone-100" onClick={() => setUI({ studyHidden: !studyHidden }, { history: false })}>{studyHidden ? 'Show study panel' : 'Hide study panel'}</button>
      </div>

      <main className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* 70 / 30 split: the manuscript gets the room, the method gets the margin.
            The sidebar owns the 30% and its own minimum; the canvas takes whatever
            is left, so a narrow window never forces the page to scroll sideways. */}
        <div className={`relative min-w-0 flex-1 ${studyHidden ? 'min-h-0' : 'min-h-[45vh] lg:min-h-0'}`}>
          <CanvasStage />
        </div>
        <MovablePanel label="Study panel" docked hidden={studyHidden} width={380} resizable onHide={() => setUI({ studyHidden: true }, { history: false })}>
          <Sidebar />
        </MovablePanel>
      </main>

      <SettingsModal />
      <ExportModal />
      <ShareModal />
      <Toast />
    </div>
  )
}
