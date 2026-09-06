import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Stage, Layer, Group, Rect, Arrow, Line, Transformer } from 'react-konva'
import { useShallow } from 'zustand/shallow'
import { useStudy, visibleNotes, visibleShapes } from '../../store'
import { layoutPassage, connectorBox } from '../../lib/textLayout'
import { highlightNotesAt } from '../../lib/connections'
import { frameUpdate } from '../../lib/frameUpdate'
import { inViewport, canvasSize } from '../../lib/viewport'
import { publishLayout } from '../../lib/layoutRegistry'
import { registerCanvasApi } from '../../lib/canvasApi'
import { useFontEpoch } from '../../lib/useFonts'
import { translationShort } from '../../data/translations'
import { noteWidth, noteHeight } from '../../lib/noteMetrics'
import { resolveTag } from '../../data/tags'
import ScriptureColumn from './ScriptureColumn'
import Toolbar from './Toolbar'
import SelectionPopover from './SelectionPopover'
import CanvasTextEditor from './CanvasTextEditor'
import ZoomControls from './ZoomControls'
import NoteNode from './NoteNode'
import ShapeNode from './ShapeNode'

const MIN_SCALE = 0.15
const MAX_SCALE = 4
const GRID = 26

function dotPattern() {
  const c = document.createElement('canvas')
  c.width = GRID
  c.height = GRID
  const g = c.getContext('2d')
  g.fillStyle = '#d3cec6'
  g.beginPath()
  g.arc(1.5, 1.5, 1.2, 0, Math.PI * 2)
  g.fill()
  return c
}

const DRAW_TOOLS = new Set(['box', 'highlight', 'arrow'])
const CLICK_TOOLS = new Set(['text', 'note'])

