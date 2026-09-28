---
target: landing page completa (index)
total_score: 17
max_score: 32
na_heuristics: 7,10
p0_count: 2
p1_count: 2
target_identity: "file:/home/user/StudioGlam---Landing/landing page completa (index)"
timestamp: 2026-09-28T05-17-24Z
slug: landing-page-completa-index
---
Method: dual-agent (A: ad79f4061cb216d5b · B: a1891791ddd14122c)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No feedback state on the two CTA buttons; broken images give no visible fallback |
| 2 | Match System / Real World | 3 | Spanish copy, real Mendoza address, peso pricing all fit |
| 3 | User Control and Freedom | 3 | Nav anchors and mobile burger menu work correctly |
| 4 | Consistency and Standards | 3 | CSS vars and 0px-radius rule applied consistently across components |
| 5 | Error Prevention | 1 | No `onError` fallback for images; dead buttons give zero indication anything failed |
| 6 | Recognition Rather Than Recall | 3 | Nav labels clear and persistent |
| 7 | Flexibility and Efficiency | n/a | Not applicable to a Persuade-mode landing page |
| 8 | Aesthetic and Minimalist Design | 2 | Intent is minimalist, but 3 broken image boxes + an empty map box break it |
| 9 | Error Recovery | 0 | The "RESERVAR TURNO POR WHATSAPP" buttons have no `href`, `onClick`, or `wa.me/` link anywhere in the codebase — clicking does nothing |
| 10 | Help and Documentation | n/a | Not applicable to a Persuade-mode landing page |
| **Total** | | **17/32** | **Acceptable (53%)** |

## Design Specificity Verdict

**LLM assessment**: Mostly generic, with specific touches undermined by execution. The real address (Av. Arístides Villanueva 450, a well-known Mendoza street), Spanish copy, and peso pricing are salon/city-specific. But the imagery is not: the About section uses a Shutterstock **vector clipart stock illustration** as if it were a real photo, and two of three service images are `encrypted-tbn0.gstatic.com` Google Images cache thumbnails — scraped, not owned. Combined with a fabricated Google Maps embed (place-ID string contains a repeating `3e3e3e3e` placeholder pattern, not a real place), the page reads as a template filled with real text but never given real assets. Swap the address and it's any salon in any city.

**Deterministic scan**: The static CLI scan (`impeccable detect --json src`) found 20 findings: 18 advisory `design-system-font-size` deviations (literal px values off the DESIGN.md type ramp, spread across About, Contact, Footer, Hero, Navbar, ResenaCard, Resenas, ServicioCard, Servicios, index.css) and 2 `layout-transition` warnings (`transition: width` in `Footer.module.css:48` and `Navbar.module.css:181`/64 — animating a layout property instead of `transform`). The live browser overlay (DOM-based, distinct engine from the CLI) additionally flagged 2× `kicker-above-heading` (the "NUESTRA ESENCIA" and "TESTIMONIOS" eyebrow labels sitting directly above their headings) — **this reads as a false positive here**: DESIGN.md explicitly documents uppercase tracked Manrope labels above serif headings as the intended "boutique" navigational pattern, so this is the brief being followed, not violated. Both engines agreed on the `layout-transition` finding.

Net picture: the mechanical scan is clean of anything severe (no errors, all advisory/warning) — the real damage is entirely in content/functionality that no static scanner can see: dead CTAs, broken/placeholder imagery, a fake map, and duplicated copy.

## Overall Impression

The typography and shape system are genuinely well executed and match the documented "Noir et Or" brief. But the page cannot currently do its one job: convert a visitor into a booking. The primary call-to-action is a completely non-functional button, three of four content images are broken placeholders, and the map is fake. This isn't a polish problem, it's a "the funnel doesn't exist yet" problem — biggest opportunity is making the site actually bookable and giving it real photography before touching anything cosmetic.

## What's Working

1. **Typography discipline** — Noto Serif headings + Manrope body/uppercase tracked labels, applied consistently exactly as DESIGN.md specifies.
2. **Sharp shape language** — 0px border-radius enforced everywhere (cards, buttons, images), giving the "couture edge" the brief calls for.
3. **Mobile nav** — the burger-to-X animation and slide-in panel (`Navbar.tsx`) is a genuinely well-built micro-interaction, better crafted than the rest of the page.

## Priority Issues

