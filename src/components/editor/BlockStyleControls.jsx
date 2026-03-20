import { useT } from '../../lib/i18n'

function SizeIcon({ type }) {
  const bar = 'h-1.5 rounded-sm bg-current opacity-80'
  if (type === 'full')  return <div className="flex w-full px-1"><div className={`${bar} w-full`} /></div>
  if (type === 'half')  return <div className="flex gap-1 w-full px-1"><div className={`${bar} flex-1`} /><div className={`${bar} flex-1`} /></div>
  if (type === 'third') return <div className="flex gap-0.5 w-full px-1"><div className={`${bar} flex-1`} /><div className={`${bar} flex-1`} /><div className={`${bar} flex-1`} /></div>
  // auto / compact
  return <div className="flex w-full px-1 justify-center"><div className={`${bar}`} style={{ width: '55%' }} /></div>
}

export default function BlockStyleControls({ block, onChange }) {
  const { t } = useT()
  const current = block.size ?? 'full'

  const SIZE_OPTIONS = [
    { value: 'full',  label: t('style.fullWidth') },
    { value: 'half',  label: t('style.sideBySide') },
    { value: 'third', label: t('style.threeInRow') },
    { value: 'auto',  label: t('style.compact') },
  ]

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {SIZE_OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange({ size: opt.value })}
          className={`flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg border-2 transition ${
            current === opt.value
              ? 'border-primary bg-primary/10 text-primary-dim'
              : 'border-overlay bg-surface text-fg-ghost hover:border-subtle hover:text-fg-muted'
          }`}
        >
          <SizeIcon type={opt.value} />
          <span className="text-xs leading-tight text-center">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}
