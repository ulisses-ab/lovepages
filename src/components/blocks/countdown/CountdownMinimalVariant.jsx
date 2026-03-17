import { colors } from '../../../lib/theme'
import { useT } from '../../../lib/i18n'
import { pad } from './CountdownShared'

export default function CountdownMinimalVariant({ days, hours, minutes, seconds, label }) {
  const { t } = useT()
  const units = [
    { value: days,    label: t('countdown.days') },
    { value: hours,   label: t('countdown.hours') },
    { value: minutes, label: t('countdown.minutes') },
    { value: seconds, label: t('countdown.seconds') },
  ]

  return (
    <div className="w-full py-2 text-center">
      {label && (
        <p style={{
          fontFamily: 'Georgia, serif',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: colors.fgMuted,
          marginBottom: 20,
        }}>
          {label}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 0 }}>
        {units.map(({ value, label: unitLabel }, i) => (
          <div key={unitLabel} style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 56 }}>
              <span style={{
                fontFamily: 'Georgia, serif',
                fontSize: 48,
                fontWeight: 400,
                lineHeight: 1,
                color: colors.fg,
                letterSpacing: '-0.02em',
              }}>
                {pad(value)}
              </span>
              <div style={{
                width: 24, height: 1,
                background: colors.fgMuted,
                opacity: 0.3,
                margin: '8px auto 6px',
              }} />
              <span style={{
                fontFamily: 'Georgia, serif',
                fontSize: 9,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: colors.fgMuted,
              }}>
                {unitLabel}
              </span>
            </div>
            {i < units.length - 1 && (
              <span style={{
                fontFamily: 'Georgia, serif',
                fontSize: 36,
                fontWeight: 300,
                color: colors.fgMuted,
                opacity: 0.35,
                lineHeight: 1,
                padding: '0 2px',
                marginTop: 4,
              }}>·</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
