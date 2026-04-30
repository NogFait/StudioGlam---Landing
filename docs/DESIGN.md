---
name: Aura of Elegance
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1c1c1a'
  on-tertiary-container: '#858480'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#e5e2de'
  tertiary-fixed-dim: '#c8c6c2'
  on-tertiary-fixed: '#1c1c1a'
  on-tertiary-fixed-variant: '#474744'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Noto Serif
    fontSize: 64px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Noto Serif
    fontSize: 40px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: 0em
  headline-md:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
    letterSpacing: 0em
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.15em
  button:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  section-padding: 120px
---

## Brand & Style

The brand personality is rooted in high-end editorial aesthetics, evoking a sense of exclusive luxury and personalized care. The target audience consists of discerning individuals who view hair styling as an art form and a vital component of their personal brand. The UI must feel curated, calm, and expensive.

This design system utilizes a **Minimalist** foundation with **High-Contrast** accents. It relies on generous whitespace (macro-typography), a restricted but impactful color palette, and a focus on high-quality imagery to communicate prestige. The emotional response should be one of aspiration and confidence—mirroring the feeling of walking out of a premier salon.

## Colors

The palette is a classic "Noir et Or" (Black and Gold) composition. 

- **Primary (Black):** Used for primary typography, borders, and high-impact CTA backgrounds to provide a grounded, authoritative feel.
- **Secondary (Gold):** A metallic-inspired hue used sparingly for accents, active states, and decorative elements to inject warmth and luxury.
- **Tertiary (Bone):** A soft, off-white used for section backgrounds to prevent the "starkness" of pure white, adding a subtle feminine softness.
- **Neutral (White):** Used for card surfaces and primary backgrounds to maintain clarity and breathability.

## Typography

The typography strategy relies on the tension between the classic, editorial Noto Serif and the technical, modern Manrope.

- **Headlines:** Use Noto Serif. For large display text, use tight line heights and slight negative letter spacing to mimic high-fashion mastheads.
- **Body:** Use Manrope for its exceptional readability and clean, architectural feel. 
- **Navigation & Labels:** Always use Manrope in Uppercase with generous letter spacing (tracking) to denote a premium, "boutique" navigational experience.

## Layout & Spacing

This design system follows a **Fixed Grid** model for desktop and a fluid model for mobile. It uses a 12-column system with wide gutters to ensure the interface never feels "cluttered."

The spacing rhythm is intentional and "slow." Large vertical gaps (120px+) between sections are encouraged to allow the eye to rest and focus on one service or brand story at a time. Elements should be aligned to a strict baseline grid to maintain the "Modern" architectural feel.

## Elevation & Depth

To maintain a high-end feel, this system avoids heavy, muddy shadows. Depth is communicated through:

- **Tonal Layers:** Using the Tertiary (Bone) color to distinguish different content zones from the Neutral (White) background.
- **Low-Contrast Outlines:** Using very thin (1px) borders in a light grey or gold for cards and containers, rather than drop shadows.
- **Micro-Shadows:** If a shadow is necessary for a floating action button, use a "Whisper Shadow"—an extremely diffused, low-opacity (5-8%) black shadow with a high vertical offset to simulate a light source directly above.

## Shapes

The shape language is **Sharp (0)**. 

Sharp corners convey precision, modernism, and a "couture" edge. All buttons, input fields, image containers, and cards should have 0px border-radius. This geometric rigor contrasts beautifully with the organic, flowing nature of hair photography, creating a professional and structured frame for the salon's work.

## Components

- **Buttons:** Primary buttons are solid Black with White uppercase text. Secondary buttons are Ghost-style with a thin Black or Gold border. On hover, buttons should fill with Gold.
- **Input Fields:** Minimalist design with only a bottom border (1px Black). Labels sit above in the `label-caps` style.
- **Cards:** No shadows. Use thin 1px borders or simple color blocks to define boundaries. Images within cards should have a subtle zoom effect on hover.
- **Chips/Tags:** Used for hair services (e.g., "Balayage", "Styling"). These should be outlined in Gold with Manrope typography.
- **Service Menu:** A list-based component using Noto Serif for service names and Manrope for prices, separated by a thin dotted line or generous whitespace.
- **Booking Calendar:** A clean, high-contrast interface using simple lines and bold typography to highlight available dates, avoiding heavy "widget" styling.