/** Keep a margin around the viewport to avoid popping during movement. */
export function canvasSize(width, height) {
  const dimension = value => Number.isFinite(value) ? Math.max(1, Math.ceil(value)) : 1
  return { width: dimension(width), height: dimension(height) }
}

export function inViewport(x, y, width, height, viewport, bounds, margin = 100) {
  return (x + width) * viewport.scale + viewport.x >= -margin &&
    x * viewport.scale + viewport.x <= bounds.width + margin &&
    (y + height) * viewport.scale + viewport.y >= -margin &&
    y * viewport.scale + viewport.y <= bounds.height + margin
}
