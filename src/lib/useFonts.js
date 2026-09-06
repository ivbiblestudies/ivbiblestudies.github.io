import { useEffect, useState } from 'react'

/**
 * Everything on the canvas is measured by hand with a 2D context and then
 * painted by Konva. If the measuring happens before a webfont has arrived, the
 * numbers describe the fallback font while the paint uses the real one — words
 * are then laid out too tightly and run into each other.
 *
 * This returns a counter that ticks once the requested faces are loaded. Feed it
 * into the layout's dependencies and everything re-measures against the font
 * that will actually be drawn.
 */
export function useFontEpoch(families) {
  const key = families.filter(Boolean).join('|')
  const [epoch, setEpoch] = useState(0)

  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts) return
    let alive = true

    const load = async () => {
      try {
        await Promise.all(
          key
            .split('|')
            .flatMap((family) => [
              document.fonts.load(`400 19px "${family}"`),
              document.fonts.load(`600 19px "${family}"`),
            ]),
        )
        await document.fonts.ready
      } catch {
        // A font that refuses to load just means we keep the fallback metrics.
      }
      if (alive) setEpoch((e) => e + 1)
    }

    load()
    return () => {
      alive = false
    }
  }, [key])

  return epoch
}