export default function CanvasStage() {
  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const trRef = useRef(null)
  const bgBaseRef = useRef(null)
  const bgDotsRef = useRef(null)
  const pattern = useMemo(() => dotPattern(), [])

  // Firefox rejects drawImage from a zero-sized Konva compositing buffer.
  // Layers can draw before ResizeObserver delivers the first measurement.
  const [size, setSize] = useState(() => canvasSize(0, 0))
  const [draft, setDraft] = useState(null)
  const [wordSelection, setWordSelection] = useState(null)
  const [hoveredNoteId, setHoveredNoteId] = useState(null)
  const [hoveredHighlightNotes, setHoveredHighlightNotes] = useState([])
  const panRef = useRef(null)
  const nativeDragActive = useRef(false)
  const wheelPending = useRef(null)

  const scripture = useStudy((s) => s.scripture)
  const style = useStudy((s) => s.style)
  const layer = useStudy((s) => s.layer)
  const ui = useStudy((s) => s.ui)
  const notes = useStudy(useShallow(visibleNotes))
  const shapes = useStudy(useShallow(visibleShapes))
  const connectors = useStudy((s) => s.connectors)
  const customTags = useStudy((s) => s.tags)
  const selectedId = useStudy((s) => s.selectedId)

  const setViewport = useStudy((s) => s.setViewport)
  const wheelUpdates = useMemo(() => frameUpdate((next) => {
    wheelPending.current = null
    setViewport(next)
  }), [setViewport])
  useEffect(() => () => wheelUpdates.cancel(), [wheelUpdates])
  const panUpdates = useMemo(() => frameUpdate(setViewport), [setViewport])
  useEffect(() => () => panUpdates.cancel(), [panUpdates])
  const setSelected = useStudy((s) => s.setSelected)
  const setEditing = useStudy((s) => s.setEditing)
  const setTool = useStudy((s) => s.setTool)
  const addShape = useStudy((s) => s.addShape)
  const updateShape = useStudy((s) => s.updateShape)
  const addNote = useStudy((s) => s.addNote)
  const updateNote = useStudy((s) => s.updateNote)
  const noteDragUpdates = useMemo(() => frameUpdate(({ id, x, y }) => {
    updateNote(id, { x, y }, { history: false })
  }), [updateNote])
  useEffect(() => () => noteDragUpdates.cancel(), [noteDragUpdates])
  const moveNote = useCallback((id, x, y) => noteDragUpdates.push({ id, x, y }), [noteDragUpdates])
  const finishNoteDrag = useCallback((id, x, y) => {
    noteDragUpdates.cancel()
    updateNote(id, { x, y })
  }, [noteDragUpdates, updateNote])
  const setConnectorRange = useStudy((s) => s.setConnectorRange)

  const vp = ui.viewport
  const tool = ui.tool

  useEffect(() => {
    setWordSelection(null)
  }, [selectedId, tool, scripture])

  useEffect(() => {
    if (!wordSelection) return
    const cancel = (event) => {
      if (event.key === 'Escape') setWordSelection(null)
    }
    window.addEventListener('keydown', cancel)
    return () => window.removeEventListener('keydown', cancel)
  }, [wordSelection])

  // Re-measure the passage and the notes once the webfonts are really loaded.
  const fontEpoch = useFontEpoch([style.fontFamily, 'Inter'])

  // --- passage layout ---------------------------------------------------
  const columns = useMemo(() => {
    const cols = []
    const primary = scripture.primary
    if (primary.verses?.length) {
      cols.push({
        slot: 'primary',
        layout: layoutPassage(primary.verses, style),
        label: primary.loadedTranslation || translationShort(primary.translation),
        reference: primary.loadedReference || scripture.reference,
      })
    }
    if (scripture.parallel && scripture.secondary.verses?.length) {
      cols.push({
        slot: 'secondary',
        layout: layoutPassage(scripture.secondary.verses, style),
        label:
          scripture.secondary.loadedTranslation ||
          translationShort(scripture.secondary.translation),
        reference: scripture.secondary.loadedReference || scripture.reference,
      })
    }
    return cols
  }, [scripture, style, fontEpoch])

  const columnX = useCallback(
    (i) => layer.x + i * (style.columnWidth + layer.gap),
    [layer.x, layer.gap, style.columnWidth],
  )

  useEffect(() => {
    publishLayout({
      columns: columns.map((c) => c.layout),
      origin: { x: layer.x, y: layer.y },
      gap: layer.gap,
    })
  }, [columns, layer])

  // --- sizing -----------------------------------------------------------
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize(canvasSize(width, height))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // --- coordinate helpers -----------------------------------------------
  const toWorld = useCallback(
    (p) => ({ x: (p.x - vp.x) / vp.scale, y: (p.y - vp.y) / vp.scale }),
    [vp],
  )

  const contentBounds = useCallback(() => {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    const add = (x, y, w = 0, h = 0) => {
      minX = Math.min(minX, x, x + w)
      minY = Math.min(minY, y, y + h)
      maxX = Math.max(maxX, x, x + w)
      maxY = Math.max(maxY, y, y + h)
    }

    columns.forEach((c, i) => add(columnX(i), layer.y - 60, c.layout.width, c.layout.height + 60))
    notes.forEach((n) => add(n.x, n.y, noteWidth(n), noteHeight(n)))
    shapes.forEach((s) => {
      if (s.type === 'arrow') {
        const pts = s.points || [0, 0, 0, 0]
        for (let i = 0; i < pts.length; i += 2) add(s.x + pts[i], s.y + pts[i + 1])
      } else if (s.type === 'text') {
        add(s.x, s.y, s.width || 220, (s.fontSize || 18) * 1.6)
      } else {
        add(s.x, s.y, s.width, s.height)
      }
    })

    if (!Number.isFinite(minX)) return { x: 0, y: 0, width: 800, height: 600 }
    return { x: minX, y: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) }
  }, [columns, columnX, layer.y, notes, shapes])

  const fitToContent = useCallback(
    (padding = 80) => {
      if (!size.width || !size.height) return
      const b = contentBounds()
      const scale = Math.min(
        MAX_SCALE,
        Math.max(
          MIN_SCALE,
          Math.min(
            (size.width - padding * 2) / b.width,
            (size.height - padding * 2) / b.height,
          ),
        ),
      )
      setViewport({
        scale,
        x: size.width / 2 - (b.x + b.width / 2) * scale,
        y: size.height / 2 - (b.y + b.height / 2) * scale,
      })
    },
    [contentBounds, setViewport, size],
  )

  const zoomBy = useCallback(
    (factor) => {
      const cx = size.width / 2
      const cy = size.height / 2
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, vp.scale * factor))
      const wx = (cx - vp.x) / vp.scale
      const wy = (cy - vp.y) / vp.scale
      setViewport({ scale: next, x: cx - wx * next, y: cy - wy * next })
    },
    [size, vp, setViewport],
  )

  // --- export ------------------------------------------------------------
  const renderImage = useCallback(
    ({ pixelRatio = 3, padding = 64, background = true } = {}) => {
      const stage = stageRef.current
      if (!stage) return null

      // Selection handles are UI, not artwork — hide them for the render.
      const tr = trRef.current
      const prevNodes = tr?.nodes() || []
      tr?.nodes([])

      const b = contentBounds()
      const width = Math.ceil(b.width + padding * 2)
      const height = Math.ceil(b.height + padding * 2)

      const prev = {
        x: stage.x(),
        y: stage.y(),
        width: stage.width(),
        height: stage.height(),
      }

      // Render at 1:1 world scale into a stage sized to the content, so the
      // export is independent of whatever the user is currently zoomed to.
      stage.size({ width, height })
      const world = stage.findOne('#world')
      const worldPrev = { x: world.x(), y: world.y(), scale: world.scaleX() }
      world.position({ x: -b.x + padding, y: -b.y + padding })
      world.scale({ x: 1, y: 1 })

      const base = bgBaseRef.current
      const dots = bgDotsRef.current
      base.size({ width, height })
      base.visible(background)
      dots.size({ width, height })
      dots.visible(background && ui.showGrid)
      dots.fillPatternX(-b.x + padding)
      dots.fillPatternY(-b.y + padding)
      dots.fillPatternScale({ x: 1, y: 1 })

      // Export all text at the requested resolution, including offscreen tiles.
      const tiles = [...stage.find('.scripture-tile'), ...stage.find('.note')].map(node => ({ node, visible: node.visible(), cached: node.isCached() }))
      let dataUrl
      try {
        tiles.forEach(({ node }) => { node.visible(true); node.clearCache() })
        stage.draw()
        dataUrl = stage.toDataURL({ pixelRatio, mimeType: 'image/png' })
      } finally {
        tiles.forEach(({ node, visible, cached }) => {
          node.visible(visible)
          if (cached) node.cache({ pixelRatio: node.getAttr('cacheRatio'), hitCanvasPixelRatio: 1, offset: 4 })
        })

      // Put everything back exactly as it was.
      stage.size({ width: prev.width, height: prev.height })
      world.position({ x: worldPrev.x, y: worldPrev.y })
      world.scale({ x: worldPrev.scale, y: worldPrev.scale })
      base.size({ width: prev.width, height: prev.height })
      base.visible(true)
      dots.size({ width: prev.width, height: prev.height })
      dots.visible(ui.showGrid)
      dots.fillPatternX(vp.x)
      dots.fillPatternY(vp.y)
      dots.fillPatternScale({ x: vp.scale, y: vp.scale })
      tr?.nodes(prevNodes)
      stage.draw()
      }

      return { dataUrl, width, height }
    },
    [contentBounds, ui.showGrid, vp],
  )

  /** Bring a world-space point into the middle of the viewport. */
  const centerOn = useCallback(
    (x, y) => {
      if (!size.width || !size.height) return
      setViewport({
        ...vp,
        x: size.width / 2 - x * vp.scale,
        y: size.height / 2 - y * vp.scale,
      })
    },
    [size, vp, setViewport],
  )

  useEffect(() => {
    registerCanvasApi({ renderImage, fitToContent, centerOn })
    return () => registerCanvasApi(null)
  }, [renderImage, fitToContent, centerOn])

  // --- pointer interaction ------------------------------------------------
  const isBackground = (e) => {
    const t = e.target
    return t === t.getStage() || t.name() === 'background'
  }

  const onPointerDown = (e) => {
    const stage = stageRef.current
    const pos = stage.getPointerPosition()
    if (!pos) return

    const world = toWorld(pos)

    // Middle mouse and space-drag always pan, whatever the tool.
    const wantsPan =
      e.evt?.button === 1 || panRef.current?.spaceHeld || tool === 'hand'

    if (wantsPan || (tool === 'select' && isBackground(e))) {
      panRef.current = {
        ...panRef.current,
        active: true,
        startX: pos.x,
        startY: pos.y,
        originX: vp.x,
        originY: vp.y,
        moved: false,
      }
      if (tool === 'select' && isBackground(e) && !wordSelection) {
        setSelected(null)
      }
      return
    }

    if (!isBackground(e) && tool === 'select') return

    if (DRAW_TOOLS.has(tool)) {
      setSelected(null)
      setDraft({ type: tool, startX: world.x, startY: world.y, x: world.x, y: world.y })
      return
    }

    if (CLICK_TOOLS.has(tool)) {
      if (tool === 'note') {
        const id = addNote({
          x: world.x,
          y: world.y,
          text: '',
          tag: ui.noteTag,
          panel:
            ui.noteTag === 'observation'
              ? 'observations'
              : ui.noteTag === 'question'
                ? 'questions'
                : ui.noteTag === 'application'
                  ? 'application'
                  : null,
        })
        setSelected(id)
        setEditing(id)
      } else {
        const id = addShape({
          type: 'text',
          x: world.x,
          y: world.y,
          text: '',
          fontSize: 18,
          color: ui.color,
          tag: ui.noteTag,
          width: 240,
        })
        setSelected(id)
        setEditing(id)
      }
      setTool('select')
    }
  }

  const onPointerMove = (event) => {
    const stage = stageRef.current
    const pos = stage?.getPointerPosition()
    if (!pos) return

    if (panRef.current?.active) {
      const p = panRef.current
      const dx = pos.x - p.startX
      const dy = pos.y - p.startY
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) p.moved = true
      panUpdates.push({ ...vp, x: p.originX + dx, y: p.originY + dy })
      return
    }

    const hitNotes = tool === 'select' && !wordSelection && !event?.target?.findAncestor('.note', true)
      ? highlightNotesAt(connectorLines, toWorld(pos)) : []
    setHoveredHighlightNotes((previous) => previous.length === hitNotes.length && previous.every((id, i) => id === hitNotes[i]) ? previous : hitNotes)

    if (draft) {
      const world = toWorld(pos)
      setDraft({ ...draft, x: world.x, y: world.y })
    }
  }

  const onPointerUp = () => {
    if (panRef.current?.active) {
      panUpdates.flush()
      panRef.current = { ...panRef.current, active: false }
      return
    }
    if (!draft) return

    const x = Math.min(draft.startX, draft.x)
    const y = Math.min(draft.startY, draft.y)
    const width = Math.abs(draft.x - draft.startX)
    const height = Math.abs(draft.y - draft.startY)

    if (draft.type === 'arrow') {
      const dx = draft.x - draft.startX
      const dy = draft.y - draft.startY
      if (Math.hypot(dx, dy) > 12) {
        const id = addShape({
          type: 'arrow',
          x: draft.startX,
          y: draft.startY,
          points: [0, 0, dx, dy],
          color: ui.color,
          strokeWidth: ui.strokeWidth,
          tag: ui.noteTag,
        })
        setSelected(id)
      }
    } else if (width > 8 && height > 8) {
      const id = addShape({
        type: draft.type,
        x,
        y,
        width,
        height,
        color: ui.color,
        strokeWidth: ui.strokeWidth,
        opacity: draft.type === 'highlight' ? 0.3 : 1,
        tag: ui.noteTag,
      })
      setSelected(id)
    }

    setDraft(null)
    setTool('select')
  }

  // A release outside the browser or a cancelled touch may never reach Konva.
  // Its stale drag state suppresses hit testing until explicitly stopped.
  useEffect(() => {
    const finishInterruptedGesture = (clearSpace = false) => {
      const stage = stageRef.current
      if (!stage) return
      stage.find(node => node.isDragging()).forEach(node => node.stopDrag())
      nativeDragActive.current = false
      panUpdates.flush()
      noteDragUpdates.flush()
      wheelUpdates.flush()
      panRef.current = { ...panRef.current, active: false,
        spaceHeld: clearSpace ? false : !!panRef.current?.spaceHeld }
      setDraft(null)
      setHoveredNoteId(null)
      setHoveredHighlightNotes([])
      if (containerRef.current) containerRef.current.style.cursor = ''
      stage.batchDraw()
    }
    const interrupt = () => finishInterruptedGesture(true)
    const recover = event => {
      if (event.pointerType === 'touch' || event.buttons !== 0) return
      if (panRef.current?.active || nativeDragActive.current) {
        finishInterruptedGesture()
      }
    }
    const hidden = () => { if (document.visibilityState === 'hidden') interrupt() }
    window.addEventListener('blur', interrupt)
    window.addEventListener('pointercancel', interrupt)
    window.addEventListener('pointermove', recover)
    document.addEventListener('visibilitychange', hidden)
    return () => {
      window.removeEventListener('blur', interrupt)
      window.removeEventListener('pointercancel', interrupt)
      window.removeEventListener('pointermove', recover)
      document.removeEventListener('visibilitychange', hidden)
    }
  }, [panUpdates, noteDragUpdates, wheelUpdates])

  const onWheel = (e) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    const pos = stage.getPointerPosition()
    if (!pos) return

    // Accumulate every wheel delta but reconcile the scene only once per frame.
    const current = wheelPending.current || useStudy.getState().ui.viewport
    const queueViewport = (next) => {
      wheelPending.current = next
      wheelUpdates.push(next)
    }

    // Scrolling zooms, anchored on the cursor — hold shift to pan instead.
    if (e.evt.shiftKey) {
      queueViewport({ ...current, x: current.x - e.evt.deltaX, y: current.y - e.evt.deltaY })
      return
    }

    // Normalize across mouse wheels (large, chunky deltas), trackpads (small,
    // continuous) and page/line delta modes, so one notch is one step.
    const unit = e.evt.deltaMode === 1 ? 16 : e.evt.deltaMode === 2 ? 400 : 1
    const delta = Math.max(-240, Math.min(240, e.evt.deltaY * unit))
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, current.scale * Math.exp(-delta * 0.0015)))
    if (next === current.scale) return

    const wx = (pos.x - current.x) / current.scale
    const wy = (pos.y - current.y) / current.scale
    queueViewport({ scale: next, x: pos.x - wx * next, y: pos.y - wy * next })
  }

  // Space-to-pan, the way every canvas tool works.
  useEffect(() => {
    const down = (ev) => {
      if (ev.code === 'Space' && !ev.repeat) {
        const tag = ev.target?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || ev.target?.isContentEditable) return
        ev.preventDefault()
        panRef.current = { ...panRef.current, spaceHeld: true }
        const el = containerRef.current
        if (el) el.style.cursor = 'grab'
      }
    }
    const up = (ev) => {
      if (ev.code === 'Space') {
        panRef.current = { ...panRef.current, spaceHeld: false }
        const el = containerRef.current
        if (el) el.style.cursor = ''
      }
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  /**
   * Persist a note resize. Notes carry their own corner handles rather than the
   * Transformer: a note's height is derived from its wrapped text, and mutating
   * that mid-transform fights the Transformer's own drag bookkeeping. The handle
   * hands us an already-clamped box; only the last frame becomes an undo step.
   */
  const resizeNote = useCallback(
    (id, box, done) => updateNote(id, box, done ? undefined : { history: false }),
    [updateNote],
  )

  // --- transformer ---------------------------------------------------------
  useEffect(() => {
    const tr = trRef.current
    const stage = stageRef.current
    if (!tr || !stage) return
    const shape = shapes.find((s) => s.id === selectedId)
    const node =
      shape && shape.type !== 'arrow' ? stage.findOne(`#${selectedId}`) : null
    tr.nodes(node ? [node] : [])
    tr.getLayer()?.batchDraw()
  }, [selectedId, shapes, columns])

  // --- word clicks ---------------------------------------------------------
  const handleWordClick = (word, colIndex, evt) => {
    if (tool !== 'select') return
    evt.cancelBubble = true
    if (panRef.current?.spaceHeld) return
    if (wordSelection) {
      const range = wordSelection.range
      if (range && range.column === colIndex && range.verseIndex === word.verseIndex) {
        setConnectorRange(wordSelection.noteId, {
          ...range,
          startWord: Math.min(range.startWord, word.wordIndex),
          endWord: Math.max(range.startWord, word.wordIndex),
        })
        setWordSelection(null)
      } else {
        setWordSelection({ ...wordSelection, range: {
          verse: word.verse, verseIndex: word.verseIndex, column: colIndex,
          startWord: word.wordIndex, endWord: word.wordIndex,
        } })
      }
      return
    }
  }

  // --- connectors ----------------------------------------------------------
  //
  // A connector ties a note to its verse either as an arrow or as a highlight
  // laid over the verse itself in the note's color. The highlight traces the
  // verse line by line and keeps a hairline tether, so which note it belongs to
  // stays readable once several verses are marked in the same color.
  const connectorLines = useMemo(() => {
    const noteById = new Map(notes.map((n) => [n.id, n]))
    const out = []
    for (const c of connectors) {
      const note = noteById.get(c.noteId)
      if (!note) continue
      const colIndex = c.column ?? 0
      const col = columns[colIndex]
      if (!col) continue
      const box = connectorBox(col.layout, c)
      if (!box) continue

      const originX = columnX(colIndex)
      const width = noteWidth(note)
      const height = noteHeight(note)
      // Attach to whichever side of the note faces the passage.
      const noteIsLeft = note.x + width < originX + box.minX
      const from = {
        x: noteIsLeft ? note.x + width : note.x,
        y: note.y + Math.min(28, height / 2),
      }
      const to = {
        x: originX + (noteIsLeft ? box.minX - 8 : box.maxX + 8),
        y: layer.y + box.anchorY,
      }

      out.push({
        id: c.id,
        noteId: c.noteId,
        style: c.style === 'highlight' ? 'highlight' : 'arrow',
        color: resolveTag(note.tag, customTags).hex,
        rects: (box.lines || []).map((line) => ({
          x: originX + line.x - 2,
          y: layer.y + line.y,
          width: line.width + 4,
          height: line.height,
        })),
        points: [
          from.x,
          from.y,
          from.x - (from.x - to.x) * 0.55,
          from.y - (from.y - to.y) * 0.15,
          to.x,
          to.y,
        ],
      })
    }
    return out
  }, [connectors, notes, columns, columnX, layer.y, customTags])

  const previewRange = wordSelection?.range
  const previewBox = previewRange && connectorBox(columns[previewRange.column]?.layout, previewRange)
  const activeConnectionNotes = new Set(tool === 'select' && !wordSelection
    ? [...hoveredHighlightNotes, hoveredNoteId].filter(Boolean) : [])

  const cursor =
    tool === 'hand'
      ? 'grab'
      : DRAW_TOOLS.has(tool)
        ? 'crosshair'
        : CLICK_TOOLS.has(tool)
          ? 'copy'
          : 'default'

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-[#faf7f2]" style={{ cursor }}>
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        onMouseDown={onPointerDown}
        onDragStart={() => { nativeDragActive.current = true }}
        onDragEnd={() => { nativeDragActive.current = false }}
        onTouchStart={onPointerDown}
        onMouseMove={onPointerMove}
        onTouchMove={onPointerMove}
        onMouseUp={onPointerUp}
        onTouchEnd={onPointerUp}
        onMouseLeave={() => {
          onPointerUp()
          setHoveredNoteId(null)
          setHoveredHighlightNotes([])
        }}
        onWheel={onWheel}
        onContextMenu={(e) => e.evt.preventDefault()}
      >
        {/* Background: paper wash plus the dot grid, pinned to world space. */}
        <Layer listening={false}>
          <Rect ref={bgBaseRef} name="background" width={size.width} height={size.height} fill="#faf7f2" />
          <Rect
            ref={bgDotsRef}
            name="background"
            width={size.width}
            height={size.height}
            visible={ui.showGrid}
            fillPatternImage={pattern}
            fillPatternRepeat="repeat"
            fillPatternX={vp.x}
            fillPatternY={vp.y}
            fillPatternScaleX={vp.scale}
            fillPatternScaleY={vp.scale}
          />
        </Layer>

        <Layer>
          <Group id="world" x={vp.x} y={vp.y} scaleX={vp.scale} scaleY={vp.scale}>
            {columns.map((col, i) => (
              <ScriptureColumn
                key={col.slot}
                layout={col.layout}
                style={style}
                x={columnX(i)}
                y={layer.y}
                label={col.label}
                reference={col.reference}
                viewport={vp}
                bounds={size}
                interactive={tool === 'select'}
                selectingWords={!!wordSelection}
                onWordHover={(word) => {
                  if (!previewRange || previewRange.column !== i || previewRange.verseIndex !== word.verseIndex) return
                  setWordSelection((current) => current && ({ ...current, range: { ...current.range, endWord: word.wordIndex } }))
                }}
                onWordClick={(w, evt) => handleWordClick(w, i, evt)}
              />
            ))}

            {previewBox?.lines.map((line, i) => (
              <Rect key={`word-preview-${i}`} x={columnX(previewRange.column) + line.x - 2}
                y={layer.y + line.y} width={line.width + 4} height={line.height}
                fill={resolveTag(notes.find((n) => n.id === wordSelection.noteId)?.tag, customTags).hex}
                opacity={0.35} cornerRadius={3} listening={false} />
            ))}

            {connectorLines.map((c) =>
              c.style === 'highlight' ? (
                <Group key={c.id} name="connection-highlight" listening={false}>
                  {c.rects.map((r, i) => (
                    <Rect
                      key={i}
                      x={r.x}
                      y={r.y}
                      width={r.width}
                      height={r.height}
                      fill={c.color}
                      opacity={activeConnectionNotes.has(c.noteId) ? 0.42 : 0.22}
                      stroke={activeConnectionNotes.has(c.noteId) ? c.color : undefined}
                      strokeWidth={1.5}
                      cornerRadius={3}
                    />
                  ))}
                  <Line
                    points={c.points}
                    tension={0.4}
                    stroke={c.color}
                    strokeWidth={activeConnectionNotes.has(c.noteId) ? 2.4 : 1.2}
                    opacity={activeConnectionNotes.has(c.noteId) ? 0.9 : 0.4}
                    dash={[4, 4]}
                  />
                </Group>
              ) : (
                <Arrow
                  key={c.id}
                  points={c.points}
                  tension={0.4}
                  stroke={c.color}
                  fill={c.color}
                  strokeWidth={1.6}
                  opacity={0.75}
                  pointerLength={8}
                  pointerWidth={7}
                  listening={false}
                />
              ),
            )}

            {shapes.map((shape) => (
              <ShapeNode
                key={shape.id}
                shape={shape}
                selected={selectedId === shape.id}
                draggable={tool === 'select'}
                onSelect={setSelected}
                onEdit={setEditing}
                onChange={(id, patch) => updateShape(id, patch)}
              />
            ))}

            {notes.map((note) => (
              <NoteNode
                key={note.id}
                note={note}
                customTags={customTags}
                fontEpoch={fontEpoch}
                selected={selectedId === note.id}
                visible={selectedId === note.id || inViewport(note.x, note.y, noteWidth(note), noteHeight(note), vp, size)}
                connectionHovered={activeConnectionNotes.has(note.id)}
                onHover={setHoveredNoteId}
                onSelect={setSelected}
                onDragMove={moveNote}
                onDragEnd={finishNoteDrag}
                onResize={resizeNote}
                onEdit={setEditing}
              />
            ))}

            {/* Live preview of the shape being drawn. */}
            {draft && draft.type !== 'arrow' && (
              <Rect
                x={Math.min(draft.startX, draft.x)}
                y={Math.min(draft.startY, draft.y)}
                width={Math.abs(draft.x - draft.startX)}
                height={Math.abs(draft.y - draft.startY)}
                stroke={draft.type === 'box' ? ui.color : undefined}
                strokeWidth={ui.strokeWidth}
                fill={draft.type === 'highlight' ? ui.color : undefined}
                opacity={draft.type === 'highlight' ? 0.3 : 0.9}
                cornerRadius={draft.type === 'box' ? 4 : 2}
                listening={false}
              />
            )}
            {draft && draft.type === 'arrow' && (
              <Arrow
                x={draft.startX}
                y={draft.startY}
                points={[0, 0, draft.x - draft.startX, draft.y - draft.startY]}
                stroke={ui.color}
                fill={ui.color}
                strokeWidth={ui.strokeWidth}
                pointerLength={10}
                pointerWidth={9}
                listening={false}
              />
            )}

            <Transformer
              ref={trRef}
              rotateEnabled={false}
              keepRatio={false}
              borderStroke="#1c1917"
              borderStrokeWidth={1}
              anchorStroke="#1c1917"
              anchorFill="#ffffff"
              anchorSize={8}
              anchorCornerRadius={2}
              boundBoxFunc={(oldBox, newBox) =>
                newBox.width < 12 || newBox.height < 12 ? oldBox : newBox
              }
            />
          </Group>
        </Layer>
      </Stage>

      <Toolbar />
      <ZoomControls scale={vp.scale} onZoom={zoomBy} onFit={() => fitToContent()} />
      {!wordSelection && <SelectionPopover bounds={size} onSelectWords={(noteId) => {
        setTool('select')
        panRef.current = null
        setWordSelection({ noteId, range: null })
      }} />}
      {wordSelection && (
        <div role="status" className="absolute left-1/2 top-4 z-30 flex max-w-[90%] -translate-x-1/2 items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 text-xs shadow-lg">
          <span>{previewRange ? 'Click the last word in the same verse, or save this selection.' : 'Click the first word of the phrase to connect to this note.'}</span>
          {previewRange && <button type="button" className="rounded-lg bg-stone-900 px-3 py-2 font-semibold whitespace-nowrap text-white" onClick={() => {
            setConnectorRange(wordSelection.noteId, { ...previewRange, startWord: Math.min(previewRange.startWord, previewRange.endWord), endWord: Math.max(previewRange.startWord, previewRange.endWord) })
            setWordSelection(null)
          }}>Save selection</button>}
          <button type="button" className="rounded-lg px-2 py-2 font-semibold hover:bg-stone-100" onClick={() => setWordSelection(null)}>Cancel</button>
        </div>
      )}
      <CanvasTextEditor />
    </div>
  )
}

export { MIN_SCALE, MAX_SCALE }
