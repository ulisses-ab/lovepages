import { inputClass } from '../../lib/theme'
import GameWordleVariant from './game/GameWordleVariant'

export default function GameBlock({ block, isEditing, onChange }) {
  const { variant = 'wordle' } = block

  if (isEditing) {
    return (
      <div className="space-y-3">
        {/* Word input */}
        <div>
          <label className="text-xs text-fg-muted mb-1 block">Secret word</label>
          <input
            className={inputClass}
            placeholder="e.g. HEART"
            value={block.word || ''}
            onChange={e => onChange({ word: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') })}
            maxLength={8}
          />
          <p className="text-xs text-fg-faint mt-1">Letters only, 3–8 characters. Visitors will try to guess this!</p>
        </div>

        {/* Optional title */}
        <div>
          <label className="text-xs text-fg-muted mb-1 block">Title (optional)</label>
          <input
            className={inputClass}
            placeholder="e.g. Guess our song"
            value={block.gameTitle || ''}
            onChange={e => onChange({ gameTitle: e.target.value })}
          />
        </div>

        {/* Win message */}
        <div>
          <label className="text-xs text-fg-muted mb-1 block">Win message</label>
          <input
            className={inputClass}
            placeholder="You got it! 🎉"
            value={block.winMessage || ''}
            onChange={e => onChange({ winMessage: e.target.value })}
          />
        </div>

        {/* Lose message */}
        <div>
          <label className="text-xs text-fg-muted mb-1 block">Lose message</label>
          <input
            className={inputClass}
            placeholder="The word was:"
            value={block.loseMessage || ''}
            onChange={e => onChange({ loseMessage: e.target.value })}
          />
        </div>

        {/* Live preview */}
        <div>
          <p className="text-xs text-fg-muted mb-2">Preview</p>
          <div style={{ pointerEvents: 'none', opacity: 0.8, transform: 'scale(0.75)', transformOrigin: 'top center' }}>
            <GameWordleVariant block={{ ...block, word: block.word || 'LOVE' }} />
          </div>
        </div>
      </div>
    )
  }

  // Public / preview mode
  switch (variant) {
    case 'wordle':
    default:
      return <GameWordleVariant block={block} />
  }
}
