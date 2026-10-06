import { useEffect, useRef, useState } from 'react'
import styles from './Navbar.module.css'

const LINKS = [
  { id: 'about', label: 'Sobre nosotros' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'resenas', label: 'Reseñas' },
  { id: 'contacto', label: 'Contacto' },
]

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [indicator, setIndicator] = useState<{ x: number; w: number } | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const navRef = useRef<HTMLElement>(null)

  const closeMenu = () => setIsOpen(false)

  // Section in view -> active link.
  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    const visible = new Set<string>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id)
          else visible.delete(e.target.id)
        }
        // A thin band across the middle of the viewport decides the active section.
        setActive(LINKS.find((l) => visible.has(l.id))?.id ?? null)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  // The gold line travels to the hovered link, and rests on the active one.
  const target = hovered ?? active
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const measure = () => {
      const link = target ? list.querySelector<HTMLElement>(`[data-id="${target}"]`) : null
      setIndicator(link ? { x: link.offsetLeft, w: link.offsetWidth } : null)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    document.fonts?.ready.then(measure)
    return () => ro.disconnect()
  }, [target])

  // Touch widths: the bar leaves while reading, returns on the first upward move.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    let lastY = window.scrollY
    let ticking = false
    const update = () => {
      ticking = false
      const y = window.scrollY
      const dy = y - lastY
      if (!mq.matches) setHidden(false)
      else if (dy > 4 && y > 80) setHidden(true)
      else if (dy < -4 || y <= 80) setHidden(false)
      if (Math.abs(dy) > 4) lastY = y
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Open menu: lock page scroll, Esc closes.
  useEffect(() => {
    if (!isOpen) return
    document.documentElement.classList.add('scroll-locked')
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.classList.remove('scroll-locked')
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen])

  const barHidden = hidden && !isOpen

  return (
    <>
      <nav
        ref={navRef}
        className={`${styles.navbar} ${barHidden ? styles.navbarHidden : ''}`}
        onFocusCapture={() => setHidden(false)}
      >
        <div className={styles.navbarInner}>
          <a className={styles.brand} href="#top" aria-label="Studio Glam, ir al inicio">
            STUDIO GLAM
          </a>

          <ul
            ref={listRef}
            className={`${styles.navList} ${isOpen ? styles.navListOpen : ''}`}
            onMouseLeave={() => setHovered(null)}
          >
            {LINKS.map((l) => (
              <li key={l.id} className={styles.navItem}>
                <a
                  href={`#${l.id}`}
                  data-id={l.id}
                  aria-current={active === l.id ? 'true' : undefined}
                  className={active === l.id ? styles.current : undefined}
                  onClick={closeMenu}
                  onMouseEnter={() => setHovered(l.id)}
                  onFocus={() => setHovered(l.id)}
                  onBlur={() => setHovered(null)}
                >
                  {l.label}
                </a>
              </li>
            ))}
            <span
              className={styles.indicator}
              aria-hidden="true"
              style={
                indicator
                  ? { transform: `translateX(${indicator.x}px) scaleX(${indicator.w})`, opacity: 1 }
                  : undefined
              }
            />
          </ul>

          <button
            className={`${styles.burger} ${isOpen ? styles.burgerOpen : ''}`}
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
    </>
  )
}

export default Navbar
