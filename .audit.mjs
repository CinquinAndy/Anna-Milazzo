// Responsive audit harness. Measures every page at every viewport and screenshots every
// section, so the people judging the result all look at the same evidence.
import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'

const OUT = process.env.OUT
const BASE = process.env.BASE ?? 'http://localhost:3001'
mkdirSync(OUT, { recursive: true })

const VIEWPORTS = [
	// phones, portrait
	[320, 568, 'phone'], [360, 740, 'phone'], [375, 667, 'phone'], [390, 844, 'phone'], [414, 896, 'phone'], [430, 932, 'phone'],
	// phones, landscape (short)
	[844, 390, 'phone-landscape'], [932, 430, 'phone-landscape'],
	// tablets
	[768, 1024, 'tablet'], [820, 1180, 'tablet'], [1024, 768, 'tablet'], [1024, 1366, 'tablet'],
	// laptops and desktops
	[1280, 720, 'desktop'], [1366, 768, 'desktop'], [1440, 900, 'desktop'], [1536, 864, 'desktop'], [1920, 1080, 'desktop'], [2560, 1440, 'desktop'],
	// odd
	[1024, 600, 'odd-short'], [3440, 1440, 'odd-ultrawide'],
]
const PAGES = [
	{ id: 'landing', it: '/', en: '/en' },
	{ id: 'contact', it: '/contact', en: '/en/contact' },
	{ id: 'legal', it: '/legal', en: '/en/legal' },
]
// English at a subset only: the layout is the same, the copy is not.
const EN_WIDTHS = new Set([320, 375, 768, 1440])

