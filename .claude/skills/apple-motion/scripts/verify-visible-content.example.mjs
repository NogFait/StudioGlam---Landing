// Visible-content check for a detail panel / dialog: how much of it is the image, and does the
// text actually FIT in view (not merely exist in the DOM)? Includes 1536x744 @ dpr 1.25, which is
// a 1920x1080 screen with the browser at 125% zoom. Selectors are this repo's: adapt them.
// Run with a build served on :4173  ->  node verify-visible-content.example.mjs after
// Pass criteria: image <= ~35% of the panel; title and paragraphs visible; no hidden text on desktop.
import { chromium } from 'playwright'
const tag = process.argv[2] ?? 'x'
const b = await chromium.launch()
// [name, cssW, cssH, dpr]  -- 1536x744 @1.25 = a 1920x1080 screen with Firefox UI at 125% zoom (the user's screenshot)
const VPS = [['1920x1080@125%', 1536, 744, 1.25], ['1920x1080@100%', 1920, 930, 1], ['1440x900', 1440, 900, 1], ['1280x720', 1280, 720, 1], ['390x844', 390, 844, 1], ['360x640', 360, 640, 1]]
for (const [name, w, h, dpr] of VPS) {
  const mobile = w < 800
  const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, hasTouch: mobile, isMobile: mobile }); const p = await c.newPage()
  await p.goto('http://127.0.0.1:4173/'); await p.waitForTimeout(1500)
  await p.evaluate(() => document.querySelector('#projects-label').scrollIntoView({ block: 'start', behavior: 'instant' }))
  for (let k = 0; k < 6; k++) { await p.evaluate(() => window.scrollBy(0, 300)); await p.waitForTimeout(200) }
  const rows = []
  for (const t of ['Client Flow', 'El Tornillo']) {
    const card = p.locator('.projects-grid a').filter({ hasText: t }).first(); await card.scrollIntoViewIfNeeded(); await p.waitForTimeout(800)
    mobile ? await card.tap() : await card.click(); await p.waitForTimeout(1500)
    const g = await p.evaluate(() => {
      const d = document.querySelector('[role=dialog]'); const dr = d.getBoundingClientRect()
      const img = d.querySelector('img').parentElement.getBoundingClientRect()
      const sc = [...d.querySelectorAll('div')].find(e => getComputedStyle(e).overflowY === 'auto'); const sr = sc.getBoundingClientRect()
      // text visible inside the scroller's viewport at scrollTop 0?
      const vis = (el) => { const r = el.getBoundingClientRect(); return r.top >= sr.top - 1 && r.bottom <= sr.bottom + 1 }
      const h2 = d.querySelector('h2'), ps = [...sc.querySelectorAll('p')]
      return { panel: Math.round(dr.height), image: Math.round(img.height), body: Math.round(sr.height), bodyContent: sc.scrollHeight, imagePct: Math.round(img.height / dr.height * 100), titleVisible: vis(h2), paragraphsVisible: ps.map(vis), allFit: sc.scrollHeight <= sc.clientHeight + 2 }
    })
    rows.push(`${t}: panel ${g.panel}px = image ${g.image}px (${g.imagePct}%) + body ${g.body}px (content needs ${g.bodyContent}px) | title visible ${g.titleVisible} | paragraphs visible ${g.paragraphsVisible.join('/')} | all text fits without scrolling ${g.allFit}`)
    if (t === 'Client Flow') await p.screenshot({ path: `geo-${tag}-${name.replace(/[@%]/g, '_')}.png` })
    await p.keyboard.press('Escape'); await p.waitForTimeout(1100)
  }
  console.log(`## ${name}\n  ` + rows.join('\n  '))
  await c.close()
}
await b.close()
