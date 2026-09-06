import { expect, type Page, test } from '@playwright/test'

/**
 * The viewports the site is held to. Phones portrait from the smallest still in use up
 * to the largest, two phones on their side, tablets both ways, laptops, desktops, and
 * two odd ones: a short laptop and an ultrawide.
 */
const VIEWPORTS = [
	[320, 568],
	[360, 740],
	[375, 667],
	[390, 844],
	[430, 932],
	[844, 390],
	[768, 1024],
	[1024, 768],
	[1024, 600],
	[1280, 720],
	[1440, 900],
	[1920, 1080],
	[2560, 1440],
	[3440, 1440],
] as const

const PAGES = ['/', '/en', '/contact', '/en/contact', '/legal', '/en/legal'] as const

/** A phone or a tablet: anything that is driven by a thumb. */
const touch = (width: number) => width < 1024

async function open(page: Page, path: string, width: number, height: number) {
	await page.setViewportSize({ width, height })
	// Every section at its resting state, so nothing is measured mid-entrance.
	await page.emulateMedia({ reducedMotion: 'reduce' })
	await page.goto(path, { waitUntil: 'load' })
	await page.evaluate(() => document.fonts.ready)
}

/**
 * What the page itself reports, at the size it is at. One evaluate, so a sweep over
 * fourteen viewports and six pages stays under a minute.
 */
async function survey(page: Page) {
	return page.evaluate(() => {
		const vw = document.documentElement.clientWidth
		const decorative = (el: Element) => el.closest('[aria-hidden="true"]') !== null || el.closest('.sr-only') !== null
		const visible = (el: Element) => {
			const r = el.getBoundingClientRect()
			const s = getComputedStyle(el)
			return r.width > 0 && r.height > 0 && s.visibility !== 'hidden'
		}
		const hasText = (el: Element) =>
			[...el.childNodes].some(n => n.nodeType === 3 && (n.textContent ?? '').trim().length > 0)
		const describe = (el: Element) => {
			const cls = typeof el.className === 'string' ? el.className.split(/\s+/).slice(0, 2).join('.') : ''
			return `${el.tagName.toLowerCase()}${cls ? `.${cls}` : ''} "${(el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 30)}"`
		}
		const all = [...document.querySelectorAll('body *')].filter(el => !el.closest('nextjs-portal'))

		// Text wider than its box, or taller than a box that hides the rest. A line clamp
		// truncates on purpose and is not counted.
		const clipped: string[] = []
		for (const el of all) {
			if (!visible(el) || !hasText(el) || decorative(el)) continue
			const s = getComputedStyle(el)
			if (el.scrollWidth - el.clientWidth > 2 && el.clientWidth > 0)
				clipped.push(`${describe(el)} is ${el.scrollWidth - el.clientWidth}px wider than its box`)
			else if (
				el.scrollHeight - el.clientHeight > 2 &&
				(s.overflowY === 'hidden' || s.overflowY === 'clip') &&
				s.webkitLineClamp === 'none'
			)
				clipped.push(`${describe(el)} is cut ${el.scrollHeight - el.clientHeight}px short`)
		}

		// Text or controls lying on top of each other. Four pixels is one keyline, which is
		// how the Folder's tab meets its body on purpose.
		const textish = all.filter(
			el =>
				visible(el) &&
				!decorative(el) &&
				(hasText(el) || ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'IMG', 'CANVAS'].includes(el.tagName))
		)
		const overlaps: string[] = []
		for (let i = 0; i < textish.length && overlaps.length < 20; i++) {
			const a = textish[i] as Element
			const ra = a.getBoundingClientRect()
			for (let j = i + 1; j < textish.length; j++) {
				const b = textish[j] as Element
				if (a.contains(b) || b.contains(a)) continue
				const rb = b.getBoundingClientRect()
				const x = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left)
				const y = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top)
				if (x > 4 && y > 4) overlaps.push(`${describe(a)} over ${describe(b)} by ${Math.round(x)}x${Math.round(y)}`)
			}
		}

		const targets = [...document.querySelectorAll('a, button, input, textarea, select, [role="button"]')].filter(
			visible
		)
		const small = targets
			.map(el => ({ el, r: el.getBoundingClientRect() }))
			.filter(({ r }) => r.width < 24 || r.height < 24)
			.map(({ el, r }) => `${describe(el)} ${Math.round(r.width)}x${Math.round(r.height)}`)
		const smallInputs = [...document.querySelectorAll('input:not([type="hidden"]), textarea, select')]
			.filter(visible)
			.map(el => ({ el, px: Number.parseFloat(getComputedStyle(el).fontSize) }))
			.filter(({ px }) => px < 16)
			.map(({ el, px }) => `${describe(el)} ${px}px`)

		// Every section title reaches both edges but never crosses one.
		const titles = [...document.querySelectorAll('h2.font-display')].filter(visible).map(el => {
			const r = el.getBoundingClientRect()
			// The painted glyphs, not the block: the block is the band's width whatever the
			// type does inside it.
			const range = document.createRange()
			range.selectNodeContents(el)
			const ink = range.getBoundingClientRect()
			return {
				text: (el.textContent ?? '').trim(),
				past: Math.round(Math.max(ink.right - vw, -ink.left)),
				band: Math.round(r.width),
			}
		})

		const header = document.querySelector('header')
		const headerShare = header ? header.getBoundingClientRect().height / window.innerHeight : 0

		return {
			docOverflow: document.documentElement.scrollWidth - vw,
			clipped,
			overlaps,
			small,
			smallInputs,
			titles,
			headerShare: +headerShare.toFixed(2),
			headerRows: header
				? new Set(
						[...header.querySelectorAll('a, span[aria-current]')]
							.filter(visible)
							.map(el => Math.round(el.getBoundingClientRect().top))
					).size
				: 0,
		}
	})
}

for (const path of PAGES) {
	test.describe(`${path} across viewports`, () => {
		for (const [width, height] of VIEWPORTS) {
			test(`holds at ${width}x${height}`, async ({ page }) => {
				await open(page, path, width, height)
				const s = await survey(page)

				expect(s.docOverflow, 'the page scrolls sideways').toBeLessThanOrEqual(0)
				expect(s.clipped, 'text is cut by its own box').toEqual([])
				expect(s.overlaps, 'text or controls collide').toEqual([])
				expect(s.small, 'tap targets under 24x24').toEqual([])
				if (touch(width)) {
					expect(s.smallInputs, 'a form control under 16px makes iOS zoom the page').toEqual([])
				}
				for (const title of s.titles) {
					expect(title.past, `the section title "${title.text}" crosses the edge of the screen`).toBeLessThanOrEqual(0)
				}
				// A sticky bar that takes more than a fifth of a phone leaves nothing to read
				// under it. Two rows at most on a phone, one everywhere else.
				expect(s.headerShare, 'the sticky header eats too much of the viewport').toBeLessThanOrEqual(
					width < 640 ? 0.2 : 0.12
				)
				expect(s.headerRows, 'the header wraps into too many rows').toBeLessThanOrEqual(width < 640 ? 2 : 1)
			})
		}
	})
}
