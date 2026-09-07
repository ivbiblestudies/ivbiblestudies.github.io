export function polygonPoints(type, width, height) {
  return type === 'triangle'
    ? [width / 2, 0, width, height, 0, height]
    : [width / 2, 0, width, height / 2, width / 2, height, 0, height / 2]
}

export function shapeBounds(draft) {
  const width = Math.abs(draft.x - draft.startX)
  const height = Math.abs(draft.y - draft.startY)
  const side = Math.max(width, height)
  return {
    x: draft.type === 'circle' ? (draft.x < draft.startX ? draft.startX - side : draft.startX) : Math.min(draft.startX, draft.x),
    y: draft.type === 'circle' ? (draft.y < draft.startY ? draft.startY - side : draft.startY) : Math.min(draft.startY, draft.y),
    width: draft.type === 'circle' ? side : width,
    height: draft.type === 'circle' ? side : height,
  }
}
