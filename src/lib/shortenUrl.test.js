import test from 'node:test'
import assert from 'node:assert/strict'
import { shortenUrl } from './shortenUrl.js'

test('shortening preserves the full encoded fragment and caches successful replies', async () => {
  const original = 'https://example.com/fable/#s=a+b&value=1'
  let calls = 0
  const request = async (endpoint, options) => {
    calls++
    assert.equal(endpoint, 'https://is.gd/create.php')
    assert.equal(options.body.get('url'), original)
    return { ok: true, json: async () => ({ shorturl: 'https://is.gd/Test123' }) }
  }
  assert.deepEqual(await shortenUrl(original, request), { url: 'https://is.gd/Test123', shortened: true })
  await shortenUrl(original, request)
  assert.equal(calls, 1)
})

test('service errors and oversized links retain a usable full share link', async () => {
  const original = 'https://example.com/fable/#s=failure'
  for (const request of [async () => { throw Error('offline') }, async () => ({ ok: true, json: async () => ({ errorcode: 3 }) }), async () => ({ ok: true, json: async () => ({ shorturl: 'javascript:alert(1)' }) })]) {
    const result = await shortenUrl(original, request)
    assert.equal(result.url, original)
    assert.equal(result.shortened, false)
  }
  const long = original + 'x'.repeat(5000)
  const result = await shortenUrl(long, () => { assert.fail('Oversized URLs must not be sent') })
  assert.equal(result.url, long)
  assert.equal(result.shortened, false)
})
