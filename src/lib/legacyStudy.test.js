import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import LZString from 'lz-string'
import { encodeState, readStateFromLocation, saveLocalDraft, readLocalDraft } from './urlState.js'

test('legacy lookup and parallel studies retain their data through links, drafts and re-sharing', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  try {
    const { emptyDoc, hydrateDoc, pickDoc, useStudy } = await server.ssrLoadModule('/src/store.js')
    assert.equal('showStrongs' in emptyDoc().ui, false)
    assert.equal('setStrongs' in useStudy.getState(), false)
    assert.equal('strongs' in useStudy.getState(), false)
    for (const tool of ['hand', 'pan']) {
      assert.equal(hydrateDoc({ ui: { tool } }).ui.tool, 'select')
    }
    for (const showStrongs of [true, false]) {
      const old = {
        v: 1, title: 'Older study',
        scripture: {
          parallel: true,
          primary: { verses: [{ verse: 1, text: 'In the beginning' }] },
          secondary: { translation: 'KJV', verses: [{ verse: 1, text: 'An older second passage' }] },
        },
        notes: [{ id: 'n1', text: 'A note', x: 10, y: 20 }],
        connectors: [{ id: 'c1', noteId: 'n1', verse: 1, startWord: 0, endWord: 2 },
          { id: 'c2', noteId: 'n1', verse: 1, column: 1 }],
        ui: { showStrongs, showGrid: false, viewport: { x: 20, y: 30, scale: 2 } },
      }
      const payloads = [LZString.compressToEncodedURIComponent(JSON.stringify(old)), await encodeState(old)]
      for (const payload of payloads) {
        for (const marker of ['?', '#']) {
          const decoded = await readStateFromLocation(new URL(`https://example.com/fable/${marker}s=${payload}`))
          useStudy.getState().loadDoc(decoded)
          const restored = pickDoc(useStudy.getState())
          assert.deepEqual(restored, hydrateDoc(old))
          assert.deepEqual(restored.notes, old.notes)
          assert.deepEqual(restored.connectors, old.connectors)
          assert.deepEqual(restored.scripture.primary.verses, old.scripture.primary.verses)
          assert.deepEqual(restored.scripture.secondary.verses, old.scripture.secondary.verses)
          assert.equal(restored.scripture.parallel, true)
          assert.deepEqual(restored.ui.viewport, old.ui.viewport)
          assert.equal(restored.v, 1)
          const values = new Map()
          const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) }
          assert.equal(saveLocalDraft(restored, storage), true)
          assert.deepEqual(hydrateDoc(readLocalDraft(storage)), restored)
          const shared = await encodeState(restored)
          assert.deepEqual(await readStateFromLocation(new URL(`https://example.com/fable/#s=${shared}`)), restored)
        }
      }
    }
  } finally {
    await server.close()
  }
})
