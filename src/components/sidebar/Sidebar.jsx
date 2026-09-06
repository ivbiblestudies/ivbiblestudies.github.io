import { useMemo } from 'react'
import { useStudy, PANELS, PANEL_LABEL, PANEL_TAG } from '../../store'
import { tagList, tagIds, resolveTag, tagOf } from '../../data/tags'
import { Textarea, Button, cx } from '../ui'
import { IconChevron, IconPlus } from '../icons'
import QuickEntry from './QuickEntry'
import PromptLibrary from './PromptLibrary'
import NoteCard from './NoteCard'

const PANEL_BLURB = {
  observations: 'What does the text actually say? Facts before meaning.',
  questions: 'What don’t you understand yet? Interrogate the text.',
  summary: 'Say the passage back in your own words.',
  application: 'So what? Where does this land in your life?',
}

// Quick entry drops sticky notes on the canvas; that only makes sense for the
// panels whose notes anchor to specific verses.
const QUICK_ENTRY_PANELS = new Set(['observations', 'questions', 'application'])

function TagFilterBar() {
  const tagFilter = useStudy((s) => s.ui.tagFilter)
  const toggleTagFilter = useStudy((s) => s.toggleTagFilter)
  const setTagFilter = useStudy((s) => s.setTagFilter)
  const notes = useStudy((s) => s.notes)
  const customTags = useStudy((s) => s.tags)

  const tags = tagList(customTags)
  const everyTag = tagIds(customTags)

  const counts = useMemo(() => {
    const c = {}
    for (const n of notes) c[n.tag || 'none'] = (c[n.tag || 'none'] || 0) + 1
    return c
  }, [notes])

  const all = everyTag.every((id) => tagFilter.includes(id))

  // Clicking a tag shows that tag alone; clicking the soloed tag again returns
  // to everything. Hold ⌘/Ctrl/Shift to build a multi-tag view.
  const pick = (id, event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey) {
      if (tagFilter.length === 1 && tagFilter[0] === id) return
      toggleTagFilter(id)
      return
    }
    const soloed = tagFilter.length === 1 && tagFilter[0] === id
    setTagFilter(soloed ? everyTag : [id])
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-stone-200 bg-stone-50/80 px-4 py-2.5">
      <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.09em] text-stone-400">
        Show
      </span>
      <button
        type="button"
        onClick={() => setTagFilter(everyTag)}
        title="Show every tag"
        className={cx(
          'rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
          all ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-200/70',
        )}
      >
        All
      </button>
      {tags.map((t) => {
        const id = t.id
        const on = tagFilter.includes(id)
        const solo = tagFilter.length === 1 && on
        return (
          <button
            key={id}
            type="button"
            onClick={(e) => pick(id, e)}
            aria-pressed={on}
            title={
              solo
                ? `Showing only ${t.label.toLowerCase()}s — click to show all`
                : `Show only ${t.label.toLowerCase()}s  ·  ⌘-click to add`
            }
            className={cx(
              'flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors',
              solo
                ? 'border-transparent text-stone-900 shadow-sm'
                : on
                  ? 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  : 'border-transparent text-stone-400 hover:bg-stone-200/60 hover:text-stone-600',
            )}
            style={solo ? { background: t.soft } : undefined}
          >
            <span
              className={cx('h-2 w-2 rounded-full', !on && 'opacity-30')}
              style={{ background: t.hex }}
            />
            {t.label}
            <span className="font-mono text-[10px] text-stone-400">{counts[id] || 0}</span>
          </button>
        )
      })}
    </div>
  )
}

