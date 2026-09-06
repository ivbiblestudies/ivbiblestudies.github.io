import { memo, useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { Group, Text, Line } from 'react-konva'
import { fontStack } from '../../lib/textLayout'

const TILE_HEIGHT = 640

// Cache groups, not individual words: retain Konva's per-word hit colors while
// reusing painted text. Only visible tiles allocate image buffers.
const WordTile = memo(function WordTile({ words, top, style, visible, ratio, interactive, onClick, onHover, onLeave }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const node = ref.current
    node.clearCache()
    if (visible) node.cache({ pixelRatio: ratio, hitCanvasPixelRatio: 1, offset: 4 })
    return () => node.clearCache()
  }, [words, style, visible, ratio, interactive])
  return <Group ref={ref} name="scripture-tile" y={top} visible={visible} cacheRatio={ratio}>
    {words.map(w => <Text key={w.id} text={w.text} x={w.x} y={w.y - top}
      fontSize={w.fontSize} fontFamily={fontStack(style.fontFamily)} fontStyle={String(w.fontWeight)}
      letterSpacing={style.letterSpacing || 0} fill={w.isVerseNum ? '#a8a29e' : style.textColor}
      listening={!w.isVerseNum} perfectDrawEnabled={false}
      onClick={e => onClick(w, e)} onTap={e => onClick(w, e)}
      onMouseEnter={e => onHover(w, e)} onMouseLeave={onLeave} />)}
  </Group>
})

function ScriptureColumn({ layout, style, x, y, label, reference,
  onWordClick, onWordHover, selectingWords = false, interactive = true, viewport, bounds }) {
  const handlers = useRef(null)
  handlers.current = { onWordClick, onWordHover, selectingWords }
  const click = useCallback((w, e) => handlers.current.onWordClick?.(w, e), [])
  const hover = useCallback((w, e) => {
    handlers.current.onWordHover?.(w)
    const container = e.target.getStage()?.container()
    if (container) container.style.cursor = handlers.current.selectingWords ? 'text' : ''
  }, [])
  const leave = useCallback(e => {
    const container = e.target.getStage()?.container()
    if (container) container.style.cursor = ''
  }, [])
  const tiles = useMemo(() => {
    const rows = new Map()
    for (const word of layout.words) {
      const top = Math.floor(word.y / TILE_HEIGHT) * TILE_HEIGHT
      if (!rows.has(top)) rows.set(top, [])
      rows.get(top).push(word)
    }
    return [...rows].map(([top, words]) => ({ top, words }))
  }, [layout])
  const scale = viewport?.scale || 1
  const ratio = Math.min(3, Math.max(1, Math.ceil(scale * (window.devicePixelRatio || 1))))
  const viewTop = viewport ? -viewport.y / scale - y : -Infinity
  const viewBottom = viewport ? ((bounds?.height || 0) - viewport.y) / scale - y : Infinity
  const columnVisible = !viewport || ((x + layout.width) * scale + viewport.x >= -100 && x * scale + viewport.x <= (bounds?.width || 0) + 100)

  return <Group x={x} y={y} listening={interactive}>
    <Text text={(reference || '').toUpperCase()} x={0} y={-58} fontSize={11}
      fontFamily="Inter, sans-serif" fontStyle="600" letterSpacing={1.4} fill="#a8a29e" listening={false} />
    <Text text={label || ''} x={0} y={-40} fontSize={14} fontFamily="Inter, sans-serif"
      fontStyle="500" fill="#57534e" listening={false} />
    <Line points={[0, -18, layout.width, -18]} stroke="#e7e5e4" strokeWidth={1} listening={false} />
    {tiles.map(tile => <WordTile key={tile.top} {...tile} style={style} ratio={ratio} interactive={interactive}
      visible={columnVisible && tile.top + TILE_HEIGHT + style.fontSize * 2 >= viewTop - 160 && tile.top <= viewBottom + 160}
      onClick={click} onHover={hover} onLeave={leave} />)}
  </Group>
}

export default memo(ScriptureColumn)
