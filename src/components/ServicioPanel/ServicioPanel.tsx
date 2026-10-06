import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './ServicioPanel.module.css'
import type { Servicio } from '../../types/Servicio'
import { whatsappUrlFor } from '../../data/contacto'
import { formatPrecio } from '../../data/format'
import { prefersReducedMotion, project, rubberband, springs } from '../../motion/physics'
import { runSpring, type SpringRun } from '../../motion/spring'

type Props = {
  servicio: Servicio
  /** The card this panel grows out of (and returns to). */
  origin: HTMLElement
  onClosed: () => void
}

// Distance (px) of a downward drag that equals "fully closed".
const DRAG_DISTANCE = 320

const clamp = (n: number, min = 0, max = 1) => Math.min(Math.max(n, min), max)

// One number drives everything: p = 0 is the card, p = 1 is the open panel.
// Opening, closing, dragging and re-grabbing mid-flight all just move p, so the
// panel always continues from where it is on screen, with the velocity it had.
const ServicioPanel = ({ servicio, origin, onClosed }: Props) => {
  const layerRef = useRef<HTMLDivElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const p = useRef(0)
  const run = useRef<SpringRun | null>(null)
  const closing = useRef(false)
  const geo = useRef({ x: 0, y: 0, sx: 1, sy: 1 })
  const drag = useRef<{ startY: number; startP: number; samples: { t: number; y: number }[] } | null>(null)
  const [imageFailed, setImageFailed] = useState(false)
  const reduced = useRef(prefersReducedMotion())

  // Card rect -> panel rect, as a translate + scale around the panel's centre.
  const measure = useCallback(() => {
    const layer = layerRef.current
    const panel = panelRef.current
    if (!layer || !panel) return
    const L = layer.getBoundingClientRect()
    const C = origin.getBoundingClientRect()
    // Layout position (offset*) ignores the current transform, so this holds mid-flight.
    geo.current = {
      x: C.left + C.width / 2 - (L.left + panel.offsetLeft + panel.offsetWidth / 2),
      y: C.top + C.height / 2 - (L.top + panel.offsetTop + panel.offsetHeight / 2),
      sx: C.width / panel.offsetWidth,
      sy: C.height / panel.offsetHeight,
    }
  }, [origin])

  const render = useCallback((value: number) => {
    p.current = value
    const panel = panelRef.current
    const scrim = scrimRef.current
    const content = contentRef.current
    if (!panel || !scrim || !content) return
    scrim.style.opacity = String(clamp(value))
    if (reduced.current) {
      panel.style.opacity = String(clamp(value))
      return
    }
    const g = geo.current
    const q = 1 - value
    panel.style.transform = `translate3d(${g.x * q}px, ${g.y * q}px, 0) scale(${g.sx + (1 - g.sx) * value}, ${g.sy + (1 - g.sy) * value})`
    // The box arrives first; its content follows once it is nearly full size.
    panel.style.opacity = String(clamp(value / 0.3))
    content.style.opacity = String(clamp((value - 0.55) / 0.4))
  }, [])

  const animateTo = useCallback(
    (to: 0 | 1, velocity = 0, config = springs.settle) => {
      const live = run.current?.stop()
      measure()
      run.current = runSpring({
        from: live?.value ?? p.current,
        to,
        velocity: live ? live.velocity : velocity,
        config,
        onUpdate: render,
        onDone: () => {
          run.current = null
          if (to === 0) onClosed()
        },
      })
    },
    [measure, render, onClosed],
  )

  const close = useCallback(
    (velocity = 0) => {
      if (closing.current) return
      closing.current = true
      animateTo(0, velocity)
    },
    [animateTo],
  )

  // Open: laid out at its final size, then released from the card.
  useLayoutEffect(() => {
    measure()
    render(0)
    run.current = runSpring({ from: 0, to: 1, config: springs.settle, onUpdate: render, onDone: () => (run.current = null) })
    return () => {
      run.current?.stop()
      run.current = null
    }
  }, [measure, render])

  // Modal behaviour: background inert + scroll locked, focus moves in, Esc closes.
  useEffect(() => {
    const root = document.getElementById('root')
    const html = document.documentElement
    root?.setAttribute('inert', '')
    html.classList.add('scroll-locked')
    panelRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    const onResize = () => {
      measure()
      render(p.current)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      root?.removeAttribute('inert')
      html.classList.remove('scroll-locked')
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [close, measure, render])

  // Drag the sheet by its media / handle: follows the pointer 1:1, then the
  // release velocity is projected to decide, and handed to the spring.
  const onPointerDown = (e: React.PointerEvent) => {
    if (closing.current || e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const live = run.current?.stop()
    run.current = null
    drag.current = { startY: e.clientY, startP: live?.value ?? p.current, samples: [{ t: e.timeStamp, y: e.clientY }] }
    measure()
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    d.samples.push({ t: e.timeStamp, y: e.clientY })
    if (d.samples.length > 8) d.samples.shift()
    const dy = e.clientY - d.startY // > 0 = pulling down = closing
    let value = d.startP - dy / DRAG_DISTANCE
    if (value > 1) value = 1 + rubberband(value - 1, 1) * 0.35 // soft edge: resist, don't stop
    render(value)
  }

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    const recent = d.samples.filter((s) => e.timeStamp - s.t < 100)
    const first = recent[0]
    const last = recent[recent.length - 1]
    const vy = first && last && last.t > first.t ? ((last.y - first.y) / (last.t - first.t)) * 1000 : 0
    const vp = -vy / DRAG_DISTANCE // px/s -> p/s
    const projected = p.current + project(vp)
    if (projected < 0.55) close(vp)
    else animateTo(1, vp, springs.momentum)
  }

  const cta = whatsappUrlFor(servicio.titulo)

  return createPortal(
    <div ref={layerRef} className={styles.layer}>
      <div ref={scrimRef} className={styles.scrim} onClick={() => close()} />
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="servicio-panel-title"
        tabIndex={-1}
      >
        <div ref={contentRef} className={styles.inner}>
          <div
            className={styles.media}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {imageFailed || !servicio.img ? (
              <div className={styles.placeholder}>Foto próximamente</div>
            ) : (
              <img src={servicio.img} alt={servicio.titulo} draggable={false} onError={() => setImageFailed(true)} />
            )}
            <span className={styles.grabber} aria-hidden="true" />
          </div>

          <div className={styles.text}>
            <div className={styles.body}>
              <span className={styles.eyebrow}>Servicio</span>
              <h2 id="servicio-panel-title" className={styles.title}>{servicio.titulo}</h2>
              <p className={styles.price}>{formatPrecio(servicio.precio)}</p>
              <hr className={styles.divider} />
              <p className={styles.description}>{servicio.descripcion}</p>
            </div>
            <div className={styles.footer}>
              <a className={styles.cta} href={cta} target="_blank" rel="noopener noreferrer">
                Reservar por WhatsApp
              </a>
            </div>
          </div>

          <button type="button" className={styles.closeBtn} aria-label="Cerrar detalle" onClick={() => close()}>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ServicioPanel
