// Tracks the currently active YT player so only one plays at a time.
const registry = new Map() // id -> { pause: fn }

export function registerPlayer(id, pause) {
  registry.set(id, { pause })
}

export function unregisterPlayer(id) {
  registry.delete(id)
}

export function pauseOthers(id) {
  registry.forEach((entry, key) => {
    if (key !== id) entry.pause()
  })
}
