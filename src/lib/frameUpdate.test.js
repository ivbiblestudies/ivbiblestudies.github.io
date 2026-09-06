import test from 'node:test'
import assert from 'node:assert/strict'
import { frameUpdate } from './frameUpdate.js'

test('input bursts commit only the newest value and flush the final position', () => {
  const tasks = new Map(), values = []
  let id = 0
  const updater = frameUpdate(v => values.push(v), fn => { tasks.set(++id, fn); return id }, id => tasks.delete(id))
  for (let i = 0; i < 100; i++) updater.push(i)
  assert.equal(tasks.size, 1)
  tasks.values().next().value()
  assert.deepEqual(values, [99])
  updater.push(100)
  updater.flush()
  assert.deepEqual(values, [99, 100])
  updater.push(101)
  updater.cancel()
  assert.equal(tasks.size, 0)
})
