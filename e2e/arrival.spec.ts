import { expect, type Page, test } from '@playwright/test'

/** `cubic-bezier(0, 0, 0.58, 1)` is exactly `ease-out`, and that is how it serialises. */
const EASE_OUT = 'ease-out'

/**
 * Every stylesheet rule declaring an animation for `selector`, with the media conditions
 * it is nested inside.
 *
 * Walked from the CSSOM rather than read off computed style, because the failure this
 * guards against is invisible to `getComputedStyle`: an animation declared at the top
 * level and then cancelled with `animation-duration: 0.001ms` under reduced motion looks
 * stopped and is not, since that override does not stop a scroll-driven animation.
 */
async function animationDeclarations(page: Page, selector: string) {
	return page.evaluate(needle => {
		const found: { condition: string; text: string }[] = []
		const walk = (rules: CSSRuleList, condition: string) => {
			for (const rule of [...rules]) {
				const nested = condition + (rule instanceof CSSMediaRule ? ` ${rule.conditionText}` : '')
				// Read the style rule BEFORE recursing. Since CSS nesting, a CSSStyleRule
				// carries `cssRules` of its own, so a `'cssRules' in rule` test that comes
				// first swallows every style rule on the page and the walk finds nothing.
				if (rule instanceof CSSStyleRule && rule.selectorText.includes(needle)) {
					if (rule.style.animationName !== '' || rule.style.animation !== '') {
						found.push({ condition: nested, text: rule.cssText })
					}
				}
				if ('cssRules' in rule) {
					walk((rule as CSSGroupingRule).cssRules, nested)
				}
			}
		}
		for (const sheet of [...document.styleSheets]) {
			try {
				walk(sheet.cssRules, '')
			} catch {
				// A cross-origin sheet cannot be read and carries none of our rules anyway.
			}
		}
		return found
	}, selector)
}

/** Drags the arrangement and waits a frame, because a scroll-state query answers on the next one. */
async function dragStrip(page: Page, scrollLeft: number) {
	await page.evaluate(left => {
		const strip = document.querySelector('[data-timeline-scroller]') as HTMLElement
		strip.scrollLeft = left
	}, scrollLeft)
	await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
}

test.describe('the card that carries the words', () => {
	test('its motion is declared inside the reduced-motion guard, not switched off after', async ({ page }) => {
		await page.goto('/')

		const declarations = await animationDeclarations(page, '.about-card')
		// An empty result is also a failure: the test would otherwise pass by proving
		// nothing at all if the seat were deleted or renamed.
		expect(declarations.length, 'the card seat is not declared anywhere').toBeGreaterThan(0)
		for (const declaration of declarations) {
			expect(declaration.condition, `declared outside the guard: ${declaration.text}`).toContain(
				'prefers-reduced-motion'
			)
			expect(declaration.condition).toContain('no-preference')
		}
	})

	test('the section is not its own scroll container', async ({ page }) => {
		await page.goto('/')

		// `overflow: hidden` here made the section a scroll container, and `view()` resolves
		// against the nearest one, so every scroll-driven animation inside it jumped from
		// its base state straight to its finished one without passing through anything.
		const about = await page.locator('[data-about]').evaluate(el => ({
			overflow: getComputedStyle(el).overflowY,
			scrollable: el.scrollHeight > el.clientHeight,
			movesWhenScrolled: (() => {
				el.scrollTop = 50
				return el.scrollTop !== 0
			})(),
		}))
		expect(about.overflow, 'the About section clips as a scroll container again').toBe('clip')
		expect(about.movesWhenScrolled, 'the About section can be scrolled, so view() resolves against it').toBe(false)
	})

	test('it lands in steps and is at rest before it is at reading height', async ({ page }) => {
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)

		const readings = await page.evaluate(async () => {
			const card = document.querySelector('.about-card') as HTMLElement
			const top = window.scrollY + card.getBoundingClientRect().top
			const out: { fromTop: number; translate: string }[] = []
			for (let y = top - 950; y < top - 100; y += 25) {
				window.scrollTo(0, y)
				await new Promise(resolve => requestAnimationFrame(resolve))
				out.push({ fromTop: card.getBoundingClientRect().top, translate: getComputedStyle(card).translate })
			}
			return out
		})

		// Five reachable positions and nothing in between: steps(4), not a glide.
		const positions = [...new Set(readings.map(reading => reading.translate))]
		expect(positions.length, `the card glides instead of landing: ${positions.join(' ')}`).toBeLessThanOrEqual(5)

		// The finished state computes as `0px`, not `none`, because the keyframe sets a
		// length. Anything else is a position part-way through the seat.
		const height = page.viewportSize()?.height ?? 900
		const displaced = readings.filter(reading => reading.translate !== '0px' && reading.translate !== 'none')
		expect(displaced.length, 'the card never moved at all').toBeGreaterThan(0)
		for (const reading of displaced) {
			expect(reading.fromTop, 'the card was still moving at reading height').toBeGreaterThan(height * 0.6)
		}
	})

	test('it is the only thing that moves in the green field', async ({ page }) => {
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)

		// The Score out-weighs the card by area and carries no information, so its
		// stillness is the mechanism rather than an omission. Same for the record, the
		// arcs and the six ornaments.
		const moving = await page.evaluate(() =>
			[...document.querySelectorAll('[data-about] *')]
				.filter(el => !el.classList.contains('about-card'))
				.filter(el => {
					const style = getComputedStyle(el)
					return style.animationName !== 'none' || style.transitionDuration !== '0s'
				})
				.map(el => el.className)
		)
		expect(moving, 'something other than the card moves in About').toEqual([])
	})

	test('with motion off the card sits where it always sat', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)

		const animating = await page.evaluate(() =>
			[...document.querySelectorAll('[data-about] *, [data-timeline] *')]
				.filter(el => {
					const style = getComputedStyle(el)
					return style.animationName !== 'none' && style.animationPlayState !== 'paused'
				})
				.map(el => el.className)
		)
		expect(animating, 'something in About or the Timeline animates under reduced motion').toEqual([])

		const card = await page.locator('.about-card').evaluate(el => ({
			translate: getComputedStyle(el).translate,
			opacity: getComputedStyle(el).opacity,
		}))
		expect(card.translate, 'the card is displaced with motion off').toBe('none')
		expect(card.opacity).toBe('1')
	})
})

