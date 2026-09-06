import { memo } from 'react'
import { Group, Text, Rect, Line } from 'react-konva'
import { fontStack } from '../../lib/textLayout'

/**
 * One translation column, rendered word by word so each word is clickable and
 * each verse has real geometry for arrows to point at.
 */
function ScriptureColumn({
  layout,
  style,
  x,
  y,
  label,
  reference,
  activeWordId,
  onWordClick,
  interactive = true,
}) {
  const stack = fontStack(style.fontFamily)

  return (
    <Group x={x} y={y} listening={interactive}>
      {/* Column header: reference and translation, set apart from the text. */}
      <Text
        text={(reference || '').toUpperCase()}
        x={0}
        y={-58}
        fontSize={11}
        fontFamily="Inter, sans-serif"
        fontStyle="600"
        letterSpacing={1.4}
        fill="#a8a29e"
        listening={false}
      />
      <Text
        text={label || ''}
        x={0}
        y={-40}
        fontSize={14}
        fontFamily="Inter, sans-serif"
        fontStyle="500"
        fill="#57534e"
        listening={false}
      />
      <Line
        points={[0, -18, layout.width, -18]}
        stroke="#e7e5e4"
        strokeWidth={1}
        listening={false}
      />

      {layout.words.map((w) => {
        const active = activeWordId === `${label}:${w.id}`
        return (
          <Group key={w.id}>
            {active && (
              <Rect
                x={w.x - 2}
                y={w.y - 2}
                width={w.w + 4}
                height={w.h + 4}
                fill="#fde68a"
                opacity={0.85}
                cornerRadius={3}
                listening={false}
              />
            )}
            <Text
              text={w.text}
              x={w.x}
              y={w.y}
              fontSize={w.fontSize}
              fontFamily={stack}
              fontStyle={String(w.fontWeight)}
              letterSpacing={style.letterSpacing || 0}
              fill={w.isVerseNum ? '#a8a29e' : style.textColor}
              listening={interactive && !w.isVerseNum}
              onClick={(evt) => onWordClick?.(w, evt)}
              onTap={(evt) => onWordClick?.(w, evt)}
              onMouseEnter={(evt) => {
                if (!interactive || w.isVerseNum) return
                const container = evt.target.getStage()?.container()
                if (container) container.style.cursor = 'help'
              }}
              onMouseLeave={(evt) => {
                const container = evt.target.getStage()?.container()
                if (container) container.style.cursor = ''
              }}
            />
          </Group>
        )
      })}
    </Group>
  )
}

export default memo(ScriptureColumn)
