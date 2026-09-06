/** Keep a margin around the viewport to avoid popping during movement. */
export function inViewport(x, y, width, height, viewport, bounds, margin = 100) {
  return (x + width) * viewport.scale + viewport.x >= -margin &&
    x * viewport.scale + viewport.x <= bounds.width + margin &&
    (y + height) * viewport.scale + viewport.y >= -margin &&
    y * viewport.scale + viewport.y <= bounds.height + margin
}
