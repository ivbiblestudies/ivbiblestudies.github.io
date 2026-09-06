const cache = new Map()

/** Free is.gd API; retain the original link on service or size failures. */
export async function shortenUrl(url, request = fetch) {
  if (cache.has(url)) return { url: cache.get(url), shortened: true }
  const host = new URL(url).hostname
  if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') {
    return { url, shortened: false, message: 'Local preview links cannot be shortened. Share from the published site.' }
  }
  if (url.length > 5000) {
    return { url, shortened: false, message: 'This study exceeds is.gd’s size limit. Your full share link is ready instead.' }
  }
  try {
    const response = await request('https://is.gd/create.php', {
      method: 'POST',
      body: new URLSearchParams({ format: 'json', url }),
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: AbortSignal.timeout(8000),
    })
    const data = await response.json()
    if (!response.ok || data.errorcode || !/^https:\/\/is\.gd\/[A-Za-z0-9_]+$/.test(data.shorturl || '')) throw Error('Shortening failed')
    cache.set(url, data.shorturl)
    if (cache.size > 20) cache.delete(cache.keys().next().value)
    return { url: data.shorturl, shortened: true }
  } catch {
    return { url, shortened: false, message: 'The shortening service is unavailable. Your full share link is ready instead.' }
  }
}
