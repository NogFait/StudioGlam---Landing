---
name: apple-motion
description: Aplica a una web un movimiento estilo Apple que SE NOTA — springs, física, interrumpibilidad, gestos con inercia, elementos compartidos y continuidad espacial, con una sola física coherente — midiendo antes/después en vez de solo cambiar curvas. Úsalo cuando pidan "animaciones estilo Apple", "que se sienta fluido/físico/natural/premium", "springs", "drag/swipe con momentum", "rubber-band", "card que se expande", "interrumpible", unificar o auditar el movimiento de una web. English: apply Apple-style motion behavior that is actually perceptible (springs, velocity handoff, shared-element transitions, interruptibility), proven with before/after motion traces. El movimiento debe costar casi nada: se mide fluidez y rendimiento (frames, hilo principal, bundle) contra una línea base, no solo cómo se ve. Teoría de fondo: `apple-design`; una animación puntual: `animate`; auditoría general de carga: `impeccable` (optimize).
---

# Apple Motion — diseña el comportamiento, y comprueba que se note

> No diseñes "animaciones"; diseña el comportamiento de los elementos.
> Cada acción produce una respuesta inmediata, predecible y natural, regida por **una sola física**.

## Lección que da forma a este skill

La primera versión de este trabajo cambió ~15 archivos y el usuario casi no notó diferencia. Medido: en entradas pasivas (fades/reveals) un `cubic-bezier(0.16,1,0.3,1)` y un spring crítico dibujan **casi la misma curva** (t90 300ms→400ms en una sección, mismo perfil). Sustituir curvas es higiene y consistencia, **no un cambio perceptible**.

La física se siente en cuatro situaciones: **(1) input continuo** (drag, puntero, scroll), **(2) velocidad** (flick, soltar), **(3) interrupción** (cambiar de idea a media animación), **(4) continuidad espacial** (algo se *convierte* en otra cosa). Todo el trabajo se mide contra eso.

## Reglas de diseño (el prompt, ordenado)

1. **Comportamiento antes que duración.** Lo que se toca va con springs.
2. **Respuesta inmediata:** feedback en pointer-down; durante un gesto, el UI sigue al dedo/ratón 1:1.
3. **Interrumpible siempre.** Se anima desde el valor *actual* en pantalla y se hereda su velocidad.
4. **Continuidad espacial.** Un elemento se transforma o viaja; entra y sale por el mismo camino, anclado a su origen.
5. **Gestos ligados.** Al soltar: proyecta el momentum (`project(v)`), decide por la proyección y continúa a la velocidad del gesto.
6. **Límites elásticos** (`rubberband`), nunca cortes secos.
7. **Sutil y coordinado:** desplazamiento + escala + opacidad (+ blur solo en elementos pequeños). Sin rebotes gratuitos ni loops decorativos.
8. **Una sola física** en JS y CSS.
9. **El movimiento no cuesta fluidez.** Cada efecto entra a un presupuesto de rendimiento y se mide contra la línea base (sección *Presupuesto de rendimiento*). Un efecto que baja los fps no es premium: se arregla o se elimina.

## Procedimiento

### Fase 0 — Define qué se va a *sentir* (antes de tocar código)

1. **Mapea las interacciones reales** de la web: qué agarra, toca, hoverea, scrollea o navega el usuario. Anota cuáles ocurren en **escritorio** (ratón/teclado/rueda) y cuáles en **táctil**. *Ninguna interacción puede ser solo-táctil*; en escritorio, hover, drag con ratón y scroll son las superficies.
2. **Elige de 3 a 5 "momentos firma"** de `reference/signature-patterns.md` (A carrusel arrastrable, B card→detalle compartido, C scroll direccional, D profundidad hover/press, E expandir interrumpible, F parallax ligado, G píldora viajera). Requisito mínimo: **uno de manipulación directa o continuidad (A/B)** y **uno ligado al scroll o al puntero (C/D/F)**. Si la web es muy estática, no inventes más de los que el contenido pide.
3. **Escribe el delta esperado de cada uno** en una frase: *"Antes: la card abre un link externo. Después: la card se expande en el sitio y se puede cerrar arrastrando."* Si no puedes escribir esa frase con algo que un usuario notaría, ese cambio no es un momento firma.

### Fase 1 — Inventario y línea base

```bash
grep -rnE "cubic-bezier|transition:|animation:|@keyframes|duration:|ease:|stiffness|damping|scrollIntoView|scroll-behavior|setTimeout" src
```

