// Single source of truth for how things move on this site.
//
// Every spring is described the way Apple describes them: a damping ratio
// (1 = no overshoot, < 1 = bounces) and a response in seconds (lower = snappier).
// `spring()` converts that pair into stiffness/damping (mass 1) for the JS
// solver in ./spring.ts. The CSS twins live in index.css (--spring-*, --t-*),
// generated from the same ζ/response pairs.

export type SpringConfig = { stiffness: number; damping: number }

export function spring(dampingRatio: number, response: number): SpringConfig {
  const omega = (2 * Math.PI) / response
  return { stiffness: omega * omega, damping: 2 * dampingRatio * omega }
}

// Default is critically damped: graceful, never distracting. Bounce (< 1) is
// reserved for motion that already carried momentum (a flick, a release).
export const springs = {
  press: spring(1, 0.2), // pointer-down feedback
  snappy: spring(1, 0.3), // small UI: indicators, menus
  settle: spring(1, 0.4), // default for entering / moving things
  gentle: spring(1, 0.55), // large surfaces
  momentum: spring(0.8, 0.4), // after a gesture that carried velocity
} satisfies Record<string, SpringConfig>

// Where a flick would come to rest, using the same exponential decay as
// scroll deceleration (UIScrollView.DecelerationRate.normal = 0.998).
export function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate)
}

// Progressive resistance past a boundary instead of a hard stop.
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
