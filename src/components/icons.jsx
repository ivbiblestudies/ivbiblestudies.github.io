const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const IconCursor = (p) => (
  <svg {...base} {...p}>
    <path d="M5 3l6.5 16 2.3-6.4L20 10.3z" />
  </svg>
)

export const IconHand = (p) => (
  <svg {...base} {...p}>
    <path d="M9 11V5.5a1.5 1.5 0 013 0V11m0-.5V4.5a1.5 1.5 0 013 0V11m0-.5a1.5 1.5 0 013 0V15a6 6 0 01-6 6h-1a6 6 0 01-6-6v-4a1.5 1.5 0 013 0" />
  </svg>
)

export const IconBox = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
  </svg>
)

export const IconHighlighter = (p) => (
  <svg {...base} {...p}>
    <path d="M14 4l6 6-8.5 8.5H6l-1.5-3z" />
    <path d="M3 21h18" />
  </svg>
)

export const IconArrow = (p) => (
  <svg {...base} {...p}>
    <path d="M5 19L19 5" />
    <path d="M11 5h8v8" />
  </svg>
)

export const IconText = (p) => (
  <svg {...base} {...p}>
    <path d="M5 6V4.5h14V6M12 4.5V20M8.5 20h7" />
  </svg>
)

export const IconNote = (p) => (
  <svg {...base} {...p}>
    <path d="M5 4.5h14a.5.5 0 01.5.5v9.5L14 20H5a.5.5 0 01-.5-.5V5a.5.5 0 01.5-.5z" />
    <path d="M19.5 14.5H14V20" />
  </svg>
)

export const IconZoomIn = (p) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M11 8.5v5M8.5 11h5M20 20l-4.4-4.4" />
  </svg>
)

export const IconZoomOut = (p) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M8.5 11h5M20 20l-4.4-4.4" />
  </svg>
)

export const IconFit = (p) => (
  <svg {...base} {...p}>
    <path d="M4 9V5.5a1.5 1.5 0 011.5-1.5H9M15 4h3.5A1.5 1.5 0 0120 5.5V9M20 15v3.5a1.5 1.5 0 01-1.5 1.5H15M9 20H5.5A1.5 1.5 0 014 18.5V15" />
  </svg>
)

export const IconUndo = (p) => (
  <svg {...base} {...p}>
    <path d="M4 9h11a5 5 0 010 10h-5" />
    <path d="M8 5L4 9l4 4" />
  </svg>
)

export const IconRedo = (p) => (
  <svg {...base} {...p}>
    <path d="M20 9H9a5 5 0 000 10h5" />
    <path d="M16 5l4 4-4 4" />
  </svg>
)

export const IconSettings = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M18 6l-1.5 1.5M7.5 16.5L6 18M18 18l-1.5-1.5M7.5 7.5L6 6" />
  </svg>
)

export const IconExport = (p) => (
  <svg {...base} {...p}>
    <path d="M12 15V4M8.5 7.5L12 4l3.5 3.5" />
    <path d="M4.5 14v4.5A1.5 1.5 0 006 20h12a1.5 1.5 0 001.5-1.5V14" />
  </svg>
)

export const IconLink = (p) => (
  <svg {...base} {...p}>
    <path d="M10.5 13.5a4 4 0 006 .5l2-2a4 4 0 00-5.7-5.7l-1.1 1.1" />
    <path d="M13.5 10.5a4 4 0 00-6-.5l-2 2a4 4 0 005.7 5.7l1.1-1.1" />
  </svg>
)

export const IconTrash = (p) => (
  <svg {...base} {...p}>
    <path d="M4.5 6.5h15M9.5 6.5V5a1 1 0 011-1h3a1 1 0 011 1v1.5M6.5 6.5l.8 12a1.5 1.5 0 001.5 1.4h6.4a1.5 1.5 0 001.5-1.4l.8-12" />
  </svg>
)

export const IconChevron = (p) => (
  <svg {...base} {...p}>
    <path d="M9 6l6 6-6 6" />
  </svg>
)

export const IconPlus = (p) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconSparkle = (p) => (
  <svg {...base} {...p}>
    <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" />
    <path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
  </svg>
)
