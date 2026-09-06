// Shared connection behavior for persisted ranges and canvas hover feedback.
export function appendHighlight(connectors, next) {
  const duplicate = connectors.some((c) => c.noteId === next.noteId &&
    (c.column ?? 0) === (next.column ?? 0) && c.verse === next.verse &&
    c.verseIndex === next.verseIndex && c.startWord === next.startWord && c.endWord === next.endWord)
  if (duplicate) return connectors
  return [...connectors.filter((c) => c.noteId !== next.noteId ||
    (c.startWord != null && c.endWord != null)), next]
}

export function highlightNotesAt(connectors, point) {
  return [...new Set(connectors.filter((c) => c.style === 'highlight' &&
    c.rects.some((r) => point.x >= r.x && point.x <= r.x + r.width &&
      point.y >= r.y && point.y <= r.y + r.height)).map((c) => c.noteId))]
}
