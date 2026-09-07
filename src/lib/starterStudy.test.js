import test from 'node:test'
import assert from 'node:assert/strict'
import { starterStudy } from './starterStudy.js'
import { DEFAULT_STYLE, layoutPassage, connectorBox } from './textLayout.js'
import { noteHeight } from './noteMetrics.js'

globalThis.document = { createElement: () => ({ getContext: () => ({ measureText: text => ({ width: text.length * 7 }) }) }) }

test('starter preview has eight simple study notes and three larger corner notes', () => {
  const verses = Array.from({ length: 10 }, (_, index) => ({ verse: index + 1, text: 'A sample verse for layout and fallback checks.' }))
  verses[6].text = 'But say the word and my servant will be healed.'
  const doc = { title: 'Untitled study', scripture: { primary: { verses } },
    style: DEFAULT_STYLE, layer: { x: 160, y: 140 }, notes: [], ui: {} }
  const preview = starterStudy(doc)
  assert.equal(doc.notes.length, 0)
  assert.equal(preview.notes.length, 11)
  assert.equal(preview.notes.filter(note => note.tag === 'observation').length, 4)
  assert.equal(preview.notes.filter(note => note.tag === 'question').length, 4)
  assert.equal(preview.notes.filter(note => !note.title).length, 4)
  assert.deepEqual(preview.tags.map(tag => tag.label), ['Context', 'Announcements'])
  const layout = layoutPassage(verses, DEFAULT_STYLE)
  for (const note of preview.notes.filter(note => ['observation', 'question'].includes(note.tag))) {
    const links = preview.connectors.filter(link => link.noteId === note.id)
    assert.equal(links.filter(link => link.style === 'highlight').length, 1)
    assert.equal(links.filter(link => link.style === 'arrow').length, 1)
    for (const link of links) assert.ok(connectorBox(layout, link))
  }
  const exact = preview.connectors.find(link => link.noteId === 'demo-obs-authority' && link.verse === 7)
  assert.equal(exact.startWord, 1)
  assert.equal(exact.endWord, 3)
  for (const note of preview.notes.filter(note => !['observation', 'question'].includes(note.tag))) {
    assert.equal(note.width, note.id === 'demo-announcements-note' ? 400 : 300)
    assert.equal(note.fontScale, note.id === 'demo-announcements-note' ? 1.3 : 1.2)
  }
  for (let i = 0; i < preview.notes.length; i++) {
    for (const other of preview.notes.slice(i + 1)) {
      const note = preview.notes[i]
      const overlaps = note.x < other.x + other.width && other.x < note.x + note.width &&
        note.y < other.y + noteHeight(other) && other.y < note.y + noteHeight(note)
      assert.equal(overlaps, false, `${note.id} overlaps ${other.id}`)
    }
  }
})
