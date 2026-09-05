import { expect, type Page, test } from '@playwright/test'
import sharp from 'sharp'

/**
 * A colour reduced to sRGB, whatever notation it arrived in.
 *
 * Comparing serialised strings does not work: Chrome computes a registered custom
 * property to `lab()` and an identical literal to `oklch()`. Resolving through
 * `getComputedStyle` and then normalising through a canvas gives both sides one form.
 */
async function resolveColour(page: Page, expression: string): Promise<string> {
	return page.evaluate(expr => {
		const probe = document.createElement('span')
		probe.style.color = expr
		document.body.append(probe)
		const computed = getComputedStyle(probe).color
		probe.remove()

		// Painting a pixel and reading it back is what actually converts to sRGB.
		// Assigning `fillStyle` preserves the colour space, so `lab(100 0 0)` and
		// `oklch(1 0 0)` still compare unequal even though both are white.
		const context = document.createElement('canvas').getContext('2d')
		if (context === null) {
			return computed
		}
		context.fillStyle = computed
		context.fillRect(0, 0, 1, 1)
		return [...context.getImageData(0, 0, 1, 1).data].join(',')
	}, expression)
}

/** Every colour token declared in the theme layer. */
const COLOUR_TOKENS = [
	'--background',
	'--foreground',
	'--card',
	'--card-foreground',
	'--popover',
	'--popover-foreground',
	'--primary',
	'--primary-foreground',
	'--secondary',
	'--secondary-foreground',
	'--muted',
	'--muted-foreground',
	'--accent',
	'--accent-foreground',
	'--destructive',
	'--destructive-foreground',
	'--border',
	'--input',
	'--ring',
	'--decor-lime',
	'--chart-1',
	'--chart-2',
	'--chart-3',
	'--chart-4',
	'--chart-5',
]

const SHADOW_STEPS = [
	'--shadow-2xs',
	'--shadow-xs',
	'--shadow-sm',
	'--shadow',
	'--shadow-md',
	'--shadow-lg',
	'--shadow-xl',
	'--shadow-2xl',
]

/**
 * Rows of an element screenshot that contain ink, as `[start, end)` bands.
 *
 * A row counts as ink if any pixel in it differs from the frame's own corner pixel by
 * more than `tolerance`. Anti-aliasing puts faint pixels at a glyph's edge, so the
 * threshold is deliberately well above zero.
 */
async function inkBands(png: Buffer, tolerance = 40): Promise<Array<[number, number]>> {
	const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true })
	const { width, height, channels } = info
	const ground = [data[0] ?? 0, data[1] ?? 0, data[2] ?? 0]

	const bands: Array<[number, number]> = []
	let open: number | null = null

	for (let y = 0; y < height; y++) {
		let hasInk = false
		for (let x = 0; x < width && !hasInk; x++) {
			const i = (y * width + x) * channels
			const distance =
				Math.abs((data[i] ?? 0) - (ground[0] ?? 0)) +
				Math.abs((data[i + 1] ?? 0) - (ground[1] ?? 0)) +
				Math.abs((data[i + 2] ?? 0) - (ground[2] ?? 0))
			if (distance > tolerance) {
				hasInk = true
			}
		}
		if (hasInk && open === null) {
			open = y
		} else if (!hasInk && open !== null) {
			bands.push([open, y])
			open = null
		}
	}
	if (open !== null) {
		bands.push([open, height])
	}
	return bands
}

/** Whether any row in `[from, to)` is free of ink. */
function blankRows(bands: Array<[number, number]>, from: number, to: number): boolean {
	for (let row = Math.max(0, Math.ceil(from)); row < to; row++) {
		if (!bands.some(([start, end]) => row >= start && row < end)) {
			return true
		}
	}
	return false
}

