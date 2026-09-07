import test from 'node:test'
import assert from 'node:assert/strict'
import { selectWords, nearestWord } from './textSelection.js'

const words = [
  { verse: 1, verseIndex: 0, wordIndex: -1, text: '1', isVerseNum: true },
  { verse: 1, verseIndex: 0, wordIndex: 0, text: 'First', x: 0, y: 0, w: 40, h: 20 },
  { verse: 1, verseIndex: 0, wordIndex: 1, text: 'verse.', x: 50, y: 0, w: 40, h: 20 },
  { verse: 1, verseIndex: 1, wordIndex: 0, text: 'Next', x: 0, y: 30, w: 40, h: 20 },
]
test('backward cross-verse selection copies in reading order and preserves distinct verse indices', () => {
  assert.deepEqual(selectWords({ words }, words[3], words[2]), {
    text: 'verse.\nNext', ranges: [
      { column: 0, verse: 1, verseIndex: 0, startWord: 1, endWord: 1 },
      { column: 0, verse: 1, verseIndex: 1, startWord: 0, endWord: 0 },
    ],
  })
})
test('drag endpoints snap across whitespace and ignore verse numbers', () => {
  assert.equal(nearestWord({ words }, { x: 45, y: 35 }), words[3])
  assert.equal(selectWords({ words }, words[1], words[1]).text, 'First')
  assert.deepEqual(selectWords({ words }, { verseIndex: 99 }, words[1]), { text: '', ranges: [] })
})
