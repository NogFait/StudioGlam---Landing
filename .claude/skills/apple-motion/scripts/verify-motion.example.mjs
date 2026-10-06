// Example motion verification (Playwright + CDP touch). Adapt URL, selectors and
// thresholds to the project. Run:  node verify-motion.example.mjs [outDir]
// Needs a dev server running (BASE) and `playwright` resolvable from this folder
// (npm i -D playwright, or set PLAYWRIGHT_BROWSERS_PATH to an existing Chromium).
import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://127.0.0.1:5173/'
const out = process.argv[2] ?? '.'
const browser = await chromium.launch()
const errors = []

// ---------- Mobile: menu physics ----------
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
const page = await ctx.newPage()
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push(String(e)))
await page.goto(BASE)
await page.waitForTimeout(1500)
await page.screenshot({ path: `${out}/m-hero.png` })

const overlayY = () => page.evaluate(() => {
  const el = document.querySelector('#mobile-menu'); if (!el) return null
  return new DOMMatrix(getComputedStyle(el).transform).m42
})

await page.click('.navbar__hamburger')
await page.waitForTimeout(80)
const early = await overlayY()           // mid-flight: should be between -24 and 0
await page.waitForTimeout(700)
const rest = await overlayY()
await page.screenshot({ path: `${out}/m-menu-open.png` })
console.log('open: mid-flight y =', early, '| rest y =', rest)

// Drag with a CDP touch sequence: 1:1 tracking upward
const cdp = await ctx.newCDPSession(page)
const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] })

await touch('touchStart', 195, 500)
for (let i = 1; i <= 6; i++) { await touch('touchMove', 195, 500 - i * 10); await page.waitForTimeout(16) }
const dragUp = await overlayY()
console.log('drag up 60px  -> overlay y =', dragUp, '(expect ≈ -60, 1:1)')

// pull back down well past origin: rubber-band (resisted)
for (let i = 1; i <= 20; i++) { await touch('touchMove', 195, 440 + i * 10); await page.waitForTimeout(16) }
const dragDown = await overlayY()
console.log('finger 140px below origin -> overlay y =', dragDown, '(expect far less than 140: rubber-band)')
await touch('touchEnd')
await page.waitForTimeout(900)
console.log('after release (no commit) y =', await overlayY(), '(expect 0: spring back)')

// Flick up fast -> dismiss continuing the motion
await touch('touchStart', 195, 600)
for (let i = 1; i <= 8; i++) { await touch('touchMove', 195, 600 - i * 30); await page.waitForTimeout(8) }
const beforeRelease = await overlayY()
await touch('touchEnd')
await page.waitForTimeout(120)
const afterFlick = await overlayY()
console.log('flick: y at release =', beforeRelease, '| 120ms later =', afterFlick, '(keeps going up)')
await page.waitForTimeout(900)
console.log('menu removed from DOM after swipe:', (await page.$('#mobile-menu')) === null)

// Tap open then tap hamburger again mid-open (interrupt)
await page.click('.navbar__hamburger')
await page.waitForTimeout(60)
const a = await overlayY()
await page.click('.navbar__hamburger')
await page.waitForTimeout(40)
const b = await overlayY()
console.log('interrupt: y when closing started =', a, '-> 40ms later', b, '(no jump to rest/target)')
await page.waitForTimeout(800)
console.log('closed:', (await page.$('#mobile-menu')) === null)

// Section reveals + cards on mobile
await page.evaluate(() => window.scrollTo(0, 900)); await page.waitForTimeout(1200)
await page.screenshot({ path: `${out}/m-projects.png` })

// ---------- Desktop ----------
const dctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const d = await dctx.newPage()
d.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
d.on('pageerror', e => errors.push(String(e)))
await d.goto(BASE)
await d.waitForTimeout(1800)
await d.screenshot({ path: `${out}/d-hero.png` })
// hero entrance samples
const d2 = await dctx.newPage()
await d2.goto(BASE)
await d2.waitForTimeout(250)
await d2.screenshot({ path: `${out}/d-hero-entering.png` })

// Nav click -> Lenis scroll
await d.click('text=Proyectos')
await d.waitForTimeout(1800)
console.log('scrollY after nav click:', await d.evaluate(() => Math.round(window.scrollY)))
await d.waitForTimeout(600)
await d.screenshot({ path: `${out}/d-projects.png` })

// Card press: scale on mousedown
const card = await d.$('.projects-grid a')
const box = await card.boundingBox()
await d.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
await d.mouse.down()
await d.waitForTimeout(250)
const scaleDown = await card.evaluate(el => getComputedStyle(el).transform)
await d.mouse.up()
console.log('card transform while pressed:', scaleDown)

// Tilt follows pointer
await d.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.1)
await d.waitForTimeout(500)
console.log('card tilt transform:', await card.evaluate(el => getComputedStyle(el).transform))
await d.screenshot({ path: `${out}/d-card-tilt.png` })

await d.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })); await d.waitForTimeout(1500)
await d.screenshot({ path: `${out}/d-bottom.png` })

console.log('console/page errors:', errors.length ? errors : 'none')
await browser.close()
