import { memo } from 'react'
import { Rect, Arrow, Ellipse, Text } from 'react-konva'

/**
 * Freehand annotation primitives: boxes, highlighter swipes, arrows and text.
 * Each is a single Konva node so the Transformer can grab it directly.
 */
function ShapeNode({ shape, selected, onSelect, onChange, onEdit, draggable = true }) {
  const common = {
    id: shape.id,
    name: 'shape',
    draggable,
    onClick: () => onSelect?.(shape.id),
    onTap: () => onSelect?.(shape.id),
    onDragEnd: (e) => onChange?.(shape.id, { x: e.target.x(), y: e.target.y() }),
    onMouseEnter: (e) => {
      const c = e.target.getStage()?.container()
      if (c && draggable) c.style.cursor = 'move'
    },
    onMouseLeave: (e) => {
      const c = e.target.getStage()?.container()
      if (c) c.style.cursor = ''
    },
  }

  if (shape.type === 'box') {
    return (
      <Rect
        {...common}
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        stroke={shape.color}
        strokeWidth={shape.strokeWidth || 3}
        cornerRadius={4}
        // A hollow box is nearly impossible to grab; give it an invisible fill.
        fill="rgba(0,0,0,0.001)"
        dash={shape.dash ? [10, 6] : undefined}
        onTransformEnd={(e) => {
          const node = e.target
          onChange?.(shape.id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(8, node.width() * node.scaleX()),
            height: Math.max(8, node.height() * node.scaleY()),
          })
          node.scaleX(1)
          node.scaleY(1)
        }}
      />
    )
  }

  if (shape.type === 'highlight') {
    return (
      <Rect
        {...common}
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        fill={shape.color}
        opacity={shape.opacity ?? 0.3}
        cornerRadius={2}
        onTransformEnd={(e) => {
          const node = e.target
          onChange?.(shape.id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(6, node.width() * node.scaleX()),
            height: Math.max(6, node.height() * node.scaleY()),
          })
          node.scaleX(1)
          node.scaleY(1)
        }}
      />
    )
  }

  if (shape.type === 'circle' || shape.type === 'ellipse') {
    const width = shape.width || 40
    const height = shape.height || 40
    return (
      <Ellipse
        {...common}
        x={shape.x + width / 2}
        y={shape.y + height / 2}
        radiusX={width / 2}
        radiusY={height / 2}
        stroke={shape.color}
        strokeWidth={shape.strokeWidth || 3}
        fill="rgba(0,0,0,0.001)"
        dash={shape.dash ? [10, 6] : undefined}
        onDragEnd={(e) => onChange?.(shape.id, {
          x: e.target.x() - width / 2,
          y: e.target.y() - height / 2,
        })}
        onTransformEnd={(e) => {
          const node = e.target
          const nextWidth = Math.max(8, width * node.scaleX())
          const nextHeight = Math.max(8, height * node.scaleY())
          onChange?.(shape.id, {
            x: node.x() - nextWidth / 2,
            y: node.y() - nextHeight / 2,
            width: nextWidth,
            height: nextHeight,
          })
          node.scaleX(1)
          node.scaleY(1)
        }}
      />
    )
  }

  if (shape.type === 'arrow') {
    return (
      <Arrow
        {...common}
        x={shape.x}
        y={shape.y}
        points={shape.points}
        stroke={shape.color}
        fill={shape.color}
        strokeWidth={shape.strokeWidth || 3}
        pointerLength={10}
        pointerWidth={9}
        lineCap="round"
        lineJoin="round"
        hitStrokeWidth={18}
      />
    )
  }

  if (shape.type === 'text') {
    return (
      <Text
        {...common}
        x={shape.x}
        y={shape.y}
        text={shape.text || 'Double-click to edit'}
        width={shape.width || undefined}
        fontSize={shape.fontSize || 18}
        fontFamily="Inter, sans-serif"
        fontStyle={shape.bold ? '600' : '400'}
        fill={shape.color}
        opacity={shape.text ? 1 : 0.45}
        onDblClick={() => onEdit?.(shape.id)}
        onDblTap={() => onEdit?.(shape.id)}
        onTransformEnd={(e) => {
          const node = e.target
          onChange?.(shape.id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(40, node.width() * node.scaleX()),
          })
          node.scaleX(1)
          node.scaleY(1)
        }}
      />
    )
  }

  return null
}

export default memo(ShapeNode)
