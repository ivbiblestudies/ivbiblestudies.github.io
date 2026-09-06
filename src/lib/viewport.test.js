import test from 'node:test'
import assert from 'node:assert/strict'
import { inViewport } from './viewport.js'

test('viewport culling accounts for zoom, pan and partially visible notes', () => {
  const vp = { x: -100, y: -200, scale: 2 }, bounds = { width: 800, height: 600 }
  assert.equal(inViewport(50, 100, 190, 100, vp, bounds), true)
  assert.equal(inViewport(-500, 100, 190, 100, vp, bounds), false)
  assert.equal(inViewport(50, 1000, 190, 100, vp, bounds), false)
  assert.equal(inViewport(-50, 100, 190, 100, vp, bounds), true)
})
