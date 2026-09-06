import { memo, useMemo } from 'react'
import { Group, Rect, Text } from 'react-konva'
import { resolveTag } from '../../data/tags'
import {
  NOTE_MIN_WIDTH,
  NOTE_MAX_WIDTH,
  NOTE_LINE_HEIGHT,
  NOTE_TITLE_LINE_HEIGHT,
  MIN_SCALE,
  MAX_SCALE,
  noteWidth,
  noteHeight,
  noteScale,
  noteFontMetrics,
  noteTitleLines,
  noteBodyLines,
  noteContentHeight,
} from '../../lib/noteMetrics'
import { verseLabel } from '../../lib/quickEntry'

const HANDLE = 9

const CORNERS = [
  { key: 'tl', ax: 0, ay: 0, cursor: 'nwse-resize' },
  { key: 'tr', ax: 1, ay: 0, cursor: 'nesw-resize' },
  { key: 'bl', ax: 0, ay: 1, cursor: 'nesw-resize' },
  { key: 'br', ax: 1, ay: 1, cursor: 'nwse-resize' },
]

function NoteNode({
  note,
  customTags,
  fontEpoch,
  selected,
  onSelect,
  onDragMove,
  onDragEnd,
  onEdit,
  onResize,
}) {
  const tag = resolveTag(note.tag, customTags)
  const width = noteWidth(note)
  const m = noteFontMetrics(note)

  // Wrap with the same measurer the store and the resize clamp use, then hand
  // Konva pre-broken lines so on-screen height matches the reserved height.
  const { titleLines, body, titleBlock, height } = useMemo(() => {
    const titles = noteTitleLines(note)
    return {
      titleLines: titles.join('\n'),
      body: noteBodyLines(note).join('\n'),
      titleBlock: titles.length
        ? titles.length * m.titleSize * NOTE_TITLE_LINE_HEIGHT + m.titleGap
        : 0,
      height: noteHeight(note),
    }
  }, [note, m.titleSize, m.titleGap, fontEpoch])

  const label = verseLabel(note.verses)
  const bodyTop = m.header + m.padding - 4 * m.scale + titleBlock

  /**
   * Turn a dragged corner into a new box. The corner opposite the one being
   * dragged stays pinned, the type scales with the box, and the note can never
   * be squeezed smaller than the text inside it.
   */
  const emitResize = (handle, ax, ay, done) => {
    const hx = handle.x() + HANDLE / 2
    const hy = handle.y() + HANDLE / 2

    // Edges in the note's local space; the dragged corner moves, the other stays.
    const left = ax === 0 ? hx : 0
    const right = ax === 0 ? width : hx
    const top = ay === 0 ? hy : 0
    const bottom = ay === 0 ? height : hy

    const w = Math.min(NOTE_MAX_WIDTH, Math.max(NOTE_MIN_WIDTH, right - left))
    // Type scales with the box, the way a text frame scales in a drawing tool.
    const fontScale = Math.min(
      MAX_SCALE,
      Math.max(MIN_SCALE, noteScale(note) * (w / width)),
    )
    const next = { ...note, width: w, fontScale }
    const h = Math.max(noteContentHeight(next), bottom - top)

    // Re-derive the origin from the pinned edge so a clamp doesn't drag the
    // whole note along with it.
    const x = ax === 0 ? note.x + right - w : note.x
    const y = ay === 0 ? note.y + bottom - h : note.y

    // Konva owns this node's position while dragging; if the clamp bit, the
    // handle would sit away from the corner it represents until some other
    // prop changed. Put it back on the corner every frame.
    handle.position({ x: ax * w - HANDLE / 2, y: ay * h - HANDLE / 2 })

    onResize?.(note.id, { x, y, width: w, height: h, fontScale }, done)
  }

  return (
    <Group
      id={note.id}
      name="note"
      x={note.x}
      y={note.y}
      draggable
      onDragStart={() => onSelect?.(note.id)}
      onDragMove={(e) => onDragMove?.(note.id, e.target.x(), e.target.y())}
      onDragEnd={(e) => onDragEnd?.(note.id, e.target.x(), e.target.y())}
      onClick={() => onSelect?.(note.id)}
      onTap={() => onSelect?.(note.id)}
      onDblClick={() => onEdit?.(note.id)}
      onDblTap={() => onEdit?.(note.id)}
      onMouseEnter={(e) => {
        const c = e.target.getStage()?.container()
        if (c) c.style.cursor = 'move'
      }}
      onMouseLeave={(e) => {
        const c = e.target.getStage()?.container()
        if (c) c.style.cursor = ''
      }}
    >
      <Rect
        width={width}
        height={height}
        fill={tag.soft}
        stroke={selected ? tag.hex : 'rgba(28,25,23,0.14)'}
        strokeWidth={selected ? 2 : 1}
        cornerRadius={6}
        shadowColor="#1c1917"
        shadowOpacity={selected ? 0.16 : 0.08}
        shadowBlur={selected ? 14 : 8}
        shadowOffsetY={selected ? 4 : 2}
      />
      {/* Colored spine keeps the tag readable even when zoomed out. */}
      <Rect
        width={4 * m.scale}
        height={height}
        fill={tag.hex}
        cornerRadius={[6, 0, 0, 6]}
      />

      <Text
        text={label ? `${tag.label.toUpperCase()} · ${label}` : tag.label.toUpperCase()}
        x={m.padding}
        y={9 * m.scale}
        width={width - m.padding * 2}
        fontSize={m.metaSize}
        fontFamily="Inter, sans-serif"
        fontStyle="600"
        letterSpacing={0.9 * m.scale}
        fill={tag.hex}
        listening={false}
      />

      {titleLines && (
        <Text
          text={titleLines}
          x={m.padding}
          y={m.header + m.padding - 6 * m.scale}
          width={width - m.padding * 2}
          fontSize={m.titleSize}
          lineHeight={NOTE_TITLE_LINE_HEIGHT}
          fontFamily="Inter, sans-serif"
          fontStyle="600"
          fill="#1c1917"
          listening={false}
        />
      )}

      <Text
        text={body}
        x={m.padding}
        y={bodyTop}
        width={width - m.padding * 2}
        fontSize={m.bodySize}
        lineHeight={NOTE_LINE_HEIGHT}
        fontFamily="Inter, sans-serif"
        fill={note.title ? '#44403c' : '#1c1917'}
        listening={false}
      />

      {selected &&
        CORNERS.map(({ key, ax, ay, cursor }) => (
          <Rect
            key={key}
            x={ax * width - HANDLE / 2}
            y={ay * height - HANDLE / 2}
            width={HANDLE}
            height={HANDLE}
            fill="#ffffff"
            stroke={tag.hex}
            strokeWidth={1.5}
            cornerRadius={2}
            draggable
            hitStrokeWidth={10}
            onDragStart={(e) => {
              e.cancelBubble = true
            }}
            onDragMove={(e) => {
              e.cancelBubble = true
              emitResize(e.target, ax, ay, false)
            }}
            onDragEnd={(e) => {
              e.cancelBubble = true
              emitResize(e.target, ax, ay, true)
            }}
            onMouseEnter={(e) => {
              const c = e.target.getStage()?.container()
              if (c) c.style.cursor = cursor
            }}
            onMouseLeave={(e) => {
              const c = e.target.getStage()?.container()
              if (c) c.style.cursor = ''
            }}
          />
        ))}
    </Group>
  )
}

export default memo(NoteNode)
