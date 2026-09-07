import test from 'node:test'
import assert from 'node:assert/strict'
import * as touch from './touchViewport.js'

test('pinch keeps the original world point under the moving midpoint', () => {
  assert.deepEqual(touch.pinchViewport({ x: 10, y: 20, scale: 1 },
    { x: 60, y: 70, distance: 100 }, { x: 80, y: 100, distance: 200 }),
  { x: -20, y: 0, scale: 2 })
})

test('pinch limits zoom and ignores coincident starting touches', () => {
  assert.deepEqual(touch.pinchViewport({ x: 0, y: 0, scale: 1 },
    { x: 0, y: 0, distance: 10 }, { x: 20, y: 30, distance: 1000 }),
  { x: 20, y: 30, scale: 4 })
  assert.deepEqual(touch.pinchViewport({ x: 1, y: 2, scale: 1 },
    { x: 0, y: 0, distance: 0 }, { x: 20, y: 30, distance: 100 }),
  { x: 1, y: 2, scale: 1 })
})