Clasifica cada hallazgo: **gesto** (springs + MotionValues + velocidad), **estado/entrada** (springs declarativos, exit espejo), **micro-feedback** (spring CSS `linear()` o `whileTap`). Lo decorativo sin significado (pulsos infinitos, flotados) se elimina.

Captura la **línea base** antes de cambiar nada (una rama/worktree de `main` servida aparte) con `scripts/trace-motion.mjs`:

```bash
node scripts/trace-motion.mjs --url http://127.0.0.1:5174/ --selector "#projects > div" --trigger scroll:700 --label before
```

Imprime t10/t50/t90, asentamiento, overshoot y una curva ASCII del movimiento real del elemento.

### Fase 2 — Una física en un archivo

Copia `templates/physics.ts` a `src/motion/physics.ts`: springs descritos como Apple (damping ratio + response) y convertidos con `ω=2π/r, k=ω², c=2ζω`.

| Token | ζ | response | Uso |
|---|---|---|---|
| `press` | 1 | 0.2 | feedback al presionar |
| `snappy` | 1 | 0.3 | UI pequeña, indicadores, menús |
| `settle` | 1 | 0.4 | entrar / reposicionar (default) |
| `gentle` | 1 | 0.55 | superficies grandes |
| `momentum` | 0.8 | 0.4 | **solo** tras un gesto con velocidad |
| `follow` | 1 | 0.3 | seguir al puntero / scroll |
| `magnet` | 0.85 | 0.35 | atraídos por el puntero |
| `ambient` | 1 | 0.9 | fondo, más pesado que lo que se toca |

Default `ζ=1`; rebote (`ζ≈0.8`) solo si el gesto traía momentum. Gemelo CSS: `node scripts/gen-spring.mjs` → `linear(...)` (`--spring`, `--spring-bounce`, `--t-press 160ms`, `--t-snappy 300ms`, `--t-settle 470ms`, `--t-gentle 650ms`). Todo `transition` de **transform** usa `var(--spring)`.

### Fase 3 — Momentos firma primero, refactor después

1. **Implementa los momentos firma** (código en `reference/signature-patterns.md`). Son el entregable; hazlos bien antes de nada más.
2. **Luego** el barrido de consistencia (tokens, `whileTap`, variantes compartidas, Lenis con `lerp`). Esto es valioso pero es *invisible*: no lo presentes como el cambio.

Recetas base (verificadas):

- **Entradas:** variantes compartidas `reveal`/`item`/`focusIn` en un archivo, no props sueltas por componente. Blur solo en elementos pequeños.
- **Press:** `whileTap={{ scale: .985 }} transition={springs.press}` o `:active { transition-duration: var(--t-press) }`; más rápido bajando que subiendo.
- **Superficie que sale de un origen:** `transformOrigin` en el disparador; `hidden` y `exit` con los mismos valores; materializa con **escala + opacidad** (nunca animes `backdrop-filter`: ver *Presupuesto de rendimiento*).
- **Drag con inercia (descartar):**

```tsx
const y = useMotionValue(0)
<motion.div drag="y" dragMomentum={false}
  dragConstraints={{ top: -1200, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.15 }}
  style={{ y }} onDragEnd={(_, i) => {
    const projected = i.offset.y + project(i.velocity.y)
    if (projected < -Math.max(120, height * 0.2)) close({ velocity: i.velocity.y, distance: height })
    else animate(y, 0, { ...springs.momentum, velocity: i.velocity.y })
  }} />
```
- **Scroll:** Lenis con `lerp` (no `duration+easing`); scrolls programáticos por `lenis.scrollTo`, no `scrollIntoView`; CSS oficial `.lenis.lenis-smooth { scroll-behavior:auto !important }`.
- **Pointer-follow:** `useSpring(raw, springs.follow|magnet)`; el valor crudo se escribe 1:1 en cada movimiento.

### Fase 4 — Demuestra la diferencia (obligatorio)

1. **Traza después** con el mismo comando que en la línea base y compara. Regla de delta perceptible:
   - En movimientos **pasivos** (fade/reveal), si t90 varía < ~25% y la silueta ASCII es la misma → **invisible**; no lo cuentes como mejora, solo como consistencia.
   - Un momento firma debe mostrar algo que la línea base **no podía**: seguir un puntero, heredar velocidad, revertir a mitad, transformarse en otro elemento. Pruébalo con interacción real (Playwright: `mouse.down/move/up`, `hover`, doble clic rápido) y mide: posición vs input, continuidad tras soltar, ausencia de saltos al interrumpir.
