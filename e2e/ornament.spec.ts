import { expect, test } from '@playwright/test'

test.describe('the ornament layer', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)
	})

	test('is placed per section, and no two share a rotation', async ({ page }) => {
		const rotations = await page
			.locator('[data-ornament]')
			.evaluateAll(nodes => nodes.map(n => Number(n.getAttribute('data-rotation'))))

		expect(rotations.length, 'no ornament reached the page').toBeGreaterThan(3)
		expect(new Set(rotations).size, 'two ornaments share a rotation').toBe(rotations.length)
		// Never zero: an unrotated ornament reads as a component, not as composition.
		expect(rotations.filter(r => r === 0)).toEqual([])
	})

	test('nothing in it animates', async ({ page }) => {
		const moving = await page.locator('[data-ornament]').evaluateAll(nodes =>
			nodes
				.map(node => {
					const style = getComputedStyle(node)
					return {
						kind: node.getAttribute('data-ornament') ?? '',
						animation: style.animationName,
						transition: style.transitionProperty,
					}
				})
				.filter(o => o.animation !== 'none' || (o.transition !== 'none' && o.transition !== 'all'))
		)
		expect(moving, 'an ornament animates; rotation here is composition, not movement').toEqual([])
	})

	test('every element is hidden from assistive technology and carries no text', async ({ page }) => {
		const exposed = await page
			.locator('[data-ornament]')
			.evaluateAll(nodes =>
				nodes
					.filter(node => node.getAttribute('aria-hidden') !== 'true' || (node.textContent ?? '').trim() !== '')
					.map(node => node.getAttribute('data-ornament') ?? '?')
			)
		expect(exposed, 'an ornament is exposed to assistive technology or carries meaning').toEqual([])
	})

	test('never overlaps a control or a tap target', async ({ page }) => {
		const collisions = await page.evaluate(() => {
			const rect = (el: Element) => {
				const box = el.getBoundingClientRect()
				return { left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width }
			}
			const hits = (a: ReturnType<typeof rect>, b: ReturnType<typeof rect>) =>
				a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

			const ornaments = [...document.querySelectorAll('[data-ornament]')].map(rect)
			const controls = [...document.querySelectorAll('a, button, input, textarea, select, [tabindex]')].map(rect)

			const found: string[] = []
			for (const ornament of ornaments) {
				for (const control of controls) {
					if (control.width > 0 && hits(ornament, control)) {
						found.push(`${Math.round(ornament.left)},${Math.round(ornament.top)}`)
					}
				}
			}
			return found
		})
		expect(collisions, 'an ornament sits over a control').toEqual([])
	})

	test('never sits behind text', async ({ page }) => {
		// The one way this layer could cost contrast is by putting a coloured shape under
		// type. Measured against the text's own rects rather than its element's box: a
		// paragraph's box spans the column, but its glyphs do not, and an ornament in that
		// margin is exactly where this layer is supposed to live.
		const behindText = await page.evaluate(() => {
			const hits = (a: DOMRect, b: DOMRect) =>
				a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

			const textRects: { rect: DOMRect; text: string }[] = []
			const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
			while (walker.nextNode()) {
				const node = walker.currentNode
				const text = (node.textContent ?? '').trim()
				if (text === '' || node.parentElement?.closest('[data-ornament]') !== null) {
					continue
				}
				const range = document.createRange()
				range.selectNodeContents(node)
				for (const rect of range.getClientRects()) {
					if (rect.width > 0 && rect.height > 0) {
						textRects.push({ rect, text })
					}
				}
			}

			const found: string[] = []
			for (const ornament of document.querySelectorAll('[data-ornament]')) {
				const box = ornament.getBoundingClientRect()
				for (const { rect, text } of textRects) {
					if (hits(box, rect)) {
						found.push(`${ornament.getAttribute('data-ornament')} over "${text.slice(0, 24)}"`)
					}
				}
			}
			return found
		})
		expect(behindText, 'an ornament sits behind text').toEqual([])
	})

	test('lime appears only here', async ({ page }) => {
		const misuse = await page.evaluate(() => {
			const lime = getComputedStyle(document.documentElement).getPropertyValue('--decor-lime').trim()
			const probe = document.createElement('span')
			probe.style.color = lime
			document.body.append(probe)
			const limeComputed = getComputedStyle(probe).color
			probe.remove()

			const found: string[] = []
			for (const el of document.querySelectorAll('body *')) {
				if (el.closest('[data-ornament]') !== null) {
					continue
				}
				const style = getComputedStyle(el)
				if (style.backgroundColor === limeComputed) {
					found.push(`fill: ${el.tagName.toLowerCase()}`)
				}
				if (style.color === limeComputed && (el.textContent ?? '').trim() !== '') {
					found.push(`type: ${el.tagName.toLowerCase()}`)
				}
			}
			return found
		})
		expect(misuse, 'lime is used outside the ornament layer').toEqual([])
	})

	test('the page reads correctly with every ornament removed', async ({ page }) => {
		const before = await page.evaluate(() => ({
			text: document.body.innerText.replace(/\s+/g, ' ').trim(),
			headings: document.querySelectorAll('h1, h2, h3').length,
			controls: document.querySelectorAll('a, button').length,
		}))

		await page.evaluate(() => {
			for (const node of document.querySelectorAll('[data-ornament]')) {
				node.remove()
			}
		})

		const after = await page.evaluate(() => ({
			text: document.body.innerText.replace(/\s+/g, ' ').trim(),
			headings: document.querySelectorAll('h1, h2, h3').length,
			controls: document.querySelectorAll('a, button').length,
		}))

		// Additive, never load-bearing: nothing readable and nothing operable was in it.
		expect(after.text).toBe(before.text)
		expect(after.headings).toBe(before.headings)
		expect(after.controls).toBe(before.controls)
	})

	test('overflows its container rather than being clipped by it', async ({ page }) => {
		const clipped = await page.locator('[data-ornament]').evaluateAll(nodes =>
			nodes
				.filter(node => {
					const parent = node.parentElement
					if (parent === null) {
						return false
					}
					// A clipping parent would cut a shape that is meant to break the edge.
					return /(hidden|clip)/.test(getComputedStyle(parent).overflow)
				})
				.map(node => node.getAttribute('data-ornament') ?? '?')
		)
		expect(clipped, 'an ornament is clipped by its container').toEqual([])
	})

	test('does not make the page scroll sideways at 375px', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 })
		await page.reload()
		await page.evaluate(() => document.fonts.ready)

		const overflow = await page.evaluate(() => ({
			scrollWidth: document.documentElement.scrollWidth,
			clientWidth: document.documentElement.clientWidth,
		}))
		expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth)
	})
})
