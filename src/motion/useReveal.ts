import { useEffect } from 'react'

// Passive entrances: every [data-reveal] element fades/rises once, the first
// time it enters the viewport. Pure CSS does the motion (spring linear() easing
// in index.css); this hook only flips the attribute. Elements are never
// re-hidden, so nothing dims while it is still on screen.
export function useReveal() {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>('[data-reveal]')
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => (el.dataset.reveal = 'in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          ;(entry.target as HTMLElement).dataset.reveal = 'in'
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}
