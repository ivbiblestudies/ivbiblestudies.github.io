// Word-level layout for the scripture layer.
//
// Konva can wrap text for us, but then every word is anonymous: we could not
// tell which pixel belongs to which word, so clicking a word for its Strong's
// entry and anchoring an arrow to "verse 3" would both be impossible. So we lay
// the passage out ourselves, one measured word at a time, and render each word
// as its own node. That gives us per-word hit testing and per-verse geometry for
// free.

let measureCtx = null
function ctx() {
  if (!measureCtx) {
    const c = document.createElement('canvas')
    measureCtx = c.getContext('2d')
  }
  return measureCtx
}

export const DEFAULT_STYLE = {
  fontFamily: 'Literata',
  fontSize: 19,
  lineHeight: 1.9,
  letterSpacing: 0,
  wordSpacing: 4,
  verseSpacing: 10,
  columnWidth: 520,
  verseOnNewLine: true,
  showVerseNumbers: true,
  textColor: '#1c1917',
}

// Konva builds its context font as "<style> <variant> <size>px <family>", so we
// measure with the identical string to keep layout and rendering in lockstep.
export const fontStack = (family) => `${family}, Georgia, serif`

const fontString = (style, weight = 400) =>
  `${weight} normal ${style.fontSize}px ${fontStack(style.fontFamily)}`

function measure(text, style, weight) {
  const c = ctx()
  c.font = fontString(style, weight)
  return c.measureText(text).width + (style.letterSpacing || 0) * text.length
}

/**
 * @param {Array<{verse:number, text:string}>} verses
 * @param {object} style see DEFAULT_STYLE
 * @returns {{words:Array, verses:Array, width:number, height:number}}
 */
export function layoutPassage(verses, style) {
  const s = { ...DEFAULT_STYLE, ...style }
  const width = s.columnWidth
  const lineStep = s.fontSize * s.lineHeight
  const space = measure(' ', s, 400) + s.wordSpacing

  const words = []
  const verseBoxes = []

  let x = 0
  let y = 0

  const newline = () => {
    x = 0
    y += lineStep
  }

  ;(verses || []).forEach((v, vi) => {
    if (vi > 0) {
      if (s.verseOnNewLine) {
        newline()
        y += s.verseSpacing
      } else if (x > 0) {
        x += space
      }
    }

    const box = {
      verse: v.verse,
      chapter: v.chapter,
      minX: x,
      minY: y,
      maxX: x,
      maxY: y + lineStep,
      // Anchor point arrows attach to: the left shoulder of the verse's first line.
      anchorX: x,
      anchorY: y + lineStep / 2,
      // One rect per rendered line, so a highlight can trace the verse's real
      // shape instead of a bounding box that swallows neighbouring text.
      lines: [],
    }
    const placed = []

    const tokens = []
    if (s.showVerseNumbers) {
      // Multi-chapter passages carry a "3:16" label so numbers stay unambiguous.
      tokens.push({ text: String(v.label ?? v.verse), isVerseNum: true })
    }
    for (const t of String(v.text || '').split(/\s+/)) {
      if (t) tokens.push({ text: t, isVerseNum: false })
    }

    tokens.forEach((tok, ti) => {
      const weight = tok.isVerseNum ? 600 : 400
      const size = tok.isVerseNum ? Math.round(s.fontSize * 0.62) : s.fontSize
      const w = tok.isVerseNum
        ? measure(tok.text, { ...s, fontSize: size }, weight)
        : measure(tok.text, s, weight)

      if (x > 0 && x + w > width) newline()

      words.push({
        id: `w_${v.verse}_${ti}`,
        text: tok.text,
        verse: v.verse,
        index: ti,
        isVerseNum: tok.isVerseNum,
        x,
        // Verse numbers ride high, like a superscript.
        y: tok.isVerseNum ? y + (s.fontSize - size) * 0.15 : y,
        w,
        h: tok.isVerseNum ? size * 1.2 : s.fontSize * 1.2,
        fontSize: size,
        fontWeight: weight,
      })

      placed.push({ x, y, w })

      box.minX = Math.min(box.minX, x)
      box.minY = Math.min(box.minY, y)
      box.maxX = Math.max(box.maxX, x + w)
      box.maxY = Math.max(box.maxY, y + lineStep)

      x += w + (tok.isVerseNum ? space * 0.7 : space)
    })

    // Collapse the verse's words into one rect per line.
    const byLine = new Map()
    for (const word of placed) {
      const row = byLine.get(word.y)
      if (row) {
        row.left = Math.min(row.left, word.x)
        row.right = Math.max(row.right, word.x + word.w)
      } else {
        byLine.set(word.y, { top: word.y, left: word.x, right: word.x + word.w })
      }
    }
    box.lines = [...byLine.values()]
      .sort((a, b) => a.top - b.top)
      .map((row) => ({
        x: row.left,
        y: row.top - s.fontSize * 0.22,
        width: row.right - row.left,
        height: s.fontSize * 1.42,
      }))

    verseBoxes.push(box)
  })

  return {
    words,
    verses: verseBoxes,
    width,
    height: Math.max(y + lineStep, lineStep),
    lineStep,
  }
}

/** Geometry for one verse in a laid-out column, or null. */
export const verseBox = (layout, verse) =>
  layout?.verses?.find((v) => v.verse === verse) || null
