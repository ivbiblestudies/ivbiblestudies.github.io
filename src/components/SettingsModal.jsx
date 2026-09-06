import { useState } from 'react'
import { useStudy } from '../store'
import { TRANSLATIONS, TRANSLATION_GROUPS, findTranslation } from '../data/translations'
import { Modal, Button, Field, Input, Select, Textarea, Range, Toggle, Segmented, Divider, cx } from './ui'

const FONTS = [
  { value: 'Literata', label: 'Literata — modern serif' },
  { value: 'EB Garamond', label: 'EB Garamond — classic serif' },
  { value: 'Spectral', label: 'Spectral — literary serif' },
  { value: 'Georgia', label: 'Georgia — system serif' },
  { value: 'Inter', label: 'Inter — grotesque sans' },
  { value: 'IBM Plex Mono', label: 'IBM Plex Mono — monospace' },
]

function SlotEditor({ slot, title, description }) {
  const scripture = useStudy((s) => s.scripture)
  const loading = useStudy((s) => s.loading)
  const setSlot = useStudy((s) => s.setSlot)
  const loadPassage = useStudy((s) => s.loadPassage)
  const applyCustomText = useStudy((s) => s.applyCustomText)

  const config = scripture[slot]
  const [label, setLabel] = useState(config.loadedTranslation || '')

  return (
    <div className="rounded-xl border border-stone-200 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
          <p className="text-xs text-stone-500">{description}</p>
        </div>
        <Segmented
          value={config.mode}
          onChange={(mode) => setSlot(slot, { mode })}
          options={[
            { value: 'api', label: 'Public domain' },
            { value: 'custom', label: 'Paste text' },
          ]}
        />
      </div>

      {config.mode === 'api' ? (
        <>
        <div className="flex items-end gap-2">
          <Field label="Translation" className="flex-1">
            <Select
              value={config.translation}
              onChange={(e) => setSlot(slot, { translation: e.target.value })}
            >
              {TRANSLATION_GROUPS.map((group) => (
                <optgroup key={group} label={group}>
                  {TRANSLATIONS.filter((t) => t.group === group).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.short})
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </Field>
          <Button
            variant="primary"
            onClick={() => loadPassage(slot)}
            disabled={loading === slot}
          >
            {loading === slot ? 'Loading…' : 'Fetch passage'}
          </Button>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-stone-500">
          {findTranslation(config.translation)?.source === 'bolls'
            ? 'Modern translations are fetched from bolls.life, a keyless public API. They remain under copyright — use “Paste text” if you would rather supply your own licensed copy.'
            : 'Public-domain text from bible-api.com.'}
        </p>
        </>
      ) : (
        <div className="space-y-2">
          <Field
            label="Paste the text"
            hint="Numbered lines, or one flowing block with verse numbers"
          >
            <Textarea
              rows={6}
              value={config.customText}
              onChange={(e) => setSlot(slot, { customText: e.target.value })}
              placeholder={'1 Paul, a servant of Christ Jesus…\n2 which he promised beforehand…'}
              className="font-mono text-xs"
            />
          </Field>
          <div className="flex items-end gap-2">
            <Field label="Label it" className="flex-1" hint="Shown above the column">
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="ESV, NIV, my own translation…"
              />
            </Field>
            <Button
              variant="primary"
              onClick={() => applyCustomText(slot, config.customText, label)}
            >
              Use this text
            </Button>
          </div>
          <p className="text-[11px] leading-snug text-stone-500">
            Copyrighted translations aren’t distributed by the free API. Paste them
            here instead — the text stays on your machine and in your share link.
          </p>
        </div>
      )}

      <p className="mt-3 text-[11px] text-stone-400">
        {config.verses?.length
          ? `Loaded: ${config.loadedReference || '—'} · ${config.loadedTranslation || '—'} · ${config.verses.length} verses`
          : 'Nothing loaded yet.'}
      </p>
    </div>
  )
}

export default function SettingsModal() {
  const open = useStudy((s) => s.settingsOpen)
  const openSettings = useStudy((s) => s.openSettings)
  const scripture = useStudy((s) => s.scripture)
  const setReference = useStudy((s) => s.setReference)
  const loadPassage = useStudy((s) => s.loadPassage)
  const style = useStudy((s) => s.style)
  const setStyle = useStudy((s) => s.setStyle)
  const ui = useStudy((s) => s.ui)
  const setUI = useStudy((s) => s.setUI)
  const layer = useStudy((s) => s.layer)
  const setLayer = useStudy((s) => s.setLayer)
  const error = useStudy((s) => s.error)

  const [tab, setTab] = useState('scripture')

  return (
    <Modal
      open={open}
      onClose={() => openSettings(false)}
      title="Study settings"
      subtitle="Choose the text on the canvas and how it is set."
      width="max-w-3xl"
      footer={<Button onClick={() => openSettings(false)}>Done</Button>}
    >
      <Segmented
        className="mb-4"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'scripture', label: 'Scripture' },
          { value: 'typography', label: 'Typography' },
          { value: 'canvas', label: 'Canvas' },
        ]}
      />

      {tab === 'scripture' && (
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <Field label="Passage reference" className="flex-1" hint="e.g. Luke 7:1-10, Romans 8, Ps 23">
              <Input
                value={scripture.reference}
                onChange={(e) => setReference(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadPassage('primary')}
                placeholder="Luke 7:1-10"
              />
            </Field>
            <Button variant="primary" onClick={() => loadPassage('primary')}>
              Load
            </Button>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}

          <SlotEditor
            slot="primary"
            title="Primary column"
            description="The manuscript you'll mark up."
          />

        </div>
      )}

      {tab === 'typography' && (
        <div className="space-y-4">
          <Field label="Font family">
            <Select
              value={style.fontFamily}
              onChange={(e) => setStyle({ fontFamily: e.target.value })}
            >
              {FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Range
              label="Size"
              suffix="px"
              min={12}
              max={40}
              value={style.fontSize}
              onChange={(fontSize) => setStyle({ fontSize }, { history: false })}
            />
            <Range
              label="Line height"
              min={1.1}
              max={3.2}
              step={0.05}
              value={style.lineHeight}
              onChange={(lineHeight) => setStyle({ lineHeight }, { history: false })}
            />
            <Range
              label="Letter spacing"
              suffix="px"
              min={-1}
              max={4}
              step={0.1}
              value={style.letterSpacing}
              onChange={(letterSpacing) => setStyle({ letterSpacing }, { history: false })}
            />
            <Range
              label="Word spacing"
              suffix="px"
              min={0}
              max={24}
              value={style.wordSpacing}
              onChange={(wordSpacing) => setStyle({ wordSpacing }, { history: false })}
            />
            <Range
              label="Space between verses"
              suffix="px"
              min={0}
              max={60}
              value={style.verseSpacing}
              onChange={(verseSpacing) => setStyle({ verseSpacing }, { history: false })}
            />
            <Range
              label="Column width"
              suffix="px"
              min={280}
              max={900}
              step={10}
              value={style.columnWidth}
              onChange={(columnWidth) => setStyle({ columnWidth }, { history: false })}
            />
          </div>

          <Divider />

          <Toggle
            checked={style.verseOnNewLine}
            onChange={(verseOnNewLine) => setStyle({ verseOnNewLine })}
            label="Start each verse on a new line"
            description="Classic manuscript format — leaves room to annotate every verse."
          />
          <Toggle
            checked={style.showVerseNumbers}
            onChange={(showVerseNumbers) => setStyle({ showVerseNumbers })}
            label="Show verse numbers"
          />

          <Field label="Text color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.textColor}
                onChange={(e) => setStyle({ textColor: e.target.value }, { history: false })}
                className="h-9 w-14 cursor-pointer rounded border border-stone-300 bg-white p-1"
              />
              <span className="font-mono text-xs text-stone-500">{style.textColor}</span>
            </div>
          </Field>

          <div
            className="rounded-xl border border-stone-200 bg-[#faf7f2] p-4"
            style={{
              fontFamily: `${style.fontFamily}, Georgia, serif`,
              fontSize: style.fontSize,
              lineHeight: style.lineHeight,
              letterSpacing: style.letterSpacing,
              wordSpacing: style.wordSpacing,
              color: style.textColor,
            }}
          >
            <span className="align-super text-[0.62em] text-stone-400">1</span> In the
            beginning was the Word, and the Word was with God, and the Word was God.
          </div>
        </div>
      )}

      {tab === 'canvas' && (
        <div className="space-y-3">
          <Toggle
            checked={ui.showGrid}
            onChange={(showGrid) => setUI({ showGrid })}
            label="Dot grid"
            description="Subtle alignment guide behind the canvas."
          />
          <Divider label="Layout" />
          <div className="grid grid-cols-2 gap-4">
            <Range
              label="Gap between columns"
              suffix="px"
              min={24}
              max={200}
              value={layer.gap}
              onChange={(gap) => setLayer({ gap }, { history: false })}
            />
          </div>
          <p className={cx('text-[11px] text-stone-400')}>
            Scroll to zoom at the cursor, shift-scroll or space-drag to pan.
          </p>
        </div>
      )}
    </Modal>
  )
}
