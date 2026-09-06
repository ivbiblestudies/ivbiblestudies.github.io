import test from 'node:test'
import assert from 'node:assert/strict'
import { inViewport, canvasSize } from './viewport.js'

test('canvas backing buffers remain nonempty before layout and when hidden', () => {
  assert.deepEqual(canvasSize(0, 0), { width: 1, height: 1 })
  assert.deepEqual(canvasSize(NaN, -20), { width: 1, height: 1 })
  assert.deepEqual(canvasSize(900, 631.2), { width: 900, height: 632 })
})

test('viewport culling accounts for zoom, pan and partially visible notes', () => {
  const vp = { x: -100, y: -200, scale: 2 }, bounds = { width: 800, height: 600 }
  assert.equal(inViewport(50, 100, 190, 100, vp, bounds), true)
  assert.equal(inViewport(-500, 100, 190, 100, vp, bounds), false)
  assert.equal(inViewport(50, 1000, 190, 100, vp, bounds), false)
  assert.equal(inViewport(-50, 100, 190, 100, vp, bounds), true)
})
