# Patrones firma (los que SÍ se sienten)

Cambiar un `cubic-bezier` por un spring en un fade de entrada **no se nota**: un expo-out y un spring crítico dibujan casi la misma curva. La física se siente cuando hay *input continuo, velocidad, interrupción o continuidad espacial*. Estos patrones son donde eso ocurre. Elige 3–5 según la web; cubre al menos uno de A/B (manipulación directa o continuidad) y uno de C/F (scroll).

Todos usan `springs`/`project`/`rubberband` de `templates/physics.ts` (Framer Motion v12). Pruébalos con `scripts/trace-motion.mjs` y con interacción real; el código es la receta, ajusta medidas y selectores.

> Regla de dispositivos: ninguno puede ser solo-táctil. Con `drag` de Framer funcionan igual con ratón; añade equivalente de teclado (flechas / Esc / Enter) para cada gesto.

---

## A. Carrusel/lista arrastrable con snap y momentum (manipulación directa)

Se siente: lo agarras, sigue tu mano 1:1, un flick lo lanza al *siguiente* punto de snap según su velocidad, y en los extremos resiste (rubber-band).

```tsx
const x = useMotionValue(0)
const trackRef = useRef<HTMLDivElement>(null)
const [moved, setMoved] = useState(false)

const snapTo = (velocity: number) => {
  const track = trackRef.current!
  const step = track.children[0].getBoundingClientRect().width + GAP // ancho de card + gap
  const min = -(track.scrollWidth - track.parentElement!.clientWidth) // límite izquierdo
  const projected = x.get() + project(velocity)                       // a dónde iría el flick
  const target = Math.max(min, Math.min(0, Math.round(projected / step) * step))
  animate(x, target, { ...springs.momentum, velocity })               // hereda la velocidad del dedo
}

<motion.div ref={trackRef} style={{ x, display: 'flex', gap: GAP, cursor: 'grab' }}
  drag="x" dragMomentum={false} dragElastic={0.12}
  dragConstraints={{ left: min, right: 0 }}          // fuera de rango: rubber-band
  onDragStart={() => setMoved(true)}
  onDragEnd={(_, i) => { snapTo(i.velocity.x); setTimeout(() => setMoved(false), 0) }}
  whileDrag={{ cursor: 'grabbing' }}
>
  {items.map(it => <a key={it.id} draggable={false}
      onClickCapture={e => moved && e.preventDefault()}  /* un arrastre no es un click */ />)}
</motion.div>
```

Trampas: `draggable={false}` en imágenes/links; `user-select: none`; sin `onClickCapture` el drag dispara el link al soltar; recalcula `min` en `resize`; añade ←/→ para cambiar de snap con `animate(x, …, springs.settle)`.

## B. Elemento compartido: card → detalle (continuidad espacial)

Se siente: la card **se convierte** en el panel (en móvil, una hoja inferior); no se abre un modal aparte. Verificado en producción de este repo: el panel nace exactamente en el rect de la card y al cerrar vuelve a él; interrumpir a mitad revierte desde la posición actual.

```tsx
// Card: un <a href> que en click normal abre el panel (Cmd/Ctrl/middle-click siguen al link)
const interactive = {
  href, target: '_blank', rel: 'noopener noreferrer',
  layoutId: `project-${id}`,
  onClick: (e) => { if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                    e.preventDefault(); resetTilt(); onOpen(id, e.currentTarget) },
  whileHover: { y: -4 }, whileTap: { scale: 0.985 },
  transition: { default: springs.snappy, scale: springs.press, layout: springs.settle }, // 'layout' = el morph
}

// Padre: LayoutGroup + AnimatePresence; al cerrar, foco de vuelta a la card
<LayoutGroup>
  <Grid>{cards.map(c => <Card {...c} onOpen={open} />)}</Grid>
  <AnimatePresence>{openItem && <Detail key={openItem.id} item={openItem} onClose={close} />}</AnimatePresence>
</LayoutGroup>

// Detail: PORTAL (evita ancestros con transform/overflow), scrim, y el panel con el mismo layoutId
createPortal(<>
  <motion.div onClick={onClose} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:'fixed',inset:0,zIndex:1100}}>
    <motion.div style={{ position:'absolute', inset:0, opacity: dim /* = useTransform(y,[0,360],[1,.2]) */, background:'rgba(6,14,32,.8)' /* SIN backdrop-filter: un blur a pantalla completa con fade duplica los tiempos de frame */ }} />
  </motion.div>
  <div style={{ position:'fixed', inset:0, zIndex:1101, display:'flex', alignItems: isMobile?'flex-end':'center', justifyContent:'center', pointerEvents:'none' }}>
    <motion.div layoutId={`project-${id}`} role="dialog" aria-modal="true" aria-labelledby={titleId}
      transition={{ default: springs.settle, layout: springs.settle }}
      drag={isMobile ? 'y' : false} dragListener={false} dragControls={controls} dragMomentum={false}
      dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0.12, bottom: 1 }}  // hacia abajo libre, hacia arriba rubber-band
      onDragEnd={(_, i) => {
        const projected = i.offset.y + project(i.velocity.y)
        if (projected > Math.max(140, height * 0.25)) { onClose(); animate(y, 0, { ...springs.settle, velocity: i.velocity.y }) } // vuela de vuelta a su card
        else animate(y, 0, { ...springs.momentum, velocity: i.velocity.y })
      }}
      style={{ y, scale /* useTransform(y,[0,400],[1,.94]) */, borderRadius, pointerEvents:'auto', /* radius/sombra en style */ }}>
      <div onPointerDown={isMobile ? e => controls.start(e) : undefined} style={{ touchAction: isMobile ? 'none' : 'auto' }}>{/* cabecera = zona de agarre */}</div>
      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0,transition:{...springs.settle,delay:.1}}} exit={{opacity:0,transition:{duration:.08}}}>
        {/* cuerpo con scroll (data-lenis-prevent) + CTA fijo como pie */}
      </motion.div>
    </motion.div>
  </div>
</>, document.body)
```

