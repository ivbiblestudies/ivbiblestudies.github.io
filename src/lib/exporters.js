import { getCanvasApi } from './canvasApi'
import { PANELS, PANEL_LABEL } from '../store'
import { resolveTag } from '../data/tags'
import { verseLabel } from './quickEntry'

const slug = (s) =>
  String(s || 'study')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'study'

function download(href, filename) {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export function exportCanvasPNG(doc, { pixelRatio = 3 } = {}) {
  const api = getCanvasApi()
  if (!api) throw new Error('The canvas is not ready yet.')
  const image = api.renderImage({ pixelRatio })
  if (!image) throw new Error('Nothing to export yet.')
  download(image.dataUrl, `${slug(doc.title)}-canvas.png`)
  return image
}

// jsPDF and its font tables are ~450 kB; nobody should download that just to
// look at a passage. It arrives on the first export instead.
const loadPdf = async () => (await import('jspdf')).jsPDF

/** The visual map alone, on a page sized to the artwork. */
export async function exportCanvasPDF(doc, { pixelRatio = 2 } = {}) {
  const api = getCanvasApi()
  if (!api) throw new Error('The canvas is not ready yet.')
  const image = api.renderImage({ pixelRatio })
  if (!image) throw new Error('Nothing to export yet.')

  const jsPDF = await loadPdf()
  const pdf = new jsPDF({
    orientation: image.width >= image.height ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [image.width, image.height],
    compress: true,
  })
  pdf.addImage(image.dataUrl, 'PNG', 0, 0, image.width, image.height)
  pdf.save(`${slug(doc.title)}-canvas.pdf`)
  return image
}

const A4 = { width: 595.28, height: 841.89 }
const MARGIN = 54

/**
 * The full study: a cover, the canvas map fitted to a page, then the sidebar
 * contents as real, selectable text.
 */
export async function exportStudyPDF(doc, { pixelRatio = 2, includeCanvas = true } = {}) {
  const jsPDF = await loadPdf()
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4', compress: true })
  const contentWidth = A4.width - MARGIN * 2
  let y = MARGIN

  const ensureRoom = (needed) => {
    if (y + needed <= A4.height - MARGIN) return
    pdf.addPage()
    y = MARGIN
  }

  const text = (value, { size = 10.5, style = 'normal', color = [40, 37, 35], leading = 1.45, gap = 0, indent = 0 } = {}) => {
    pdf.setFont('helvetica', style)
    pdf.setFontSize(size)
    pdf.setTextColor(...color)
    const lines = pdf.splitTextToSize(String(value), contentWidth - indent)
    for (const line of lines) {
      ensureRoom(size * leading)
      pdf.text(line, MARGIN + indent, y + size * 0.8)
      y += size * leading
    }
    y += gap
  }

  // --- cover ---------------------------------------------------------------
  const ref =
    doc.scripture?.primary?.loadedReference || doc.scripture?.reference || ''
  text(doc.title || 'Untitled study', { size: 22, style: 'bold', leading: 1.25 })
  text(ref, { size: 13, color: [120, 113, 108], gap: 2 })

  const sources = [doc.scripture?.primary, doc.scripture?.secondary]
    .filter((s) => s?.verses?.length)
    .map((s) => s.loadedTranslation || s.translation)
    .join('  ·  ')
  text(sources, { size: 9.5, color: [168, 162, 158], gap: 10 })

  pdf.setDrawColor(214, 211, 209)
  pdf.line(MARGIN, y, A4.width - MARGIN, y)
  y += 18

  // --- canvas map ----------------------------------------------------------
  if (includeCanvas) {
    const api = getCanvasApi()
    const image = api?.renderImage({ pixelRatio })
    if (image) {
      const scale = Math.min(
        contentWidth / image.width,
        (A4.height - MARGIN * 2 - 40) / image.height,
      )
      const w = image.width * scale
      const h = image.height * scale
      ensureRoom(h + 16)
      pdf.addImage(image.dataUrl, 'PNG', MARGIN + (contentWidth - w) / 2, y, w, h)
      y += h + 22
    }
  }

  // --- panels --------------------------------------------------------------
  for (const panel of PANELS) {
    const notes = (doc.notes || []).filter((n) => n.panel === panel)
    const prose = (doc.panels?.[panel] || '').trim()
    if (!notes.length && !prose) continue

    ensureRoom(46)
    y += 6
    text(PANEL_LABEL[panel].toUpperCase(), {
      size: 10,
      style: 'bold',
      color: [120, 113, 108],
      gap: 3,
    })
    pdf.setDrawColor(231, 229, 228)
    pdf.line(MARGIN, y, A4.width - MARGIN, y)
    y += 10

    for (const note of notes) {
      const label = note.verses?.length ? `${verseLabel(note.verses)} — ` : ''
      const tag = resolveTag(note.tag, doc.tags)
      const rgb = hexToRgb(tag.hex)

      ensureRoom(16)
      const bulletY = y + 4
      pdf.setFillColor(...rgb)
      pdf.circle(MARGIN + 3, bulletY, 2.2, 'F')
      if (note.title) {
        text(`${label}${note.title}`, { size: 10.5, style: 'bold', indent: 14, gap: 1 })
        if (note.text) text(note.text, { size: 10.5, color: [68, 64, 60], indent: 14, gap: 3 })
        else y += 3
      } else {
        text(`${label}${note.text}`, { size: 10.5, indent: 14, gap: 3 })
      }
    }

    if (prose) {
      y += notes.length ? 6 : 0
      text(prose, { size: 10.5, color: [68, 64, 60], gap: 8 })
    }
  }

  // --- notes outside the four panels ---------------------------------------
  const loose = (doc.notes || []).filter((n) => !n.panel)
  if (loose.length) {
    ensureRoom(46)
    y += 6
    text('OTHER NOTES', { size: 10, style: 'bold', color: [120, 113, 108], gap: 3 })
    pdf.setDrawColor(231, 229, 228)
    pdf.line(MARGIN, y, A4.width - MARGIN, y)
    y += 10

    for (const note of loose) {
      const tag = resolveTag(note.tag, doc.tags)
      const label = note.verses?.length ? `${verseLabel(note.verses)} — ` : ''
      ensureRoom(16)
      pdf.setFillColor(...hexToRgb(tag.hex))
      pdf.circle(MARGIN + 3, y + 4, 2.2, 'F')
      if (note.title) {
        text(`${label}${note.title}`, { size: 10.5, style: 'bold', indent: 14, gap: 1 })
        if (note.text) text(note.text, { size: 10.5, color: [68, 64, 60], indent: 14, gap: 3 })
        else y += 3
      } else {
        text(`${label}${note.text}`, { size: 10.5, indent: 14, gap: 3 })
      }
    }
  }

  // --- footer --------------------------------------------------------------
  const pages = pdf.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(168, 162, 158)
    pdf.text(`${doc.title || 'Study'} · ${ref}`, MARGIN, A4.height - 28)
    pdf.text(`${i} / ${pages}`, A4.width - MARGIN, A4.height - 28, { align: 'right' })
  }

  pdf.save(`${slug(doc.title)}-study.pdf`)
}

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '')
  if (!m) return [87, 83, 78]
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
}
