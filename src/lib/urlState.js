import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string'

// The whole study lives in the URL. No backend, no database — a link is the
// document. lz-string's URI-safe codec keeps the payload legal in a query
// string; we hang it off the hash so GitHub Pages never sees it.

export const STATE_KEY = 's'
export const SCHEMA_VERSION = 1

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
  const base = `${loc.origin}${loc.pathname}${loc.search}`
  return `${base}#${STATE_KEY}=${encodeState(doc)}`
}

/** Rewrite the address bar without adding a history entry. */
export function syncLocation(doc) {
  const payload = encodeState(doc)
  const url = `${window.location.pathname}${window.location.search}#${STATE_KEY}=${payload}`
  window.history.replaceState(null, '', url)
  return payload.length
}

export function clearLocationState() {
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}`,
  )
}