const measure = () => {
	const vw = document.documentElement.clientWidth
	const vh = window.innerHeight
	const visible = el => {
		const r = el.getBoundingClientRect()
		if (r.width === 0 || r.height === 0) return false
		const s = getComputedStyle(el)
		return s.visibility !== 'hidden' && s.display !== 'none'
	}
	const describe = el => {
		const tag = el.tagName.toLowerCase()
		const cls = typeof el.className === 'string' ? el.className.split(/\s+/).filter(Boolean).slice(0, 3).join('.') : ''
		const data = [...el.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name).slice(0, 2).join(' ')
		const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40)
		return `${tag}${cls ? '.' + cls : ''}${data ? '[' + data + ']' : ''}${text ? ' "' + text + '"' : ''}`
	}
	const insideScroller = el => {
		for (let n = el.parentElement; n; n = n.parentElement) {
			const ox = getComputedStyle(n).overflowX
			if (ox === 'auto' || ox === 'scroll') return true
		}
		return false
	}
	const insideClipper = el => {
		for (let n = el.parentElement; n; n = n.parentElement) {
			const ox = getComputedStyle(n).overflowX
			if (ox === 'hidden' || ox === 'clip') return n
		}
		return null
	}
	const decorative = el => el.closest('[aria-hidden="true"]') !== null || el.closest('.sr-only') !== null
	const all = [...document.querySelectorAll('body *')].filter(el => !el.closest('nextjs-portal') && !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName))

	// 1. page-level horizontal overflow, and what causes it
	const docOverflow = document.documentElement.scrollWidth - vw
	const offenders = []
	if (docOverflow > 0) {
		for (const el of all) {
			if (!visible(el) || insideScroller(el)) continue
			const r = el.getBoundingClientRect()
			if (r.right > vw + 1 || r.left < -1) {
				const clipper = insideClipper(el)
				// Clipped by an ancestor that itself fits: intentional bleed, not overflow.
				if (clipper && clipper.getBoundingClientRect().right <= vw + 1 && clipper.getBoundingClientRect().left >= -1) continue
				// Only the outermost such element per branch.
				if (offenders.some(o => o.el.contains(el))) continue
				offenders.push({ el, sel: describe(el), left: Math.round(r.left), right: Math.round(r.right), past: Math.round(Math.max(r.right - vw, -r.left)) })
			}
		}
	}

	// 2. text wider or taller than its own box
	const hasText = el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 0)
	const clippedText = []
	const clamped = []
	for (const el of all) {
		if (!visible(el) || !hasText(el) || decorative(el)) continue
		const s = getComputedStyle(el)
		const wide = el.scrollWidth - el.clientWidth
		const tall = el.scrollHeight - el.clientHeight
		if (wide > 2 && el.clientWidth > 0) clippedText.push({ sel: describe(el), axis: 'x', by: wide, overflow: s.overflowX })
		else if (tall > 2 && el.clientHeight > 0 && (s.overflowY === 'hidden' || s.overflowY === 'clip')) {
			// A line clamp truncates on purpose, with an ellipsis. Listed apart so it is
			// known, not counted as a defect.
			if (s.webkitLineClamp !== 'none') clamped.push({ sel: describe(el), hiddenPx: tall, lines: s.webkitLineClamp })
			else clippedText.push({ sel: describe(el), axis: 'y', by: tall, overflow: s.overflowY })
		}
	}

	// 3. overlapping text and controls (never ancestor/descendant, never decoration)
	const textish = all.filter(el => visible(el) && !decorative(el) && (hasText(el) || ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'IMG', 'CANVAS'].includes(el.tagName)))
	const overlaps = []
	for (let i = 0; i < textish.length; i++) {
		const a = textish[i], ra = a.getBoundingClientRect()
		for (let j = i + 1; j < textish.length; j++) {
			const b = textish[j]
			if (a.contains(b) || b.contains(a)) continue
			const rb = b.getBoundingClientRect()
			const x = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left)
			const y = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top)
			if (x > 4 && y > 4) {
				// Both inside the same scroller, where the arrangement stacks on purpose? Still report.
				overlaps.push({ a: describe(a), b: describe(b), byX: Math.round(x), byY: Math.round(y) })
				if (overlaps.length > 40) break
			}
		}
		if (overlaps.length > 40) break
	}

	// 4. tap targets and input type size
	const targets = [...document.querySelectorAll('a, button, input, textarea, select, [role="button"]')].filter(visible)
	const smallTargets = targets.filter(el => { const r = el.getBoundingClientRect(); return r.width < 24 || r.height < 24 }).map(el => { const r = el.getBoundingClientRect(); return { sel: describe(el), w: Math.round(r.width), h: Math.round(r.height) } })
	const under44 = targets.filter(el => { const r = el.getBoundingClientRect(); return r.width < 44 || r.height < 44 }).length
	const smallInputs = [...document.querySelectorAll('input, textarea, select')].filter(visible).map(el => ({ sel: describe(el), fontSize: Number.parseFloat(getComputedStyle(el).fontSize) })).filter(i => i.fontSize < 16)

	// 5. type sizes in play
	const sizes = all.filter(el => visible(el) && hasText(el) && !decorative(el)).map(el => Number.parseFloat(getComputedStyle(el).fontSize))
	const minFont = sizes.length ? Math.min(...sizes) : null
	const tiny = all.filter(el => visible(el) && hasText(el) && !decorative(el) && Number.parseFloat(getComputedStyle(el).fontSize) < 12).map(el => ({ sel: describe(el), px: Number.parseFloat(getComputedStyle(el).fontSize) })).slice(0, 10)

	// 6. the header and anything sticky, as a share of the viewport
	const header = document.querySelector('header')
	const headerBox = header ? header.getBoundingClientRect() : null
	const sticky = all.filter(el => visible(el) && ['fixed', 'sticky'].includes(getComputedStyle(el).position)).map(el => { const r = el.getBoundingClientRect(); return { sel: describe(el), h: Math.round(r.height), share: +(r.height / vh).toFixed(2) } })

	// 7. images and canvases
	const images = [...document.querySelectorAll('img')].filter(visible).map(img => { const r = img.getBoundingClientRect(); const natural = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : null; const rendered = r.width / r.height; return { sel: describe(img), w: Math.round(r.width), h: Math.round(r.height), distorted: natural !== null && Math.abs(natural - rendered) > 0.05 && getComputedStyle(img).objectFit === 'fill', broken: img.complete && img.naturalWidth === 0 } })

	// 8. the sections and their heights
	const sections = [...document.querySelectorAll('header, main > *, footer')].map(el => { const r = el.getBoundingClientRect(); return { sel: describe(el).slice(0, 60), h: Math.round(r.height), w: Math.round(r.width) } })

	// 9. the widest content measure, to see whether type lines get too long on wide screens
	const measures = [...document.querySelectorAll('p')].filter(visible).map(p => { const r = p.getBoundingClientRect(); const fs = Number.parseFloat(getComputedStyle(p).fontSize); return { sel: describe(p).slice(0, 50), px: Math.round(r.width), chars: Math.round(r.width / (fs * 0.5)) } }).filter(m => m.chars > 90)

	return { vw, vh, docOverflow, offenders: offenders.map(({ el, ...o }) => o), clippedText, clamped, overlaps, smallTargets, under44, smallInputs, minFont, tiny, header: headerBox ? { h: Math.round(headerBox.height), share: +(headerBox.height / vh).toFixed(2) } : null, sticky, images, sections, longLines: measures }
}

