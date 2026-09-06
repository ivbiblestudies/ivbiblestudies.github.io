import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { useStudy, pickDoc } from '../store'
import { buildShareUrl } from '../lib/urlState'
import { Modal, Button, Input, cx } from './ui'

// Browsers and servers start choking on URLs past roughly this length.
const SOFT_LIMIT = 8000
const HARD_LIMIT = 32000

export default function ShareModal() {
  const open = useStudy((s) => s.shareOpen)
  const openShare = useStudy((s) => s.openShare)
  const doc = useStudy(useShallow(pickDoc))
  const [copied, setCopied] = useState(false)

  const url = useMemo(() => (open ? buildShareUrl(doc) : ''), [open, doc])

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(t)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // Clipboard permissions vary; select the field so ⌘C still works.
      const input = document.getElementById('share-url-field')
      input?.focus()
      input?.select()
    }
  }

  const length = url.length
  const level = length > HARD_LIMIT ? 'error' : length > SOFT_LIMIT ? 'warn' : 'ok'

  return (
    <Modal
      open={open}
      onClose={() => openShare(false)}
      title="Share this study"
      subtitle="The link is the document. No account, no server, nothing stored."
      footer={
        <>
          <Button onClick={() => openShare(false)}>Close</Button>
          <Button variant="primary" onClick={copy}>
            {copied ? 'Copied ✓' : 'Copy link'}
          </Button>
        </>
      }
    >
      <div className="flex gap-2">
        <Input id="share-url-field" readOnly value={url} onFocus={(e) => e.target.select()} className="font-mono text-xs" />
        <Button onClick={copy}>{copied ? '✓' : 'Copy'}</Button>
      </div>

      <div className="mt-3 space-y-1.5 text-xs">
        <p className={cx(
          level === 'ok' && 'text-stone-500',
          level === 'warn' && 'text-amber-700',
          level === 'error' && 'text-red-700',
        )}>
          {length.toLocaleString()} characters.{' '}
          {level === 'ok' && 'Comfortably within what browsers and chat apps accept.'}
          {level === 'warn' &&
            'Getting long — some chat apps truncate links this size. Consider exporting a PDF instead.'}
          {level === 'error' &&
            'Too long for most browsers. Trim annotations or share an exported PDF.'}
        </p>
        <p className="text-stone-500">
          Scripture text, both translations, every annotation and its coordinates,
          tags, panel notes and your view settings are compressed into the fragment
          after <code className="rounded bg-stone-100 px-1 font-mono text-[11px]">#s=</code>.
          Opening the link rebuilds the board exactly.
        </p>
      </div>
    </Modal>
  )
}
