import test from 'node:test'
import assert from 'node:assert/strict'
import { resizeNoteBox } from './noteResize.js'

// Node has no canvas; provide deterministic glyph widths for wrapping.
globalThis.document = { createElement: () => ({ getContext: () => ({
  measureText: text => ({ width: text.length * 7 }),
}) }) }

const note = { x: 100, y: 200, width: 190, fontScale: 1,
  text: 'alpha bravo charlie delta echo foxtrot golf hotel india juliet' }

test('horizontal edges rewrap without scaling and pin the opposite edge', () => {
  const box = resizeNoteBox(note, 0, 0.5, -100, 0)
  assert.equal(box.width, 290)
  assert.equal(box.x, 0)
  assert.equal(box.y, 200)
  assert.equal(box.fontScale, 1)
  assert.ok(Math.abs(box.height - 81.7) < 0.001)
})

test('vertical edges preserve width and font size while clamping to content', () => {
  const tall = resizeNoteBox(note, 0.5, 1, 0, 160)
  const short = resizeNoteBox(note, 0.5, 1, 0, 82)
  assert.equal(tall.width, 190)
  assert.equal(short.width, 190)
  assert.equal(tall.fontScale, 1)
  assert.equal(short.fontScale, 1)
  assert.equal(tall.height, 160)
  assert.ok(Math.abs(short.height - 100.55) < 0.001)
  assert.equal(short.x, 100)
})

test('top edge pins the bottom and clamps when text cannot fit', () => {
  const box = resizeNoteBox(note, 0.5, 0, 0, 1000)
  assert.equal(box.width, 190)
  assert.ok(Math.abs(box.height - 100.55) < 0.001)
  assert.ok(Math.abs(box.y + box.height - (200 + 100.55)) < 0.001)
})

test('corner dragging retains font scaling', () => {
  const box = resizeNoteBox(note, 1, 1, 380, 240)
  assert.equal(box.fontScale, 2)
  assert.equal(box.width, 380)
  assert.ok(box.height >= 240)
})
