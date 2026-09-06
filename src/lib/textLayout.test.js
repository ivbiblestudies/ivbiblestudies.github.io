import test from 'node:test'
import assert from 'node:assert/strict'
import * as layout from './textLayout.js'

globalThis.document = { createElement: () => ({ getContext: () => ({ measureText: (text) => ({ width: text.length * 9 }) }) }) }

test('phrase geometry selects only chosen words across wrapped lines, in either direction', () => {
  assert.equal(typeof layout.connectorBox, 'function')
  const passage = layout.layoutPassage([{ verse: 1, text: 'In the beginning was the Word' }], { columnWidth: 140 })
  const box = layout.connectorBox(passage, { verse: 1, verseIndex: 0, startWord: 3, endWord: 1 })
  assert.equal(box.lines.length, 2)
  const words = passage.words.filter((w) => !w.isVerseNum && w.wordIndex >= 1 && w.wordIndex <= 3)
  assert.equal(box.minX, Math.min(...words.map((w) => w.x)))
  assert.equal(box.maxX, Math.max(...words.map((w) => w.x + w.w)))
})

test('word ranges survive hiding verse numbers and distinguish repeated verse numbers', () => {
  assert.equal(typeof layout.connectorBox, 'function')
  for (const showVerseNumbers of [true, false]) {
    const passage = layout.layoutPassage([{ verse: 1, text: 'First chapter' }, { verse: 1, text: 'Second chapter words' }], { showVerseNumbers })
    const box = layout.connectorBox(passage, { verse: 1, verseIndex: 1, startWord: 1, endWord: 1 })
    const word = passage.words.find((w) => w.verseIndex === 1 && w.wordIndex === 1)
    assert.equal(box.minX, word.x)
    assert.equal(box.maxX, word.x + word.w)
    assert.equal(box.lines.length, 1)
    assert.equal(layout.connectorBox(passage, { verse: 1 }), passage.verses[0])
    assert.equal(layout.connectorBox(passage, { verse: 1, startWord: 99, endWord: 100 }), null)
  }
})
