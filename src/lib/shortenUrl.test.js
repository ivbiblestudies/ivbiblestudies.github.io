import test from 'node:test'
import assert from 'node:assert/strict'
import { shortenUrl, studyAlias } from './shortenUrl.js'

test('title aliases strip punctuation, replace spaces, and fit twelve characters', () => {
  assert.equal(studyAlias('John 1:1 Study!'), 'John-11-Stud')
  assert.equal(studyAlias('  God’s   Word!  '), 'Gods-Word')
  assert.equal(studyAlias('📖 !!!'), 'study')
})

test('zip1 receives JSON with the complete URL and title alias, then caches success', async () => {
  const url = 'https://example.com/#s=gz1.abc'
  let calls = 0
  const request = async (endpoint, options) => {
    calls++
    assert.equal(endpoint, 'https://zip1.io/api/create')
    assert.equal(options.headers['Content-Type'], 'application/json')
    assert.deepEqual(JSON.parse(options.body), { url, alias: 'John-1' })
    return { ok: true, status: 201, json: async () => ({ short_url: 'https://zip1.io/John-1' }) }
  }
  assert.equal((await shortenUrl(url, 'John 1', request)).url, 'https://zip1.io/John-1')
  await shortenUrl(url, 'John 1', request)
  assert.equal(calls, 1)
})

test('409 retries use unique numeric suffixes within twelve characters', async () => {
  const aliases = []
  const result = await shortenUrl('https://example.com/#conflict', 'A very long study title', async (_, options) => {
    const { alias } = JSON.parse(options.body)
    aliases.push(alias)
    return aliases.length < 4 ? { ok: false, status: 409 } :
      { ok: true, status: 201, json: async () => ({ short_url: `https://zip1.io/${alias}` }) }
  })
  assert.equal(result.shortened, true)
  assert.equal(new Set(aliases).size, 4)
  for (const alias of aliases.slice(1)) {
    assert.ok(alias.length <= 12)
    assert.match(alias, /^[A-Za-z0-9-]+\d+$/)
  }
})

test('non-conflict errors and exhausted conflicts fall back without endless requests', async () => {
  for (const status of [400, 429, 500, 409]) {
    let calls = 0
    const url = `https://example.com/#failure${status}`
    const result = await shortenUrl(url, 'Title', async () => { calls++; return { ok: false, status } })
    assert.equal(result.url, url)
    assert.equal(result.shortened, false)
    assert.equal(calls, status === 409 ? 10 : 1)
  }
})

test('links above the old provider limit are sent and unsafe responses are rejected', async () => {
  const url = 'https://example.com/#' + 'x'.repeat(5100)
  let sent = false
  const result = await shortenUrl(url, 'Long', async () => {
    sent = true
    return { ok: true, status: 201, json: async () => ({ short_url: 'javascript:alert(1)' }) }
  })
  assert.equal(sent, true)
  assert.equal(result.url, url)
  assert.equal(result.shortened, false)
})
