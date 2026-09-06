# Inductive Bible Study Canvas

"Figma for inductive Bible study": a fully client-side canvas for manuscript
work. Load a passage, mark it up on an infinite board, work the four movements of
inductive study in the sidebar, and hand the whole thing to someone else as a
link. No application backend or account; drafts save in your browser.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static bundle in dist/
npm run preview  # serve the built bundle
```

## What it does

**Split workspace.** 70% infinite canvas over a dot grid, 30% structured sidebar.
Scroll to zoom at the cursor, shift-scroll to pan, hold space to drag the board.

**The scripture layer.** Fetch any passage in modern translations (NIV, ESV,
NASB, NKJV, NLT, AMP, MSG, RSV) or public-domain ones (WEB, KJV, ASV, YLT and
more), or paste your own text. Flip on *Parallel* to set two translations side by
side. Every word is laid out and measured individually for phrase selection and annotations. Typography
is fully adjustable: family, size, line height, letter and word spacing, verse
spacing, column width.

**Annotation.** A docked rail on the left of the canvas: select, pan, box,
highlighter, arrow, text and sticky note, plus tag and color pickers. Anything you
create can be tagged **Observation** (teal), **Question** (violet) or
**Application** (orange).

**Sticky notes.** Each note takes an optional **title** — set it on the canvas
(double-click, or *Edit* on the selection bar) or in the sidebar card; it renders
in bold above the body and carries through to the PDF export. Select a note and
drag any **corner** to resize it: the opposite corner stays pinned, the type
scales with the box the way a text frame does in a drawing tool, and a note can
never be squeezed smaller than the text inside it.

**Two ways to link a note to its verse.** An **arrow** drawn from the note to the
text, or a **highlight** laid over the verse itself in the note's color, tracing
it line by line with a hairline tether so you can still tell which note it belongs
to. Switch either way per note from the selection bar.

To link a specific phrase, select a sticky note and choose **Add highlight**.
Click the first and last word within one verse; the preview follows your cursor
and the saved highlight covers only those words. For one word, click it and choose
**Save selection**. **Cancel** or Escape keeps the previous connection. Word
selections follow text reflow and are preserved in shared studies and undo/redo.
Use **Add highlight** again to connect more phrases or repetitions to the same
note. The first phrase replaces the automatic whole-verse connection; subsequent
phrases keep earlier selections. Hover a highlight to outline its note, or hover
the note to emphasize all its highlights and connecting lines.

**Your own tags.** Beyond Observation, Question and Application, a study can define
its own — *Announcement*, *Context*, *Cross-reference* — with their own colors, from
the tag flyout on the rail. They behave like the built-ins everywhere: filter chips,
note colors, the PDF. Notes wearing a custom tag collect under **Other notes** in
the sidebar, since they don't belong to one of the four movements. Custom tags live
in the document, so they travel in the share link.

**Tag filtering.** Clicking a tag chip in the sidebar shows *only* that tag, on
the canvas and in the panels at once; clicking it again returns to everything, and
⌘/Ctrl/Shift-click builds a multi-tag view.

**Quick entry.** Paste verse-keyed notes into the Observations, Questions or
Application panel:

```
v3: Repeated word "grace"
vv5-7 — contrast between flesh and spirit
12, 14: who is "he" here?
```

Each line becomes a tagged sticky note placed beside its verse on the canvas,
linked back to the text. Notes alternate between the left and right margins and
fan outward into extra columns before they are ever pushed downward, so a long
list stays level with the passage instead of trailing off below it. Ranges, comma lists, `v`/`vv`/`verse`
prefixes and bullet markers all parse; a line with no verse number still becomes a
note, just unanchored.

**Study prompts.** Each panel carries a library of classic inductive questions —
*Are there repeated words? Why is this detail included? Is there a promise to
claim?* — that drop into your writing area.

**Export.** High-resolution PNG of the canvas, a single-page PDF of the same, or a
multi-page PDF combining the canvas map with every note and panel as selectable
text. All rendered in the browser.

**Saving and sharing.** Editing saves the current draft in localStorage and keeps
the address bar at the base URL. Refreshing restores that draft. **Share → Copy
link** creates a native gzip + Base64URL snapshot (`#s=gz1.…`) using the browser's
CompressionStream API, containing the scripture, annotations, tags, panel
prose and view settings, then requests a free short link from zip1.io. Aliases use
the study title with punctuation removed and spaces replaced by dashes, limited
to 12 characters. A 409 conflict retries with random numeric suffixes, shortening
the title portion to keep that limit (up to 10 attempts). The shortener
stores the full snapshot link, including notes; anyone with the link can open it.
Local preview links and service failures
fall back to the full `#s=...` link. Opening a shared link (including legacy `?s=`
links) loads and saves its snapshot locally, then clears the address to the base
URL. Older LZ-String links remain readable through a lazily loaded legacy decoder.
New links require browsers supporting CompressionStream/DecompressionStream.
Short links require internet access to redirect. Clear browser site data to
remove the local draft; copying the base URL alone does not share your study.

