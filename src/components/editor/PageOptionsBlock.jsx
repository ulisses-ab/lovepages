import { useState } from 'react'
import { Settings } from 'lucide-react'
import { useT } from '../../lib/i18n'
import BackgroundChooser from '../ui/BackgroundChooser'

export default function PageOptionsBlock({ pageSettings, onChange }) {
  const [expanded, setExpanded] = useState(false)
  const { t } = useT()

  return (
    <div
      className={`rounded-xl border transition ${
        expanded
          ? 'border-primary/70'
          : 'border-overlay/70 hover:border-subtle'
      }`}
      style={{
        background: 'rgba(19,17,24,0.80)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: expanded ? '0 0 0 1px rgba(255,49,49,0.25), 0 4px 24px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div className="flex items-center h-12 gap-2 px-3 pl-4 py-2">
        <Settings size={15} className="text-fg-secondary shrink-0" />
        <span className="text-sm font-medium text-fg-secondary flex-1 select-none">
          {t('pageOptions.title')}
        </span>
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-xs text-fg-muted hover:text-primary-dim px-2 py-1 rounded hover:bg-primary-subtle/50 transition"
        >
          {expanded ? t('sortable.done') : t('sortable.edit')}
        </button>
      </div>

      {/* Expanded controls */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-overlay pt-3 space-y-3">
          <p className="text-xs text-fg-muted">{t('pageOptions.background')}</p>
          <BackgroundChooser
            bgColor={pageSettings.bgColor || ''}
            bgImage={pageSettings.bgImage || ''}
            bgImageFit={pageSettings.bgImageFit || 'cover'}
            bgFade={pageSettings.bgFade || false}
            bgColor2={pageSettings.bgColor2 || ''}
            bgImage2={pageSettings.bgImage2 || ''}
            bgImageFit2={pageSettings.bgImageFit2 || 'cover'}
            onChange={onChange}
          />

            {/* Column layout */}
          <div>
            <p className="text-xs text-fg-muted mb-2">Layout</p>
            <div className="space-y-2">
              {[
                { key: 'columnGap',     label: 'Block gap',  min: 0, max: 64, step: 4,  default: 16, unit: 'px' },
                { key: 'columnPadding', label: 'Page padding', min: 0, max: 80, step: 4, default: 24, unit: 'px' },
              ].map(({ key, label, min, max, step, default: def, unit }) => {
                const val = pageSettings[key] ?? def
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-xs text-fg-muted w-24 shrink-0">{label}</span>
                    <input
                      type="range" min={min} max={max} step={step}
                      value={val}
                      onChange={e => onChange({ [key]: Number(e.target.value) })}
                      className="flex-1 h-1 accent-primary"
                    />
                    <span className="text-xs text-fg-muted tabular-nums w-8 text-right shrink-0">{val}{unit}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Background effect */}
          <div>
            <p className="text-xs text-fg-muted mb-2">{t('pageOptions.effect')}</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { value: '',             label: t('pageOptions.effectNone') },
                { value: 'soap-bubbles', label: t('pageOptions.effectSoapBubbles') },
                { value: 'prism', label: t('pageOptions.effectPrism') },
                { value: 'light-rays', label: t('pageOptions.effectLightRays') },
                { value: 'pixel-blast', label: t('pageOptions.effectPixelBlast') },
                { value: 'color-bends', label: t('pageOptions.effectColorBends') },
                { value: 'prismatic-burst', label: t('pageOptions.effectPrismaticBurst') },
                { value: 'iridescence', label: t('pageOptions.effectIridescence') },
                { value: 'letter-glitch', label: t('pageOptions.effectLetterGlitch') },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onChange({ bgEffect: opt.value })}
                  className={`px-3 py-1 text-xs rounded-full border transition ${
                    (pageSettings.bgEffect || '') === opt.value
                      ? 'bg-primary border-primary text-white'
                      : 'bg-overlay border-subtle text-fg-muted hover:border-primary-dim'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {pageSettings.bgEffect === 'soap-bubbles' && (
              <div className="flex gap-1.5 mt-2">
                {[
                  { value: 'normal',  label: t('pageOptions.effectVariantNormal') },
                  { value: 'rainbow', label: t('pageOptions.effectVariantRainbow') },
                  { value: 'blue',    label: t('pageOptions.effectVariantBlue') },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => onChange({ bgEffectVariant: opt.value })}
                    className={`px-3 py-1 text-xs rounded-full border transition ${
                      (pageSettings.bgEffectVariant || 'normal') === opt.value
                        ? 'bg-primary border-primary text-white'
                        : 'bg-overlay border-subtle text-fg-muted hover:border-primary-dim'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            {pageSettings.bgEffect === 'pixel-blast' && (() => {
              const opts = pageSettings.bgEffectOptions || {}
              const setOpt = patch => onChange({ bgEffectOptions: { ...opts, ...patch } })
              return (
                <div className="mt-2 space-y-2">
                  {/* Color */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-fg-muted w-24 shrink-0">{t('pageOptions.effectColor')}</span>
                    <input
                      type="color"
                      value={pageSettings.bgEffectColor || '#B19EEF'}
                      onChange={e => onChange({ bgEffectColor: e.target.value })}
                      className="w-7 h-7 rounded border border-subtle cursor-pointer bg-transparent"
                    />
                  </div>
                  {/* Variant */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-fg-muted w-24 shrink-0">{t('pageOptions.pbVariant')}</span>
                    <div className="flex gap-1">
                      {['square', 'circle', 'triangle', 'diamond'].map(v => (
                        <button
                          key={v}
                          onClick={() => setOpt({ variant: v })}
                          className={`px-2 py-0.5 text-xs rounded-full border transition capitalize ${
                            (opts.variant || 'square') === v
                              ? 'bg-primary border-primary text-white'
                              : 'bg-overlay border-subtle text-fg-muted hover:border-primary-dim'
                          }`}
                        >{v}</button>
                      ))}
                    </div>
                  </div>
                  {/* Sliders */}
                  {[
                    { key: 'pixelSize',      label: t('pageOptions.pbPixelSize'),      min: 1, max: 12, step: 1,    def: 4   },
                    { key: 'patternScale',   label: t('pageOptions.pbPatternScale'),   min: 0.5, max: 8, step: 0.5, def: 2   },
                    { key: 'patternDensity', label: t('pageOptions.pbPatternDensity'), min: 0, max: 2, step: 0.1,   def: 1   },
                    { key: 'pixelJitter',    label: t('pageOptions.pbPixelJitter'),    min: 0, max: 2, step: 0.1,   def: 0   },
                    { key: 'speed',          label: t('pageOptions.pbSpeed'),          min: 0, max: 2, step: 0.1,   def: 0.5 },
                    { key: 'edgeFade',       label: t('pageOptions.pbEdgeFade'),       min: 0, max: 1, step: 0.05,  def: 0.25 },
                  ].map(({ key, label, min, max, step, def }) => {
                    const val = opts[key] ?? def
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-xs text-fg-muted w-24 shrink-0">{label}</span>
                        <input
                          type="range" min={min} max={max} step={step}
                          value={val}
                          onChange={e => setOpt({ [key]: Number(e.target.value) })}
                          className="flex-1 h-1 accent-primary"
                        />
                        <span className="text-xs text-fg-muted tabular-nums w-8 text-right shrink-0">{val}</span>
                      </div>
                    )
                  })}
                  {/* Toggles */}
                  <div className="flex gap-4">
                    {[
                      { key: 'ripples', label: t('pageOptions.pbRipples'), def: false },
                      { key: 'liquid',  label: t('pageOptions.pbLiquid'),  def: false },
                    ].map(({ key, label, def }) => (
                      <label key={key} className="flex items-center gap-1.5 text-xs text-fg-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={opts[key] ?? def}
                          onChange={e => setOpt({ [key]: e.target.checked })}
                          className="accent-primary"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              )
            })()}
            {pageSettings.bgEffect === 'color-bends' && (() => {
              const opts = pageSettings.bgEffectOptions || {}
              const setOpt = patch => onChange({ bgEffectOptions: { ...opts, ...patch } })
              const colors = opts.colors || []
              return (
                <div className="mt-2 space-y-2">
                  {/* Colors */}
                  <div>
                    <span className="text-xs text-fg-muted">{t('pageOptions.cbColors')}</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      {colors.map((c, i) => (
                        <div key={i} className="relative group">
                          <input
                            type="color"
                            value={c}
                            onChange={e => {
                              const next = [...colors]
                              next[i] = e.target.value
                              setOpt({ colors: next })
                            }}
                            className="w-7 h-7 rounded border border-subtle cursor-pointer bg-transparent"
                          />
                          <button
                            onClick={() => setOpt({ colors: colors.filter((_, j) => j !== i) })}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-overlay border border-subtle text-fg-muted text-[10px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >&times;</button>
                        </div>
                      ))}
                      {colors.length < 8 && (
                        <button
                          onClick={() => setOpt({ colors: [...colors, '#ff6b9d'] })}
                          className="w-7 h-7 rounded border border-dashed border-subtle text-fg-muted text-sm flex items-center justify-center hover:border-primary-dim transition"
                        >+</button>
                      )}
                    </div>
                  </div>
                  {/* Sliders */}
                  {[
                    { key: 'speed',        label: t('pageOptions.cbSpeed'),        min: 0, max: 1, step: 0.05,  def: 0.2 },
                    { key: 'scale',        label: t('pageOptions.cbScale'),        min: 0.2, max: 4, step: 0.1, def: 1   },
                    { key: 'frequency',    label: t('pageOptions.cbFrequency'),    min: 0.1, max: 4, step: 0.1, def: 1   },
                    { key: 'warpStrength', label: t('pageOptions.cbWarp'),         min: 0, max: 3, step: 0.1,   def: 1   },
                    { key: 'rotation',     label: t('pageOptions.cbRotation'),     min: 0, max: 360, step: 5,   def: 45  },
                    { key: 'noise',        label: t('pageOptions.cbNoise'),        min: 0, max: 0.5, step: 0.05, def: 0.1 },
                  ].map(({ key, label, min, max, step, def }) => {
                    const val = opts[key] ?? def
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-xs text-fg-muted w-24 shrink-0">{label}</span>
                        <input
                          type="range" min={min} max={max} step={step}
                          value={val}
                          onChange={e => setOpt({ [key]: Number(e.target.value) })}
                          className="flex-1 h-1 accent-primary"
                        />
                        <span className="text-xs text-fg-muted tabular-nums w-8 text-right shrink-0">{val}</span>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
            {pageSettings.bgEffect === 'prismatic-burst' && (() => {
              const opts = pageSettings.bgEffectOptions || {}
              const setOpt = patch => onChange({ bgEffectOptions: { ...opts, ...patch } })
              const colors = opts.colors || []
              return (
                <div className="mt-2 space-y-2">
                  {/* Colors */}
                  <div>
                    <span className="text-xs text-fg-muted">{t('pageOptions.cbColors')}</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      {colors.map((c, i) => (
                        <div key={i} className="relative group">
                          <input
                            type="color"
                            value={c}
                            onChange={e => {
                              const next = [...colors]
                              next[i] = e.target.value
                              setOpt({ colors: next })
                            }}
                            className="w-7 h-7 rounded border border-subtle cursor-pointer bg-transparent"
                          />
                          <button
                            onClick={() => setOpt({ colors: colors.filter((_, j) => j !== i) })}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-overlay border border-subtle text-fg-muted text-[10px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >&times;</button>
                        </div>
                      ))}
                      {colors.length < 8 && (
                        <button
                          onClick={() => setOpt({ colors: [...colors, '#ff6b9d'] })}
                          className="w-7 h-7 rounded border border-dashed border-subtle text-fg-muted text-sm flex items-center justify-center hover:border-primary-dim transition"
                        >+</button>
                      )}
                    </div>
                  </div>
                  {/* Animation type */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-fg-muted w-24 shrink-0">{t('pageOptions.pbAnimation')}</span>
                    <div className="flex gap-1">
                      {[
                        { value: 'rotate',   label: t('pageOptions.pbAnimRotate') },
                        { value: 'rotate3d', label: t('pageOptions.pbAnimRotate3d') },
                      ].map(v => (
                        <button
                          key={v.value}
                          onClick={() => setOpt({ animationType: v.value })}
                          className={`px-2 py-0.5 text-xs rounded-full border transition ${
                            (opts.animationType || 'rotate3d') === v.value
                              ? 'bg-primary border-primary text-white'
                              : 'bg-overlay border-subtle text-fg-muted hover:border-primary-dim'
                          }`}
                        >{v.label}</button>
                      ))}
                    </div>
                  </div>
                  {/* Sliders */}
                  {[
                    { key: 'intensity', label: t('pageOptions.pbIntensity'), min: 0.5, max: 5,  step: 0.5, def: 2   },
                    { key: 'speed',     label: t('pageOptions.pbSpeed'),     min: 0.1, max: 2,  step: 0.1, def: 0.5 },
                    { key: 'distort',   label: t('pageOptions.pbDistort'),   min: 0,   max: 20, step: 1,   def: 0   },
                    { key: 'rayCount',  label: t('pageOptions.pbRayCount'),  min: 0,   max: 12, step: 1,   def: 0   },
                  ].map(({ key, label, min, max, step, def }) => {
                    const val = opts[key] ?? def
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-xs text-fg-muted w-24 shrink-0">{label}</span>
                        <input
                          type="range" min={min} max={max} step={step}
                          value={val}
                          onChange={e => setOpt({ [key]: Number(e.target.value) })}
                          className="flex-1 h-1 accent-primary"
                        />
                        <span className="text-xs text-fg-muted tabular-nums w-8 text-right shrink-0">{val}</span>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
            {pageSettings.bgEffect === 'iridescence' && (() => {
              const opts = pageSettings.bgEffectOptions || {}
              const setOpt = patch => onChange({ bgEffectOptions: { ...opts, ...patch } })
              const c = opts.color || [1, 1, 1]
              const toHex = ([r, g, b]) => '#' + [r, g, b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('')
              const fromHex = hex => {
                const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
                return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1]
              }
              return (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-fg-muted w-24 shrink-0">{t('pageOptions.effectColor')}</span>
                    <input
                      type="color"
                      value={toHex(c)}
                      onChange={e => setOpt({ color: fromHex(e.target.value) })}
                      className="w-7 h-7 rounded border border-subtle cursor-pointer bg-transparent"
                    />
                  </div>
                  {[
                    { key: 'speed',     label: t('pageOptions.irSpeed'),     min: 0.1, max: 3, step: 0.1, def: 1.0 },
                    { key: 'amplitude', label: t('pageOptions.irAmplitude'), min: 0, max: 1, step: 0.05,  def: 0.1 },
                  ].map(({ key, label, min, max, step, def }) => {
                    const val = opts[key] ?? def
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-xs text-fg-muted w-24 shrink-0">{label}</span>
                        <input
                          type="range" min={min} max={max} step={step}
                          value={val}
                          onChange={e => setOpt({ [key]: Number(e.target.value) })}
                          className="flex-1 h-1 accent-primary"
                        />
                        <span className="text-xs text-fg-muted tabular-nums w-8 text-right shrink-0">{val}</span>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
            {pageSettings.bgEffect === 'letter-glitch' && (() => {
              const opts = pageSettings.bgEffectOptions || {}
              const setOpt = patch => onChange({ bgEffectOptions: { ...opts, ...patch } })
              const colors = opts.colors || ['#2b4539', '#61dca3', '#61b3dc']
              return (
                <div className="mt-2 space-y-2">
                  {/* Colors */}
                  <div>
                    <span className="text-xs text-fg-muted">{t('pageOptions.cbColors')}</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      {colors.map((c, i) => (
                        <div key={i} className="relative group">
                          <input
                            type="color"
                            value={c}
                            onChange={e => {
                              const next = [...colors]
                              next[i] = e.target.value
                              setOpt({ colors: next })
                            }}
                            className="w-7 h-7 rounded border border-subtle cursor-pointer bg-transparent"
                          />
                          {colors.length > 1 && (
                            <button
                              onClick={() => setOpt({ colors: colors.filter((_, j) => j !== i) })}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-overlay border border-subtle text-fg-muted text-[10px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            >&times;</button>
                          )}
                        </div>
                      ))}
                      {colors.length < 8 && (
                        <button
                          onClick={() => setOpt({ colors: [...colors, '#ff6b9d'] })}
                          className="w-7 h-7 rounded border border-dashed border-subtle text-fg-muted text-sm flex items-center justify-center hover:border-primary-dim transition"
                        >+</button>
                      )}
                    </div>
                  </div>
                  {/* Speed slider */}
                  {[
                    { key: 'speed', label: t('pageOptions.lgSpeed'), min: 10, max: 200, step: 10, def: 50 },
                  ].map(({ key, label, min, max, step, def }) => {
                    const val = opts[key] ?? def
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-xs text-fg-muted w-24 shrink-0">{label}</span>
                        <input
                          type="range" min={min} max={max} step={step}
                          value={val}
                          onChange={e => setOpt({ [key]: Number(e.target.value) })}
                          className="flex-1 h-1 accent-primary"
                        />
                        <span className="text-xs text-fg-muted tabular-nums w-8 text-right shrink-0">{val}</span>
                      </div>
                    )
                  })}
                  {/* Toggles */}
                  <div className="flex gap-4">
                    {[
                      { key: 'smooth',         label: t('pageOptions.lgSmooth'),   def: true },
                      { key: 'outerVignette',   label: t('pageOptions.lgOuterVignette'), def: true },
                      { key: 'centerVignette',  label: t('pageOptions.lgCenterVignette'), def: false },
                    ].map(({ key, label, def }) => (
                      <label key={key} className="flex items-center gap-1.5 text-xs text-fg-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={opts[key] ?? def}
                          onChange={e => setOpt({ [key]: e.target.checked })}
                          className="accent-primary"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
