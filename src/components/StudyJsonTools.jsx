import { useEffect, useState } from 'react'
import { useStudy } from '../store'
import { MAX_JSON_SIZE, parseStudyJson, serializeStudyJson, WHITEBOARD_PROMPT } from '../lib/studyJson'
import { Button, Field, Modal, Textarea } from './ui'

export default function StudyJsonTools() {
  // Deliberately local: never part of shared JSON, drafts, or undo history.
  const [enabled, setEnabled] = useState(false)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const loading = useStudy(s => s.loading)
  const importDoc = useStudy(s => s.importDoc)
  const setNotice = useStudy(s => s.setNotice)

  useEffect(() => {
    const onKey = event => {
      if (event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey && (event.code === 'KeyA' || event.key.toLowerCase() === 'a')) {
        event.preventDefault()
        if (event.repeat) return
        setEnabled(value => !value)
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const download = () => {
    try {
      const state = useStudy.getState()
      const url = URL.createObjectURL(new Blob([serializeStudyJson(state)], { type: 'application/json' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `${state.title.replace(/[^a-z0-9_-]+/gi, '-').slice(0, 80) || 'study'}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err) { setError(err.message || 'Could not export JSON.') }
  }

  const readFile = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError('')
    setBusy(true)
    try {
      if (file.size > MAX_JSON_SIZE) throw new Error('Choose a JSON file smaller than 5 MB.')
      setText(await file.text())
    } catch (err) { setError(err.message || 'Could not read the file.') }
    finally { setBusy(false) }
  }

  const runImport = () => {
    setError('')
    try {
      if (useStudy.getState().loading) throw new Error('Wait for the passage to finish loading before importing.')
      importDoc(parseStudyJson(text))
      setText('')
      setOpen(false)
      setNotice('Study imported. Use Undo to restore the previous study.')
    } catch (err) { setError(err.message || 'Could not import JSON.') }
  }

  if (!enabled) return null
  return (
    <>
      <button type="button" className="rounded px-2 py-1 text-xs text-stone-600 hover:bg-stone-100" onClick={() => { setError(''); setOpen(true) }}>JSON tools</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Study JSON" subtitle="Turn a whiteboard picture into an editable recap."
        footer={<><Button onClick={() => setOpen(false)}>Close</Button><Button variant="primary" disabled={!text.trim() || busy || !!loading} onClick={runImport}>Replace study with JSON</Button></>}>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={download}>Export JSON</Button>
            <Button onClick={async () => {
              try { await navigator.clipboard.writeText(WHITEBOARD_PROMPT); setNotice('Whiteboard prompt copied.') }
              catch { setError('Clipboard unavailable. Expand the prompt below and copy it manually.') }
            }}>Copy whiteboard prompt</Button>
          </div>
          <p className="text-sm text-stone-600">Give the prompt and your whiteboard picture to an LLM, then paste its JSON below. Import replaces the current study, including its passage. You can undo the import.</p>
          <details className="rounded-lg border border-stone-200 p-3">
            <summary className="cursor-pointer text-sm font-medium text-stone-700">View image-to-JSON prompt</summary>
            <Textarea aria-label="Whiteboard prompt" className="mt-3 font-mono text-xs" readOnly rows={10} value={WHITEBOARD_PROMPT} />
          </details>
          <Field label="Import a JSON file"><input type="file" accept=".json,application/json" disabled={busy} onChange={readFile} className="block w-full text-sm text-stone-600" /></Field>
          <Field label="Or paste JSON"><Textarea rows={9} spellCheck={false} value={text} disabled={busy} onChange={event => { setText(event.target.value); setError('') }} placeholder={'{"v":1,"title":"Whiteboard recap",…}'} className="font-mono text-xs" /></Field>
          {loading && <p className="text-xs text-stone-500">Wait for the passage to finish loading before importing.</p>}
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </div>
      </Modal>
    </>
  )
}
