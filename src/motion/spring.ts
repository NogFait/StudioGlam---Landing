import type { SpringConfig } from './physics'

export type SpringRun = {
  /** Stops the animation and returns the live value/velocity so the next one can take over. */
  stop: () => { value: number; velocity: number }
}

// Minimal spring solver: animates a single value from where it *is* to `to`,
// inheriting `velocity` (units/s). Starting from the live value and velocity is
// what makes every motion built on it interruptible without a visible seam.
export function runSpring(opts: {
  from: number
  to: number
  velocity?: number
  config: SpringConfig
  onUpdate: (value: number, velocity: number) => void
  onDone?: () => void
}): SpringRun {
  const { to, config, onUpdate, onDone } = opts
  let x = opts.from
  let v = opts.velocity ?? 0
  let last = performance.now()
  let raf = 0
  let running = true

  const frame = (now: number) => {
    if (!running) return
    // Fixed sub-steps keep the integration stable on slow frames.
    let remaining = Math.min((now - last) / 1000, 0.064)
    last = now
    while (remaining > 0) {
      const dt = Math.min(remaining, 1 / 240)
      v += (-config.stiffness * (x - to) - config.damping * v) * dt
      x += v * dt
      remaining -= dt
    }
    if (Math.abs(x - to) < 0.0005 && Math.abs(v) < 0.01) {
      x = to
      v = 0
      running = false
      onUpdate(x, v)
      onDone?.()
      return
    }
    onUpdate(x, v)
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  return {
    stop() {
      running = false
      cancelAnimationFrame(raf)
      return { value: x, velocity: v }
    },
  }
}
