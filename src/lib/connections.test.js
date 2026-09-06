import test from 'node:test'
import assert from 'node:assert/strict'
import * as connections from './connections.js'

test('adding repetitions retains other phrases and replaces the initial whole-verse target', () => {
  const first = { id: 'a', noteId: 'note', verse: 1, column: 0, startWord: 0, endWord: 1 }
  const second = { ...first, id: 'b', startWord: 4, endWord: 5 }
  const unrelated = { id: 'other', noteId: 'other-note', verse: 1 }
  const initial = [{ id: 'whole', noteId: 'note', verse: 1 }, unrelated]
  const one = connections.appendHighlight(initial, first)
  const two = connections.appendHighlight(one, second)
  assert.deepEqual(two, [unrelated, first, second])
  assert.deepEqual(connections.appendHighlight(two, { ...first, id: 'duplicate' }), two)
})

test('hover finds every overlapping highlight but ignores arrows and empty space', () => {
  const rects = [{ x: 10, y: 20, width: 40, height: 20 }]
  const links = [{ noteId: 'a', style: 'highlight', rects }, { noteId: 'b', style: 'highlight', rects }, { noteId: 'c', style: 'arrow', rects }]
  assert.deepEqual(connections.highlightNotesAt(links, { x: 15, y: 25 }), ['a', 'b'])
  assert.deepEqual(connections.highlightNotesAt(links, { x: 60, y: 25 }), [])
})