2. **Haz visible la diferencia al usuario:** graba un clip antes/después con Playwright (`browser.newContext({ recordVideo: { dir, size } })`, mismas acciones en `main` y en la rama) o pasa capturas de frames intermedios (p. ej. a 80/160/320 ms). Los números no sustituyen verlo.
3. Corre `lint` + `build` y `prefers-reduced-motion` (todo visible, `transform: none`).
4. **Fase 4b — rendimiento** (ver *Presupuesto de rendimiento*): mide línea base vs nueva en móvil ×4 y escritorio; si algo cuesta, A/B para aislar y arreglar o eliminar. Sin esta tabla el trabajo no está terminado.
5. **Recorre cada vista y cada navegación** en 1440×900, 1280×720, 1024×768, 768×1024, 390×844, 360×640 **y 1536×744 a dpr 1.25** (una pantalla de 1920×1080 con zoom 125 %, lo que usa gente real): ningún contenido atenuado u oculto mientras se ve, nada tapado por la barra fija, **el texto no solo existe en el DOM: se VE** (mídelo con `scripts/verify-visible-content.example.mjs`: cuánto del panel ocupa la imagen y si los párrafos caen dentro del área visible sin scroll), cada enlace/CTA aterriza donde debe, y el contenido que salió de una card sigue alcanzable en su panel.

Verificaciones que deben cumplirse (ejemplos en `scripts/verify-motion.example.mjs` y `scripts/verify-shared-element.example.mjs`):

| Prueba | Esperado |
|---|---|
| Arrastrar N px | el elemento se desplaza N px (1:1) |
| Pasar el límite | se mueve mucho menos (rubber-band) |
| Soltar sin comprometer | vuelve con spring a la posición |
| Flick | continúa en la misma dirección tras soltar |
| Interrumpir a mitad (doble tap/clic) | sin salto: parte de la posición actual |
| Rueda durante scroll programático | toma el control |
| Elemento compartido: primer rect del panel | **igual al rect de la card**; al cerrar, la última posición vuelve a él (sin deriva tras 3 ciclos) |
| Panel: scroll de fondo y foco | scroll bloqueado al abrir, desbloqueado y foco devuelto al cerrar |
| Barra direccional | se esconde bajando, vuelve subiendo; fija en escritorio |
| Scroll ligado (hero/progreso) | valor a scroll N y vuelta a 0 → **mismo valor** (reversible 1:1) |
| Teclado (Esc/flechas) | cada gesto tiene equivalente |
| Consola | sin errores |

## Presupuesto de rendimiento (obligatorio)

> Mejorar la fluidez percibida **sin** gastar la fluidez real. La navegación de la web debe quedar igual de ligera, o más, que antes del movimiento.

**Reglas**

1. **Anima solo `transform` y `opacity`** (los maneja el compositor). No animes `width/height/top/left/margin` (layout), `box-shadow`, `border-radius` grande, gradientes, ni `filter`/`backdrop-filter`. Excepciones justificadas y pequeñas: un blur de entrada de una sola vez en texto corto (`focusIn`).
2. **Nada de desenfoque a pantalla completa que haga fade.** Medido en este proyecto: un scrim con `backdrop-filter` que aparece/desaparece **duplicó los tiempos de frame** del panel (escritorio p95 100 → 33 ms, máx 217 → 50 ms al quitarlo; móvil con CPU ×4: 91 → 26 frames lentos). Si la superficie ya es casi opaca (≥ .95), el blur es invisible: quítalo. La profundidad la da el oscurecimiento + la sombra del panel.
3. **Presupuesto de efectos ligados al scroll: 1–2, en elementos grandes de jerarquía.** Cada hook de scroll tiene costo. Medido: una barra de progreso (Framer o `animation-timeline: scroll()`) sumó ~10–15 % de trabajo de estilos durante el scroll y en un sitio corto no aportaba: se eliminó. El hero que retrocede y la navbar direccional no costaron nada medible.
4. **No pongas un spring sobre un valor ya suavizado** (Lenis en rueda, scroll nativo en táctil): solo añade un bucle de frames.
5. **Selectores:** evita `:has()` para estados `:hover` en listas que se scrollean (invalida estilos cuando el puntero pasa bajo el contenido). Usa `:hover` directo sobre la celda.
6. **Valores continuos = `MotionValue`, no `useState`.** `setState` solo en cambios discretos (visible/oculto). Sin re-render por frame.
7. **`will-change`:** solo en lo que morfa (el panel), no global. Un bucle de `requestAnimationFrame` por tema, y en pausa fuera de pantalla; en reposo el costo debe ser ≈ al de la línea base.
8. **Bundle:** el movimiento no debe inflar el JS (medido aquí: +4.5 KB gzip, +3 %). Si crece, `LazyMotion` + `m`.
9. **Degradación:** `prefers-reduced-motion` y `prefers-reduced-transparency` apagan lo costoso; en listas largas limita el `stagger` y no animes más de ~10–15 elementos a la vez.

