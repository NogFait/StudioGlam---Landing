import { useEffect, useRef } from 'react'
import styles from './Hero.module.css'
import peinando from '../../assets/peinando.webp'
import { WHATSAPP_URL } from '../../data/contacto'
import { prefersReducedMotion } from '../../motion/physics'

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // The hero recedes as you leave it: image sinks and settles, copy lifts and
  // softens. Progress is the scroll position itself (1:1, reversible), written
  // straight to transform/opacity — no state, no re-render.
  useEffect(() => {
    const section = sectionRef.current
    const bg = bgRef.current
    const content = contentRef.current
    if (!section || !bg || !content || prefersReducedMotion()) return

    let ticking = false
    let lastP = -1
    // Cached: reading layout inside the scroll frame would force a reflow each time.
    let height = section.offsetHeight
    const ro = new ResizeObserver(() => {
      height = section.offsetHeight
      lastP = -1
    })
    ro.observe(section)
    const apply = () => {
      ticking = false
      const p = Math.min(Math.max(window.scrollY / height, 0), 1)
      if (p === lastP) return
      lastP = p
      bg.style.transform = `translate3d(0, ${p * 14}%, 0) scale(${1.08 - p * 0.08})`
      content.style.transform = `translate3d(0, ${p * -48}px, 0) scale(${1 - p * 0.05})`
      content.style.opacity = String(1 - p * 0.6)
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(apply)
    }
    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <section ref={sectionRef} className={styles.hero} id="top">
      <div
        ref={bgRef}
        className={styles.bg}
        style={{ backgroundImage: `url(${peinando})` }}
        aria-hidden="true"
      />
      <div ref={contentRef} className={styles.content}>
        <h1 className={styles.title} data-reveal style={{ '--i': 0 } as React.CSSProperties}>
          Studio Glam
        </h1>
        <hr className={styles.divider} data-reveal style={{ '--i': 1 } as React.CSSProperties} />
        <h2 className={styles.subtitle} data-reveal style={{ '--i': 2 } as React.CSSProperties}>
          CORTES, COLORACIÓN Y ESTILO PROFESIONAL
        </h2>
        <hr className={styles.divider} data-reveal style={{ '--i': 3 } as React.CSSProperties} />
        <div data-reveal style={{ '--i': 4 } as React.CSSProperties}>
          <a className={styles.ctaButton} href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            RESERVAR TURNO POR WHATSAPP
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero
