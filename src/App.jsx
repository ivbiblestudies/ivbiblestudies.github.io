import { useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { useStudy, pickDoc } from './store'
import { readStateFromLocation, syncLocation } from './lib/urlState'
import CanvasStage from './components/canvas/CanvasStage'
import Sidebar from './components/sidebar/Sidebar'
import TopBar from './components/TopBar'
import SettingsModal from './components/SettingsModal'
import ExportModal from './components/ExportModal'
import ShareModal from './components/ShareModal'
import { cx } from './components/ui'

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
  const loadDoc = useStudy((s) => s.loadDoc)
  const doc = useStudy(useShallow(pickDoc))
  const undo = useStudy((s) => s.undo)
  const redo = useStudy((s) => s.redo)
  const setTool = useStudy((s) => s.setTool)
  const setSelected = useStudy((s) => s.setSelected)
  const deleteSelected = useStudy((s) => s.deleteSelected)
  const editingId = useStudy((s) => s.editingId)

  const [hydrated, setHydrated] = useState(false)
  const firstSync = useRef(true)

  // Rebuild a shared study before the first paint of real content.
  useEffect(() => {
    const shared = readStateFromLocation()
    if (shared) loadDoc(shared, { shared: true })
    setHydrated(true)
  }, [loadDoc])

  // Keep the address bar in step with the document, debounced so typing doesn't
  // thrash history.replaceState.
  useEffect(() => {
    if (!hydrated) return
    if (firstSync.current) {
      firstSync.current = false
    }
    const t = setTimeout(() => syncLocation(doc), 600)
    return () => clearTimeout(t)
  }, [doc, hydrated])

  // Global shortcuts.
  useEffect(() => {
    const onKey = (e) => {
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
  }, [undo, redo, setTool, setSelected, deleteSelected, editingId])

  return (
    <div className="flex h-full flex-col bg-stone-100">
      <TopBar />

      <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* 70 / 30 split: the manuscript gets the room, the method gets the margin.
            The sidebar owns the 30% and its own minimum; the canvas takes whatever
            is left, so a narrow window never forces the page to scroll sideways. */}
        <div className="relative min-h-[52vh] min-w-0 flex-1 lg:min-h-0">
          <CanvasStage />
        </div>
        <div className="min-h-0 flex-1 lg:w-[30%] lg:min-w-[320px] lg:max-w-[520px] lg:flex-none">
          <Sidebar />
        </div>
      </main>

      <SettingsModal />
      <ExportModal />
      <ShareModal />
      <Toast />
    </div>
  )
}
