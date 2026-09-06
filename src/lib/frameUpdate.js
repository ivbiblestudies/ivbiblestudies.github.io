/** Coalesce input bursts without losing the final pointer position. */
export function frameUpdate(commit, schedule = requestAnimationFrame, cancel = cancelAnimationFrame) {
  let frame = null
  let latest
  const flush = () => {
    if (frame === null) return
    cancel(frame)
    frame = null
    commit(latest)
  }
  return {
    push(value) {
      latest = value
      if (frame === null) frame = schedule(flush)
    },
    flush,
    cancel() { if (frame !== null) cancel(frame); frame = null },
  }
}
