# Studio Glam

Sitio web premium para salón de alta gama en Mendoza. Diseñado con una estética editorial minimalista inspirada en el concepto **"Aura of Elegance"** — negro y dorado, tipografía serif elegante, espacios amplios y sensación de lujo.

## 🛠️ Stack

- **React 19** + **TypeScript**
- **Vite** como bundler
- **CSS Modules** — todos los estilos están encapsulados por componente
- **Google Fonts** — Noto Serif (títulos) + Manrope (cuerpo y navegación)

## 🎨 Design System

El sistema de diseño está definido en `docs/DESIGN.md` y se aplica estrictamente:

| Token | Valor |
|---|---|
| **Primario** | `#000000` — fondos CTA, bordes, títulos de alto impacto |
| **Secundario** | `#fed65b` / `#e9c349` — acentos dorados, hover, estados activos |
| **Superficie** | `#f9f9f9` — fondo general (bone/off-white) |
| **Tipografía display** | Noto Serif, 64px, line-height 1.1, tracking negativo |
| **Tipografía cuerpo** | Manrope, 16px, line-height 1.6 |
| **Labels / Navegación** | Manrope uppercase, 12px, tracking 0.15em |
| **Bordes** | Siempre 0px (sharp corners) |
| **Sombras** | No se usan — profundidad con bordes 1px y tonal layers |
| **Espaciado secciones** | 120px vertical |
| **Max width** | 1280px |

### Componentes visuales

- **Botón primario:** fondo negro, texto blanco, hover dorado
- **Botón secundario:** borde fino negro/dorado, hover dorado
- **Cards:** sin sombras, borde 1px, zoom sutil en imágenes al hover
- **Mapa:** escala de grises por defecto, color al hover

## 📁 Estructura

```
src/
├── assets/                  # Imágenes procesadas por Vite (hash + optimización)
│   └── peinando.webp        # Hero background (66KB, comprimida desde 1.3MB PNG)
├── components/              # Componentes UI con sus CSS Modules
│   ├── About/               # Sección "Sobre nosotros"
│   ├── Contact/             # Contacto + mapa (2 columnas desktop, stack mobile)
│   ├── Footer/              # Footer con navegación
│   ├── Hero/                # Hero con imagen de fondo + overlay oscuro
│   ├── Navbar/              # Fixed navbar + burger menu en mobile
│   ├── ResenaCard/          # Tarjeta de testimonio individual
│   ├── ResenaList/          # Grid de testimonios
│   ├── Resenas/             # Sección de reseñas
│   ├── ServicioCard/        # Tarjeta de servicio individual
│   ├── ServiciosList/       # Grid de servicios
│   └── Servicios/           # Sección de servicios
├── data/                    # Datos estáticos (servicios, reseñas)
├── types/                   # Interfaces TypeScript
├── index.css                # CSS global: variables, reset, tipografía base
├── App.tsx                  # Layout principal
└── main.tsx                 # Entry point
```

## 📱 Responsive

| Breakpoint | Target | Comportamiento |
|---|---|---|
| `> 1024px` | Desktop | Layout completo, grids de 3 columnas |
| `768px – 1024px` | Tablet | Grids de 2 columnas |
| `480px – 768px` | Mobile | Layout stack vertical, burger menu |
| `< 480px` | Mobile pequeño | Tipografías reducidas, botones full-width |

## 🚀 Comandos

```bash
pnpm dev       # Servidor de desarrollo
pnpm build     # Build de producción
pnpm preview   # Preview del build local
pnpm lint      # ESLint
```

## 🔧 Decisiones técnicas

- **Imágenes en `src/assets/`:** Vite las procesa con hash de versión (cache busting automático). El `peinando.webp` se generó desde un PNG de 1.3MB → 66KB.
- **Favicon en `public/`:** Nombre fijo sin hash, necesario para que el browser lo resuelva correctamente.
- **Navegación por anchor links:** Cada sección tiene un `id` y `scroll-margin-top: 100px` para compensar el navbar fixed.
- **Overlay del menú mobile:** Separado del navList como elemento propio para que el `position: fixed` funcione correctamente sin interferir con `transform`.

## 📄 Licencia

Todos los derechos reservados — Fausto Chirino © 2026
