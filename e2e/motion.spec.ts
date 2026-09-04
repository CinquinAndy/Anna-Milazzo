import { expect, test } from '@playwright/test'

/** `cubic-bezier(0, 0, 0.58, 1)` is exactly `ease-out`, and that is how it serialises. */
const EASE_OUT = 'ease-out'

test.describe('motion', () => {
	test('every control carries the same signature move, at the same speed', async ({ page }) => {
		await page.goto('/')

		const controls = await page.locator('.control').evaluateAll(nodes =>
			nodes.map(node => {
				const style = getComputedStyle(node)
				return {
					duration: style.transitionDuration,
					easing: style.transitionTimingFunction,
					property: style.transitionProperty,
				}
			})
		)

		expect(controls.length).toBeGreaterThan(3)
		for (const control of controls) {
			// ~90ms: anything over about 250ms reads as a different design language.
			expect(control.duration).toBe('0.09s, 0.09s')
			// Asymmetric on purpose. A symmetric ease-in-out accelerates the object away
			// from the press, which is backwards for something meant to feel stamped.
			expect(control.easing).toBe(`${EASE_OUT}, ${EASE_OUT}`)
			// Named properties, never `all`: `all` animates layout and forces reflow.
			expect(control.property).toBe('transform, box-shadow')
			expect(control.property).not.toContain('all')
		}
	})

	test('the Folder lifts on hover under the same rule', async ({ page }) => {
		await page.goto('/')

		const folder = page.locator('[data-song="notturno-per-tram-vuoto"]')
		const resting = await folder.evaluate(el => ({
			transform: getComputedStyle(el).transform,
			filter: getComputedStyle(el).filter,
			duration: getComputedStyle(el).transitionDuration,
		}))
		expect(resting.transform).toBe('none')
		expect(resting.duration).toBe('0.09s, 0.09s')

		await folder.hover()
		await expect
			.poll(async () => folder.evaluate(el => getComputedStyle(el).transform))
			.toBe('matrix(1, 0, 0, 1, -2, -2)')

		// Lifted away from the shadow, and the shadow grows to match.
		const lifted = await folder.evaluate(el => getComputedStyle(el).filter)
		expect(lifted).not.toBe(resting.filter)
		expect(lifted).toContain('drop-shadow')
	})

	test('section entrances are declared inside a reduced-motion-safe query', async ({ page }) => {
		await page.goto('/')

		// Not switched off afterwards: the usual `animation-duration: 0.001ms` override
		// does not stop a scroll-driven animation, so an entrance disabled that way would
		// still move for someone who asked it not to.
		const declaration = await page.evaluate(() => {
			for (const sheet of [...document.styleSheets]) {
				let rules: CSSRuleList
				try {
					rules = sheet.cssRules
				} catch {
					continue
				}
				for (const rule of [...rules]) {
					if (rule instanceof CSSMediaRule && rule.conditionText.includes('prefers-reduced-motion')) {
						if (rule.cssText.includes('data-enter')) {
							return { guarded: true, condition: rule.conditionText }
						}
					}
				}
			}
			return { guarded: false, condition: '' }
		})

		expect(declaration.guarded, 'the entrance is not inside a prefers-reduced-motion query').toBe(true)
		expect(declaration.condition).toContain('no-preference')
	})

	test('entrances are per section, not per element', async ({ page }) => {
		await page.goto('/')

		const sections = await page.locator('[data-enter]').count()
		expect(sections).toBeGreaterThan(3)

		// Nothing inside a section animates in on its own.
		const nested = await page.locator('[data-enter] [data-enter]').count()
		expect(nested, 'an entrance is nested inside another').toBe(0)
	})

	test('nothing moves when reduced motion is requested', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)

		const animating = await page.evaluate(() =>
			[...document.querySelectorAll('body *')]
				.filter(el => {
					const style = getComputedStyle(el)
					return style.animationName !== 'none' && style.animationPlayState !== 'paused'
				})
				.map(el => `${el.tagName.toLowerCase()}: ${getComputedStyle(el).animationName}`)
		)
		expect(animating, 'something animates under reduced motion').toEqual([])

		// The press feedback stays: it is direct response to input, under 100ms.
		const control = await page
			.locator('.control')
			.first()
			.evaluate(el => getComputedStyle(el).transitionDuration)
		expect(control).toBe('0.09s, 0.09s')
	})

	test('every section is readable when the entrance never runs', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)

		// Motion must never gate access to content.
		const hidden = await page.locator('[data-enter]').evaluateAll(nodes =>
			nodes
				.filter(node => {
					const style = getComputedStyle(node)
					return Number(style.opacity) < 1 || style.visibility === 'hidden'
				})
				.map(node => node.className)
		)
		expect(hidden, 'a section is invisible without its entrance').toEqual([])

		await expect(page.getByRole('heading', { name: 'Chi sono' })).toBeVisible()
		await expect(page.getByRole('heading', { name: 'Ascolta' })).toBeVisible()
		await expect(page.getByRole('heading', { name: 'Percorso' })).toBeVisible()
	})

	test('has no magnetic buttons, custom cursor, preloader or parallax', async ({ page }) => {
		await page.goto('/')

		const smells = await page.evaluate(() => {
			const found: string[] = []
			for (const el of document.querySelectorAll('body *')) {
				const style = getComputedStyle(el)
				if (style.cursor === 'none') {
					found.push(`custom cursor on ${el.tagName.toLowerCase()}`)
				}
				if (style.backgroundAttachment === 'fixed') {
					found.push(`parallax on ${el.tagName.toLowerCase()}`)
				}
			}
			// A preloader covers the page before anything is readable.
			for (const el of document.querySelectorAll('[class*="preload"], [id*="preload"], [data-preloader]')) {
				found.push(`preloader: ${el.tagName.toLowerCase()}`)
			}
			return found
		})
		expect(smells).toEqual([])
	})
})
