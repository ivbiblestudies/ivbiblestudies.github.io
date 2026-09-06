import test from 'node:test'
import assert from 'node:assert/strict'
import * as sharing from './urlState.js'
import LZString from 'lz-string'

test('share snapshots use the base URL and still restore the document', async () => {
  const doc = { title: 'Repetitions', connectors: [{ startWord: 1, endWord: 3 }] }
  const url = new URL(await sharing.buildShareUrl(doc, new URL('https://example.com/fable/?s=old#s=old')))
  assert.equal(url.search, '')
  assert.deepEqual(await sharing.readStateFromLocation(url), doc)
})

test('native gzip Base64URL round-trips Unicode and rejects damaged data', async () => {
  const doc = { title: 'λόγος — 光 📖', notes: ['Repeated phrase '.repeat(1000)] }
  const encoded = await sharing.encodeState(doc)
  assert.match(encoded, /^gz1\.[A-Za-z0-9_-]+$/)
  assert.deepEqual(await sharing.decodeState(encoded), doc)
  assert.equal(await sharing.decodeState('gz1.invalid!'), null)
  assert.equal(await sharing.decodeState(encoded.slice(0, -8)), null)
})

test('old LZ-String links remain readable in both fragment and query form', async () => {
  const doc = { title: 'Legacy study' }
  const payload = LZString.compressToEncodedURIComponent(JSON.stringify(doc))
  for (const marker of ['#', '?']) {
    assert.deepEqual(await sharing.readStateFromLocation(new URL(`https://example.com/${marker}s=${payload}`)), doc)
  }
})

test('local drafts round-trip without generating a URL, and tolerate corrupt storage', () => {
  const values = new Map()
  const storage = { getItem: (k) => values.get(k), setItem: (k, v) => values.set(k, v) }
  const doc = { title: 'Local draft' }
  assert.equal(sharing.saveLocalDraft(doc, storage), true)
  assert.deepEqual(sharing.readLocalDraft(storage), doc)
  storage.setItem(sharing.DRAFT_KEY, 'broken')
  assert.equal(sharing.readLocalDraft(storage), null)
  assert.equal(sharing.saveLocalDraft(doc, { setItem() { throw Error('quota') } }), false)
})