test.describe('the end of the visible strip', () => {
	test('it says the arrangement continues, exactly when it continues', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)

		const mark = page.locator('.daw-edge-mark')
		const opacity = () => mark.evaluate(el => getComputedStyle(el).opacity)

		// Three quarters of the arrangement is past the right edge here, and two of the
		// five lanes render as empty track. Without this the phone reader has no hint.
		await dragStrip(page, 0)
		expect(await opacity(), 'nothing marks the hidden three quarters of the arrangement').toBe('1')

		// And it goes out at the far end, because an affordance pointing at nothing is the
		// same lie as a clip whose width is not its duration.
		await dragStrip(page, 99_999)
		expect(await opacity(), 'the marker still points right at the end of the strip').toBe('0')

		// And the rule itself, at every width rather than at one: drawn exactly while there
		// is arrangement to the right. Not asserted against a width where the strip happens
		// to fit, because whether it fits depends on the shell's own measure, which is a
		// design decision that has already moved once.
		for (const width of [375, 768, 1024, 1440, 1800]) {
			await page.setViewportSize({ width, height: 900 })
			await page.goto('/')
			await page.evaluate(() => document.fonts.ready)
			await dragStrip(page, 0)
			const hidden = await page.evaluate(() => {
				const strip = document.querySelector('[data-timeline-scroller]') as HTMLElement
				return strip.scrollWidth - strip.clientWidth
			})
			expect(await opacity(), `at ${width}px the marker disagrees with the ${hidden}px it describes`).toBe(
				hidden > 0 ? '1' : '0'
			)
		}
	})

	test('it survives with motion off, because it is drawn and not animated', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' })
		await page.setViewportSize({ width: 375, height: 812 })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)
		await dragStrip(page, 0)

		// The one place on this page where content is genuinely hidden. A reader who asked
		// for less motion must not be the one who loses the only sign that it is there.
		const mark = await page.locator('.daw-edge-mark').evaluate(el => ({
			opacity: getComputedStyle(el).opacity,
			animation: getComputedStyle(el).animationName,
			width: el.getBoundingClientRect().width,
		}))
		expect(mark.opacity).toBe('1')
		expect(mark.animation, 'the affordance depends on an animation').toBe('none')
		expect(mark.width).toBeGreaterThan(20)
	})

	test('it rides the edge of the strip and never adds a scrollbar', async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)

		for (const left of [0, 80, 160]) {
			await dragStrip(page, left)
			const measurement = await page.evaluate(() => {
				const strip = document.querySelector('[data-timeline-scroller]') as HTMLElement
				const mark = document.querySelector('.daw-edge-mark') as HTMLElement
				return {
					gap: Math.round(strip.getBoundingClientRect().right - mark.getBoundingClientRect().right),
					verticalOverflow: strip.scrollHeight - strip.clientHeight,
				}
			})
			// Pinned to the visible edge, inside the strip's own keyline, whatever the
			// reader has dragged. A marker that scrolls away describes nothing.
			expect(measurement.gap, 'the marker left the edge it describes').toBe(4)
			expect(measurement.verticalOverflow, 'the marker gave the strip a scrollbar').toBe(0)
		}
	})

	test('the keyboard is told which edge its arrow keys move', async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)

		const mark = page.locator('.daw-edge-mark')
		const resting = await mark.evaluate(el => ({
			colour: getComputedStyle(el).borderInlineStartColor,
			duration: getComputedStyle(el).transitionDuration,
			easing: getComputedStyle(el).transitionTimingFunction,
			property: getComputedStyle(el).transitionProperty,
		}))
		// Direct response to input and under 100ms, so it is not gated behind reduced
		// motion, and it presses with the same curve as every control on the site.
		expect(resting.duration).toBe('0.09s')
		expect(resting.easing).toBe(EASE_OUT)
		expect(resting.property).toBe('border-inline-start-color')

		await page.locator('[data-timeline-scroller]').focus()
		await expect
			.poll(async () => mark.evaluate(el => getComputedStyle(el).borderInlineStartColor))
			.not.toBe(resting.colour)
	})
})

