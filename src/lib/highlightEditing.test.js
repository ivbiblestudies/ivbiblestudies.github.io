import test from 'node:test'
import assert from 'node:assert/strict'
import { subtractWordRanges, selectionToolbarPosition } from './highlightEditing.js'

test('erasing the middle preserves highlighting on both sides', () => {
  const range = { verse: 1, verseIndex: 0, startWord: 0, endWord: 7 }
  assert.deepEqual(subtractWordRanges(range, [{ ...range, startWord: 4, endWord: 2 }]), [
    { ...range, endWord: 1 }, { ...range, startWord: 5 },
  ])
  assert.deepEqual(subtractWordRanges(range, [range]), [])
  assert.deepEqual(subtractWordRanges(range, [{ ...range, verseIndex: 1 }]), [range])
})

test('toolbar prefers below, flips above near bottom, and stays within horizontal edges', () => {
  const viewport = { width: 400, height: 600 }, toolbar = { width: 200, height: 100 }
  assert.deepEqual(selectionToolbarPosition({ left: 100, right: 300, top: 100, bottom: 130 }, viewport, toolbar), { left: 100, top: 146 })
  assert.deepEqual(selectionToolbarPosition({ left: 350, right: 390, top: 520, bottom: 550 }, viewport, toolbar), { left: 188, top: 392 })
})
