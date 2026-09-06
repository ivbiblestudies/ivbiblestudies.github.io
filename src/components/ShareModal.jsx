import { useEffect, useRef, useState } from 'react'
import { useStudy, pickDoc } from '../store'
import { buildShareUrl } from '../lib/urlState'
import { shortenUrl } from '../lib/shortenUrl'
import { Modal, Button, Input } from './ui'

export default function ShareModal() {
  const open = useStudy((s) => s.shareOpen)
  const openShare = useStudy((s) => s.openShare)
  const [url, setUrl] = useState('')
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)

  useEffect(() => {
    if (open) {
      setUrl('')
      setMessage('')
      setCopied(false)
    }
  }, [open])

  const copy = async () => {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setCopied(false)
    setMessage('')
    try {
      const result = await shortenUrl(buildShareUrl(pickDoc(useStudy.getState())))
      setUrl(result.url)
      setMessage(result.message || 'Short link ready. It opens a snapshot of this study.')
      try {
        await navigator.clipboard.writeText(result.url)
        setCopied(true)
      } catch {
        setMessage(`${result.message || 'Link ready.'} Select the link below and copy it manually.`)
      }
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={() => { if (!busy) openShare(false) }}
      title="Share this study"
      subtitle="Create a link to the current version of your study."
      footer={<>
        <Button disabled={busy} onClick={() => openShare(false)}>Close</Button>
        <Button variant="primary" disabled={busy} onClick={copy}>
          {busy ? 'Creating link…' : copied ? 'Copied ✓' : 'Copy link'}
        </Button>
      </>}
    >
      <p className="text-sm text-stone-600">
        Your draft saves in this browser. A share link is generated only when you
        click Copy link; your address bar stays at the base URL.
      </p>
      <p className="mt-3 text-xs text-stone-500">
        Free short links use is.gd, which stores the full snapshot link, including
        your notes. Anyone with the link can open that snapshot. If shortening is
        unavailable or the study is too large, you’ll get the full link instead.
      </p>
      {url && <Input id="share-url-field" aria-label="Share link" readOnly value={url}
        onFocus={(e) => e.target.select()} className="mt-4 font-mono text-xs" />}
      {message && <p role="status" className="mt-3 text-xs text-stone-600">{message}</p>}
      {url.length > 8000 && <p className="mt-2 text-xs text-amber-700">This full link is long; some chat apps may truncate it. A PDF export is another option.</p>}
    </Modal>
  )
}
