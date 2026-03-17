export default function TextTypewriterVariant({ content, sizePx, textAlign }) {
  const lineH = 26
  const topPad = 34
  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(175deg, #f8f3e8 0%, #f2ead6 60%, #ede3c8 100%)',
      borderRadius: 3,
      padding: `${topPad}px 28px 28px 56px`,
      boxShadow: [
        '2px 4px 14px rgba(0,0,0,0.22)',
        '0 1px 3px rgba(0,0,0,0.12)',
        'inset 0 0 0 1px rgba(120,90,40,0.08)',
      ].join(', '),
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 3, pointerEvents: 'none',
        backgroundImage: [
          'repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(120,80,20,0.025) 1px, rgba(120,80,20,0.025) 2px)',
          'repeating-linear-gradient(90deg, transparent 0px, transparent 3px, rgba(100,60,10,0.015) 3px, rgba(100,60,10,0.015) 4px)',
        ].join(', '),
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent ${lineH - 1}px, rgba(140,175,210,0.30) ${lineH - 1}px, rgba(140,175,210,0.30) ${lineH}px)`,
        backgroundPosition: `0 ${topPad}px`,
      }} />
      <div style={{
        position: 'absolute', left: 42, top: 0, bottom: 0, width: 1.5,
        background: 'rgba(195,55,55,0.45)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 3, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 55%, rgba(120,80,20,0.06) 100%)',
      }} />
      <p style={{
        position: 'relative',
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: sizePx,
        lineHeight: `${lineH}px`,
        color: '#1c140a',
        whiteSpace: 'pre-wrap',
        letterSpacing: '0.04em',
        textAlign,
        textShadow: '0.4px 0.4px 0 rgba(0,0,0,0.18), -0.2px 0 0 rgba(0,0,0,0.07)',
        margin: 0,
      }}>
        {content}
      </p>
    </div>
  )
}
