// Short, URL-friendly ids. Kept short deliberately: every id is serialized into
// the shareable URL, so bytes matter.
const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function uid(prefix = '') {
  let out = ''
  for (let i = 0; i < 8; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return prefix ? `${prefix}_${out}` : out
}
