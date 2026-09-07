import test from 'node:test'
import assert from 'node:assert/strict'
import { polygonPoints, shapeBounds } from './shapeGeometry.js'

test('polygons fit non-square drawing bounds', () => {
  assert.deepEqual(polygonPoints('triangle', 100, 60), [50, 0, 100, 60, 0, 60])
  assert.deepEqual(polygonPoints('diamond', 100, 60), [50, 0, 100, 30, 50, 60, 0, 30])
})

test('reverse drags normalize bounds and circles use equal dimensions', () => {
  const draft = { startX: 100, startY: 80, x: 20, y: 40 }
  assert.deepEqual(shapeBounds({ ...draft, type: 'ellipse' }), { x: 20, y: 40, width: 80, height: 40 })
  assert.deepEqual(shapeBounds({ ...draft, type: 'circle' }), { x: 20, y: 0, width: 80, height: 80 })
})