### Keyboard

For larger studies, scripture is cached in visible canvas tiles; offscreen tiles
release their buffers. Panning updates at most once per animation frame, and
draft writes wait for 400 ms of inactivity (flushing when the page is hidden or
left). Note shadows appear only on selected or hovered notes. Exports still render
the full passage at export resolution. These optimizations apply across browsers,
including Firefox.

| | |
|---|---|
| `V` `H` `B` `G` `A` `T` `N` | select, pan, box, highlighter, arrow, text, note |
| double-click a note | edit its title and body |
| drag a note's corner | resize it |
| scroll | zoom to cursor |
| `Shift` + scroll | pan |
| `Space` + drag | pan from any tool |
| `⌘/Ctrl+Z` / `⇧⌘Z` | undo / redo |
| `Delete` | remove selection |
| `Esc` | deselect |

## Passage sources

Both providers are keyless and CORS-enabled, which is what lets this stay a static
page with nothing to hide a secret in.

| Source | Translations |
|---|---|
| [bible-api.com](https://bible-api.com) | public domain: WEB, KJV, ASV, BBE, YLT, DRA, OEB, Vulgate, Almeida |
| [bolls.life](https://bolls.life) | modern: NIV, ESV, NASB, NKJV, NLT, AMP, MSG, RSV |

Modern translations are under copyright and are fetched from a third-party public
API for personal study; the app neither hosts nor redistributes them. If you'd
rather work from your own licensed copy, every column has a **Paste text** mode
that keeps the text entirely on your machine.

Reference parsing for the bolls source is local (`src/data/books.js`) and handles
`John 3`, `John 3:16`, `John 3:16-18`, `John 3-4`, `John 3:16-4:2`, `1 Cor 13`,
`Ps 23`, and common abbreviations.

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds and publishes `dist/` on every push to
`main` — enable Pages with source *GitHub Actions* and it works as-is. Vite is
configured with `base: './'`, so the bundle runs from any sub-path, and study
state lives in the hash fragment, which Pages never sees.

## How it's built

React 19 · Vite · Tailwind CSS v4 · react-konva · zustand · lz-string · jsPDF.

```
src/
  App.jsx                 layout, shared-link hydration, local saving, shortcuts
  store.js                the document model, history, quick-entry pipeline
  components/
    canvas/               Konva stage, scripture columns, notes, shapes, overlays
    sidebar/              accordion panels, quick entry, prompts, note cards
    SettingsModal · ExportModal · ShareModal · TopBar · ui.jsx · icons.jsx
  lib/
    textLayout.js         per-word measuring and line breaking
    quickEntry.js         verse-reference parser for pasted notes
    noteMetrics.js        sticky-note wrapping, sizing and resize floors
    bibleApi.js           provider router + bible-api.com client + paste parser
    bolls.js              bolls.life client for modern translations
    urlState.js           native gzip/Base64URL, legacy decoding, local drafts
    exporters.js          PNG and PDF output
  data/
    books.js              canonical book table and reference parser
    prompts.js · tags.js · translations.js
```

Two design decisions worth knowing about:

**Words are laid out by hand.** Konva can wrap a paragraph, but then no word has
an identity — you couldn't select a phrase or point an arrow at verse 3.
So `textLayout.js` measures each word with a 2D context using the exact font
string Konva will render with, and emits positioned words plus per-verse geometry
(including one rect per rendered line, which is what a highlight traces).
Because that measuring happens in JS while the painting happens later, layout is
re-run once `document.fonts` reports the real faces have loaded (`useFonts.js`) —
otherwise words are spaced for the fallback font and run into each other.

**Section headings are stripped heuristically.** bolls.life marks both section
headings and poetic line breaks with `<br/>`. A leading segment is dropped only
when it looks like a heading — short, capitalized, no sentence punctuation — so
poetry keeps its lines (`src/lib/bolls.js`).
