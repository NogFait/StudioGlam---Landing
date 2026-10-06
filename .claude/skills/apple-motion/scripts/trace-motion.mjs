// Motion fingerprint: samples an element's opacity / translateY / scale every
// frame after a trigger and prints how it actually moves. Use it to (a) measure a
// BEFORE (baseline branch) vs AFTER pass and prove the difference is perceptible,
// and (b) catch curves that are "the same animation with a new name".
//
//   node trace-motion.mjs --url http://127.0.0.1:5173/ --selector "#projects > div" \
//        --trigger scroll:900 [--ms 1500] [--viewport 1440x900] [--label after]
//
// Triggers: load | scroll:<y> | click:<css selector> | hover:<css selector>
// Needs `playwright` resolvable (npm i -D playwright, or NODE_PATH) and a Chromium.

import { chromium } from 'playwright'

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
)
const { url, selector, trigger = 'load', ms = '1500', viewport = '1440x900', label = '' } = args
if (!url || !selector) {
  console.error('usage: --url <url> --selector <css> [--trigger load|scroll:Y|click:SEL|hover:SEL] [--ms 1500] [--viewport WxH] [--label x]')
  process.exit(1)
}
const [w, h] = viewport.split('x').map(Number)

const sampler = `
  window.__startTrace = (selector, ms) => {
    window.__trace = []
    let t0 = null
    const tick = (now) => {
      const el = document.querySelector(selector)
      if (el) {
        if (t0 === null) t0 = now
        const cs = getComputedStyle(el)
        const m = new DOMMatrix(cs.transform === 'none' ? undefined : cs.transform)
        window.__trace.push({ t: now - t0, o: +cs.opacity, y: m.m42, s: m.a })
      }
      if (t0 === null || now - t0 < ms) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }
`

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: w, height: h } })
const page = await ctx.newPage()
await page.addInitScript(sampler)

if (trigger === 'load') {
  await page.addInitScript(`document.addEventListener('DOMContentLoaded', () => window.__startTrace(${JSON.stringify(selector)}, ${ms}))`)
  await page.goto(url)
} else {
  await page.goto(url)
  await page.waitForTimeout(1500) // let load animations finish first
  await page.evaluate(([s, m]) => window.__startTrace(s, m), [selector, +ms])
  const [kind, ...rest] = trigger.split(':')
  const val = rest.join(':')
  if (kind === 'scroll') await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), +val)
  else if (kind === 'click') await page.click(val)
  else if (kind === 'hover') await page.hover(val)
}
await page.waitForTimeout(+ms + 300)
const trace = await page.evaluate(() => window.__trace ?? [])
await browser.close()

if (trace.length < 3) {
  console.log('no samples — selector never appeared or trigger did not start motion')
  process.exit(2)
}

// Pick the property that moves the most (normalised by a rough "perceptual" scale).
const props = [
  ['opacity', 'o', 1],
  ['translateY(px)', 'y', 40],
  ['scale', 's', 0.1],
]
const range = (k) => Math.abs(trace.at(-1)[k] - trace[0][k])
const [name, key, scale] = props.sort((a, b) => range(b[1]) / b[2] - range(a[1]) / a[2])[0]
const v0 = trace[0][key]
const vf = trace.at(-1)[key]
const span = vf - v0
if (Math.abs(span) < 1e-6) {
  console.log(`${label || selector}: element does not move (flat ${name}) — nothing to feel here`)
  process.exit(0)
}
const p = trace.map((s) => ({ t: s.t, v: (s[key] - v0) / span }))
const timeTo = (frac) => p.find((q) => q.v >= frac)?.t ?? NaN
const overshoot = Math.max(0, Math.max(...p.map((q) => q.v)) - 1) * 100
const lastOutside = [...p].reverse().find((q) => Math.abs(1 - q.v) > 0.01)
const settle = lastOutside ? lastOutside.t : 0
const blocks = ' ▁▂▃▄▅▆▇█'
const bins = 40
const spark = Array.from({ length: bins }, (_, i) => {
  const q = p[Math.min(p.length - 1, Math.floor((i / bins) * p.length))]
  return blocks[Math.max(0, Math.min(8, Math.round(q.v * 8)))]
}).join('')

console.log(`\n${label ? `[${label}] ` : ''}${selector}  trigger=${trigger}  tracked=${name} (${v0.toFixed(2)} → ${vf.toFixed(2)})`)
console.log(`  t10 ${timeTo(0.1).toFixed(0)}ms | t50 ${timeTo(0.5).toFixed(0)}ms | t90 ${timeTo(0.9).toFixed(0)}ms | settled(±1%) ${settle.toFixed(0)}ms | overshoot ${overshoot.toFixed(1)}%`)
console.log(`  ${spark}   (${(p.at(-1).t / 1000).toFixed(1)}s)`)
