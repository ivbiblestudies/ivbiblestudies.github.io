import LZString from 'lz-string'
const {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} = LZString

// Drafts stay in this browser. Share snapshots are encoded only on request.

export const STATE_KEY = 's'
export const SCHEMA_VERSION = 1
export const DRAFT_KEY = 'fable.study.draft.v1'

export function encodeState(doc) {
  return compressToEncodedURIComponent(JSON.stringify(doc))
}

export function decodeState(payload) {
  if (!payload) return null
  try {
    const json = decompressFromEncodedURIComponent(payload)
    if (!json) return null
    const parsed = JSON.parse(json)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

/** Read a shared study out of `#s=...` (or the legacy `?s=...`). */
export function readStateFromLocation(loc = window.location) {
  const fromHash = new URLSearchParams(loc.hash.replace(/^#/, '')).get(STATE_KEY)
  const fromQuery = new URLSearchParams(loc.search).get(STATE_KEY)
  return decodeState(fromHash || fromQuery)
}

export function buildShareUrl(doc, loc = window.location) {
  const base = `${loc.origin}${loc.pathname}`
  return `${base}#${STATE_KEY}=${encodeState(doc)}`
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
