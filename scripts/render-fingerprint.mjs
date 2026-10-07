/**
 * A fingerprint of everything the browser computes, for every element, on every page, at
 * every viewport the site is held to.
 *
 * This exists for one job: proving that a dependency bump changed nothing. Two runs of the
 * same tree produce the same file, so a diff against the base branch is the whole answer,
 * and it is a stronger answer than screenshots because it sees what does not paint:
 * `overflow: clip` against `hidden`, `container-type`, `z-index`, `overscroll-behavior`,
 * every value that decides what happens tomorrow rather than what is on screen today.
 *
 *   bun scripts/render-fingerprint.mjs <output file>
 *
 * Reads BASE_URL, defaulting to the port the Playwright config serves on.
 */
import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const OUT = process.argv[2]
if (!OUT) {
	console.error('usage: bun scripts/render-fingerprint.mjs <output file>')
	process.exit(1)
}

const BASE = process.env.BASE_URL ?? 'http://localhost:3111'
const ROUTES = ['/', '/en', '/contact', '/en/contact', '/legal', '/en/legal']
const VIEWPORTS = [
	[320, 568],
	[375, 667],
	[430, 932],
	[640, 900],
	[768, 1024],
	[1024, 768],
	[1280, 720],
	[1440, 900],
	[1920, 1080],
]

/**
 * Runs in the page. Describes every box the site itself draws.
 *
 * Anchored on the three landmarks rather than walked from `body`, and that is the whole
 * trick. Next injects scripts, meta tags, a route announcer and `<div hidden>` streaming
 * markers as siblings of them, in a number and an order that differ between two runs of
 * the same build, and anything indexed by position underneath `body` therefore renumbers
 * itself for no reason. `header`, `main` and `footer` are ours, and what is inside them is
 * ours, so a path rooted there means the same thing twice.
 *
 * Two things are left out on the same principle, both found by this gate reporting changes
 * on a branch that changed nothing. See `.scratch/render-gate/issues/01`.
 *
 * `UNRELIABLE`, the four margin longhands. Chromium's reported *used* value for a margin
 * specified `auto` is a function of the page's load history: the hero's `.shell` reads
 * either `0px` or `208px` for identical geometry, and two runs of the same build disagree
 * about which. Nothing is lost by dropping them, because a margin that really changes
 * moves the box and the box is recorded below as `x`, `y`, `width`, `height`.
 *
 * `FOREIGN`, the Turnstile mount point. Cloudflare replaces that node's contents with the
 * widget and sizes it whenever the widget lands, which is not a box this site draws. The
 * `.check-slot` wrapper above it is still recorded, and that is the one the layout depends
 * on, because it is the element reserving the height.
 */

const snapshot = () => {
	// Declared in here, not at module scope: this function is serialised and run inside the
	// page, so it closes over nothing from this file.

	/** Properties whose reported value is not a function of the page alone. */
	const UNRELIABLE = new Set(['margin-left', 'margin-right', 'margin-inline-start', 'margin-inline-end'])

	/** Subtrees another party owns and resizes on its own schedule. */
	const FOREIGN = '[data-turnstile]'

	const rows = []

	const describe = (element, path) => {
		const box = element.getBoundingClientRect()
		for (const pseudo of [null, '::before', '::after']) {
			const style = getComputedStyle(element, pseudo)
			if (pseudo && style.content === 'none') {
				continue
			}
			// Chromium does not enumerate custom properties in a stable order across browser
			// launches, and every element inherits about a hundred of them from :root, so an
			// unsorted hash reports every element as changed on a tree that did not change.
			const names = []
			for (let i = 0; i < style.length; i++) {
				if (!UNRELIABLE.has(style[i])) {
					names.push(style[i])
				}
			}
			names.sort()
			// Geometry and style hashed apart, so a reported difference says which half of
			// the element moved. One combined hash costs nothing to compute and tells you
			// nothing when it changes; splitting it turns "something about this element is
			// different" into "its box is where it was, a property is not", which is the
			// first question anyone asks and used to take a day to answer by hand.
			const geometry = [
				Math.round(box.x * 100) / 100,
				Math.round(box.y * 100) / 100,
				Math.round(box.width * 100) / 100,
				Math.round(box.height * 100) / 100,
			].join(',')
			rows.push(
				[path + (pseudo ?? ''), geometry, names.map(name => `${name}:${style.getPropertyValue(name)}`).join(';')].join(
					'|'
				)
			)
		}
		let index = 0
		for (const child of element.children) {
			const childPath = `${path}/${child.tagName}[${index++}]`
			if (!child.matches(FOREIGN)) {
				describe(child, childPath)
			}
		}
	}

	for (const landmark of ['header', 'main', 'footer']) {
		const element = document.querySelector(landmark)
		if (element !== null) {
			describe(element, landmark)
		}
	}
	return rows
}

const browser = await chromium.launch()
const all = []
for (const route of ROUTES) {
	for (const [width, height] of VIEWPORTS) {
		const context = await browser.newContext({
			viewport: { width, height },
			// Every scroll-driven entrance at its resting state, so nothing is caught mid
			// animation and no two runs disagree about where it had got to.
			reducedMotion: 'reduce',
			deviceScaleFactor: 1,
		})
		const page = await context.newPage()
		await page.goto(BASE + route, { waitUntil: 'load', timeout: 60_000 })
		await page.evaluate(() => document.fonts.ready)
		// And the images: a grid row that sizes to a portrait is a different height before
		// and after that portrait decodes, which is the one source of noise here.
		//
		// Raced against a timer, and the timer is not a nicety. A lazily-loaded image that is
		// below the fold never fires either event, because the browser is waiting for a scroll
		// that is never coming, so waiting on it alone hangs the run forever. Measured: the
		// whole page settles in about a second, and this waits five.
		await page.evaluate(
			() =>
				new Promise(resolve => {
					const pending = [...document.images].filter(image => !image.complete)
					if (pending.length === 0) {
						resolve()
						return
					}
					let left = pending.length
					const done = () => {
						left -= 1
						if (left === 0) {
							resolve()
						}
					}
					for (const image of pending) {
						image.addEventListener('load', done, { once: true })
						image.addEventListener('error', done, { once: true })
					}
					setTimeout(resolve, 5000)
				})
		)
		await page.waitForTimeout(250)
		for (const row of await page.evaluate(snapshot)) {
			const [key, geometry, style] = row.split('|')
			const digest = value => createHash('sha1').update(value).digest('hex').slice(0, 16)
			all.push(`${route} ${width}x${height} ${key}\t${digest(geometry)}\t${digest(style)}`)
		}
		await context.close()
	}
}
all.sort()
writeFileSync(OUT, `${all.join('\n')}\n`)
console.log(`elements=${all.length} -> ${OUT}`)
await browser.close()
