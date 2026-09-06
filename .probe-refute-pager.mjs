import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const OUT = '/tmp/claude-1000/-home-andycinquin-clonedrepo-anna-milazzo/8e55e7d3-9f9e-4104-8b5b-fbb02b51495f/scratchpad/refute-pager'
mkdirSync(OUT, { recursive: true })

const VIEWPORTS = [
	[320, 568],
	[375, 667],
	[768, 1024],
	[844, 390],
	[960, 600],
	[1440, 900],
	[1920, 1080],
	[2560, 1440],
]

const measure = () => {
	const list = document.querySelector('.song-list')
	const lr = list.getBoundingClientRect()
	const lis = [...list.children]
	const visible = lis.filter(li => !li.hidden)
	const firstVisible = visible[0]?.getBoundingClientRect()
	const strip = document.querySelector('.song-pager')?.getBoundingClientRect()
	const header = document.querySelector('header')?.getBoundingClientRect()
	const sections = [...document.querySelectorAll('main section, section')].map(s => {
		const r = s.getBoundingClientRect()
		const top = Math.max(r.top, 0)
		const bottom = Math.min(r.bottom, innerHeight)
		const cover = Math.max(0, bottom - top) / innerHeight
		const title = s.querySelector('h1,h2')?.textContent?.trim().slice(0, 30) ?? s.id ?? s.className.slice(0, 30)
		return { id: s.id, title, top: Math.round(r.top), cover: Math.round(cover * 100) }
	})
	const dominant = sections.slice().sort((a, b) => b.cover - a.cover)[0]
	const mid = document.elementFromPoint(innerWidth / 2, innerHeight / 2)
	return {
		scrollY: Math.round(scrollY),
		docH: document.documentElement.scrollHeight,
		active: document.activeElement?.className?.toString().slice(0, 30) || document.activeElement?.tagName,
		listTop: Math.round(lr.top),
		listBottom: Math.round(lr.bottom),
		listH: Math.round(lr.height),
		visibleCount: visible.length,
		visibleIdx: lis.map((li, i) => (li.hidden ? null : i)).filter(x => x !== null),
		firstVisibleTop: firstVisible ? Math.round(firstVisible.top) : null,
		stripTop: strip ? Math.round(strip.top) : null,
		headerH: header ? Math.round(header.height) : null,
		dominant,
		midEl: mid ? `${mid.tagName}.${(mid.className?.toString() || '').slice(0, 30)}` : null,
		midSection: mid?.closest('section')?.querySelector('h1,h2')?.textContent?.trim().slice(0, 30) ?? mid?.closest('section')?.id ?? null,
	}
}

const browser = await chromium.launch()
const results = {}
for (const [w, h] of VIEWPORTS) {
	const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' })
	const page = await ctx.newPage()
	await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
	await page.evaluate(() => document.fonts.ready)
	await page.waitForTimeout(300)
	const key = `${w}x${h}`
	const r = {}

	r.load = await page.evaluate(measure)

	// Arrive at the strip the way a reader does: scroll so the strip sits in the lower part of the screen.
	await page.evaluate(() => {
		const s = document.querySelector('.song-pager').getBoundingClientRect()
		window.scrollBy(0, s.top - innerHeight * 0.6)
	})
	await page.waitForTimeout(150)
	r.beforeTap02 = await page.evaluate(measure)
	await page.screenshot({ path: `${OUT}/${key}-0-before-tap02.png` })

	const btn02 = page.locator('.song-pager-page', { hasText: '02' })
	await btn02.click()
	await page.waitForTimeout(500)
	r.afterTap02 = await page.evaluate(measure)
	await page.screenshot({ path: `${OUT}/${key}-1-after-tap02.png` })
	// prediction the judge made: old list bottom (doc coords) - vh
	r.prediction02 = r.beforeTap02.scrollY + r.beforeTap02.listBottom - h

	// What the "focus after commit" fix would do: blur, then focus the (new) list.
	await page.evaluate(() => {
		document.activeElement?.blur()
		document.querySelector('.song-list').focus()
	})
	await page.waitForTimeout(300)
	r.afterRefocus = await page.evaluate(measure)
	await page.screenshot({ path: `${OUT}/${key}-2-after-refocus.png` })

	// What scrollIntoView start + scroll-margin equal to the header would do.
	await page.evaluate(() => {
		const list = document.querySelector('.song-list')
		const hh = document.querySelector('header').getBoundingClientRect().height
		list.style.scrollMarginBlockStart = `${hh + 8}px`
		list.scrollIntoView({ block: 'start' })
	})
	await page.waitForTimeout(300)
	r.afterScrollIntoView = await page.evaluate(measure)
	await page.screenshot({ path: `${OUT}/${key}-3-after-siv.png` })

	// Go back to the strip and tap 01.
	await page.evaluate(() => {
		document.querySelector('.song-list').style.scrollMarginBlockStart = ''
		const s = document.querySelector('.song-pager').getBoundingClientRect()
		window.scrollBy(0, s.top - innerHeight * 0.6)
	})
	await page.waitForTimeout(150)
	r.beforeTap01 = await page.evaluate(measure)
	const btn01 = page.locator('.song-pager-page', { hasText: '01' })
	await btn01.click()
	await page.waitForTimeout(500)
	r.afterTap01 = await page.evaluate(measure)
	await page.screenshot({ path: `${OUT}/${key}-4-after-tap01.png` })

	// Keyboard: focus the "02" button and press Enter.
	await page.evaluate(() => {
		const s = document.querySelector('.song-pager').getBoundingClientRect()
		window.scrollBy(0, s.top - innerHeight * 0.6)
	})
	await page.waitForTimeout(150)
	await btn02.focus()
	await page.keyboard.press('Enter')
	await page.waitForTimeout(500)
	r.afterEnter02 = await page.evaluate(measure)

	results[key] = r
	console.log(key, JSON.stringify(r, null, 1))
	await ctx.close()
}
await browser.close()