function Panel({ panel }) {
  const open = useStudy((s) => s.ui.openPanels.includes(panel))
  const togglePanel = useStudy((s) => s.togglePanel)
  const text = useStudy((s) => s.panels[panel])
  const setPanelText = useStudy((s) => s.setPanelText)
  const appendPanelText = useStudy((s) => s.appendPanelText)
  const tagFilter = useStudy((s) => s.ui.tagFilter)
  const notes = useStudy((s) => s.notes)
  const addNote = useStudy((s) => s.addNote)
  const setSelected = useStudy((s) => s.setSelected)

  const tag = tagOf(PANEL_TAG[panel])
  const panelNotes = notes.filter(
    (n) => n.panel === panel && tagFilter.includes(n.tag || 'none'),
  )
  const hiddenCount = notes.filter(
    (n) => n.panel === panel && !tagFilter.includes(n.tag || 'none'),
  ).length

  const addBlankNote = () => {
    // Drop it in open space to the right of the manuscript.
    const spread = panelNotes.length * 14
    const id = addNote({
      panel,
      tag: PANEL_TAG[panel],
      text: '',
      x: 880 + spread,
      y: 160 + spread,
    })
    setSelected(id)
  }

  return (
    <section className="border-b border-stone-200">
      <h3>
        <button
          type="button"
          onClick={() => togglePanel(panel)}
          aria-expanded={open}
          className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-stone-50"
        >
          <IconChevron
            width={14}
            height={14}
            className={cx(
              'shrink-0 text-stone-400 transition-transform',
              open && 'rotate-90',
            )}
          />
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: tag.hex }} />
          <span className="text-sm font-semibold tracking-tight text-stone-900">
            {PANEL_LABEL[panel]}
          </span>
          <span className="ml-auto font-mono text-[11px] text-stone-400">
            {panelNotes.length || ''}
          </span>
        </button>
      </h3>

      {open && (
        <div className="space-y-3 px-4 pb-4">
          <div className="flex items-start justify-between gap-2">
            <p className="max-w-[70%] text-[11px] leading-snug text-stone-500">
              {PANEL_BLURB[panel]}
            </p>
            <PromptLibrary
              panel={panel}
              onPick={(prompt) => appendPanelText(panel, `${prompt}\n`)}
            />
          </div>

          {QUICK_ENTRY_PANELS.has(panel) && <QuickEntry panel={panel} />}

          <div className="space-y-1.5">
            {panelNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}

            {panelNotes.length === 0 && hiddenCount === 0 && (
              <p className="rounded-lg border border-dashed border-stone-200 px-3 py-4 text-center text-xs text-stone-400">
                No {PANEL_LABEL[panel].toLowerCase()} yet.
              </p>
            )}
            {hiddenCount > 0 && (
              <p className="px-1 text-[11px] text-stone-400">
                {hiddenCount} note{hiddenCount === 1 ? '' : 's'} hidden by the tag filter.
              </p>
            )}

            <Button size="sm" variant="ghost" onClick={addBlankNote} className="w-full justify-start">
              <IconPlus width={14} height={14} /> Add note
            </Button>
          </div>

          <div>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">
              Notes &amp; prose
            </div>
            <Textarea
              rows={5}
              value={text}
              onChange={(e) => setPanelText(panel, e.target.value)}
              placeholder={
                panel === 'summary'
                  ? 'Summarize the passage in a sentence or two…'
                  : 'Longer thinking that doesn’t belong on a sticky note…'
              }
              className="text-[13px]"
            />
          </div>
        </div>
      )}
    </section>
  )
}

/**
 * Notes tagged with a study's own tag ("Announcement", "Context") don't belong
 * to one of the four inductive panels, so they collect here rather than
 * disappearing from the sidebar.
 */
function LooseNotes() {
  const notes = useStudy((s) => s.notes)
  const tagFilter = useStudy((s) => s.ui.tagFilter)
  const loose = notes.filter((n) => !n.panel && tagFilter.includes(n.tag || 'none'))
  if (!loose.length) return null

  return (
    <section className="border-b border-stone-200 px-4 py-3">
      <h3 className="mb-2 text-sm font-semibold tracking-tight text-stone-900">
        Other notes
      </h3>
      <p className="mb-2 text-[11px] leading-snug text-stone-500">
        Notes on the canvas that aren’t filed under one of the four movements.
      </p>
      <div className="space-y-1.5">
        {loose.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    </section>
  )
}

export default function Sidebar() {
  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-l border-stone-200 bg-white">
      <div className="border-b border-stone-200 px-4 py-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.09em] text-stone-400">
          Manuscript study
        </div>
        <p className="mt-0.5 text-xs leading-snug text-stone-500">
          Observe, question, summarize, apply — the four movements of inductive study.
        </p>
      </div>

      <TagFilterBar />

      <div className="min-h-0 flex-1 overflow-y-auto scroll-slim">
        {PANELS.map((panel) => (
          <Panel key={panel} panel={panel} />
        ))}

        <LooseNotes />

        <div className="px-4 py-6 text-[11px] leading-relaxed text-stone-400">
          Everything here — canvas, notes, tags and settings — lives in the URL.
          Copy the share link to hand the whole study to someone else.
        </div>
      </div>
    </aside>
  )
}
