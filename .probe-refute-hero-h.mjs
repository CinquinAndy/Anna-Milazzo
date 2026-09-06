import { chromium } from '@playwright/test'

const cases = [
	[767, 1024],
	[768, 1024],
	[800, 1024],
	[820, 1180],
	[830, 1024],
	[840, 1024],
	[841, 1024],
	[850, 1024],
	[860, 1024],
	[900, 1024],
	[1024, 768],
	[1024, 1366],
	[1440, 900],
]

const browser = await chromium.launch()
for (const path of ['/', '/en']) {
	for (const [w, h] of cases) {
		const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' })
		const page = await ctx.newPage()
		await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle' })
		await page.waitForTimeout(300)
		const r = await page.evaluate(() => {
			const header = document.querySelector('[data-site-header]')
			const hero = document.querySelector('section[data-enter]')
			const hr = header.getBoundingClientRect()
			const sr = hero.getBoundingClientRect()
			const cs = getComputedStyle(hero)
			const rows = new Set([...header.querySelectorAll('a, button')].map((a) => Math.round(a.getBoundingClientRect().top)))
			return {
				headerH: +hr.height.toFixed(1),
				headerRows: rows.size,
				headerHVar: getComputedStyle(document.documentElement).getPropertyValue('--header-h').trim(),
				heroMinH: cs.minHeight,
				heroTop: +sr.top.toFixed(1),
				heroBottom: +sr.bottom.toFixed(1),
				heroH: +sr.height.toFixed(1),
				position: getComputedStyle(header).position,
				innerH: window.innerHeight,
			}
		})
		r.overFold = +(r.heroBottom - r.innerH).toFixed(1)
		r.expectedH = r.innerH - r.headerH
		r.heroMinusExpected = +(r.heroH - r.expectedH).toFixed(1)
		console.log(path, `${w}x${h}`, JSON.stringify(r))
		await ctx.close()
	}
}
await browser.close()
