import { create } from 'zustand'
import { uid } from './lib/id'
import { DEFAULT_STYLE } from './lib/textLayout'
import { readLayout } from './lib/layoutRegistry'
import { NOTE_WIDTH, noteHeight } from './lib/noteMetrics'
import { tagIds, TAG_PALETTE, softenHex } from './data/tags'
import { parseQuickEntry } from './lib/quickEntry'
import { fetchPassage, parsePastedText, BibleApiError } from './lib/bibleApi'
import { SCHEMA_VERSION } from './lib/urlState'

export const PANELS = ['observations', 'questions', 'summary', 'application']

// Which tag a panel's notes get by default.
export const PANEL_TAG = {
  observations: 'observation',
  questions: 'question',
  summary: 'none',
  application: 'application',
}

export const PANEL_LABEL = {
  observations: 'Observations',
  questions: 'Questions',
  summary: 'Summary',
  application: 'Application',
}

const SAMPLE_VERSES = [
  { verse: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
  { verse: 2, text: 'The same was in the beginning with God.' },
  { verse: 3, text: 'All things were made through him. Without him, nothing was made that has been made.' },
  { verse: 4, text: 'In him was life, and the life was the light of men.' },
  { verse: 5, text: 'The light shines in the darkness, and the darkness hasn’t overcome it.' },
]

/** The serializable document — this, and only this, goes into the URL. */
export const emptyDoc = () => ({
  v: SCHEMA_VERSION,
  title: 'Untitled study',
  scripture: {
    reference: 'John 1:1-5',
    parallel: false,
    primary: {
      mode: 'api',
      translation: 'web',
      loadedReference: 'John 1:1-5',
      loadedTranslation: 'World English Bible (sample)',
      customText: '',
      verses: SAMPLE_VERSES,
    },
    secondary: {
      mode: 'api',
      translation: 'ESV',
      loadedReference: '',
      loadedTranslation: '',
      customText: '',
      verses: [],
    },
  },
  style: { ...DEFAULT_STYLE },
  layer: { x: 160, y: 140, gap: 72 },
  shapes: [],
  notes: [],
  connectors: [],
  // Study-defined tags beyond the three inductive ones.
  tags: [],
  panels: { observations: '', questions: '', summary: '', application: '' },
  ui: {
    tool: 'select',
    color: '#0f766e',
    noteTag: 'observation',
    // How quick entry ties a note to its verse: a connector arrow, or a
    // highlight laid over the verse in the note's color.
    connectorStyle: 'arrow',
    strokeWidth: 3,
    openPanels: ['observations'],
    tagFilter: ['observation', 'question', 'application', 'none'],
    viewport: { x: 0, y: 0, scale: 1 },
    showGrid: true,
    showStrongs: true,
  },
})

/** Merge a decoded URL doc over defaults so old links keep working. */
export function hydrateDoc(raw) {
  const base = emptyDoc()
  if (!raw || typeof raw !== 'object') return base
  const slot = (s, fallback) => ({ ...fallback, ...(s || {}) })
  return {
    ...base,
    ...raw,
    v: SCHEMA_VERSION,
    scripture: {
      ...base.scripture,
      ...(raw.scripture || {}),
      primary: slot(raw.scripture?.primary, base.scripture.primary),
      secondary: slot(raw.scripture?.secondary, base.scripture.secondary),
    },
    style: { ...base.style, ...(raw.style || {}) },
    layer: { ...base.layer, ...(raw.layer || {}) },
    shapes: Array.isArray(raw.shapes) ? raw.shapes : [],
    notes: Array.isArray(raw.notes) ? raw.notes : [],
    connectors: Array.isArray(raw.connectors) ? raw.connectors : [],
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    panels: { ...base.panels, ...(raw.panels || {}) },
    ui: {
      ...base.ui,
      ...(raw.ui || {}),
      viewport: { ...base.ui.viewport, ...(raw.ui?.viewport || {}) },
      tagFilter: Array.isArray(raw.ui?.tagFilter)
        ? raw.ui.tagFilter
        : tagIds(Array.isArray(raw.tags) ? raw.tags : []),
      openPanels: Array.isArray(raw.ui?.openPanels) ? raw.ui.openPanels : base.ui.openPanels,
    },
  }
}

const HISTORY_LIMIT = 60

// Creating something the tag filter is currently hiding would drop it into the
// void, so making it always un-hides its tag.
const withTagVisible = (ui, tag) =>
  ui.tagFilter.includes(tag || 'none')
    ? ui
    : { ...ui, tagFilter: [...ui.tagFilter, tag || 'none'] }

// Fields the document owns; everything else on the store is transient.
const DOC_KEYS = Object.keys(emptyDoc())
export const pickDoc = (state) => {
  const doc = {}
  for (const k of DOC_KEYS) doc[k] = state[k]
  return doc
}

export const useStudy = create((set, get) => {
  /**
   * Apply a patch to the document.
   * @param {(state)=>object} producer returns the changed slice
   * @param {{history?:boolean}} opts history:false for high-frequency updates
   *   (dragging, panning) that should not each become an undo step
   */
  const commit = (producer, opts = {}) =>
    set((state) => {
      const patch = producer(state)
      if (!patch) return {}
      if (opts.history === false) return patch
      return {
        ...patch,
        past: [...state.past, pickDoc(state)].slice(-HISTORY_LIMIT),
        future: [],
      }
    })

  return {
    ...emptyDoc(),

    // --- transient -----------------------------------------------------
    past: [],
    future: [],
    selectedId: null,
    editingId: null,
    loading: null, // 'primary' | 'secondary' | null
    error: null,
    notice: null,
    strongs: null, // { word, headword, entries, screenX, screenY }
    settingsOpen: false,
    exportOpen: false,
    shareOpen: false,
    sharedLoad: false,

    // --- document lifecycle --------------------------------------------
    loadDoc: (doc, { shared = false } = {}) =>
      set({ ...hydrateDoc(doc), past: [], future: [], selectedId: null, sharedLoad: shared }),

    resetDoc: () => set({ ...emptyDoc(), past: [], future: [], selectedId: null }),

    undo: () =>
      set((state) => {
        if (!state.past.length) return {}
        const previous = state.past[state.past.length - 1]
        return {
          ...previous,
          past: state.past.slice(0, -1),
          future: [pickDoc(state), ...state.future].slice(0, HISTORY_LIMIT),
          selectedId: null,
          editingId: null,
        }
      }),

    redo: () =>
      set((state) => {
        if (!state.future.length) return {}
        const next = state.future[0]
        return {
          ...next,
          past: [...state.past, pickDoc(state)].slice(-HISTORY_LIMIT),
          future: state.future.slice(1),
          selectedId: null,
          editingId: null,
        }
      }),

    // --- chrome ---------------------------------------------------------
    setTitle: (title) => commit(() => ({ title })),
    setUI: (patch, opts) => commit((s) => ({ ui: { ...s.ui, ...patch } }), opts),
    setTool: (tool) => commit((s) => ({ ui: { ...s.ui, tool } }), { history: false }),
    setColor: (color) => commit((s) => ({ ui: { ...s.ui, color } }), { history: false }),
    // Panning or zooming detaches the Strong's popover from its word, so it goes.
    setViewport: (viewport) =>
      commit((s) => ({ ui: { ...s.ui, viewport }, strongs: null }), { history: false }),
    setSelected: (selectedId) => set({ selectedId, strongs: null }),
    setEditing: (editingId) => set({ editingId }),
    setStrongs: (strongs) => set({ strongs }),
    setNotice: (notice) => set({ notice }),
    setError: (error) => set({ error }),
    openSettings: (settingsOpen = true) => set({ settingsOpen, strongs: null }),
    openExport: (exportOpen = true) => set({ exportOpen }),
    openShare: (shareOpen = true) => set({ shareOpen }),

    togglePanel: (panel) =>
      commit((s) => ({
        ui: {
          ...s.ui,
          openPanels: s.ui.openPanels.includes(panel)
            ? s.ui.openPanels.filter((p) => p !== panel)
            : [...s.ui.openPanels, panel],
        },
      }), { history: false }),

    toggleTagFilter: (tag) =>
      commit((s) => {
        const on = s.ui.tagFilter.includes(tag)
        const next = on ? s.ui.tagFilter.filter((t) => t !== tag) : [...s.ui.tagFilter, tag]
        return { ui: { ...s.ui, tagFilter: next } }
      }, { history: false }),

    setTagFilter: (tagFilter) =>
      commit((s) => ({ ui: { ...s.ui, tagFilter } }), { history: false }),

    // --- scripture ------------------------------------------------------
    setReference: (reference) =>
      commit((s) => ({ scripture: { ...s.scripture, reference } }), { history: false }),

    toggleParallel: () =>
      commit((s) => ({ scripture: { ...s.scripture, parallel: !s.scripture.parallel } })),

    setSlot: (slot, patch) =>
      commit((s) => ({
        scripture: { ...s.scripture, [slot]: { ...s.scripture[slot], ...patch } },
      }), { history: false }),

    setStyle: (patch, opts) => commit((s) => ({ style: { ...s.style, ...patch } }), opts),

    setLayer: (patch, opts) => commit((s) => ({ layer: { ...s.layer, ...patch } }), opts),

    /** Load the current reference into a slot from bible-api.com. */
    loadPassage: async (slot) => {
      const { scripture } = get()
      const config = scripture[slot]
      set({ loading: slot, error: null })
      try {
        const result = await fetchPassage(scripture.reference, config.translation)
        commit((s) => ({
          scripture: {
            ...s.scripture,
            [slot]: {
              ...s.scripture[slot],
              mode: 'api',
              verses: result.verses,
              loadedReference: result.reference,
              loadedTranslation: result.translationName,
            },
          },
        }))
        set({ loading: null, notice: `Loaded ${result.reference} (${result.translationName}).` })
        return true
      } catch (err) {
        set({
          loading: null,
          error:
            err instanceof BibleApiError
              ? err.message
              : 'Something went wrong loading that passage.',
        })
        return false
      }
    },

    /** Use pasted text for a slot (for copyrighted translations). */
    applyCustomText: (slot, raw, label) => {
      const verses = parsePastedText(raw)
      if (!verses.length) {
        set({ error: 'Paste some verse text first.' })
        return false
      }
      commit((s) => ({
        scripture: {
          ...s.scripture,
          [slot]: {
            ...s.scripture[slot],
            mode: 'custom',
            customText: raw,
            verses,
            loadedReference: s.scripture.reference,
            loadedTranslation: label?.trim() || 'Custom text',
          },
        },
      }))
      set({ notice: `Loaded ${verses.length} verse${verses.length === 1 ? '' : 's'} of custom text.` })
      return true
    },

    // --- shapes ---------------------------------------------------------
    addShape: (shape) => {
      const id = shape.id || uid('s')
      commit((s) => ({
        shapes: [...s.shapes, { ...shape, id }],
        ui: withTagVisible(s.ui, shape.tag),
      }))
      return id
    },

    updateShape: (id, patch, opts) =>
      commit(
        (s) => ({ shapes: s.shapes.map((sh) => (sh.id === id ? { ...sh, ...patch } : sh)) }),
        opts,
      ),

    removeShape: (id) =>
      commit((s) => ({ shapes: s.shapes.filter((sh) => sh.id !== id) })),

    // --- notes ----------------------------------------------------------
    addNote: (note) => {
      const id = note.id || uid('n')
      commit((s) => ({
        notes: [
          ...s.notes,
          {
            id,
            title: '',
            text: '',
            tag: 'none',
            panel: null,
            verses: [],
            width: NOTE_WIDTH,
            x: 0,
            y: 0,
            ...note,
          },
        ],
        ui: withTagVisible(s.ui, note.tag),
      }))
      return id
    },

    updateNote: (id, patch, opts) =>
      commit(
        (s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)) }),
        opts,
      ),

    removeNote: (id) =>
      commit((s) => ({
        notes: s.notes.filter((n) => n.id !== id),
        connectors: s.connectors.filter((c) => c.noteId !== id),
      })),

    /** Create a study-specific tag and switch new annotations to it. */
    addTag: ({ label, hex }) => {
      const id = uid('t')
      const color = hex || TAG_PALETTE[get().tags.length % TAG_PALETTE.length]
      commit((s) => ({
        tags: [...s.tags, { id, label: String(label || 'Tag').trim() || 'Tag', hex: color }],
        ui: { ...s.ui, noteTag: id, tagFilter: [...s.ui.tagFilter, id] },
      }))
      return id
    },

    updateTag: (id, patch) =>
      commit((s) => ({
        tags: s.tags.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      })),

    /** Remove a tag; anything wearing it falls back to untagged. */
    removeTag: (id) =>
      commit((s) => ({
        tags: s.tags.filter((t) => t.id !== id),
        notes: s.notes.map((n) => (n.tag === id ? { ...n, tag: 'none' } : n)),
        shapes: s.shapes.map((sh) => (sh.tag === id ? { ...sh, tag: 'none' } : sh)),
        ui: {
          ...s.ui,
          noteTag: s.ui.noteTag === id ? 'observation' : s.ui.noteTag,
          tagFilter: s.ui.tagFilter.filter((t) => t !== id),
        },
      })),

    /** Switch a note's link to its verse between an arrow and a highlight. */
    setConnectorStyle: (noteId, style) =>
      commit((s) => ({
        connectors: s.connectors.map((c) =>
          c.noteId === noteId ? { ...c, style } : c,
        ),
      })),

    setPanelText: (panel, text) =>
      commit((s) => ({ panels: { ...s.panels, [panel]: text } }), { history: false }),

    appendPanelText: (panel, text) =>
      commit((s) => ({
        panels: {
          ...s.panels,
          [panel]: s.panels[panel] ? `${s.panels[panel].replace(/\s*$/, '')}\n${text}` : text,
        },
      })),

    /**
     * The quick-entry pipeline: parse pasted notes, drop a sticky note beside
     * each referenced verse, and link it back to the text.
     *
     * Notes alternate between the left and right margins and fan outward into
     * extra columns before they are ever pushed downward, so a long list of
     * observations stays level with the passage instead of trailing off below it.
     */
    submitQuickEntry: (panel, raw) => {
      const parsed = parseQuickEntry(raw)
      if (!parsed.length) return 0

      const state = get()
      const tag = PANEL_TAG[panel] || 'none'
      const { columns, origin, gap } = readLayout()
      const style = state.style
      const linkStyle = state.ui.connectorStyle || 'arrow'

      const columnCount = Math.max(1, columns.length)
      const textRight =
        origin.x + columnCount * style.columnWidth + (columnCount - 1) * gap
      const MARGIN = 72
      const COLUMN_STEP = NOTE_WIDTH + 26
      const MAX_COLUMNS = 3

      // Where a note sits for a given side and column index.
      const slotX = (side, col) =>
        side === 'right'
          ? textRight + MARGIN + col * COLUMN_STEP
          : origin.x - MARGIN - NOTE_WIDTH - col * COLUMN_STEP

      const primary = columns[0] || null

      // Existing notes in the margins, so nothing lands on top of them.
      const occupied = state.notes.map((n) => ({
        left: n.x,
        right: n.x + (n.width || NOTE_WIDTH),
        top: n.y,
        bottom: n.y + noteHeight(n),
      }))
      const collides = (x, y, h) =>
        occupied.some(
          (o) =>
            x < o.right + 16 &&
            x + NOTE_WIDTH > o.left - 16 &&
            y < o.bottom + 10 &&
            y + h > o.top - 10,
        )

      const newNotes = []
      const newConnectors = []
      const fallbackY = { left: origin.y, right: origin.y }
      let side = 'right'

      for (const item of parsed) {
        const box =
          item.verse != null && primary
            ? primary.verses.find((v) => v.verse === item.verse)
            : null

        const h = noteHeight({ text: item.text, width: NOTE_WIDTH })
        const preferredY = box ? origin.y + box.minY - 6 : fallbackY[side]

        // Fan outward first; only drop down once every column is taken.
        let x = slotX(side, 0)
        let y = preferredY
        let placed = false
        for (let col = 0; col < MAX_COLUMNS && !placed; col++) {
          const candidateX = slotX(side, col)
          if (!collides(candidateX, preferredY, h)) {
            x = candidateX
            y = preferredY
            placed = true
          }
        }
        if (!placed) {
          x = slotX(side, 0)
          y = preferredY
          let guard = 0
          while (guard++ < 400 && collides(x, y, h)) y += 12
        }

        occupied.push({ left: x, right: x + NOTE_WIDTH, top: y, bottom: y + h })
        fallbackY[side] = Math.max(fallbackY[side], y + h + 16)

        const id = uid('n')
        newNotes.push({
          id,
          title: '',
          text: item.text,
          tag,
          panel,
          verses: item.verses,
          x,
          y,
          width: NOTE_WIDTH,
        })

        if (box) {
          newConnectors.push({
            id: uid('c'),
            noteId: id,
            verse: item.verse,
            column: 0,
            style: linkStyle,
          })
        }

        side = side === 'right' ? 'left' : 'right'
      }

      commit((s) => ({
        notes: [...s.notes, ...newNotes],
        connectors: [...s.connectors, ...newConnectors],
        ui: withTagVisible(s.ui, tag),
      }))
      set({ notice: `Added ${newNotes.length} note${newNotes.length === 1 ? '' : 's'} to the canvas.` })
      return newNotes.length
    },

    /** Delete whatever is selected (note or shape). */
    deleteSelected: () => {
      const { selectedId } = get()
      if (!selectedId) return
      commit((s) => ({
        notes: s.notes.filter((n) => n.id !== selectedId),
        shapes: s.shapes.filter((sh) => sh.id !== selectedId),
        connectors: s.connectors.filter((c) => c.noteId !== selectedId),
      }))
      set({ selectedId: null, editingId: null })
    },
  }
})

/** Notes currently visible under the tag filter. */
export const visibleNotes = (state) =>
  state.notes.filter((n) => state.ui.tagFilter.includes(n.tag || 'none'))

export const visibleShapes = (state) =>
  state.shapes.filter((s) => !s.tag || state.ui.tagFilter.includes(s.tag))
