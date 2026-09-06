// Imperative escape hatch so the export dialog (rendered far from the canvas)
// can ask the Konva stage for a rendered image without prop-drilling refs.
let api = null

export const registerCanvasApi = (next) => {
  api = next
}

export const getCanvasApi = () => api