**[P0] The booking CTA does nothing.** `Hero.tsx` and `Contact.tsx` render `<button>RESERVAR TURNO POR WHATSAPP</button>` with no `href`, `onClick`, or `wa.me/` link anywhere in the repo (confirmed by grep — zero matches). This is the entire business purpose of the page and it's a no-op.
Fix: wrap in `<a href="https://wa.me/549261XXXXXXX?text=Hola!%20Quiero%20reservar%20un%20turno">` (real number needed) or add an onClick that opens it.
Suggested command: `/impeccable harden`

**[P0] Three of four content images are broken.** `About.tsx` uses a Shutterstock stock-page URL (not a licensed CDN asset) and two `dataServicios.ts` entries use `encrypted-tbn0.gstatic.com` Google Images cache thumbnails — all three render as empty bordered boxes with raw alt text visible, confirmed on both desktop and mobile screenshots.
Fix: replace with real, licensed/owned photography (the salon's actual work, like the one service image that already uses a proper base64/asset image), and add an `onError` fallback so a broken URL never renders as a blank box with visible alt text.
Suggested command: `/impeccable harden`

**[P1] The map is fake.** `Contact.tsx`'s Google Maps iframe `src` contains a fabricated place-ID (a repeating `3e3e3e3e...` placeholder pattern instead of a real ID) and renders as an empty grey box — no pin, no map.
Fix: generate a real embed URL from Google Maps for Av. Arístides Villanueva 450, Mendoza.
Suggested command: `/impeccable harden`

**[P1] The visual language is too flat for a stated "high-end" brand.** Gold appears only in 12px labels and star ratings — the page reads as black-and-white/generic rather than the documented "Noir et Or" luxury. There are also no entrance/scroll animations anywhere, despite DESIGN.md's emphasis on a curated, aspirational feel, and the detector's 2 `layout-transition` warnings show the only transitions present animate the wrong property.
Fix: use gold more deliberately (hover states, dividers, accents on the service cards), add restrained entrance/scroll motion using `transform`/`opacity` per the `emil-design-eng` skill's animation rules (ease-out, <300ms for UI, custom cubic-bezier curves).
Suggested command: `/impeccable colorize` then `/impeccable animate`

**[P2] A testimonial is duplicated copy, not a real quote.** `dataResenas.ts`'s first review ("Corte personalizado según tu estilo y tipo de rostro.") is a verbatim copy of the Corte de Cabello service description in `dataServicios.ts` — not an actual customer quote. This undermines trust exactly where trust-building is the section's purpose.
Fix: write (or collect) a real testimonial.
Suggested command: `/impeccable clarify`

## Persona Red Flags

**Jordan (Confused First-Timer)**: Lands on the Hero, sees "RESERVAR TURNO POR WHATSAPP," clicks expecting WhatsApp to open — nothing happens, no error, no feedback. Jordan assumes the site is broken and leaves without ever reaching the phone number or address in Contact.

**Riley (Deliberate Stress Tester)**: Immediately notices the About section image never loads (broken-image state + visible alt text "herramientas peluqueria"), then finds the same failure in 2 of 3 service cards and the map. Concludes the whole site is unmaintained — damaging trust for a business that handles a physical, appearance-related service.

**Casey (Distracted Mobile User)**: On the 390px screenshot, the broken image placeholders still reserve their full aspect-ratio box, so Casey scrolls past large chunks of blank white space before reaching real content — reads as unfinished rather than "spacious." The dead CTA sits right after the fake map: two dead ends back to back.

## Minor Observations

- `Contact.module.css` schedule text reads "Martes a Sabado" — missing the accent on "Sábado."
- Footer copyright reads "© 2026 Fausto Chirino" (the developer's name) rather than the business name.
- DESIGN.md specifies Chips/Tags for services and a Booking Calendar component; neither exists in the current implementation.
- `dataServicios.ts`'s first service embeds a large base64 JPEG directly in source (bloats the JS bundle) instead of a static asset import like `Hero.tsx` correctly does with `peinando.webp`.

## Questions to Consider

1. If the entire funnel exists to drive a WhatsApp booking, was the CTA ever clicked end-to-end before shipping?
2. The brief is "high-end editorial" luxury — does a stock clipart pattern and two Google Images thumbnails belong on a page about "high-quality imagery" and prestige?
3. Gold is used so sparingly it's nearly invisible — is "restrained" actually reading as "unfinished" to a first-time visitor who has never seen DESIGN.md?
