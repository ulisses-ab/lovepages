import { useState, useCallback, useEffect, useRef } from 'react'

const MAX_GUESSES = 6

function normalizeWord(w) {
  return (w || '').toUpperCase().replace(/[^A-Z]/g, '')
}

function evaluateGuess(guess, answer) {
  const result = Array(answer.length).fill('absent')
  const answerLetters = answer.split('')
  const guessLetters = guess.split('')

  // First pass: correct positions
  for (let i = 0; i < answer.length; i++) {
    if (guessLetters[i] === answerLetters[i]) {
      result[i] = 'correct'
      answerLetters[i] = null
      guessLetters[i] = null
    }
  }

  // Second pass: present but wrong position
  for (let i = 0; i < answer.length; i++) {
    if (guessLetters[i] === null) continue
    const idx = answerLetters.indexOf(guessLetters[i])
    if (idx !== -1) {
      result[i] = 'present'
      answerLetters[idx] = null
    }
  }

  return result
}

const TILE_COLORS = {
  correct: '#6aaa64',
  present: '#c9b458',
  absent:  '#3a3a3c',
  empty:   '#121213',
  border:  '#3a3a3c',
  activeBorder: '#565758',
}

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
]

function Tile({ letter, status, size, animDelay }) {
  const bg = status ? TILE_COLORS[status] : TILE_COLORS.empty
  const border = letter && !status ? TILE_COLORS.activeBorder : status ? 'transparent' : TILE_COLORS.border

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.55,
        fontWeight: 700,
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        color: '#fff',
        textTransform: 'uppercase',
        border: `2px solid ${border}`,
        backgroundColor: bg,
        borderRadius: 4,
        transition: status ? 'background-color 0.3s, border-color 0.3s' : undefined,
        transitionDelay: status ? `${animDelay}ms` : undefined,
        userSelect: 'none',
        lineHeight: 1,
      }}
    >
      {letter || ''}
    </div>
  )
}

function KeyboardKey({ label, status, onClick }) {
  const isWide = label === 'ENTER' || label === '⌫'
  const bg = status ? TILE_COLORS[status] : '#818384'

  return (
    <button
      type="button"
      onClick={() => onClick(label)}
      style={{
        minWidth: isWide ? 56 : 32,
        height: 50,
        borderRadius: 4,
        border: 'none',
        backgroundColor: bg,
        color: '#fff',
        fontSize: label === 'ENTER' ? 11 : 14,
        fontWeight: 600,
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 3px 6px',
        padding: '0 4px',
        userSelect: 'none',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </button>
  )
}

export default function GameWordleVariant({ block }) {
  const answer = normalizeWord(block.word)
  const wordLength = answer.length || 5

  const [guesses, setGuesses] = useState([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [shake, setShake] = useState(false)
  const containerRef = useRef(null)

  // Focus container for keyboard events
  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  // Build keyboard letter statuses
  const letterStatuses = {}
  guesses.forEach(({ word, result }) => {
    word.split('').forEach((letter, i) => {
      const s = result[i]
      const prev = letterStatuses[letter]
      if (s === 'correct') letterStatuses[letter] = 'correct'
      else if (s === 'present' && prev !== 'correct') letterStatuses[letter] = 'present'
      else if (!prev) letterStatuses[letter] = 'absent'
    })
  })

  const submitGuess = useCallback(() => {
    if (gameOver || currentGuess.length !== wordLength || !answer) return

    const result = evaluateGuess(currentGuess, answer)
    const newGuesses = [...guesses, { word: currentGuess, result }]
    setGuesses(newGuesses)
    setCurrentGuess('')

    if (currentGuess === answer) {
      setWon(true)
      setGameOver(true)
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameOver(true)
    }
  }, [currentGuess, answer, guesses, gameOver, wordLength])

  const handleKey = useCallback((key) => {
    if (gameOver) return
    if (key === '⌫' || key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1))
    } else if (key === 'ENTER') {
      if (currentGuess.length !== wordLength) {
        setShake(true)
        setTimeout(() => setShake(false), 500)
        return
      }
      submitGuess()
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < wordLength) {
      setCurrentGuess(prev => prev + key)
    }
  }, [gameOver, currentGuess, wordLength, submitGuess])

  // Physical keyboard — listen on window so it works inside the fullscreen modal
  useEffect(() => {
    const handler = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toUpperCase()
      if (k === 'BACKSPACE' || k === 'ENTER' || (/^[A-Z]$/.test(k))) {
        e.preventDefault()
        handleKey(k)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleKey])

  const resetGame = () => {
    setGuesses([])
    setCurrentGuess('')
    setGameOver(false)
    setWon(false)
    containerRef.current?.focus()
  }

  if (!answer) {
    return (
      <div style={{ textAlign: 'center', padding: 32, color: '#86888a', fontFamily: "'Inter', sans-serif", fontSize: 14 }}>
        No word set yet
      </div>
    )
  }

  // Responsive tile size
  const tileSize = Math.min(56, Math.floor((Math.min(380, window.innerWidth - 40)) / wordLength) - 6)

  const rows = []
  for (let r = 0; r < MAX_GUESSES; r++) {
    const guess = guesses[r]
    const isCurrentRow = r === guesses.length && !gameOver
    const letters = guess ? guess.word.split('') : isCurrentRow ? currentGuess.padEnd(wordLength, ' ').split('').map(c => c === ' ' ? '' : c) : Array(wordLength).fill('')
    const statuses = guess ? guess.result : Array(wordLength).fill(null)

    rows.push(
      <div
        key={r}
        style={{
          display: 'flex',
          gap: 5,
          justifyContent: 'center',
          animation: isCurrentRow && shake ? 'wordle-shake 0.5s ease' : undefined,
        }}
      >
        {letters.map((letter, c) => (
          <Tile key={c} letter={letter} status={statuses[c]} size={tileSize} animDelay={c * 150} />
        ))}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      style={{
        outline: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        padding: '20px 8px',
        backgroundColor: '#121213',
        borderRadius: 12,
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        minWidth: 280,
      }}
    >
      {/* Title */}
      {block.gameTitle && (
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: 1, textAlign: 'center', marginBottom: 4, textTransform: 'uppercase' }}>
          {block.gameTitle}
        </div>
      )}

      {/* Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {rows}
      </div>

      {/* Game over message */}
      {gameOver && (
        <div style={{ textAlign: 'center', marginTop: 4 }}>
          {won ? (
            <div style={{ color: TILE_COLORS.correct, fontWeight: 700, fontSize: 16 }}>
              {block.winMessage || 'You got it! 🎉'}
            </div>
          ) : (
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                {block.loseMessage || 'The word was:'}
              </div>
              <div style={{ color: TILE_COLORS.present, fontWeight: 700, fontSize: 20, letterSpacing: 3, textTransform: 'uppercase' }}>
                {answer}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={resetGame}
            style={{
              marginTop: 12,
              padding: '8px 24px',
              borderRadius: 999,
              border: 'none',
              backgroundColor: TILE_COLORS.correct,
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Play again
          </button>
        </div>
      )}

      {/* Keyboard */}
      {!gameOver && (
        <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {KEYBOARD_ROWS.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', justifyContent: 'center' }}>
              {row.map(key => (
                <KeyboardKey
                  key={key}
                  label={key}
                  status={letterStatuses[key]}
                  onClick={handleKey}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Shake keyframe */}
      <style>{`
        @keyframes wordle-shake {
          0%, 100% { transform: translateX(0); }
          10%, 50%, 90% { transform: translateX(-4px); }
          30%, 70% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  )
}