Trampas: portal obligatorio; `transition.layout` explícito; radius/sombra en `style`; el contenido nuevo entra *después* de la forma; bloquear scroll (`lockScroll`) y devolver foco al cerrar; Esc + trampa de Tab; el CTA como pie fijo (no dentro del scroll); `scrollbar-gutter: stable`; sin `onOpen` la card sigue siendo un link normal. El fondo se atenúa ligado a `y`, y la hoja se encoge a 0.94 mientras se arrastra: cada píxel del gesto tiene respuesta visible.

## C. Scroll con dirección/velocidad (el chrome responde al scroll)

```tsx
const { scrollY } = useScroll()
const [hidden, setHidden] = useState(false)
useMotionValueEvent(scrollY, 'change', y => {
  const prev = scrollY.getPrevious() ?? 0
  setHidden(y > prev && y > 120)            // baja → se esconde; sube → vuelve
})
<motion.nav animate={{ y: hidden ? -72 : 0 }} transition={springs.snappy} />
```

Variante con velocidad (sutil, ±2°; **mídela antes de dejarla**, re-rasteriza el elemento en cada tick; solo en elementos grandes y lentos): `const v = useSpring(useVelocity(scrollY), springs.follow)`; `const skew = useTransform(v, [-2000, 2000], [-2, 2], { clamp: true })`. Si se nota "mareo", baja el rango.

## D. Profundidad en hover/press (micro, pero constante)

Se siente: la card se *levanta* hacia el puntero y se hunde al presionar; es lo que más se toca.

```tsx
<motion.a whileHover={{ y: -4 }} whileTap={{ scale: 0.985, y: 0 }} transition={springs.snappy} className="card" />
```
Sombra sin animar `box-shadow` (no es compositor): pseudo-elemento `.card::after` con la sombra grande y `opacity: 0 → 1` en `:hover` con `transition: opacity var(--t-snappy) var(--spring)`. Solo `@media (hover: hover) and (pointer: fine)`; en táctil, solo el press.

## E. Expandir/colapsar interrumpible (acordeón, FAQ, detalles)

> Animar `height` dispara layout en cada frame: úsalo en paneles pequeños y pocos a la vez; mídelo si la lista es larga.

```tsx
<AnimatePresence initial={false}>
  {open && <motion.div key="body"
    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
    exit={{ height: 0, opacity: 0 }} transition={springs.settle} style={{ overflow: 'hidden' }} />}
</AnimatePresence>
```
Clic doble rápido debe revertir desde la altura actual sin saltar (Framer lo hace con springs; con CSS `height` no). Contenido interno en `opacity` + leve `y`, no animar su layout.

## F. Parallax ligado al scroll (presupuesto: 1–2 en toda la página)

> Una barra de progreso de lectura **no** entra aquí: medida, sumó ~10–15 % de estilos en scroll (con Framer y también con `animation-timeline: scroll()`) y en un sitio corto no aporta. Úsalo para el elemento de jerarquía (el hero), no para decorar.

```tsx
const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
const p = useSpring(scrollYProgress, springs.follow)   // suaviza sin retrasar de más
const y = useTransform(p, [0, 1], [40, -40])
```
El valor sigue al scroll (ligado), el spring solo le quita el escalonado. Úsalo para 1–2 elementos de jerarquía (imagen hero, barra de progreso), no para todo.

## G. Selector con "píldora" que viaja (tabs/segmentado/nav)

```tsx
{active === t.id && <motion.span layoutId="pill" className="pill" transition={springs.snappy} />}
```
La píldora **viaja** entre opciones en vez de apagarse y encenderse; si el usuario cambia rápido, redirige sin saltos.

---

## Criterio de elección

| Si la web tiene… | Prioriza |
|---|---|
| Lista/grilla de proyectos o productos | B (card → detalle), A (carrusel), D |
| Navegación fija / secciones largas | C, G, F |
| Contenido plegable | E |
| Muy estática (portafolio simple) | D + C + 1 gesto firma (A o B); no inventes más |