**Medir (Fase 4b — no se salta)**

```bash
# misma orden sobre la línea base y sobre la versión nueva; móvil = CPU ×4 (gama media)
node scripts/measure-perf.mjs --url <base> --profile mobile  --label before
node scripts/measure-perf.mjs --url <new>  --profile mobile  --label after
node scripts/measure-perf.mjs --url <new>  --profile desktop --label after
```

Reporta por escenario (reposo, scroll, hover, menú, panel): p50/p95/máx de frame, frames > 33 ms, long tasks, ms de script/layout/estilo por segundo y nº de layouts/recalcs; y el tamaño gzip del bundle (`cat dist/assets/*.js | gzip -9 | wc -c`).

**Criterios de aceptación**

| Métrica | Debe cumplirse |
|---|---|
| Reposo | script/seg ≈ línea base (sin bucles nuevos) |
| Scroll | script/seg ≤ +10 % y frames > 33 ms no peor que la base |
| Cada interacción nueva (móvil ×4) | p95 ≤ 50 ms (ideal ≤ 33), máx < 150 ms |
| Bundle | JS gzip ≤ +5 % |

**Si falla: A/B para aislar, no adivinar.** Quita una pieza a la vez (o inyecta CSS en caliente: `CSS='…' node scripts/measure-perf.mjs …`) y mide solo ese escenario (`--only scroll`). Así se encontró aquí que el culpable del scroll era la barra de progreso y no el hero ni la navbar, y que el del panel era el blur del scrim. Arregla o elimina; no justifiques con "se ve mejor".

**Cuidado con el entorno:** headless rasteriza por software (p50 ~30 fps en escritorio incluso en el original). Confía en la **diferencia** entre corridas del mismo entorno, repite cada medición 2 veces (el ruido es ±10 %) y confirma en un dispositivo real.

## Trampas reales

- **`exit` no puede depender de estado:** un hijo de `AnimatePresence` conserva las props de su último render. Usa variante `exit` como función + `custom` en `AnimatePresence` **y** en el hijo.
- **Distancias en px, no %**, al animar `exit` desde valores en px.
- **`filter` en contenedores grandes** (aun con `blur(0px)`) deja un stacking context y rompe `backdrop-filter` de los hijos.
- **`transition-duration` en lista se empareja por posición** de propiedad (`transform, box-shadow, opacity` → 3 valores en ese orden).
- **Un `transition:` inline en JSX gana a `:active`** de la hoja de estilos; muévelo a CSS si el press debe ser más rápido.
- **`@keyframes` + `animation-delay`** no se interrumpen ni heredan velocidad; usa variantes con spring.
- **`once:false` + `hidden`/`visible`:** úsalo igual en todas las secciones, y que el re-ocultado ocurra **solo cuando el elemento queda por debajo del viewport**, nunca al salir por arriba ni con un umbral (`threshold`) que apague el final de una sección alta mientras aún se ve (medido en móvil de 360×640: un CTA al 10 % de opacidad a la vista).
- **Un drag dispara el click del link al soltar:** `onClickCapture` que lo cancele si hubo movimiento; `draggable={false}` en imágenes.
- **Una imagen dentro de un flex nunca debe dimensionar su caja.** Con `height:100%` en un hijo de un ítem flex de alto indefinido, la imagen manda su altura natural y empuja el layout (aquí: la captura ocupó 68 % del panel y dejó 120 px al texto que necesitaba 324 px). Caja de alto fijo + `overflow:hidden` + `img` en `position:absolute; inset:0`. Una vista previa pesa ≲ 35 % del panel; el texto es el contenido.
- **`layoutId` + `border-radius`/`box-shadow` en clases:** se deforman al escalar; ponlos en `style`.
- **Panel de un card compartido: renderízalo con `createPortal(…, document.body)`.** Un `position: fixed` dentro de un ancestro con `transform` u `overflow:hidden` (una sección con reveal) se recorta o se ancla mal.
- **El `transition` de un elemento con `layoutId` es también su transición de layout.** Si le das `springs.press` para `whileTap`, el morph usará ese spring (rápido y seco). Usa `transition={{ default: springs.snappy, scale: springs.press, layout: springs.settle }}`.
- **Un morph card→panel cambia el comportamiento del click** (antes abría un link). Dilo explícitamente al usuario y conserva el comportamiento nativo con `Cmd/Ctrl/Shift/middle-click` (deja pasar el `<a href>`); el enlace externo pasa al panel.
- **Una card que abre un detalle debe ponerse a dieta.** Si el panel ya muestra descripción, problema/solución y stack, la card solo lleva imagen, etiqueta, título y ~2 líneas de contexto (`line-clamp: 2`) + una pista de acción ("Ver detalle"). Duplicar el contenido en ambos sitios alarga el scroll móvil (aquí: 2060px → 1502px) y quita sentido al morph. Reduce también las alturas fijas de escritorio para que las cards no queden con huecos.
- **Acción principal siempre visible:** en un panel con scroll interno, fija el CTA como pie (`flex: 0 0 auto`) y deja que solo el cuerpo haga scroll; la imagen cede altura (`clamp(…, 27vh, …)`). Revísalo en 1440×900, **1280×720** y 390×844: en la primera pasada el botón quedaba cortado.
- **Scroll bajo un modal:** `lenis.stop()` + clase en `html` con `overflow:hidden`, y `html { scrollbar-gutter: stable }` para que no salte el layout. Devuelve el foco al disparador al cerrar.
- **Barra que se esconde al bajar:** solo en anchos táctiles/tablet; en escritorio la píldora de sección activa es parte de la orientación. Umbral de ±4px para ignorar el jitter del scroll inercial, y fuerza visible con foco/menú abierto.

