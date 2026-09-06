// Tag definitions shared by the sidebar and the canvas (Konva can't read CSS
// variables, so colors live here as raw hex).
//
// The three inductive tags plus "untagged" are built in. Studies can add their
// own — "Announcement", "Context", "Cross-reference" — and those live in the
// document, so they travel in the share link like everything else.

/** Lighten a hex color toward white for note backgrounds. */
export function softenHex(hex, amount = 0.86) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '')
  if (!m) return '#eeecea'
  const mix = (c) => Math.round(c + (255 - c) * amount)
  const [r, g, b] = [1, 2, 3].map((i) => mix(parseInt(m[i], 16)))
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

const BUILTIN = {
  observation: { id: 'observation', label: 'Observation', short: 'Obs', hex: '#0f766e' },
  question: { id: 'question', label: 'Question', short: 'Q', hex: '#7c3aed' },
  application: { id: 'application', label: 'Application', short: 'App', hex: '#c2410c' },
  none: { id: 'none', label: 'Untagged', short: '—', hex: '#57534e' },
}

/** Fill in everything derivable from a tag's label and color. */
export function materializeTag(def) {
  const label = String(def.label || 'Tag').trim() || 'Tag'
  return {
    id: def.id,
    label,
    short: def.short || label.slice(0, 3),
    hex: def.hex || '#57534e',
    soft: def.soft || softenHex(def.hex || '#57534e'),
    custom: !!def.custom,
  }
}

export const TAGS = Object.fromEntries(
  Object.entries(BUILTIN).map(([id, def]) => [id, materializeTag(def)]),
)

export const TAG_ORDER = ['observation', 'question', 'application', 'none']

/** The full ordered tag list for a document: built-ins, then its own. */
export function tagList(custom = []) {
  return [
    ...TAG_ORDER.map((id) => TAGS[id]),
    ...custom.map((def) => materializeTag({ ...def, custom: true })),
  ]
}

export const tagIds = (custom = []) => tagList(custom).map((t) => t.id)

/** Resolve a tag id against a document's custom tags; never returns undefined. */
export function resolveTag(id, custom = []) {
  if (TAGS[id]) return TAGS[id]
  const found = custom.find((t) => t.id === id)
  return found ? materializeTag({ ...found, custom: true }) : TAGS.none
}

// Built-in-only lookup, for the few places that predate custom tags.
export const tagOf = (id) => TAGS[id] || TAGS.none

// A starting palette for new tags — distinct from the three built-in hues.
export const TAG_PALETTE = [
  '#1d4ed8',
  '#0891b2',
  '#65a30d',
  '#ca8a04',
  '#db2777',
  '#9333ea',
  '#dc2626',
  '#475569',
]
