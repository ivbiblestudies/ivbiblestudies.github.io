// Touch coordinates are relative to the canvas container.
export function pinchViewport(viewport, start, current) {
  if (start.distance <= 0) return viewport
  const scale = Math.max(0.15, Math.min(4, viewport.scale * current.distance / start.distance))
  return {
    x: current.x - (start.x - viewport.x) * scale / viewport.scale,
    y: current.y - (start.y - viewport.y) * scale / viewport.scale,
    scale,
  }
}
