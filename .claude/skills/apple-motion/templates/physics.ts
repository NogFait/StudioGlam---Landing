// Single source of truth for how things move in this app.
//
// Every spring is described the way Apple describes them: a damping ratio
// (1 = no overshoot, < 1 = bounces) and a response in seconds (lower = snappier).
// `spring()` converts that pair into the stiffness/damping/mass Framer Motion
// wants, so animate props, `useSpring` and drag releases all share one physics.
// The CSS twins live in index.css (--spring, --spring-bounce, --t-*).

import type { Transition } from 'framer-motion'

export function spring(dampingRatio: number, response: number) {
  const omega = (2 * Math.PI) / response
  return {
    type: 'spring' as const,
    stiffness: omega * omega,
    damping: 2 * dampingRatio * omega,
    mass: 1,
  }
}

// Default is critically damped: graceful, never distracting. Bounce (< 1) is
// reserved for motion that already carried momentum (a flick, a release).
export const springs = {
  press: spring(1, 0.2), // pointer-down feedback, micro state changes
  snappy: spring(1, 0.3), // small UI: indicators, chips, menu items
  settle: spring(1, 0.4), // default for entering / moving things
  gentle: spring(1, 0.55), // large surfaces: section reveals
  momentum: spring(0.8, 0.4), // after a gesture that carried velocity
  follow: spring(1, 0.3), // tracking a pointer (tilt)
  magnet: spring(0.85, 0.35), // pointer-attracted elements
  ambient: spring(1, 0.9), // slow background elements
} satisfies Record<string, Transition>

// Where a flick would come to rest, using the same exponential decay as
// scroll deceleration (UIScrollView.DecelerationRate.normal = 0.998).
export function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate)
}

// Progressive resistance past a boundary instead of a hard stop.
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}
