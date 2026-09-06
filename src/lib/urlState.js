// Drafts stay in this browser. Share snapshots are encoded only on request.

export const STATE_KEY = 's'
export const SCHEMA_VERSION = 1
export const DRAFT_KEY = 'fable.study.draft.v1'

export async function encodeState(doc) {
  if (typeof CompressionStream === 'undefined') {
    throw new Error('This browser cannot create compressed share links. Please use a current browser.')
  }
  const stream = new Blob([JSON.stringify(doc)]).stream().pipeThrough(new CompressionStream('gzip'))
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer())
  let binary = ''
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
  }
  return `gz1.${btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`
}

export async function decodeState(payload) {
  if (!payload) return null
  try {
    let json
    if (payload.startsWith('gz1.')) {
      const encoded = payload.slice(4)
      if (!/^[A-Za-z0-9_-]+$/.test(encoded)) return null
      const bytes = Uint8Array.from(atob(encoded.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
      json = await new Response(stream).text()
    } else {
      const { default: legacy } = await import('lz-string')
      json = legacy.decompressFromEncodedURIComponent(payload)
    }
    if (!json) return null
    const parsed = JSON.parse(json)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

/** Read a shared study out of `#s=...` (or the legacy `?s=...`). */
export async function readStateFromLocation(loc = window.location) {
  const fromHash = new URLSearchParams(loc.hash.replace(/^#/, '')).get(STATE_KEY)
  const fromQuery = new URLSearchParams(loc.search).get(STATE_KEY)
  return decodeState(fromHash || fromQuery)
}

export async function buildShareUrl(doc, loc = window.location) {
  const base = `${loc.origin}${loc.pathname}`
  return `${base}#${STATE_KEY}=${await encodeState(doc)}`
}

export function readLocalDraft(storage) {
  try {
    const doc = JSON.parse((storage || window.localStorage).getItem(DRAFT_KEY))
    return doc && typeof doc === 'object' && !Array.isArray(doc) ? doc : null
  } catch {
    return null
  }
}

export function saveLocalDraft(doc, storage) {
  try {
    (storage || window.localStorage).setItem(DRAFT_KEY, JSON.stringify(doc))
    return true
  } catch {
    return false
  }
}

export function clearLocationState() {
  window.history.replaceState(
    null,
    '',
    window.location.pathname,
  )
}
