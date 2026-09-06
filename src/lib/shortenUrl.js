const cache = new Map()
const MAX_ALIAS_LENGTH = 12
const MAX_ATTEMPTS = 10

export function studyAlias(title) {
  return (String(title || '').replace(/[^A-Za-z0-9\s]/g, '').trim()
    .replace(/\s+/g, '-').slice(0, MAX_ALIAS_LENGTH).replace(/-+$/, '') || 'study')
}

/** zip1 API; retain the full snapshot link if creation fails. */
export async function shortenUrl(url, title, request = fetch) {
  const base = studyAlias(title)
  const cacheKey = JSON.stringify([url, base])
  if (cache.has(cacheKey)) return { url: cache.get(cacheKey), shortened: true }
  const host = new URL(url).hostname
  if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') {
    return { url, shortened: false, message: 'Local preview links cannot be shortened. Share from the published site.' }
  }
  try {
    const signal = AbortSignal.timeout(15000)
    const tried = new Set()
    let alias = base
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      if (attempt > 0) {
        // Rotate through distinct four-digit suffixes, even if randomness repeats.
        let number = 1000 + Math.floor(Math.random() * 9000)
        do {
          const suffix = String(number)
          alias = base.slice(0, MAX_ALIAS_LENGTH - suffix.length).replace(/-+$/, '') + suffix
          number = number === 9999 ? 1000 : number + 1
        } while (tried.has(alias))
      }
      tried.add(alias)
      const response = await request('https://zip1.io/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, alias }),
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        signal,
      })
      if (response.status === 409) continue
      if (!response.ok) throw Error('Shortening failed')
      const data = await response.json()
      if (!/^https:\/\/zip1\.io\/[A-Za-z0-9-]+$/.test(data.short_url || '')) throw Error('Invalid short link')
      cache.set(cacheKey, data.short_url)
      if (cache.size > 20) cache.delete(cache.keys().next().value)
      return { url: data.short_url, shortened: true }
    }
    return { url, shortened: false, message: 'Could not find an available short alias. Your full share link is ready instead.' }
  } catch {
    return { url, shortened: false, message: 'The shortening service is unavailable. Your full share link is ready instead.' }
  }
}
