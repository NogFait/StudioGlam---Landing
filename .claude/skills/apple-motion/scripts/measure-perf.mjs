// Motion performance probe. Answers: "did adding motion make the site slower?"
// Drives the same scripted interactions on a page and reports, per scenario:
//   frame pacing  -> p50 / p95 / max frame interval and the count of frames > 33 ms (dropped)
//   main thread   -> script / layout / style-recalc time and layout + recalc counts (CDP Performance)
//   long tasks    -> tasks > 50 ms blocking the main thread
// Run it on the BASELINE and on the new build with the same flags and compare the tables.
//
//   node measure-perf.mjs --url http://127.0.0.1:4173/ --profile mobile --label after
//   --profile desktop : 1440x900, no throttling
//   --profile mobile  : 390x844 touch, CPU throttled 4x (a mid-range phone)
//   --only scroll,menu : run just the scenarios whose name contains one of these words
//
// Scenarios that need an element which does not exist on a build (no panel in the baseline)
// are skipped, so the same command works on both. Selectors below are this repo's; adapt them.
// Headless Chromium rasterises in software, so absolute numbers are pessimistic: trust the
// DIFFERENCE between runs, and confirm on a real device. Needs `playwright`.

import { chromium } from 'playwright'

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
)
const { url, profile = 'desktop', label = '', only = '' } = args
const wanted = only ? only.split(',') : null // e.g. --only scroll,menu
if (!url) { console.error('usage: --url <url> [--profile desktop|mobile] [--label name]'); process.exit(1) }
const mobile = profile === 'mobile'

const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {})
const ctx = await browser.newContext(
  mobile ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } : { viewport: { width: 1440, height: 900 } },
)
const page = await ctx.newPage()
const cdp = await ctx.newCDPSession(page)
await cdp.send('Performance.enable')
if (mobile) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })

await page.addInitScript(() => {
  window.__long = 0
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__long += e.duration > 50 ? 1 : 0 }).observe({ type: 'longtask', buffered: true }) } catch {}
  window.__rec = false; window.__iv = []
  let last = 0
  const tick = (t) => { if (window.__rec && last) window.__iv.push(t - last); last = t; requestAnimationFrame(tick) }
  requestAnimationFrame(tick)
})

await page.goto(url, { waitUntil: 'load' })
await page.waitForTimeout(2500)
// Hot A/B: CSS='.thing{display:none!important}' node measure-perf.mjs ... measures the page without that rule's cost
if (process.env.CSS) await page.addStyleTag({ content: process.env.CSS })

const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]))
const pct = (a, q) => (a.length ? [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(q * a.length))] : 0)

async function scenario(name, run) {
  if (wanted && !wanted.some(w => name.includes(w))) return
  await page.evaluate(() => { window.__iv = []; window.__rec = true; window.__long = 0 })
  const m0 = await metrics()
  const t0 = Date.now()
  const skipped = (await run()) === 'skip'
  const wall = (Date.now() - t0) / 1000
  const m1 = await metrics()
  const { iv, long } = await page.evaluate(() => { window.__rec = false; return { iv: window.__iv, long: window.__long } })
  if (skipped) { console.log(`${name.padEnd(14)} (not available on this build)`); return }
  const d = (k) => ((m1[k] - m0[k]) * 1000) / wall // ms of work per second of wall time
  console.log(
    `${name.padEnd(14)} frames ${String(iv.length).padStart(4)} | p50 ${pct(iv, 0.5).toFixed(1).padStart(5)}ms p95 ${pct(iv, 0.95).toFixed(1).padStart(6)}ms max ${Math.max(0, ...iv).toFixed(0).padStart(4)}ms | >33ms ${String(iv.filter(x => x > 33).length).padStart(3)} | long tasks ${long} | per-second: script ${d('ScriptDuration').toFixed(0).padStart(4)}ms layout ${d('LayoutDuration').toFixed(0).padStart(3)}ms style ${d('RecalcStyleDuration').toFixed(0).padStart(3)}ms | layouts ${Math.round(m1.LayoutCount - m0.LayoutCount)} recalcs ${Math.round(m1.RecalcStyleCount - m0.RecalcStyleCount)}`,
  )
}

console.log(`\n=== ${label || url}  [${profile}${mobile ? ', CPU x4' : ''}]`)

await scenario('idle (3s)', async () => { await page.waitForTimeout(3000) })

await scenario('scroll page', async () => {
  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  await page.mouse.move(200, 300)
  for (let y = 0; y < total; y += 110) { await page.mouse.wheel(0, 110); await page.waitForTimeout(16) }
  await page.waitForTimeout(500)
  for (let y = total; y > 0; y -= 220) { await page.mouse.wheel(0, -220); await page.waitForTimeout(16) }
  await page.waitForTimeout(400)
})

await scenario('cards hover', async () => {
  if (mobile || !(await page.$('.projects-grid'))) return 'skip'
  await page.evaluate(() => document.querySelector('.projects-grid').scrollIntoView({ block: 'center', behavior: 'instant' }))
  await page.waitForTimeout(1200)
  for (let r = 0; r < 3; r++) for (let x = 120; x < 1300; x += 30) { await page.mouse.move(x, 300 + (r % 2) * 280); await page.waitForTimeout(8) }
})

await scenario('mobile menu x3', async () => {
  if (!mobile || !(await page.$('.navbar__hamburger'))) return 'skip'
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await page.waitForTimeout(500)
  for (let i = 0; i < 3; i++) { await page.locator('.navbar__hamburger').tap(); await page.waitForTimeout(900); await page.locator('.navbar__hamburger').tap(); await page.waitForTimeout(900) }
})

await scenario('detail panel x3', async () => {
  if (!(await page.$('.projects-grid a.project-card'))) return 'skip'
  await page.evaluate(() => document.querySelector('.projects-grid').scrollIntoView({ block: 'start', behavior: 'instant' })); await page.waitForTimeout(1200)
  const card = page.locator('.projects-grid a.project-card').first()
  for (let i = 0; i < 3; i++) { mobile ? await card.tap() : await card.click(); await page.waitForTimeout(1100); await page.keyboard.press('Escape'); await page.waitForTimeout(1100) }
})

await browser.close()