test.describe('the arrangement itself', () => {
	test('the ruler gutter holds while the arrangement scrolls under it', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)
		await dragStrip(page, 140)

		// The year labels used to slide over the lane names, because only the lane headers
		// were sticky. Two gutters, one edge, at every scroll position.
		const edges = await page.evaluate(() => {
			const gutter = document.querySelector('.daw-ruler-gutter') as HTMLElement
			const header = document.querySelector('.daw-lane-header') as HTMLElement
			const firstBar = document.querySelector('.daw-bar') as HTMLElement
			return {
				gutterRight: Math.round(gutter.getBoundingClientRect().right),
				headerRight: Math.round(header.getBoundingClientRect().right),
				barLeft: Math.round(firstBar.getBoundingClientRect().left),
			}
		})
		expect(edges.gutterRight, 'the ruler gutter scrolled away from the lane gutter').toBe(edges.headerRight)
		expect(edges.barLeft, 'a year label is sliding over the lane names').toBeLessThanOrEqual(edges.gutterRight)
	})

	test('no clip cuts its own text', async ({ page }) => {
		for (const width of [375, 1024, 1440]) {
			await page.setViewportSize({ width, height: 900 })
			await page.goto('/')
			await page.evaluate(() => document.fonts.ready)

			// The detail is clamped to whole lines on purpose. What must never happen is the
			// clip being shorter than the clamped text, which cuts the last line through the
			// middle of the letterforms and reads as a rendering fault.
			const sliced = await page
				.locator('.daw-clip')
				.evaluateAll(nodes =>
					nodes
						.filter(node => node.scrollHeight > node.clientHeight)
						.map(
							node =>
								`${node.querySelector('.daw-clip-title')?.textContent}: ${node.scrollHeight} in ${node.clientHeight}`
						)
				)
			expect(sliced, `a clip is too short for its own text at ${width}px`).toEqual([])
		}
	})

	test('nothing inside the black box moves', async ({ page }) => {
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)

		// The playhead does not sweep, no clip grows, and no lane lights. A stopped
		// arrangement is stopped, and a clip whose width animates is a lie about how long
		// four years at the conservatory lasted.
		const moving = await page.evaluate(() =>
			[...document.querySelectorAll('[data-timeline-scroller] *')]
				.filter(el => getComputedStyle(el).animationName !== 'none')
				.map(el => el.className)
		)
		expect(moving, 'something in the arrangement animates').toEqual([])
	})
})
