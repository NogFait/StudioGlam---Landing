// Example end-to-end check for a card -> dialog shared-element transition, a bottom sheet
// with drag-to-dismiss, a direction-aware navbar, scroll-linked hero and reduced-motion.
// Selectors (.projects-grid, [role=dialog], nav...) belong to THIS repo: adapt them.
// Run with a dev server up:  URL=http://127.0.0.1:5173/ node verify-shared-element.example.mjs
import { chromium } from 'playwright'

const URL = process.env.URL ?? 'http://127.0.0.1:5173/'
const out = '.'
const browser = await chromium.launch()
const errors = []
const track = (page) => { page.on('pageerror', e => errors.push(String(e))); page.on('console', m => m.type() === 'error' && errors.push(m.text())) }

const rectSampler = `
  window.__rects = []
  window.__sample = (ms) => { const t0 = performance.now(); const tick = () => {
    const el = document.querySelector('[role=dialog]'); const t = performance.now() - t0
    if (el) { const r = el.getBoundingClientRect(); window.__rects.push({ t: Math.round(t), l: Math.round(r.left), tp: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), o: +getComputedStyle(el).opacity }) }
    else window.__rects.push({ t: Math.round(t), gone: true })
    if (t < ms) requestAnimationFrame(tick) }; requestAnimationFrame(tick) }`

// =============== DESKTOP ===============
const dctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const d = await dctx.newPage(); track(d)
await d.addInitScript(rectSampler)
await d.goto(URL); await d.waitForTimeout(1500)
await d.evaluate(() => document.querySelector('#projects-label').scrollIntoView({ block: 'start', behavior: 'instant' }))
await d.waitForTimeout(1500)

const card = d.locator('.projects-grid > div:nth-child(1) a')
const cr = await card.boundingBox()
console.log('DESKTOP card rect:', Object.fromEntries(Object.entries(cr).map(([k, v]) => [k, Math.round(v)])))

// click -> sample trajectory
await d.evaluate(() => window.__sample(900))
await card.click()
await d.waitForTimeout(1000)
const open = await d.evaluate(() => window.__rects)
const first = open.find(r => !r.gone)
const last = open.filter(r => !r.gone).at(-1)
console.log('open: first sampled rect', first, '\n      settled rect      ', last)
console.log('open: width/height progress samples ->', open.filter((_, i) => i % 6 === 0 && !open[i].gone).slice(0, 9).map(r => `${r.t}ms:${r.w}x${r.h}@(${r.l},${r.tp})`).join('  '))
console.log('scroll locked:', await d.evaluate(() => document.documentElement.classList.contains('scroll-locked')),
  '| focus on:', await d.evaluate(() => document.activeElement?.getAttribute('aria-label')))
await d.screenshot({ path: `${out}/n-d-detail.png` })

// Esc -> returns to the card (continuity), focus restored
await d.evaluate(() => window.__sample(900))
await d.keyboard.press('Escape')
await d.waitForTimeout(1000)
const back = await d.evaluate(() => window.__rects)
const lastBack = back.filter(r => !r.gone).at(-1)
console.log('close: last panel rect before removal', lastBack, '| removed:', await d.evaluate(() => !document.querySelector('[role=dialog]')))
console.log('focus restored to card:', await d.evaluate(() => document.activeElement?.classList.contains('project-card')), '| scroll unlocked:', await d.evaluate(() => !document.documentElement.classList.contains('scroll-locked')))

// Interrupt: open, close 110ms in (mid-flight) -> no jump
await d.evaluate(() => window.__sample(1200))
await card.click(); await d.waitForTimeout(110); await d.keyboard.press('Escape'); await d.waitForTimeout(1200)
const intr = await d.evaluate(() => window.__rects.filter(r => !r.gone))
let maxJump = 0
for (let i = 1; i < intr.length; i++) maxJump = Math.max(maxJump, Math.abs(intr[i].w - intr[i - 1].w), Math.abs(intr[i].tp - intr[i - 1].tp))
console.log('interrupt mid-flight: max per-frame jump in width/top =', maxJump, 'px (smooth if < ~120)')

// Hover depth
await d.mouse.move(cr.x + cr.width / 2, cr.y + cr.height / 2); await d.waitForTimeout(700)
console.log('hover: card transform =', (await card.evaluate(el => getComputedStyle(el).transform)).slice(0, 60),
  '| shadow opacity =', await d.evaluate(() => getComputedStyle(document.querySelector('.projects-grid > div'), '::before').opacity))
await d.mouse.move(5, 5)

