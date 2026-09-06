import test from 'node:test'
import assert from 'node:assert/strict'
import * as sharing from './urlState.js'

test('share snapshots use the base URL and still restore the document', () => {
  const doc = { title: 'Repetitions', connectors: [{ startWord: 1, endWord: 3 }] }
  const url = new URL(sharing.buildShareUrl(doc, new URL('https://example.com/fable/?s=old#s=old')))
  assert.equal(url.search, '')
  assert.deepEqual(sharing.readStateFromLocation(url), doc)
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
