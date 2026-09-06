// The canvas is the only place that knows the pixel geometry of the passage
// (it does the word measuring). The store needs that geometry when the quick
// entry parser drops sticky notes "next to verse 3". Rather than push derived
// pixel data into persisted state, the canvas publishes its latest layout here
// and the store reads it on demand.

let current = { columns: [], origin: { x: 0, y: 0 }, gap: 0 }

export function publishLayout(next) {
  current = next
}

export function readLayout() {
  return current
}