// Hero recede + progress
await d.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await d.waitForTimeout(500)
const heroEl = '#hero > div:nth-of-type(2)'
const hv = async () => d.evaluate((s) => { const el = document.querySelector(s); const cs = getComputedStyle(el); return { o: +(+cs.opacity).toFixed(2), ty: +new DOMMatrix(cs.transform).m42.toFixed(0), sc: +new DOMMatrix(cs.transform).a.toFixed(3) } }, heroEl)
const h0 = await hv()
await d.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' })); await d.waitForTimeout(500)
const h1 = await hv()
await d.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await d.waitForTimeout(500)
const h2 = await hv()
console.log('hero recede  top:', h0, '| scrollY=300:', h1, '| back to top:', h2)
await d.evaluate(() => window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'instant' })); await d.waitForTimeout(700)
console.log('progress bar scaleX at mid-page =', await d.evaluate(() => { const el = [...document.querySelectorAll('div')].find(e => e.style.zIndex === '1001'); return +new DOMMatrix(getComputedStyle(el).transform).a.toFixed(2) }))
console.log('desktop navbar stays visible while scrolling down:', await d.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('nav')).transform).m42 === 0))

// =============== MOBILE ===============
const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
const m = await mctx.newPage(); track(m)
await m.addInitScript(rectSampler)
await m.goto(URL); await m.waitForTimeout(1500)

// nav hides on scroll down / returns on scroll up
const navY = () => m.evaluate(() => Math.round(new DOMMatrix(getComputedStyle(document.querySelector('nav')).transform).m42))
console.log('\nMOBILE nav y at top:', await navY())
for (let y = 100; y <= 700; y += 100) { await m.evaluate((v) => window.scrollTo(0, v), y); await m.waitForTimeout(40) }
await m.waitForTimeout(500); console.log('nav y after scrolling DOWN:', await navY(), '(expect ≈ -72)')
for (let y = 650; y >= 500; y -= 30) { await m.evaluate((v) => window.scrollTo(0, v), y); await m.waitForTimeout(40) }
await m.waitForTimeout(500); console.log('nav y after scrolling UP:', await navY(), '(expect 0)')

await m.evaluate(() => document.querySelector('#projects-label').scrollIntoView({ block: 'start', behavior: 'instant' })); await m.waitForTimeout(1200)
await m.locator('.projects-grid > div:nth-child(1) a').tap(); await m.waitForTimeout(1000)
const sheet = await m.evaluate(() => { const r = document.querySelector('[role=dialog]').getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), w: Math.round(r.width) } })
console.log('sheet rect:', sheet, '(bottom ≈ 844, full width)')
await m.screenshot({ path: `${out}/n-m-sheet.png` })

const cdp = await mctx.newCDPSession(m)
const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] })
const sy = () => m.evaluate(() => Math.round(new DOMMatrix(getComputedStyle(document.querySelector('[role=dialog]')).transform).m42))
const dimO = () => m.evaluate(() => { const s = document.querySelector('[role=dialog]'); return +(+getComputedStyle(document.querySelector('body > div[aria-hidden=true] > div')).opacity).toFixed(2) })

// slow drag 90px, release -> springs back, stays open
await touch('touchStart', 195, sheet.top + 60)
for (let i = 1; i <= 9; i++) { await touch('touchMove', 195, sheet.top + 60 + i * 10); await m.waitForTimeout(70) }
await m.waitForTimeout(250)
console.log('drag 90px down -> sheet y =', await sy(), '(≈ +90, 1:1) | scrim dim opacity =', await dimO(), '(< 1: tied to drag)')
await touch('touchEnd'); await m.waitForTimeout(900)
console.log('slow release -> y =', await sy(), '| still open:', await m.evaluate(() => !!document.querySelector('[role=dialog]')))

// flick down -> dismiss back into the card
await m.evaluate(() => window.__sample(1200))
await touch('touchStart', 195, sheet.top + 60)
for (let i = 1; i <= 7; i++) { await touch('touchMove', 195, sheet.top + 60 + i * 28); await m.waitForTimeout(8) }
await touch('touchEnd'); await m.waitForTimeout(1300)
const fl = await m.evaluate(() => window.__rects)
console.log('flick: dismissed =', await m.evaluate(() => !document.querySelector('[role=dialog]')), '| last frames:', fl.filter(r => !r.gone).slice(-2).map(r => `${r.t}ms ${r.w}x${r.h}`).join(' → '))

// reduced motion still works
const rctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
const r = await rctx.newPage(); track(r)
await r.goto(URL); await r.waitForTimeout(1200)
await r.evaluate(() => document.querySelector('#projects-label').scrollIntoView({ block: 'start', behavior: 'instant' })); await r.waitForTimeout(800)
await r.locator('.projects-grid > div:nth-child(1) a').click(); await r.waitForTimeout(600)
console.log('\nREDUCED MOTION dialog visible:', await r.evaluate(() => { const e = document.querySelector('[role=dialog]'); return !!e && +getComputedStyle(e).opacity === 1 }))
await r.keyboard.press('Escape'); await r.waitForTimeout(500)
console.log('REDUCED MOTION closes on Esc:', await r.evaluate(() => !document.querySelector('[role=dialog]')))

console.log('\nconsole/page errors:', errors.length ? errors : 'none')
await browser.close()