test.describe('the theme layer', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/specimen')
		// Layout depends on the real faces; measuring before they swap in reads the
		// fallback's metrics, not Bricolage's.
		await page.evaluate(() => document.fonts.ready)
	})

	test('declares every colour token, and each one renders', async ({ page }) => {
		for (const token of COLOUR_TOKENS) {
			const swatch = page.locator(`[data-token="${token}"]`)
			await expect(swatch, `${token} is missing from the specimen`).toHaveCount(1)

			const painted = await swatch.evaluate(el => getComputedStyle(el).backgroundColor)
			expect(painted, `${token} resolved to nothing`).not.toBe('')
			expect(painted).not.toBe('rgba(0, 0, 0, 0)')
		}
	})

	test('carries Anna’s palette: blue primary on white type, cantaloupe on black only', async ({ page }) => {
		const is = async (token: string, expected: string) =>
			expect(await resolveColour(page, `var(${token})`), token).toBe(await resolveColour(page, expected))

		await is('--primary', 'oklch(0.5104 0.1169 257.59)')
		await is('--primary-foreground', 'oklch(1 0 0)')
		await is('--accent', 'oklch(0.7803 0.1196 44.76)')
		// Cantaloupe carries black type only: 2.08:1 against white.
		await is('--accent-foreground', 'oklch(0 0 0)')
		// Warm paper, never pure white.
		await is('--background', 'oklch(0.9711 0.0125 92)')
		// Every keyline is black.
		await is('--border', 'oklch(0 0 0)')
		// Focus is the blue, not the black keyline.
		await is('--ring', 'oklch(0.5104 0.1169 257.59)')
	})

	test('every shadow step is a hard offset with no blur', async ({ page }) => {
		for (const step of SHADOW_STEPS) {
			const box = page.locator(`[data-shadow="${step}"]`)
			await expect(box, `${step} is missing from the specimen`).toHaveCount(1)

			const shadow = await box.evaluate(el => getComputedStyle(el).boxShadow)
			// `rgb(...) Xpx Ypx BLURpx SPREADpx`, the third length is the blur radius.
			const lengths = shadow.match(/-?\d+(\.\d+)?px/g) ?? []
			expect(lengths.length, `could not read lengths from "${shadow}"`).toBeGreaterThanOrEqual(3)
			expect(lengths[2], `${step} has a blur radius: ${shadow}`).toBe('0px')
		}
	})

	test('corners are square and keylines are 4px', async ({ page }) => {
		const control = page.locator('[data-control-state="rest"]')
		const style = await control.evaluate(el => {
			const computed = getComputedStyle(el)
			return {
				radius: computed.borderTopLeftRadius,
				width: computed.borderTopWidth,
			}
		})
		expect(style.radius).toBe('0px')
		expect(style.width).toBe('4px')

		// The whole radius namespace is cleared, not only the four named steps.
		const rounded = await page.evaluate(() => {
			const probe = document.createElement('div')
			probe.className = 'rounded rounded-2xl'
			document.body.append(probe)
			const value = getComputedStyle(probe).borderTopLeftRadius
			probe.remove()
			return value
		})
		expect(rounded, 'a Tailwind radius utility still rounds').toBe('0px')
	})

	test('no heading falls below a line height of 0.9', async ({ page }) => {
		for (const level of [1, 2, 3, 4, 5, 6]) {
			const heading = page.locator(`[data-heading="${level}"]`)
			const ratio = await heading.evaluate(el => {
				const computed = getComputedStyle(el)
				return Number.parseFloat(computed.lineHeight) / Number.parseFloat(computed.fontSize)
			})
			// Both sides are rounded pixel values, so the division lands a hair under.
			expect(ratio, `h${level} is set at ${ratio}`).toBeGreaterThanOrEqual(0.9 - 1e-6)
		}
	})

	test('the heading scale descends', async ({ page }) => {
		const sizes = await page.evaluate(() =>
			[1, 2, 3, 4, 5, 6].map(level => {
				const el = document.querySelector(`[data-heading="${level}"]`)
				return el ? Number.parseFloat(getComputedStyle(el).fontSize) : 0
			})
		)
		for (let i = 1; i < sizes.length; i++) {
			expect(sizes[i], `h${i + 1} is not smaller than h${i}`).toBeLessThan(sizes[i - 1] ?? 0)
		}
	})

	test('Italian accents are not clipped or collided at the largest heading size', async ({ page }) => {
		const frame = page.locator('[data-accent-frame]')
		const hero = page.locator('[data-accent-hero]')

		// It really is the largest size.
		const heroSize = await hero.evaluate(el => Number.parseFloat(getComputedStyle(el).fontSize))
		const h1Size = await page
			.locator('[data-heading="1"]')
			.evaluate(el => Number.parseFloat(getComputedStyle(el).fontSize))
		expect(heroSize).toBe(h1Size)

		// The row where the first line of capitals ends and the second begins. Line
		// boxes are contiguous, so this single row is where a collision would show.
		const seam = await hero.evaluate(el => {
			const computed = getComputedStyle(el)
			const frameTop = (el.parentElement as HTMLElement).getBoundingClientRect().top
			const heroTop = el.getBoundingClientRect().top - frameTop
			const lineHeight = Number.parseFloat(computed.lineHeight)
			return { row: heroTop + Number.parseFloat(computed.paddingTop) + lineHeight, lineHeight }
		})

		const shot = await frame.screenshot()
		const bands = await inkBands(shot)
		const { height = 0 } = await sharp(shot).metadata()

		// Accented capitals put the mark and the letter in separate bands, and at a
		// line-height below 1 the second line's marks legitimately rise above its line
		// box, so ink crossing the seam is expected. What must not happen is the two
		// lines running together: that shows up as an unbroken run of ink through the
		// whole seam region.
		const window = seam.lineHeight * 0.4
		const daylight = blankRows(bands, seam.row - window, seam.row + window)
		expect(daylight, `no daylight around row ${Math.round(seam.row)}: È À Ù have hit the line above`).toBe(true)

		// Both lines actually rendered, otherwise the assertion above is vacuous.
		expect(
			bands.some(([, end]) => end <= seam.row),
			'no ink on the first line'
		).toBe(true)
		expect(
			bands.some(([start]) => start > seam.row),
			'no ink on the second line'
		).toBe(true)

		// And nothing is cut off at the frame's edges.
		const first = bands[0]
		const last = bands[bands.length - 1]
		expect(first?.[0] ?? 0, 'ink reaches the top of the frame').toBeGreaterThan(0)
		expect(last?.[1] ?? height, 'ink reaches the bottom of the frame').toBeLessThan(height)
	})

	test('the accent marks themselves are drawn, not cut away', async ({ page }) => {
		const accented = await inkBands(await page.locator('[data-accent-probe="accented"]').screenshot())
		const plain = await inkBands(await page.locator('[data-accent-probe="plain"]').screenshot())

		const accentedTop = accented[0]?.[0] ?? 0
		const plainTop = plain[0]?.[0] ?? 0

		// È À Ù carry their marks above the cap height, so the accented probe must have
		// ink strictly higher than the bare capitals. Equal tops would mean the marks
		// are missing, the subset failed to load, or clipped off.
		expect(accentedTop, 'ÈÀÙ starts no higher than EAU: the marks are not being drawn').toBeLessThan(plainTop)
	})

	test('Bricolage’s width axis is loaded and narrows the type', async ({ page }) => {
		const wide = await page.locator('[data-axis="wdth-100"]').boundingBox()
		const narrow = await page.locator('[data-axis="wdth-75"]').boundingBox()

		expect(wide?.width).toBeGreaterThan(0)
		expect(narrow?.width).toBeGreaterThan(0)
		// If `axes: ['opsz','wdth']` were dropped, next/font would ship a weight-only
		// file and both strings would measure the same.
		expect(narrow?.width, 'the wdth axis is not doing anything').toBeLessThan((wide?.width ?? 0) * 0.95)
	})

	test('every interactive element takes a blue focus outline distinct from its keyline', async ({ page }) => {
		const focusables = page.locator('[data-focusable]')
		const count = await focusables.count()
		expect(count).toBeGreaterThan(0)

		for (let i = 0; i < count; i++) {
			const element = focusables.nth(i)
			await element.focus()

			const style = await element.evaluate(el => {
				const computed = getComputedStyle(el)
				return {
					width: computed.outlineWidth,
					style: computed.outlineStyle,
					colour: computed.outlineColor,
					keyline: computed.borderTopColor,
				}
			})

			expect(style.style, 'no focus outline').not.toBe('none')
			expect(Number.parseFloat(style.width)).toBeGreaterThanOrEqual(3)

			// The blue, not the black keyline, an offset black outline around an
			// element that already has a black keyline reads as a doubled border.
			const outline = await resolveColour(page, style.colour)
			const keyline = await resolveColour(page, style.keyline)
			expect(outline, 'the focus indicator is not the blue ring').toBe(await resolveColour(page, 'var(--ring)'))
			expect(outline, 'the focus indicator is the same colour as the keyline').not.toBe(keyline)
		}
	})

	test('the signature move lifts on hover and collapses into the shadow on press', async ({ page }) => {
		const read = async (state: string) =>
			page.locator(`[data-control-state="${state}"]`).evaluate(el => {
				const computed = getComputedStyle(el)
				return { transform: computed.transform, shadow: computed.boxShadow, transition: computed.transitionDuration }
			})

		const rest = await read('rest')
		const hover = await read('hover')
		const press = await read('press')

		expect(rest.transform).toBe('none')
		// Hover lifts away from the shadow, which grows.
		expect(hover.transform).toBe('matrix(1, 0, 0, 1, -2, -2)')
		// Press translates into the shadow, which collapses to nothing.
		expect(press.transform).toBe('matrix(1, 0, 0, 1, 6, 6)')
		expect(press.shadow).toMatch(/0px 0px 0px 0px/)
		// Abrupt, not animated: brutalism is mechanical.
		expect(rest.transition).toBe('0.09s, 0.09s')
	})

	test('the specimen is not offered to search engines', async ({ page }) => {
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
	})
})
