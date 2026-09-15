import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

test('study JSON round trips, validates imports, and preserves undo without sharing hidden controls', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
  try {
    const { emptyDoc, useStudy, pickDoc } = await server.ssrLoadModule('/src/store.js')
    const { parseStudyJson, serializeStudyJson, WHITEBOARD_PROMPT } = await server.ssrLoadModule('/src/lib/studyJson.js')
    const doc = emptyDoc()
    doc.notes = [{ id: 'n1', title: '', text: 'A recap', tag: 'observation', panel: 'observations', verses: [], x: 10, y: 20, width: 300 }]
    assert.deepEqual(parseStudyJson(serializeStudyJson(doc)), doc)
    assert.deepEqual(parseStudyJson('```json\n' + JSON.stringify(doc) + '\n```'), doc)
    const linked = structuredClone(doc)
    linked.scripture.primary.verses = [{ verse: 1, text: 'First chapter' }, { verse: 1, text: 'Another chapter has more words' }]
    linked.connectors = [{ id: 'c1', noteId: 'n1', column: 0, verse: 1, verseIndex: 1, startWord: 2, endWord: 4, style: 'highlight' }]
    linked.shapes = [{ id: 's1', type: 'box', x: 20, y: 30, width: 100, height: 60, color: '#123456' }]
    assert.deepEqual(parseStudyJson(serializeStudyJson(linked)), linked)
    for (const raw of ['null', '[]', '{}', '{', JSON.stringify({ ...doc, notes: [null] }), JSON.stringify({ ...doc, notes: [{ ...doc.notes[0], x: 'bad' }] }), JSON.stringify({ ...doc, connectors: [{ id: 'c1', noteId: 'missing', column: 0, verse: 1 }] }), JSON.stringify({ ...doc, v: 999 }), JSON.stringify({ ...doc, style: { fontSize: 0 } })]) {
      assert.throws(() => parseStudyJson(raw))
    }
    const injected = parseStudyJson(JSON.stringify({ ...doc, loadDoc: 'bad', jsonToolsEnabled: true }))
    assert.equal('loadDoc' in injected, false)
    assert.equal('jsonToolsEnabled' in injected, false)
    useStudy.getState().setTitle('Before import')
    useStudy.getState().importDoc(injected)
    assert.equal(useStudy.getState().notes[0].text, 'A recap')
    useStudy.getState().undo()
    assert.equal(useStudy.getState().title, 'Before import')
    useStudy.getState().redo()
    assert.deepEqual(pickDoc(useStudy.getState()), doc)
    const example = WHITEBOARD_PROMPT.match(/```json\n([\s\S]*?)\n```/)[1]
    assert.doesNotThrow(() => parseStudyJson(example))
  } finally { await server.close() }
})