const browser = await chromium.launch()
const report = []
for (const page of PAGES) {
	for (const [width, height, cls] of VIEWPORTS) {
		for (const locale of ['it', 'en']) {
			if (locale === 'en' && !EN_WIDTHS.has(width)) continue
			const ctx = await browser.newContext({
				viewport: { width, height },
				// No scroll-driven entrance, so every section is at its base state and a
				// full-page capture shows the page rather than a page at opacity 0.
				reducedMotion: 'reduce',
				deviceScaleFactor: 1,
				hasTouch: cls.startsWith('phone') || cls === 'tablet',
				isMobile: cls.startsWith('phone'),
			})
			const p = await ctx.newPage()
			await p.goto(BASE + page[locale], { waitUntil: 'load' })
			await p.evaluate(() => document.fonts.ready)
			// Scroll through so lazy things exist, then back to the top.
			await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)) } window.scrollTo(0, 0) })
			await p.waitForTimeout(300)
			const data = await p.evaluate(measure)
			const tag = `${page.id}-${locale}-${width}x${height}`
			const dir = `${OUT}/${tag}`
			mkdirSync(dir, { recursive: true })
			await p.screenshot({ path: `${dir}/full.png`, fullPage: true })
			// One shot per section, so a phone page is not a 15000px strip nobody can read.
			const handles = await p.$$('header, main > *, footer')
			const shots = []
			for (let i = 0; i < handles.length; i++) {
				const h = handles[i]
				const box = await h.boundingBox()
				if (!box || box.height < 8) continue
				const name = await h.evaluate((el, n) => (el.tagName + '-' + (el.id || [...el.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name.replace('data-', ''))[0] || n)).toLowerCase(), i)
				const file = `${dir}/${String(i).padStart(2, '0')}-${name}.png`
				try { await h.screenshot({ path: file }); shots.push(file) } catch (e) { shots.push(`FAILED ${name}: ${e.message.split('\n')[0]}`) }
			}
			// The fold: what a visitor sees first, without scrolling.
			await p.evaluate(() => window.scrollTo(0, 0))
			await p.screenshot({ path: `${dir}/fold.png` })
			report.push({ page: page.id, locale, width, height, cls, dir, ...data, shots })
			writeFileSync(`${dir}/measure.json`, JSON.stringify(data, null, 1))
			const flags = []
			if (data.docOverflow > 0) flags.push(`OVERFLOW ${data.docOverflow}px`)
			if (data.clippedText.length) flags.push(`clipped ${data.clippedText.length}`)
			if (data.overlaps.length) flags.push(`overlaps ${data.overlaps.length}`)
			if (data.smallTargets.length) flags.push(`small ${data.smallTargets.length}`)
			if (data.smallInputs.length) flags.push(`inputs<16 ${data.smallInputs.length}`)
			if (data.tiny.length) flags.push(`tiny ${data.tiny.length}`)
			console.log(tag.padEnd(28), flags.join(' | ') || 'clean')
			await ctx.close()
		}
	}
}
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1))
await browser.close()
