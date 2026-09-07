export function subtractWordRanges(range, selections) {
  let pieces = [range]
  for (const selection of selections) {
    if ((range.column ?? 0) !== (selection.column ?? 0) || range.verse !== selection.verse ||
      (range.verseIndex != null && selection.verseIndex != null && range.verseIndex !== selection.verseIndex)) continue
    const low = Math.min(selection.startWord, selection.endWord)
    const high = Math.max(selection.startWord, selection.endWord)
    pieces = pieces.flatMap(piece => {
      const start = Math.min(piece.startWord, piece.endWord)
      const end = Math.max(piece.startWord, piece.endWord)
      if (high < start || low > end) return [piece]
      return [
        ...(start < low ? [{ ...piece, startWord: start, endWord: low - 1 }] : []),
        ...(end > high ? [{ ...piece, startWord: high + 1, endWord: end }] : []),
      ]
    })
  }
  return pieces
}

export function selectionToolbarPosition(anchor, viewport, toolbar) {
  const margin = 12, gap = 16
  const left = Math.max(margin, Math.min((anchor.left + anchor.right - toolbar.width) / 2,
    viewport.width - toolbar.width - margin))
  const below = anchor.bottom + gap
  const top = below + toolbar.height <= viewport.height - margin
    ? below : anchor.top - toolbar.height - 28
  return { left, top: Math.max(margin, Math.min(top, viewport.height - toolbar.height - margin)) }
}