## Cómo probar sin engañarte (entornos headless)

- **Pocos fps ≠ saltos.** En headless por software los frames llegan cada 100-170 ms. Un "salto de 130px por frame" suele ser un hueco de muestreo: mira los **timestamps** y que la serie sea continua/monótona, no el delta por frame.
- **Un arrastre "lento" tiene que serlo de verdad.** 10px cada 16ms son ~600px/s (un flick: se descartará, correctamente). Para probar "soltar sin comprometer" usa ~70ms por paso y una pausa antes de soltar.
- **`page.clock` (reloj simulado, 16ms/frame)** sirve para capturar la *forma* de una transición de manera determinista, pero los `delay`/timers de contenido pueden no avanzar: un cuerpo "vacío" ahí puede ser artefacto. Confirma siempre con una captura en tiempo real.
- **Reduced-motion:** espera ≥ 1 s antes de afirmar que algo no cerró (el scrim aún hace fade de opacidad).
- Captura el estado final en **3 viewports** (1440×900, 1280×720, 390×844): ahí aparecen los recortes que ninguna métrica de movimiento detecta.

## Accesibilidad

`MotionConfig reducedMotion="user"`; `prefers-reduced-transparency` quita `backdrop-filter`; el smooth-scroll se desactiva con reduced motion. Todo gesto tiene vía de tap/teclado; los diálogos conservan foco, `Esc` y `aria-modal`.

## Anti-patrones

- Presentar un barrido de curvas como "la mejora" cuando no se nota.
- Dar por bueno un contenido porque "está en el DOM" o porque "tiene scroll": si el texto principal queda recortado en una pantalla común (1080p con zoom), no está.
- `cubic-bezier` + duración fija en algo que el usuario toca.
- Animar el destino en vez del valor actual; bloquear input mientras anima.
- Aparecer/desaparecer sin origen; entrar por un lado y salir por otro.
- Rebotes sin momentum previo; springs distintos "porque sí".
- Bucles decorativos; cortes secos en los límites.
- Gestos solo táctiles, o sin equivalente de teclado.
- Contenido que se atenúa o se oculta **mientras todavía está a la vista** (reveals que se repiten, fades de scroll que bajan de ~0.6).
- Animar `backdrop-filter`/`filter`/layout, o decorar con efectos ligados al scroll sin medir su costo.

## Entregable

Al terminar, reporta con honestidad: (1) los **momentos firma** y su *antes → después* en una frase, (2) la **tabla de trazas** antes/después con cuáles son perceptibles y cuáles solo consistencia, (3) tokens de física y dónde viven, (4) qué se eliminó, (5) **tabla de rendimiento antes/después** (móvil ×4 y escritorio) con lo que se tuvo que arreglar o eliminar, (6) cómo ver la diferencia (clip/capturas) y qué falta probar en hardware real.
