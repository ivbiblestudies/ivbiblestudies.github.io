import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'

test('NIV passages load from the supplied local books without an API', async (t) => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => { throw new Error('External APIs are unavailable') }
  try {
    const { fetchPassage, BibleApiError } = await server.ssrLoadModule('/src/lib/bibleApi.js')
    await t.test('retrieves a verse range with numeric chapter and verse fields', async () => {
      const result = await fetchPassage('Jn 3:16-18', 'NIV')
      assert.equal(result.reference, 'John 3:16-18')
      assert.equal(result.translation, 'NIV')
      assert.equal(result.translationName, 'New International Version')
      assert.deepEqual(result.verses.map(v => [v.chapter, v.verse]), [[3, 16], [3, 17], [3, 18]])
      assert.equal(result.verses[0].text, 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.')
      assert.equal('label' in result.verses[0], false)
    })
    await t.test('loads complete chapters and labels cross-chapter ranges', async () => {
      const chapter = await fetchPassage('Ps 23', 'NIV')
      assert.equal(chapter.reference, 'Psalms 23')
      assert.equal(chapter.verses.length, 6)
      assert.equal(chapter.verses[0].text, 'The Lord is my shepherd, I lack nothing.')
      const range = await fetchPassage('John 3:36-4:2', 'NIV')
      assert.deepEqual(range.verses.map(v => [v.chapter, v.verse, v.label]), [[3, 36, '3:36'], [4, 1, '4:1'], [4, 2, '4:2']])
      const chapters = await fetchPassage('Jude 1', 'NIV')
      assert.equal(chapters.verses.length, 25)
    })
    await t.test('resolves numbered books and Song Of Solomon filename casing', async () => {
      assert.equal((await fetchPassage('1 Cor 13:4', 'NIV')).verses[0].text, 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud.')
      const song = await fetchPassage('Song of Songs 1:1', 'NIV')
      assert.equal(song.reference, 'Song of Solomon 1:1')
      assert.equal(song.verses[0].text, 'Solomon`s Song of Songs.')
    })
    await t.test('skips empty NIV entries without renumbering neighboring verses', async () => {
      const result = await fetchPassage('John 5:3-5', 'NIV')
      assert.deepEqual(result.verses.map(v => v.verse), [3, 5])
      assert.ok(result.verses.every(v => v.text.trim()))
    })
    await t.test('rejects invalid, missing and reversed ranges with the shared error type', async () => {
      for (const reference of ['not a reference', 'John 0', 'John 22', 'John 3:0', 'John 3:99', 'John 3:16-99', 'John 4-3', 'John 3:18-16', 'John 5:4', 'John 1-7']) {
        await assert.rejects(fetchPassage(reference, 'NIV'), error => error instanceof BibleApiError, reference)
      }
    })
    await t.test('makes every book in Books.json accessible', async () => {
      const books = JSON.parse(await readFile(new URL('../../niv/Books.json', import.meta.url), 'utf8'))
      assert.equal(books.length, 66)
      for (const name of books) {
        const passage = await fetchPassage(name + ' 1:1', 'NIV')
        assert.equal(passage.verses.length, 1, name)
        assert.equal(passage.verses[0].chapter, 1, name)
        assert.equal(passage.verses[0].verse, 1, name)
        assert.ok(passage.verses[0].text.trim(), name)
      }
    })
  } finally {
    globalThis.fetch = originalFetch
    await server.close()
  }
})
