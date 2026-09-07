import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { encodeState, decodeState } from './urlState.js'

test('selection highlights recolor without stacking and connected notes undo atomically', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
  try {
    const { useStudy, pickDoc, hydrateDoc } = await server.ssrLoadModule('/src/store.js')
    const ranges = [0, 1].map(verseIndex => ({ verseIndex, verse: verseIndex + 1, column: 0, startWord: 0, endWord: 2 }))
    const regions = ranges.map(range => ({ range, x: 10, y: 20, width: 80, height: 30 }))
    const ids = useStudy.getState().highlightSelection(regions, '#fbbf24')
    useStudy.getState().highlightSelection(regions, '#60a5fa', ids)
    assert.equal(useStudy.getState().shapes.length, 2)
    assert.ok(useStudy.getState().shapes.every(shape => shape.color === '#60a5fa'))
    useStudy.getState().undo()
    assert.ok(useStudy.getState().shapes.every(shape => shape.color === '#fbbf24'))
    useStudy.getState().removeSelectionHighlights([{ ...ranges[0], startWord: 1, endWord: 1 }])
    assert.deepEqual(useStudy.getState().shapes.map(shape => shape.wordRange), [
      { ...ranges[0], endWord: 0 }, { ...ranges[0], startWord: 2 }, ranges[1],
    ])
    useStudy.getState().undo()
    assert.deepEqual(useStudy.getState().shapes.map(shape => shape.wordRange), ranges)
    const id = useStudy.getState().addConnectedNote(ranges, { x: 120, y: 20 })
    assert.equal(useStudy.getState().editingId, id)
    assert.equal(useStudy.getState().notes.length, 1)
    assert.deepEqual(useStudy.getState().connectors.map(({ id, noteId, style, ...range }) => range), ranges)
    const doc = pickDoc(useStudy.getState())
    assert.deepEqual(hydrateDoc(await decodeState(await encodeState(doc))), doc)
    useStudy.getState().undo()
    assert.equal(useStudy.getState().notes.length, 0)
    assert.equal(useStudy.getState().connectors.length, 0)
    assert.equal(useStudy.getState().shapes.length, 2)
  } finally { await server.close() }
})
