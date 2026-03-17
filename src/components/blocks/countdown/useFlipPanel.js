import { useState, useEffect, useRef } from 'react'

// ── Flip animation state machine ──────────────────────────────────────────────
// Phases:
//   idle      — static display, no animation
//   fold-top  — old top card folds away (0→-90°); static top shows new value
//   fold-bot  — new bottom card folds in (90→0°); static bottom still shows old
//   done      — animation complete, static bottom updates to new value
export function useFlipPanel(value) {
  const [topVal, setTopVal]     = useState(value)
  const [botVal, setBotVal]     = useState(value)
  const [phase, setPhase]       = useState('idle')
  const [prevTop, setPrevTop]   = useState(value)
  const [nextBot, setNextBot]   = useState(value)
  const prevRef  = useRef(value)
  const timers   = useRef([])

  useEffect(() => {
    if (value === prevRef.current) return

    timers.current.forEach(clearTimeout)
    timers.current = []

    const old = prevRef.current
    prevRef.current = value

    setPrevTop(old)
    setNextBot(value)
    setTopVal(value)     // static top already shows new value (hidden by animated layer)
    // botVal stays = old during fold-top
    setPhase('fold-top')

    timers.current.push(setTimeout(() => setPhase('fold-bot'), 160))
    timers.current.push(setTimeout(() => {
      setBotVal(value)
      setPhase('idle')
    }, 320))

    return () => timers.current.forEach(clearTimeout)
  }, [value])

  return { topVal, botVal, phase, prevTop, nextBot }
}
