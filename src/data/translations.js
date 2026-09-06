// Every translation the app can fetch, and which keyless API serves it.
//
//  - `bible-api`  bible-api.com — public domain texts, parses references itself
//  - `bolls`      bolls.life — modern translations, chapter at a time
//
// Neither needs an API key or a backend, which is what keeps this app a static
// page. Modern translations are under copyright and are fetched from a third
// party for personal study; use the "Paste text" mode if you'd rather supply
// them from your own licensed copy.

const T = (id, name, short, source, group) => ({ id, name, short, source, group })

export const TRANSLATIONS = [
  // Modern, copyrighted — via bolls.life
  T('NIV', 'New International Version', 'NIV', 'bolls', 'Modern'),
  T('ESV', 'English Standard Version', 'ESV', 'bolls', 'Modern'),
  T('NASB', 'New American Standard Bible', 'NASB', 'bolls', 'Modern'),
  T('NKJV', 'New King James Version', 'NKJV', 'bolls', 'Modern'),
  T('NLT', 'New Living Translation', 'NLT', 'bolls', 'Modern'),
  T('AMP', 'Amplified Bible', 'AMP', 'bolls', 'Modern'),
  T('MSG', 'The Message', 'MSG', 'bolls', 'Modern'),
  T('RSV', 'Revised Standard Version', 'RSV', 'bolls', 'Modern'),

  // Public domain — via bible-api.com
  T('web', 'World English Bible', 'WEB', 'bible-api', 'Public domain'),
  T('kjv', 'King James Version', 'KJV', 'bible-api', 'Public domain'),
  T('asv', 'American Standard Version', 'ASV', 'bible-api', 'Public domain'),
  T('bbe', 'Bible in Basic English', 'BBE', 'bible-api', 'Public domain'),
  T('ylt', "Young's Literal Translation", 'YLT', 'bible-api', 'Public domain'),
  T('dra', 'Douay-Rheims 1899', 'DRA', 'bible-api', 'Public domain'),
  T('oeb-us', 'Open English Bible', 'OEB', 'bible-api', 'Public domain'),
  T('webbe', 'World English Bible, British', 'WEBBE', 'bible-api', 'Public domain'),
  T('clementine', 'Clementine Latin Vulgate', 'VULG', 'bible-api', 'Public domain'),
  T('almeida', 'João Ferreira de Almeida', 'ALM', 'bible-api', 'Public domain'),
]

export const TRANSLATION_GROUPS = ['Modern', 'Public domain']

export const findTranslation = (id) => TRANSLATIONS.find((t) => t.id === id) || null

export const CUSTOM_SOURCE = { id: 'custom', name: 'Custom / pasted text', short: 'Custom' }

export const translationName = (id) =>
  id === 'custom' ? CUSTOM_SOURCE.name : findTranslation(id)?.name || String(id).toUpperCase()

export const translationShort = (id) =>
  id === 'custom' ? CUSTOM_SOURCE.short : findTranslation(id)?.short || String(id).toUpperCase()

// Kept for older share links that stored a bible-api id we no longer list.
export const API_TRANSLATIONS = TRANSLATIONS
