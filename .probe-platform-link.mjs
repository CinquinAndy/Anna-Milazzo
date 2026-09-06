import { chromium } from 'playwright'

const widths = [300, 310, 320, 330, 335, 340, 345, 350, 360]
const locales = [
	['it', 'http://localhost:3000/'],
	['en', 'http://localhost:3000/en'],
]
const out = []
const browser = await chromium.launch()
for (const [loc, url] of locales) {
	for (const w of widths) {
		const ctx = await browser.newContext({
			viewport: { width: w, height: 800 },
			reducedMotion: 'reduce',
			deviceScaleFactor: 1,
		})
		const page = await ctx.newPage()
		await page.goto(url, { waitUntil: 'networkidle' })
		await page.waitForSelector('[data-platform-link]')
		const rows = await page.evaluate(() => {
			const links = [...document.querySelectorAll('[data-platform-link]')]
			return links.map((a) => {
				const r = a.getBoundingClientRect()
				const cs = getComputedStyle(a)
				const range = document.createRange()
				range.selectNodeContents(a)
				const rects = [...range.getClientRects()]
				const textW = Math.max(...rects.map((x) => x.width))
				// natural width if allowed to be shrink-wrapped
				const clone = a.cloneNode(true)
				clone.style.position = 'absolute'
				clone.style.visibility = 'hidden'
				clone.style.width = 'max-content'
				clone.style.inlineSize = 'max-content'
				clone.style.whiteSpace = 'nowrap'
				document.body.appendChild(clone)
				const natural = clone.getBoundingClientRect().width
				clone.remove()
				const parent = a.parentElement
				const pr = parent.getBoundingClientRect()
				const pcs = getComputedStyle(parent)
				const interior = pr.width - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight)
				return {
					text: a.textContent.trim(),
					w: Math.round(r.width),
					h: Math.round(r.height),
					lines: rects.length,
					textW: Math.round(textW),
					natural: Math.round(natural),
					interior: Math.round(interior),
					padX: cs.paddingLeft,
					font: cs.fontSize,
					textAlign: cs.textAlign,
					display: cs.display,
					visible: r.width > 0 && r.height > 0,
				}
			})
		})
		const visible = rows.filter((r) => r.visible)
		out.push({ loc, w, first: visible[0], count: visible.length, allSame: visible.every((r) => r.h === visible[0].h && r.lines === visible[0].lines) })
		await ctx.close()
	}
}
await browser.close()
for (const o of out) console.log(JSON.stringify(o))
