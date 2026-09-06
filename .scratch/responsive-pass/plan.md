# Responsive plan for annamilazzo.com

Audit date: 2026-09-06. Evidence root: `/tmp/claude-1000/-home-andycinquin-clonedrepo-anna-milazzo/8e55e7d3-9f9e-4104-8b5b-fbb02b51495f/scratchpad/responsive/` (72 capture folders, `index.md` lists them). Every finding below was reported by one agent and then re-checked by a second agent who looked at the pictures and measured the running site themselves. 42 defects survived that check. 10 reports were refuted and are listed in section 4 so nobody spends a day re-auditing them.

---

## 1. The matrix

### Viewport classes captured

| Class | Widths x heights | Locales captured |
|---|---|---|
| Phone portrait | 320x568, 360x740, 375x667, 390x844, 414x896, 430x932 | IT at all six, EN at 320 and 375 |
| Phone landscape | 844x390, 932x430 | IT |
| Tablet | 768x1024, 820x1180, 1024x768, 1024x1366 | IT at all four, EN at 768 |
| Desktop | 1280x720, 1366x768, 1440x900, 1536x864, 1920x1080, 2560x1440 | IT at all six, EN at 1440 |
| Odd | 1024x600 (short laptop), 3440x1440 (ultrawide) | IT |

24 viewport folders per page, 3 pages, 72 folders. Each folder holds `fold.png`, `full.png`, one PNG per section in document order, and `measure.json` (document overflow, clipped text, overlapping text, tap targets under 24 and under 44, inputs under 16px, header height as a share of the viewport, image boxes, section heights).

Beyond the captures, the live site was probed at the boundaries that matter: 300, 330, 335, 340, 356, 362, 384, 385, 417, 419, 427, 443, 452, 500, 505, 510, 639, 640, 641, 700, 740, 767, 768, 790, 820, 836, 840, 852, 866, 870, 900, 960, 1000, 1023, 1024, 1033, 1043, 1060, 1100, 1150, 1200, 1220, 1279, 1280, 1504, 1536, 1600, 1700, 1800, 1880, 1905, 1920, 2200, 2560, 3440, and at viewport heights 375, 390, 430, 500, 550, 600, 700, 720, 768, 800, 860, 880, 900, 1080, 1366, 1440.

### Pages and sections

| Page | Route | Sections, in document order |
|---|---|---|
| Landing | `/`, `/en` | `00-header-site-header`, `01-section-enter` (hero), `02-section-enter` (Chi sono / About), `03-section-enter` (Cosa so fare / What I do), `04-div-marquee`, `05-section-ascolta` (works, Folder cards and pager), `06-section-percorso` (training, DAW arrangement), `07-section-enter` (contact CTA), `08-footer-site-footer` |
| Contact | `/contact`, `/en/contact` | `00-header-site-header`, `01-section-enter` (arrival, address slip), `02-section-enter` (desk: brief card and form), `03-section-enter` (facts, small Folder cards), `04-footer-site-footer` |
| Legal | `/legal`, `/en/legal` | `00-header-site-header`, `01-div-1` (notice prose), `02-footer-site-footer` |

Interaction states probed beyond the static captures: anchor jumps from the hero and the footer, works pager taps in both directions, empty form submit, focus order forward and backward, the phone keyboard open on each form field, rotation from portrait to landscape, and a horizontal drag past both ends of the DAW.

---

## 2. The verdict in one paragraph

The site holds up well. Across 72 page-by-viewport captures there is no horizontal document overflow, no overlapping text, no input under 16px, no unreachable control and no form that cannot be completed: there are zero blockers. The design survives every width, which is the harder thing to get right, and the parts that look alarming in a screenshot (the DAW scrolling sideways, decoration bleeding past a section edge, a section title that fills its whole band, empty DAW lanes on a phone) are all deliberate and were confirmed as such. What is actually wrong falls into three clusters. First, the header: on a phone it stacks into three rows and eats 27% of a 320x568 screen, and between 640 and 866 it wraps into two rows that take 30% of a landscape phone, and because a fixed 67px is hard-coded as the header height in three other places, every anchor jump and every backward Tab on the site lands underneath it. Second, the giant section titles: they are sized by a character-width constant that is a hair too small, so PERCORSO overruns its band from 640px up (and on a Windows machine with a classic scrollbar that makes the page scroll sideways), and the long English heading collapses to a 36px two-line caption on every phone. Third, a scattering of independent small things: the works pager scrolls the reader past the works instead of to them, the DAW's "there is more this way" chevron is a Chromium-only CSS feature that Safari and Firefox never draw, and about twenty measure, wrap and spacing items that are worse than they should be without breaking anything. Nothing here requires redesigning a section. Almost every fix is a breakpoint, a constant, or one declaration.

---

## 3. The screens to treat

Two notes before the list.

**Shared groundwork, do this first.** Five findings (`scroll-under-header`, `hero-header-h-tablet`, `pager-scroll-jump`, `contact-submit-banner-hidden`, and part of `pill-touch-size`) all depend on the page knowing how tall the header actually is. `--header-h: 67px` in `globals.css` is a constant that is only true above 840px (IT) or 900px (EN); the real bar is 153px on a phone and 111px in between. Per-breakpoint constants will not work, because the wrap width differs by locale. Add one small client island that sets `--header-h` on `document.documentElement` from a `ResizeObserver` on `[data-site-header]` (the same pattern already used in `dither-field.tsx:381` and `song-visualiser.tsx:481`), then let the five fixes below read it. Do this before anything else and four of the five become one-liners.

**Line numbers.** The working tree carries an uncommitted `globals.css` edit that shifts line numbers by roughly 60 to 100. Every `globals.css:NNN` below is the number at HEAD unless marked otherwise. Grep the selector, do not trust the number blindly.

---

### MAJOR

---

#### M1. `scroll-under-header` — anchor jumps, focus and Shift+Tab land under the sticky bar

**Pages and sections:** all three pages, both locales. Landing `01-section-enter` (hero Ascolta trigger), `05-section-ascolta` and `06-section-percorso` (anchor targets), `08-footer-site-footer` (link triggers and the Shift+Tab start). Contact `02-section-enter` (Turnstile slot, fields) and `03-section-enter` (`#in-pratica`, facts controls). Legal `02-footer-site-footer`.

**Viewport range:** anchor jumps land under the bar at every width below 840 (IT) and below 900 (EN). The giant title is visibly sliced by the bar from 320 to 639; between 640 and 839/899 the band's top 31px are hidden but the word clears. `/contact#in-pratica` is sliced at every width below 840/900 because the id sits on the h2 itself. Backward Tab puts a control fully under the bar at every width from 320 to 1440 inclusive.

**What is wrong:** every `[id]` carries a flat 80px scroll margin sized for the 67px desktop bar, and nothing else reserves the header's height, so on a phone (153px bar) the target parks 73px under it and ASCOLTA and PERCORSO arrive with their top 41px cut off. Shift+Tab is worse, because elements without an id carry no margin at all: the footer links, the Turnstile slot, the facts buttons and the message textarea all scroll to y=0 and sit entirely behind the bar.

**Cause:** `src/app/(frontend)/globals.css:465-467` `[id] { scroll-margin-block-start: 5rem }`; `globals.css:95` `--header-h: 67px`; no `scroll-padding` anywhere on `html`.

**The fix:** with the measured `--header-h` in place, delete the `[id]` rule and put `html { scroll-padding-block-start: calc(var(--header-h) + 0.75rem) }` in its place. Scroll padding applies to every scroll the browser performs, including `focus()` and sequential focus navigation, so it covers anchors, the rejected-field focus and Shift+Tab in one declaration and `contact-form.tsx` needs no change. The `0.75rem` is the section's own top keyline plus a hair, so the target reads as landing just under the bar rather than glued to it. Nothing visual moves.

**The test** (`e2e/header-scroll.spec.ts`), at 375, 768 and 1440:

```ts
for (const width of [375, 768, 1440]) {
	test(`anchor jumps clear the sticky header at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 800 })
		await page.emulateMedia({ reducedMotion: 'reduce' })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)

		await page.locator('[data-hero-listen]').click()
		const { target, barBottom } = await page.evaluate(() => ({
			target: document.querySelector('#ascolta')!.getBoundingClientRect().top,
			barBottom: document.querySelector('[data-site-header]')!.getBoundingClientRect().bottom,
		}))
		// The band the title sits in must start below the bar, not behind it.
		expect(target, 'the section landed under the sticky header').toBeGreaterThanOrEqual(barBottom - 1)
	})
}
```

---

#### M2. `header-rows` — the phone header is three rows and 153px, 27% of a small screen

**Pages and sections:** all three pages, both locales. `00-header-site-header`; it also pushes the hero composition below the first screen on `01-section-enter`.

**Viewport range:** three rows, 152.5px, at 300 to 452 in Italian and 300 to 361 in English. From there to 639 the bar is two rows and 110.5px but still left-packed against empty paper. At 640 the intended layout takes over.

**What is wrong:** below 640 the bar stacks the wordmark, the magenta contact pill and the two full-name language pills into three left-packed rows, 153px tall and sticky on every page, which is 27% of 320x568 and 23% of 375x667, with a field of empty paper to the right of each row. The section nav it is pinned for is hidden on phones, so 153px of sticky chrome carries one CTA and a language toggle.

**Cause:** `src/components/site-header.tsx:32` `sticky top-0` at every width; `:42` `hidden sm:flex` on the section nav; `:54` the second group is `flex w-full flex-wrap` with no `ms-auto` below sm, holding a 227px nowrap Italian CTA plus a 186px switch against a 288 to 398px shell; `src/components/language-switch.tsx:30,42` render full locale names.

**The fix:** below `sm`, move the language switch onto the wordmark's row with `ms-auto` and render it as two-letter `IT` / `EN` pills, keeping the full locale name in `aria-label` and leaving `hreflang` and `lang` untouched. Two-letter pills measure about 92px, so at 320 the row is 142 + 12 + 92 = 246 of 288 available and fits with room. Leave the contact pill on a second row and give that row `ms-auto` too, so it right-aligns like the tablet bar instead of packing left against empty paper. Result: two rows, about 111px, in both languages at every phone width. Keep the bar sticky: the CTA is the one thing the phone bar still carries, and the header's own doc comment says a nav that scrolls away is decoration. If the client would rather have it scroll away below `sm`, that is a design call for them, not part of this fix.

**The test** (`e2e/site-header.spec.ts`), at 320, 360, 375 and 430, both locales:

```ts
for (const path of ['/', '/en'] as const) {
	for (const width of [320, 360, 375, 430]) {
		test(`the phone header is at most two rows at ${width}px on ${path}`, async ({ page }) => {
			await page.setViewportSize({ width, height: 800 })
			await page.goto(path)
			await page.evaluate(() => document.fonts.ready)

			const rows = await page
				.locator('[data-site-header] a, [data-site-header] button')
				.evaluateAll(nodes => new Set(nodes.map(n => Math.round(n.getBoundingClientRect().top))).size)
			expect(rows, 'the header stacked into more than two rows').toBeLessThanOrEqual(2)

			const height = await page.locator('[data-site-header]').evaluate(el => el.getBoundingClientRect().height)
			expect(height, 'the sticky bar is taller than two rows').toBeLessThanOrEqual(120)
		})
	}
}
```

---

#### M3. `pager-scroll-jump` — tapping page 02 drops the reader past the works onto PERCORSO

**Pages and sections:** landing, `05-section-ascolta` (lands the reader in `06-section-percorso`).

**Viewport range:** every viewport where the old three-folder list is taller than the screen, which is 320x568 through 1920x1080, so effectively every real device. At 2560x1440 the list fits and the only residue is the first folder's tab tucked under the bar.

**What is wrong:** `setPage(next)` and `listRef.current?.focus()` run in the same click handler, so the browser scrolls the OLD three-folder list into view (bottom-aligned, because it is taller than the viewport) and only then does React commit the shorter two-folder page, leaving the scroll position computed for a list that no longer exists. On a phone the DAW of the next section fills the whole screen after the tap and works 4 and 5 sit 2100 to 2320px above; tapping back to 01 lands inside the second folder.

**Cause:** `src/components/song-pager.tsx:47-48` (inside `go()`).

**The fix:** move the focus out of the click handler into a `useEffect` keyed on `page` that skips the first render (or wrap the state change in `flushSync`), and there call `listRef.current.focus({ preventScroll: true })` followed by `scrollIntoView({ block: 'start' })`, so there is one scroll rather than a centre-then-start pair. Then give `.song-list` `scroll-margin-block-start: calc(var(--header-h) + 0.5rem)` using the measured value, not the 5rem the `[id]` rule uses, so the first folder's tab lands just under whatever bar is on screen. A post-commit focus alone is not enough: Chrome centres a fully hidden element, which lands the reader mid-way through work 4 with its tab and title above the fold.

**The test** (extends `e2e/song-pager.spec.ts`), at 375, 768 and 1440:

```ts
for (const width of [375, 768, 1440]) {
	test(`paging puts the first work of the new page under the bar at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 800 })
		await page.emulateMedia({ reducedMotion: 'reduce' })
		await page.goto('/')
		await page.locator('#ascolta').scrollIntoViewIfNeeded()

		await page.locator('.song-pager-page').nth(1).click()

		const { listTop, barBottom } = await page.evaluate(() => ({
			listTop: document.querySelector('.song-list')!.getBoundingClientRect().top,
			barBottom: document.querySelector('[data-site-header]')!.getBoundingClientRect().bottom,
		}))
		expect(listTop, 'the new page is above the fold').toBeGreaterThanOrEqual(barBottom - 1)
		expect(listTop, 'the reader was dropped past the works').toBeLessThan(barBottom + 24)
	})
}
```

---

#### M4. `daw-edge-marker-support` — the "continues this way" chevron is Chromium-only

**Pages and sections:** landing, `06-section-percorso`.

**Viewport range:** every width, in Safari (all iPhones and iPads) and Firefox. Major from 320 to 1024, where 48% to 78% of the arrangement is hidden and two of five lanes render empty; minor at desktop widths, where only one clip's tail is off screen.

**What is wrong:** the chevron is shown only by `@container scroll-state(scrollable: inline-end)`, which Chromium 133 and up implements and Firefox and Safari do not, so on those engines the base `opacity: 0` stands and nothing is ever drawn. On iOS the scrollbar is an overlay that is invisible until touched, so at 375 with 937px of arrangement hidden there is no signal at all that the strip scrolls. The brief accepts empty lanes on a phone precisely because the marker is the affordance, and on iOS the affordance is missing. Confirmed in Firefox 151 and WebKitGTK 2.52, where `CSS.supports('container-type: scroll-state')` returns false.

**Cause:** `src/app/(frontend)/globals.css:1056` `container-type: scroll-state`; `:1292-1310` `.daw-edge-mark { opacity: 0 }` as the base state; `:1334-1338` the only rule that turns it on.

**The fix:** keep the scroll-state query (it is right before hydration in Chromium) and add a JS-maintained fallback beside it. `timeline.tsx` is a server component, so render the `.daw-edge` span from a small client island that on mount takes `closest('.daw')`, listens to `scroll` and a `ResizeObserver`, and sets `data-more = scrollLeft + clientWidth < scrollWidth - 1`. Then add `.daw[data-more='true'] .daw-edge-mark { opacity: 1 }` next to the existing query at `:1334`. No visual change in any engine that already draws it.

**The test** (`e2e/timeline.spec.ts`), at 375 and 1440, running in Chromium but asserting the engine-independent contract:

```ts
for (const width of [375, 1440]) {
	test(`the arrangement says it continues at ${width}px, without a scroll-state query`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 })
		await page.emulateMedia({ reducedMotion: 'reduce' })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)

		const daw = page.locator('.daw')
		await expect(daw).toHaveAttribute('data-more', 'true')

		await daw.evaluate(el => el.scrollTo({ left: el.scrollWidth }))
		await expect(daw).toHaveAttribute('data-more', 'false')
	})
}
```

---

#### M5. `title-sliced` — PERCORSO and ABOUT overrun their band and are cut by the edge

**Pages and sections:** landing, `06-section-percorso` (Italian PERCORSO) and `02-section-enter` (English ABOUT).

**Viewport range:** PERCORSO overruns the band's content box from 640 (where the padding steps to the exact 4rem the formula subtracts) to about 1905, where the 44rem ceiling caps it. Without a scrollbar it passes the viewport and makes the page scroll sideways between about 1540 and 1840; with a classic 15px scrollbar it cuts the O and adds a horizontal scrollbar from 844 through about 1890. ABOUT in English overruns from 640 to about 1215 and is sliced flat by the section clip from about 700 (with a scrollbar) or 790 (without) to 1210.

**What is wrong:** `SectionTitle` sizes each word as `(100vw - 4rem) / (chars x 0.32)`, but PERCORSO measures 0.327em per character and ABOUT 0.335em, so those two words come out 2.5% to 4% too wide, and from 640 the band's padding is exactly the 4rem subtracted so there is no slack left to absorb it. The about section clips its overflow, so ABOUT is sliced; the timeline section has no clip at all, so PERCORSO widens the document and the whole page scrolls sideways, which is what a Windows visitor sees at nearly every desktop width.

**Cause:** `src/components/section-title.tsx:30` `EM_PER_CHARACTER = 0.32`; `:45` sizes from `100vw - 4rem`, which counts the scrollbar and leaves zero margin; `src/components/about.tsx:40` `overflow-clip`; `src/components/timeline.tsx:44-49` has no clip.

**The fix:** put `container-type: inline-size` on the band div and size the h2 from `clamp(2.25rem, 100cqi / (n * 0.335), 44rem)`. `100cqi` is the band's real content width, which excludes both the padding and the scrollbar, so the two sources of error go at once; 0.335 is the widest per-character advance measured across every heading, so PERCORSO then underfills by about 2.4% and ABOUT fills exactly. Keep the 2.25rem floor and the 44rem ceiling. Add `overflow-x: clip` to the timeline section as a belt so no future heading can widen the page. Note the cost, and take it: at 1920 PERCORSO drops from 96% of the band to about 92%.

**The test** (`e2e/section-title.spec.ts`), at 768, 1024, 1280, 1440 and 1536, both locales:

```ts
for (const path of ['/', '/en'] as const) {
	for (const width of [768, 1024, 1280, 1440, 1536]) {
		test(`no section title runs past its band at ${width}px on ${path}`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 })
			await page.goto(path)
			await page.evaluate(() => document.fonts.ready)

			const overruns = await page.locator('[data-section-title] h2').evaluateAll(nodes =>
				nodes.flatMap(h2 => {
					const band = h2.parentElement!
					const pad = parseFloat(getComputedStyle(band).paddingInlineEnd)
					const range = document.createRange()
					range.selectNodeContents(h2)
					const over = range.getBoundingClientRect().right - (band.getBoundingClientRect().right - pad)
					return over > 0 ? [`${h2.textContent!.trim()} overruns by ${Math.round(over)}px`] : []
				})
			)
			expect(overruns, overruns.join('; ')).toEqual([])

			const slop = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
			expect(slop, 'a title widened the document').toBeLessThanOrEqual(0)
		})
	}
}
```

---

#### M6. `header-two-rows-mid` — the bar wraps to two rows (111px) from 640 to 866

**Pages and sections:** all three pages, both locales. `00-header-site-header`, and the hero under it on `01-section-enter`.

**Viewport range:** 640 to 839 in Italian, 640 to 865 in English. Major on landscape phones (667x375 in both locales and 844x390 in English: 111px sticky, 28% to 30% of the screen). Minor on 768 and 820 tablets, where it is 9% to 11% and reads as an unbalanced wrap rather than a break.

**What is wrong:** once the section nav appears at `sm`, the six pills need about 792px in Italian and 818px in English, but the shell offers 619px at 667, 720 at 768 and 772 at 820, so the CTA and the language switch drop to a second row and the sticky bar doubles in height. The first row is left under-filled to the right of the section pills.

**Cause:** `src/components/site-header.tsx:33` `flex flex-wrap`; `:42` the section nav shown from `sm:` (640px) with nowrap pills; `:54` the right group inheriting the wrap; `src/components/language-switch.tsx:4-7` full locale names (186px together).

**The fix:** the same `IT` / `EN` two-letter pills from M2 (saving about 98px), plus show the section nav from `md:` instead of `sm:` so 640 to 767 keeps a one-row 67px bar, plus tighten the shell row's `gap-x-3` to `gap-x-2` (saving 8px). The arithmetic: with codes the bar needs about 698px in Italian and 724px in English; the shell at 768 is 720px, which is 4px short in English, and the gap change closes exactly that. With all three, no two-row state remains anywhere between 640 and 1024.

**The test** (`e2e/site-header.spec.ts`), at 640, 667, 768, 820 and 844, both locales:

```ts
for (const path of ['/', '/en'] as const) {
	for (const width of [640, 667, 768, 820, 844]) {
		test(`the header holds one row at ${width}px on ${path}`, async ({ page }) => {
			await page.setViewportSize({ width, height: 600 })
			await page.goto(path)
			await page.evaluate(() => document.fonts.ready)

			const rows = await page
				.locator('[data-site-header] a, [data-site-header] button')
				.evaluateAll(nodes => new Set(nodes.map(n => Math.round(n.getBoundingClientRect().top))).size)
			expect(rows, 'the bar wrapped onto a second row').toBe(1)
		})
	}
}
```

---

#### M7. `contact-address-overflow` — the address control has 7px of room and will break the page with a real address

**Pages and sections:** contact `01-section-enter` (the "Per email" card); `08-footer-site-footer` / `04-footer-site-footer` / `02-footer-site-footer` on all three pages (the same control).

**Viewport range:** arrival card 320 to 430 (breaks at a 20-character address at 320, 26 at 375, 30 at 430; fine from 640 where the card is centred and capped). Footer 768 to about 1000 on every page (breaks the document at 22 characters, which is what `anna.milazzo@gmail.com` is). Conditional on the address entered in the CMS.

**What is wrong:** an email address is one unbreakable word and `.control` sets neither `overflow-wrap` nor a min-content floor, so the pill's minimum width inflates whatever holds it. In the arrival, the card is a grid item with `min-width: auto`, so the whole card grows from 272px to 397px and drags the h1 and the intro paragraph past the viewport, where the section's `overflow-hidden` slices the prose mid-word. In the footer, `.footer-columns` is `repeat(3, minmax(0,1fr))` from 48rem, and a 208px track cannot absorb a 250px pill, so the document itself scrolls sideways at 768. The seeded placeholder is 16 characters with 7px to spare, which is the only reason `docOverflow` is 0 in every capture.

**Cause:** `src/components/contact-arrival.tsx:72` and `src/components/site-footer.tsx:89` put an unbreakable string in `.control` (`globals.css:329-345`); `contact-arrival.tsx:58` `mx-auto w-full max-w-md` on a grid item whose auto min-width lets the card inflate; `globals.css:1874-1877` `.footer-columns` fixed tracks.

**The fix:** add `overflow-wrap: anywhere` to the two address controls (a `[data-address-control]` attribute on both, or a shared `.control-address` class). That single declaration is what lowers the min-content contribution and lets the pill wrap to two lines inside its keyline instead of inflating its container. Do not bother with `max-inline-size: 100%` (a percentage does not clamp intrinsic sizing) or `min-inline-size: 0` (it does nothing on an inline-flex box that is not a flex item), and do not use a `clamp()`ed font size: a 30-character address at 320 would need roughly 7px type.

**The test** (`e2e/contact-page.spec.ts`), at 320, 375, 768 and 900:

```ts
const LONG = 'anna.milazzo.composer@example.com' // 33 chars, an ordinary professional address

for (const width of [320, 375, 768, 900]) {
	test(`a long address does not break the page at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 800 })
		await page.goto('/contact')
		await page.evaluate(() => document.fonts.ready)

		await page.evaluate(long => {
			for (const a of document.querySelectorAll<HTMLAnchorElement>('a[href^="mailto:"]')) a.textContent = long
		}, LONG)

		const slop = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
		expect(slop, 'the address pushed the document sideways').toBeLessThanOrEqual(0)

		const card = await page.locator('[data-address-card]').evaluate(el => el.getBoundingClientRect().width)
		expect(card, 'the address inflated its card past max-w-md').toBeLessThanOrEqual(449)
	})
}
```

---

#### M8. `title-long-en` — "TRAINING AND EXPERIENCE" is set as a 36px two-line caption

**Pages and sections:** landing, `/en` only, `06-section-percorso`.

**Viewport range:** 320 to about 505 (still two lines at 500, one line from 510). Above that the heading is one line at 91% to 98% of the band and is working as designed; drop 768 and 1440 from the complaint.

**What is wrong:** the title is sized from the character count of the whole string, so the 23-character English heading gets 36px at 320 and 42px at 375, wraps to two lines anyway, and fills barely half the band, while the Italian PERCORSO next to it is 100 to 121px and fills it edge to edge. On every phone the English section opens with a caption where the design's whole device is a giant word.

**Cause:** `src/components/section-title.tsx:42` only splits on a double space or a newline, so the whole 23-character string is measured as one line, hits the 2.25rem floor and then wraps at caption size; the string at `src/seed/content.ts:255` has single spaces so the existing double-space hook never fires; `EM_PER_CHARACTER = 0.32` also under-measures this string (0.338 measured).

**The fix:** in `SectionTitle`, break a heading longer than about 12 characters into two balanced lines at the nearest space to the midpoint, set `white-space: pre-line` on the h2 so the break is honoured, and size from the longest resulting line with the constant at 0.35 for split headings. At 320 that gives "TRAINING AND / EXPERIENCE" at 67px filling 95% of the band, at 375 80px at 91%. Keep the single line where it already fits. `text-wrap: balance` alone will not do: it never adds a line, and the size still comes from the 23-character string.

**The test** (`e2e/section-title.spec.ts`), at 320, 375, 430 and 500 on `/en`:

```ts
for (const width of [320, 375, 430, 500]) {
	test(`the English training title fills its band at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 800 })
		await page.goto('/en')
		await page.evaluate(() => document.fonts.ready)

		const fill = await page.locator('#percorso h2').evaluate(h2 => {
			const band = h2.parentElement!
			const style = getComputedStyle(band)
			const inner =
				band.getBoundingClientRect().width - parseFloat(style.paddingInlineStart) - parseFloat(style.paddingInlineEnd)
			const range = document.createRange()
			range.selectNodeContents(h2)
			const widest = Math.max(...[...range.getClientRects()].map(r => r.width))
			return { ratio: widest / inner, size: parseFloat(getComputedStyle(h2).fontSize) }
		})
		expect(fill.ratio, 'the heading underfills its band').toBeGreaterThan(0.85)
		expect(fill.size, 'the heading is set at caption size').toBeGreaterThan(60)
	})
}
```

---

#### M9. `daw-first-clip-cut` — the "now" clip is sliced by the strip's edge at rest

**Pages and sections:** landing, `06-section-percorso`.

**Viewport range:** every width below 363. Major at 320 (title and detail both cut); minor at 356 to 362 (a single letter touching the marker's rule). Clear from 363 up.

**What is wrong:** at 320 the first clip of the arrangement, the 2026 entry the playhead points at, loses 36px of its title and 43px of its detail line under the opaque edge marker, so "COLONNA SONORA PER / CORTOMETRAGGIO" and its description are unreadable at rest without scrolling. It is the most recent work and it is the first thing cut.

**Cause:** `src/app/(frontend)/globals.css:1012-1013` (`--bar: 9rem`, `--gutter: 7rem` below 40rem), `:1142` (12rem clip floor) and `:1244` (the 1.75rem opaque marker): 112px gutter plus a 192px clip floor is 304px against a 272px scrollport at 320. The gutter cannot shrink, because the "2019-2022" period label needs about 103px.

**The fix:** below `23rem`, let `.daw` run full bleed exactly the way `.form-panel` already does at `globals.css:1500`: `margin-inline: -1.25rem; border-inline: 0; box-shadow: none`. That widens the scrollport to the full 320 so the clip's detail (287px) clears the marker (292px) while every clip keeps its honest width, the black ground, the playhead, the gutter and the top and bottom keylines. The switchover at exactly 368 is safe: the boxed layout there clears by 5px.

**The test** (`e2e/timeline.spec.ts`), at 320 and 360:

```ts
for (const width of [320, 360]) {
	test(`the newest clip is readable at rest at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 800 })
		await page.emulateMedia({ reducedMotion: 'reduce' })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)

		const gap = await page.evaluate(() => {
			const daw = document.querySelector('.daw')!
			daw.scrollLeft = 0
			const detail = daw.querySelector('.daw-clip-detail')!.getBoundingClientRect()
			const mark = daw.querySelector('.daw-edge-mark')!.getBoundingClientRect()
			return mark.left - detail.right
		})
		expect(gap, 'the first clip runs under the edge marker').toBeGreaterThanOrEqual(0)
	})
}
```

---

### MINOR

---

#### N1. `footer-link-targets` — footer links are 18 to 20px tall

**Pages and sections:** all three pages, both locales, `08-` / `04-` / `02-footer-site-footer`. **Viewports:** all, 320 to 3440.

Every footer link is a bare inline anchor with no padding, so its hit box is the 20px glyph box (18px for the 12px credit link), under the 24x24 floor everywhere. They sit on a 36px pitch with 16px of dead ground between, so a miss lands on nothing rather than on the wrong link.

**Cause:** `globals.css:1901-1906` `.footer-link` sets only font and underline; `:1891-1897` `.footer-list` spaces by a 12px gap.

**The fix:** `.footer-link { display: inline-block; padding-block: 0.25rem; margin-block: -0.25rem }`, and the same padding pair on the credit anchor. That makes a 32px hit box with a 4px cushion between neighbours, on the same 36px pitch, with the underline, colour and rhythm unchanged. Do not use `0.375rem`: once the anchor is inline-block its box is the 24px line box, so 0.375 gives 36px boxes that abut and a miss lands on the next link instead. "Note legali" is already 24px and needs nothing.

**The test**, at 320 and 1440:

```ts
for (const width of [320, 1440]) {
	test(`footer links clear the 24px tap floor at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 800 })
		await page.goto('/')
		const small = await page
			.locator('.footer-link, .footer-credit a')
			.evaluateAll(nodes =>
				nodes.filter(n => n.getBoundingClientRect().height < 24).map(n => `${n.textContent!.trim()}`)
			)
		expect(small, `under 24px: ${small.join(', ')}`).toEqual([])
	})
}
```

---

#### N2. `pill-touch-size` — header, switch and pager pills are 34 to 36px on touch

**Pages and sections:** landing `00-header-site-header` and `05-section-ascolta`; the header pills on every page. **Viewports:** all, on any coarse-pointer device.

The contact pill is 34px, the language pills 36px, the four pager pills 34px: over the 24px floor, under the 44px comfortable target, and the pager is the only way to reach works 04 and 05 on a phone.

**Cause:** `globals.css:361-376` `.nav-pill` uses 6px/12px padding on 12px mono and is reused by the pager at `:406-431`; `language-switch.tsx:30,42` `py-2 text-xs`.

**The fix:** do not grow the boxes, grow the hit region. Under `@media (pointer: coarse)`, give `.nav-pill` and the switch pills `position: relative` and a transparent `::before { content: ''; position: absolute; inset-inline: 0; inset-block: -5px }`. The face, keyline, fill and shadow are untouched, and so is the header height, which matters because the hero subtracts it. The pager can take the full 5px (nothing sits above or below it); the header's 8px row gap caps the extension at 4px per row unless `gap-y-2` becomes `gap-y-2.5`, a 2px change nobody will see. A `min-block-size: 2.75rem` would instead push the sticky bar to 176px at 320 and to 72px on every touch laptop, which breaks the hero's `calc(100svh - var(--header-h))`.

**The test**, at 375 and 430 with `hasTouch`:

```ts
test.use({ hasTouch: true })
for (const width of [375, 430]) {
	test(`every header and pager pill is a 44px target at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 800 })
		await page.goto('/')
		const short = await page.locator('.nav-pill, .song-pager button').evaluateAll(nodes =>
			nodes
				.map(n => {
					const box = n.getBoundingClientRect()
					const before = getComputedStyle(n, '::before')
					const grow = before.content !== 'none' ? Math.abs(parseFloat(before.insetBlockStart || '0')) * 2 : 0
					return { name: n.textContent!.trim(), h: box.height + grow }
				})
				.filter(p => p.h < 44)
		)
		expect(short, `under 44px: ${short.map(p => p.name).join(', ')}`).toEqual([])
	})
}
```

---

#### N3. `daw-overscroll` — overshooting the strip's left end triggers swipe-back

**Pages and sections:** landing, `06-section-percorso`. **Viewports:** all, 320 to 3440 (the strip overflows at every width, including 1920 and above), on trackpads and touch.

A drag that continues past `scrollLeft: 0` chains its unconsumed delta to the document, which is what feeds Safari's and Chrome's swipe-back gesture and iOS's whole-page rubber band, so a reader mid-arrangement can be taken off the page. Reproduced: as shipped, six leftward wheel events over the pinned strip move the document; with containment they do not.

**Cause:** `globals.css:1063` `.daw { overflow-x: auto }` with no containment, while `.check-slot` at `:1695` already carries `overscroll-behavior-inline: contain`.

**The fix:** add `overscroll-behavior-inline: contain` to `.daw`, written that way to match the file's own idiom four hundred lines down. The strip has zero vertical overflow, so a vertical wheel over it still scrolls the page exactly as it does today. The OS-level edge swipe that starts in the screen's first 20px is not something CSS can stop, and that is fine.

**The test**, at 375 and 1440:

```ts
for (const width of [375, 1440]) {
	test(`the arrangement contains its own overscroll at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 })
		await page.goto('/')
		const behaviour = await page.locator('.daw').evaluate(el => getComputedStyle(el).overscrollBehaviorInline)
		expect(behaviour, 'a drag past the strip chains to the document').toBe('contain')
	})
}
```

---

#### N4. `images-srcset` — `sizes` with no `srcset`, so a phone downloads the desktop asset

**Pages and sections:** landing only, `01-section-enter` (portrait) and `05-section-ascolta` (covers). Contact and legal carry no images. **Viewports:** all.

`Portrait` renders a plain `img` with a `sizes` attribute but never a `srcset`, and the Media collection declares no `imageSizes`, so Payload keeps no resized variants and the attribute is inert. Measured: 281KB of images at 320px against 273KB at 1440px, so the phone downloads slightly more than the desktop, and the 1200x1500 portrait is fetched eagerly into a 194x242 box.

**Cause:** `src/components/portrait.tsx:39` `sizes={sizes}` with no `srcSet`; `src/collections/media.ts:25` no `imageSizes`.

**The fix:** add `imageSizes` (480, 768, 1200 widths) to the Media collection and build a `srcSet` from `image.sizes` in `Portrait`, so the `sizes` attribute starts selecting. The variants go straight to the R2 bucket and are served from the public domain, so this does not put the app back in the byte path that ADR 05 removed it from, and the deliberate no-`next/image` decision at `portrait.tsx:6-9` is preserved. Do not add `object-fit: cover` or a hand-picked `aspect-ratio`: nothing is distorted today (the width and height attributes already give each image its intrinsic ratio), and cropping Anna's photograph to a developer's ratio would damage a hand-composed hero.

**The test**, at 375 and 1440:

```ts
for (const width of [375, 1440]) {
	test(`images offer a candidate set at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 })
		await page.goto('/')
		const bare = await page
			.locator('img[sizes]')
			.evaluateAll(nodes => nodes.filter(n => !(n as HTMLImageElement).srcset).map(n => (n as HTMLImageElement).src))
		expect(bare, `sizes with no srcset: ${bare.join(', ')}`).toEqual([])
	})
}
```

---

#### N5. `wordmark-noop` — the wordmark pill does nothing on the landing page

**Pages and sections:** landing, `00-header-site-header`, both locales. **Viewports:** all; it matters below 640, where the section nav is hidden and the wordmark is the last control in the sticky bar that could go up a 9000px page.

Clicking or tapping "Anna Milazzo" while scrolled leaves the page exactly where it is, although the component's own comment says pressing it returns to the top. Reproduced 16 times over 8 viewports and both locales.

**Cause:** `src/components/site-header.tsx:37` renders `<Link href={home}>`, which on the landing page is a navigation to the current URL and the App Router treats it as a no-op.

**The fix:** `href={path === '/' ? \`${home}#top\` : home}`. Next resolves a bare `#top` fragment to `document.body`, so no `id="top"` element is needed, and a repeated same-hash Link navigation still re-scrolls in this app (verified against the footer's `#ascolta` link). Prefer this over an `onClick`, which would force the whole header into a Client Component.

**The test**, at 375 and 1440:

```ts
for (const width of [375, 1440]) {
	test(`the wordmark returns to the top at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 800 })
		await page.goto('/')
		await page.evaluate(() => window.scrollTo(0, 4000))
		await page.locator('[data-nav-home]').click()
		await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(100)
	})
}
```

---

#### N6. `legal-facts-spacing` — the address block is spaced like paragraphs, and the tightening rule is dead

**Pages and sections:** legal, `01-div-1`, both locales. **Viewports:** all; the numbers are byte-identical at 320 and at 2560, so this is a typography bug the responsive sweep happened to surface, not a responsive regression.

Name, SIRET, address, phone and URL (and the two hosting lines) are each their own paragraph on a 44px pitch over a 28px line, so the address reads as six paragraphs. The stylesheet's own comment says these should "sit tight to each other rather than a paragraph apart", and the `p + p { margin-block-start: 0 }` rule that is supposed to do it overrides a value that is already 0.

**Cause:** `globals.css:1846-1847` (the intent), `:1848-1850` (the dead rule), `:1827-1829` (where the 16px actually comes from, `margin-block: 0 calc(var(--spacing) * 4)`); the seed at `src/seed/content.ts:483-487` and `:516-520` emits one paragraph per fact.

**The fix:** author each facts block as a single paragraph with soft line breaks. That needs `paragraphs()` in `src/seed/index.ts:147-178` to split on `\n` and emit Lexical `linebreak` nodes, then a re-seed, since the copy lives in Payload. Delete the dead `p + p` rule in the same change so the comment stops describing behaviour that does not exist. Prose paragraphs keep their 16px; the facts sit on consecutive lines. Note this removes only 80px of page height, so do not sell it as a length fix.

**The test**, at 375 and 1440:

```ts
for (const width of [375, 1440]) {
	test(`the legal facts sit as a block, not as paragraphs, at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 })
		await page.goto('/legal')
		const lines = await page.locator('.legal-prose p', { hasText: 'SIRET' }).evaluate(p => p.getClientRects().length)
		expect(lines, 'the publisher facts are still one paragraph per line').toBeGreaterThan(1)
	})
}
```

---

#### N7. `hero-name-floor` — the hero name fills 58% of its column on a phone, 93% on a desktop

**Pages and sections:** landing, `01-section-enter`, both locales. **Viewports:** 375 to 767, worst around 560; mild at 320 and 360 (79% and 69% fill).

"ANNA MILAZZO" sits at 48 to 74px filling 52% to 66% of its column below `md`, while the same h1 fills 93% to 98% from 834 up and every section band below it is set at 81 to 139px. The hierarchy inverts: the name the hero exists to make big is smaller than every section title.

**Cause:** `src/components/hero.tsx:60` `text-[clamp(3rem,11.5vw,11rem)]`. One `vw` coefficient serves two layouts: above `md` the h1 sits in a 48vw grid column where 11.5vw fills it; below `md` that column becomes the whole page and the same coefficient fills half of it. The 3rem floor is what stops it being smaller, not what pins it.

**The fix:** below `sm`, size the name from its column the way `SectionTitle` does, deriving the divisor from `hero.name.length` and the measured 0.383em advance rather than hard-coding it (a longer name in the CMS would otherwise overflow). For the 12-character seeded name that is about `calc((100vw - 2.5rem) / 4.6)`: 61px at 320, 73px at 375, 85px at 430, one line throughout, 87% to 94% fill, which is the desktop's own parity. Keep the existing clamp above `sm` untouched. Do not aim for a two-line ANNA / MILAZZO break: one line fits.

**The test**, at 375, 430 and 560:

```ts
for (const width of [375, 430, 560]) {
	test(`the hero name fills its column at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)
		const fill = await page.locator('[data-hero] h1').evaluate(h1 => {
			const range = document.createRange()
			range.selectNodeContents(h1)
			return Math.max(...[...range.getClientRects()].map(r => r.width)) / h1.getBoundingClientRect().width
		})
		expect(fill, 'the name is set far smaller than its column').toBeGreaterThan(0.85)
	})
}
```

---

#### N8. `legal-prose-measure` — legal lines run 92 to 102 characters

**Pages and sections:** legal, `01-div-1`. **Viewports:** about 744 and up, so 768, 844, 1024, 1024x600, 1280, 1440, 1920, 2560, 3440. Phones (320 to 430) are 34 to 49 characters and read well.

The reading column is capped with `max-w-prose` (65ch), and this sans face has a wide `ch`, so the column is 715px and full lines carry a median of 94 characters, with 15 of 17 over 90.

**Cause:** `src/app/(frontend)/[lang]/legal/page.tsx:59` `max-w-prose` combined with `.legal-prose { font-size: 1.0625rem }` at `globals.css:1720-1723`.

**The fix:** cap `.legal-prose` at `56ch` (about 616px), which gives a median of 78 characters and zero lines over 90. Do not raise the font size instead: a `ch`-based cap scales with the type, so 1.125rem widens the column to 780px and leaves the measure exactly where it was. The h2 keylines shorten with the column and nothing else moves.

**The test**, at 768 and 1440:

```ts
for (const width of [768, 1440]) {
	test(`legal prose stays under 90 characters a line at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 })
		await page.goto('/legal')
		await page.evaluate(() => document.fonts.ready)
		const box = await page.locator('.legal-prose').evaluate(el => el.getBoundingClientRect().width)
		const ch = await page.locator('.legal-prose').evaluate(el => {
			const probe = document.createElement('span')
			probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre'
			probe.textContent = '0'.repeat(100)
			el.append(probe)
			const w = probe.getBoundingClientRect().width / 100
			probe.remove()
			return w
		})
		expect(box / ch, 'the reading column holds more than 90 characters').toBeLessThan(90)
	})
}
```

---

#### N9. `folder-story-measure` — Folder story lines run 107 characters

**Pages and sections:** landing, `05-section-ascolta`, both locales. **Viewports:** from about 1050 up (94 characters at 1060, full 715px and 107 characters from 1152, unchanged through 3440). Fine at 1024 and below.

Each Folder's story is capped at `max-w-prose`, which resolves to 715px here, and at 16px that holds 107 characters. The card body caps at 1440px, so 365px of paper sits empty to the right of the story while the transport rail runs the card's full width.

**Cause:** `src/components/folder.tsx:122` `max-w-prose` on a 16px paragraph (65ch at about 11px per `ch`).

**The fix:** `max-w-[36rem]` (576px, about 86 characters) on the story paragraph, keeping 16px type and leaving the play rail at the card's full width as designed. Raising the type instead does not work: at 18px the line still holds about 95 characters, and 19px would put the story at heading weight beside the display title.

**The test**, at 1280 and 1440:

```ts
for (const width of [1280, 1440]) {
	test(`the Folder story keeps a readable measure at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)
		const w = await page.locator('.folder-body p').first().evaluate(el => el.getBoundingClientRect().width)
		expect(w, 'the story runs past a comfortable measure').toBeLessThanOrEqual(600)
	})
}
```

---

#### N10. `title-ultrawide-left` — titles stay pinned left while the shell centres

**Pages and sections:** landing `02-`, `03-`, `05-`, `06-`; contact `02-` and `03-section-enter`. **Viewports:** from about 1504 (where the viewport exceeds the 1440px shell plus band padding); invisible at 1536, faint at 1920 (208px offset), plain from about 2200, 528px at 2560, 968px at 3440.

Past the shell cap, the title band keeps laying the word at x=32 while every card and column under it centres, so on a 3440 screen the word starts 968px left of the content and fills under half the band with up to 1900px of empty black to its right. The band reads neither as the word that takes the whole width nor as part of the column under it.

**Cause:** `src/components/section-title.tsx:45` clamps on `100vw` with a 44rem ceiling; `:48` pads the band with `px-5 sm:px-8` instead of laying the h2 on the `.shell` every other section uses (`globals.css:252-256`, `--measure: 90rem`).

**The fix:** keep the band full-bleed black, wrap the h2 in a `.shell` with `container-type: inline-size`, and size from `clamp(2.25rem, 100cqi / (n * 0.335), 44rem)` (the same change M5 needs, applied on the shell rather than the band). The word then grows until the shell caps and sits flush with the content's left edge. Do not simply move the existing `100vw`-sized h2 onto the shell: at 1920 PERCORSO would run from 240 to 2083 and be sliced. Accept the cost: at 1920 PERCORSO drops from 96% of the band to about 77%, which is the price of laying every edge on one measure.

**The test**, at 2560 and 3440:

```ts
for (const width of [2560, 3440]) {
	test(`section titles sit on the content's measure at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 1440 })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)
		const drift = await page.locator('#ascolta h2').evaluate(h2 => {
			const range = document.createRange()
			range.selectNodeContents(h2)
			const shell = document.querySelector('[data-song-stack] .shell')!.getBoundingClientRect()
			return Math.abs(range.getBoundingClientRect().left - shell.left)
		})
		expect(drift, 'the title is pinned to the viewport, not the shell').toBeLessThan(40)
	})
}
```

---

#### N11. `hero-cta-wrap` — the Italian hero control pair stacks as two loose blocks

**Pages and sections:** landing, `01-section-enter`, Italian only. **Viewports:** 320 to 426 (one row from 427) and 768 to 851 (one row from 852). English is one row at every width.

"Ascolta" (117px) and "Mettiamoci in contatto" (254px) wrap into two left-aligned rows of different widths, with no stacked styling, so it reads as a fallen-over row rather than a stack; the arrow ornament drops a row with it. The `md` grid gives the text column only 344 to 383px against the pair's 387px.

**Cause:** `src/components/hero.tsx:69` `mt-9 flex flex-wrap items-center gap-4` around two content-sized `.control`; `:55` `md:grid-cols-[1.05fr_1fr]` narrows the column at `md`.

**The fix:** two parts. Below 427px, make the stack deliberate: `flex-col` with `w-full` on both controls, keeping the keyline and hard shadow, so it reads as a stacked pair rather than a wrap. At `md`, pair `md:text-base lg:text-lg` on the controls with `md:grid-cols-[1.15fr_1fr]` (359px at 768, enough for the 16px pair from 768 up). Neither half alone covers the `md` range: `md:text-base` shrinks the pair to about 356px, still over the 344px column at 768, and the wider grid alone gives 366px against a 387px pair.

**The test**, at 375 and 768 on `/`:

```ts
for (const width of [375, 768]) {
	test(`the hero controls do not wrap loose at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)
		const { rows, widths } = await page.locator('[data-hero] .control').evaluateAll(nodes => ({
			rows: new Set(nodes.map(n => Math.round(n.getBoundingClientRect().top))).size,
			widths: new Set(nodes.map(n => Math.round(n.getBoundingClientRect().width))).size,
		}))
		// Either one row, or a deliberate stack of equal-width blocks.
		expect(rows === 1 || widths === 1, 'the controls wrapped into two ragged rows').toBe(true)
	})
}
```

---

#### N12. `skills-phone-balloon` — the skills field balloons and two tags wrap at 320

**Pages and sections:** landing, `03-section-enter`, both locales. **Viewports:** 320 to about 560 for the ballooning (section 1031px at 320, 1.8 viewports); the tag wrap is 330 and below only.

Seven tags stack in one column with 32px gaps inside 96px of section padding above and below, and the mixing desk that fills the lemon on desktop is hidden below 1024, so 36% of the field is ink and the rest is empty colour. At 320 "Registrazione sul campo" and "Notazione e arrangiamento" also wrap to two lines inside their tags.

**Cause:** `src/components/skills.tsx:37` `py-24` with no phone step (every other landing section uses `py-14` or `py-16` on a phone); `:46` `gap-y-8`; `:60` `hidden lg:flex` on the Console.

**The fix:** step the section to `py-16 md:py-40`, the row gap to `gap-y-6 sm:gap-y-10`, and below `sm` drop the tags to `text-sm` while keeping `px-6`, the tilts, the fills and the shadows. That removes about 250px of empty lemon and puts both long tags back on one line at 320 (at 14px "Notazione e arrangiamento" needs 277px against a 280px column). Do not use `px-4` instead of the type step: with 40px of chrome that tag still needs 293px and wraps.

**The test**, at 320:

```ts
test('skills tags hold one line each at 320px', async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 800 })
	await page.goto('/')
	await page.evaluate(() => document.fonts.ready)
	const wrapped = await page
		.locator('[data-skills] li')
		.evaluateAll(nodes => nodes.filter(n => n.getClientRects().length > 1).map(n => n.textContent!.trim()))
	expect(wrapped, `tags on two lines: ${wrapped.join(', ')}`).toEqual([])
})
```

---

#### N13. `contact-submit-banner-hidden` — the summary banner after an empty submit lands under or above the fold

**Pages and sections:** contact, `02-section-enter`. **Viewports:** 320x568 and 375x667 (banner cut by the bar), 844x390 (top of the banner cut), and worst at 768x1024, 820x1180 and 1440x900, where the banner sits entirely above the viewport.

Submitting empty correctly moves focus to the first rejected field with its doubled keyline and its own note, but the flat 80px scroll margin puts that field near the top and the summary banner about 150px above it, so the banner is either sliced by the bar or off screen entirely. At 768 and 820 the focused input itself is 21px under the bar.

**Cause:** `globals.css:465-467` `[id] { scroll-margin-block-start: 5rem }` against a 153px or 111px bar; `src/components/contact-form.tsx:82-97` lets the browser's focus scroll place the field.

**The fix:** once M1's `scroll-padding-block-start` is in place and the flat `[id]` margin is gone, add to the same effect `liveRegion.scrollIntoView({ block: 'start' })` before `target.focus({ preventScroll: true })`. At the tightest case, 320x568, that puts the banner at 152.5 and the name box at about 382 to 439, so summary, note and field are all on screen together. Do not add a root `scroll-padding` while the `[id]` `scroll-margin` still exists: they stack and every anchor on the site over-scrolls.

**The test**, at 375, 768 and 1440:

```ts
for (const width of [375, 768, 1440]) {
	test(`the rejected-submit summary is on screen at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: width === 375 ? 667 : 900 })
		await page.emulateMedia({ reducedMotion: 'reduce' })
		await page.goto('/contact')
		await page.locator('.form-foot button[type="submit"]').click()

		const { top, bottom, barBottom, vh } = await page.evaluate(() => {
			const b = document.querySelector('.outcome')!.getBoundingClientRect()
			return {
				top: b.top,
				bottom: b.bottom,
				barBottom: document.querySelector('[data-site-header]')!.getBoundingClientRect().bottom,
				vh: window.innerHeight,
			}
		})
		expect(top, 'the summary is behind the header').toBeGreaterThanOrEqual(barBottom - 1)
		expect(bottom, 'the summary is below the fold').toBeLessThanOrEqual(vh)
	})
}
```

---

#### N14. `hero-keyboard-fold-desktop` — the piano falls below the fold on short desktops

**Pages and sections:** landing, `01-section-enter`. **Viewports:** any viewport shorter than 819px CSS at widths 1280 and up (1280x720 shows no keys at all, 1366x768 shows a 37px sliver), and shorter than 727px at 1024 (1024x600 shows none). Fine at 1024x768, 1280x880, 1366x880, 1440x900, 1536x864, 1920x1080.

The hero asks for `100svh` minus the header but its content forces 812px regardless of viewport height, so the section runs 159px past the fold on a 720-tall screen and the keyboard, which the component says should sit at the foot of the first screenful, is not on it.

**Cause:** `src/components/hero.tsx:89` `md:max-w-[34rem]` (544px) plus `:40` `md:py-14` plus `:111` `mt-14 md:mt-16` sum to 812px independent of height.

**The fix:** cap the composition square by the viewport height as well as the width: `md:max-w-[min(34rem,calc(100svh-var(--header-h)-17rem))]`, and gate a shorter `md:mt-*` / `md:py-*` behind `(max-height: 860px)`. Subtracting the real `--header-h` rather than a flat 22rem matters because the bar is 111px between 768 and 843; 860 rather than 880 leaves 1280x880 and 1366x880, which already fit, untouched.

**The test**, at 1280x720 and 1366x768:

```ts
for (const [width, height] of [[1280, 720], [1366, 768]] as const) {
	test(`the keyboard sits inside the first screen at ${width}x${height}`, async ({ page }) => {
		await page.setViewportSize({ width, height })
		await page.emulateMedia({ reducedMotion: 'reduce' })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)
		const bottom = await page.locator('[data-piano]').evaluate(el => el.getBoundingClientRect().bottom)
		expect(bottom, 'the keyboard is below the fold').toBeLessThanOrEqual(height)
	})
}
```

---

#### N15. `skills-console-breakpoint` — the tags fall one per row beside the console at 1024

**Pages and sections:** landing, `03-section-enter`, both locales. **Viewports:** 1024 to about 1200 (7 rows at 1024 and 1060, 5 rows at 1100 to 1180, back to the 4-row cluster at 1220). At 1023 the section is 987px tall; at 1024 it is 1419px, 44% taller one pixel later.

At `lg` the grid goes two-column and the 459px console leaves the tag list 421px, which is less than two tags plus their gap, so all seven stack in a narrow column and the lemon field is mostly empty. The component's own comment says the console is hidden below 1024 precisely to avoid pushing the tags into a column, and at 1024 that is what ships. (Below 1024 the console being hidden is a documented decision and not part of this.)

**Cause:** `src/components/skills.tsx:43` `lg:grid-cols-[1fr_auto] lg:gap-20`; `:60` `<Console className="hidden lg:flex" />`; `globals.css:646-651` `.console { inline-size: max-content }` (459px).

**The fix:** show the console from `md` as a second row under the chips (`hidden md:flex md:justify-self-start`, matching the left edge the tags and the ornament are anchored to) and move the side-by-side grid from `lg:` to `xl:`. At 1280 the tag column is 677px and wraps in four rows, which is the current desktop look; 1024 to 1200 keeps the full-width cloud plus the desk. The 768 section grows to about 1164px, but filled with equipment instead of empty lemon, which is the trade the component's own comment argues for.

**The test**, at 1024 and 1100:

```ts
for (const width of [1024, 1100]) {
	test(`the skills tags cluster rather than stack at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)
		const rows = await page
			.locator('[data-skills] li')
			.evaluateAll(nodes => new Set(nodes.map(n => Math.round((n as HTMLElement).offsetTop / 8))).size)
		expect(rows, 'the tags fell into a single column').toBeLessThanOrEqual(4)
	})
}
```

---

#### N16. `hero-header-h-tablet` — the hero subtracts 67px while the bar is 111px

**Pages and sections:** landing, `01-section-enter`. **Viewports:** 768 to 838 in Italian, 768 to 865 in English (from `md` up only; below `md` the rule does not apply).

The hero is `min-height: calc(100svh - var(--header-h))` with `--header-h` fixed at the one-row 67px, so where the bar wraps to 111px the hero is 44px taller than the space under it and the last 44px of its bottom padding plus the 4px closing keyline fall below the first screen. The piano and its shadow are still visible; what is lost is the hero visibly closing.

**Cause:** `globals.css:100` `--header-h: 67px` (with a comment at `:96-99` claiming the bar never reflows); `src/components/hero.tsx:40`.

**The fix:** the measured `--header-h` from the shared groundwork. Do not use a static `@media (40rem <= width < 52.5rem) { --header-h: 111px }`: English still wraps to 870, so 840 to 869 would stay 44px over in English and over-subtract 44px in Italian.

**The test**, at 768x1024 and 820x1180:

```ts
for (const [width, height] of [[768, 1024], [820, 1180]] as const) {
	test(`the hero closes inside the first screen at ${width}x${height}`, async ({ page }) => {
		await page.setViewportSize({ width, height })
		await page.emulateMedia({ reducedMotion: 'reduce' })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)
		const bottom = await page.locator('[data-enter]').first().evaluate(el => el.getBoundingClientRect().bottom)
		expect(bottom, 'the hero runs past the fold').toBeLessThanOrEqual(height + 1)
	})
}
```

---

#### N17. `contact-facts-pinched-1024` — fact cards pinched to 241px at 1024

**Pages and sections:** contact, `03-section-enter`. **Viewports:** 1024 to about 1150 at its worst (241 to 263px cards, "Risposta" over five lines), easing through 1200, fully recovered by 1279. At 1023 the cards are 460px with three-line answers.

When the section goes two-column at `lg`, the `1.4fr` track leaves the four Folders 241px each after the 40px gap, so answers run about 28 characters a line while the links column keeps 373px for buttons that are 218px wide.

**Cause:** `src/components/contact-facts.tsx:41` `lg:grid-cols-[1.4fr_1fr]` combined with the inner `sm:grid-cols-2 gap-10` at `:43`.

**The fix:** `lg:grid-cols-[1fr_auto] xl:grid-cols-[1.4fr_1fr]`. The `auto` track sizes to the widest control (218px), leaving 678px for the cards and 319px each at 1024, which is the 1280 look, and the `xl` step restores today's proportion from 1280 up. Accept the side effect: between 1024 and 1279 the buttons sit flush to the shell's right margin instead of floating with 155px of air.

**The test**, at 1024 and 1100:

```ts
for (const width of [1024, 1100]) {
	test(`fact cards keep a readable width at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 })
		await page.goto('/contact')
		await page.evaluate(() => document.fonts.ready)
		const narrowest = await page
			.locator('[data-contact-facts] .folder')
			.evaluateAll(nodes => Math.min(...nodes.map(n => n.getBoundingClientRect().width)))
		expect(narrowest, 'the fact cards are pinched').toBeGreaterThan(300)
	})
}
```

---

#### N18. `cta-button-wrap` — the contact CTA label breaks in two

**Pages and sections:** landing, `07-section-enter`, Italian only. **Viewports:** 300 to 384 (one line from 385).

The one button on the page whose entire job is to be pressed breaks into "Mettiamoci in / contatto" with the arrow floating beside a two-line label, 88px tall instead of 60. English is one line everywhere.

**Cause:** `src/components/contact-cta.tsx:46` `text-lg sm:text-xl` and `:36` `px-6` on the panel, against `.control`'s 20px inline padding (`globals.css:329`) and `.cta-button`'s 12px gap plus a 1.25em arrow (`globals.css:1538`): 288.5px natural width against a 279px panel interior at 375.

**The fix:** change the size in the class string, not the stylesheet: `text-base min-[25rem]:text-lg sm:text-xl` on `contact-cta.tsx:46` (a font-size written into `@layer components` loses to the `text-lg` utility in Tailwind v4). That drops the natural width to 262px, one line from 360 up. Add `inline-size: 100%` under `@media (width < 25rem)` in the components layer, and trim the panel's `px-6` to `px-5` at that width so 360 has 10px of headroom rather than 2px. At 320 the label still wraps, centred and full width, as it already does.

**The test**, at 360 and 375:

```ts
for (const width of [360, 375]) {
	test(`the contact CTA holds one line at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 800 })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)
		const height = await page.locator('[data-contact-cta]').evaluate(el => el.getBoundingClientRect().height)
		expect(height, 'the CTA label wrapped').toBeLessThan(70)
	})
}
```

---

#### N19. `contact-form-foot-1024` — the send button drops under the note at 1024

**Pages and sections:** contact, `02-section-enter` (form foot). **Viewports:** 1024 to 1033 in Italian, 1024 to 1043 in English. A row at every width below and above, so the layout goes row, stack, row as the screen grows, and the stack lands exactly on iPad landscape.

The moment the desk goes two-column at `lg`, the foot's content box is 442.7px while the note's 34ch flex base plus the 20px gap plus the 88px (IT) or 94px (EN) button need 448 or 454, so the button wraps under the note and the foot grows from 107px to 187px.

**Cause:** `globals.css:1704` `.form-foot` is flex-wrap with a 20px gap; `:1716` `.form-note` has `max-inline-size: 34ch` and a matching max-content base; `src/components/contact-desk.tsx:41` `lg:grid-cols-[1fr_1.35fr]`.

**The fix:** `.form-note { flex: 1 1 20ch }` with the 34ch max kept, so the note gives ground before the line breaks. At 320 the foot content box is about 280px and 200 + 20 + 88 still exceeds it, so the phone keeps its intended stacked note-over-button layout. Do not trim the cap to 32ch instead: that leaves about 9px of slack in English and any copy change puts the flip straight back.

**The test**, at 1024 and 1040, both locales:

```ts
for (const path of ['/contact', '/en/contact'] as const) {
	for (const width of [1024, 1040]) {
		test(`the send button stays on the note's row at ${width}px on ${path}`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 })
			await page.goto(path)
			await page.evaluate(() => document.fonts.ready)
			const rows = await page
				.locator('.form-foot > *')
				.evaluateAll(nodes => new Set(nodes.map(n => Math.round(n.getBoundingClientRect().top))).size)
			expect(rows, 'the form foot wrapped').toBe(1)
		})
	}
}
```

---

#### N20. `contact-check-slot-320` — the Cloudflare check is clipped and scrolls sideways inside the form

**Pages and sections:** contact, `02-section-enter`. **Viewports:** every width below 340 (300 to 339); among the captured sizes, 320 only.

The full-bleed phone panel keeps 20px of padding each side, so the reserved slot is 280px while Turnstile renders its fixed 300x65 card: the right 20px, the Cloudflare mark and the Privacy and Terms links, are sliced off and the slot becomes a horizontally scrolling box in the middle of the form, with no visible cue because the scrollbar is an overlay. The checkbox itself is on the visible left side, so the form can still be completed.

**Cause:** `globals.css:1572-1573` `.form-panel { --panel-pad: 1.25rem }` with the full-bleed rule at `:1587-1600`; `:1692-1696` `.check-slot { overflow-x: auto }`; `src/components/contact-form.tsx:247-253` renders the widget without a size.

**The fix:** under the existing `@media (width < 23rem)` at `globals.css:1004`, let only the slot bleed into the panel's padding: `.check-slot { margin-inline: calc(var(--panel-pad) * -1); padding-inline: 0.625rem }`. That gives a 320px slot holding the 300px card with 10px each side. Do not lower `--panel-pad` for the whole panel: that drops every field and the send button to a 10px gutter while the rest of the page keeps 20px.

**The test**, at 320 (needs the Turnstile site key, so skip it when the widget is absent):

```ts
test('the check slot holds the widget at 320px', async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 568 })
	await page.goto('/contact')
	const slot = page.locator('.check-slot')
	const room = await slot.evaluate(el => el.clientWidth)
	expect(room, 'the reserved check slot is narrower than the 300px widget').toBeGreaterThanOrEqual(300)
})
```

---

#### N21. `folder-platform-link-wrap` — the platform link wraps ragged at 320

**Pages and sections:** landing, `05-section-ascolta`, Italian only. **Viewports:** every width up to and including 330 (one line from 335). English wraps only below 320.

"Ascolta sulla piattaforma" does not fit the 232px card interior at 320, so the control stretches full width and its label breaks into two left-ragged lines inside a centred button, 67px tall instead of 50, on every Folder on both pager pages.

**Cause:** `src/components/folder.tsx:140` `control control-paper mt-4 inline-flex`; `.control`'s 20px inline padding at `globals.css:334` plus the 4px keyline exceed the interior at 320.

**The fix:** below `22rem`, give `[data-platform-link]` `padding-inline: calc(var(--spacing) * 3)` (12px) **and** `text-align: center`. The label is 199px, so 199 + 24 + 8 = 231 against a 232px interior: it fits on one line, and if a device font renders a hair wider it wraps centred rather than ragged. Dropping to 15px type alone does not fit (235px), and `white-space: nowrap` would overflow the card below 320.

**The test**, at 320:

```ts
test('the Folder platform link holds one line at 320px', async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 568 })
	await page.goto('/')
	await page.evaluate(() => document.fonts.ready)
	const wrapped = await page
		.locator('[data-platform-link]')
		.evaluateAll(nodes => nodes.filter(n => n.getBoundingClientRect().height > 56).length)
	expect(wrapped, 'a platform link wrapped to two lines').toBe(0)
})
```

---

#### N22. `daw-edge-marker-position` — the chevron is off screen when the arrangement arrives

**Pages and sections:** landing, `06-section-percorso`. **Viewports:** 844x390 and 932x430 only. Confirmed clear at 1024x600, 375x667, 320x568 and every taller viewport, so this tracks viewport height, not how much is hidden.

The single chevron sits at the vertical middle of an 818px box, 409px down, while the usable window under the header is 324px at 844x390 and 364px at 932x430, so it is below the fold when the strip arrives and above it at the tail. In between, a reader sees half the arrangement hidden and the last lane empty with nothing saying there is more.

**Cause:** `globals.css:1292` `.daw-edge-mark` with `align-items: center` at `:1296` and `block-size: 100%` at `:1299`, centring one `.daw-edge-arrow` (`:1325`) in the full box. A block-direction sticky would not help: `.daw` is `overflow: auto` in both axes and its scrollport has no vertical scroll.

**The fix:** under `@media (height <= 34rem)`, repeat the chevron down the edge column: three `.daw-edge-arrow` spans with `flex-direction: column; justify-content: space-evenly`. That spaces them 273px apart, inside the 324px shortest usable window, so one is always on screen, while the deliberate single mark (a sibling of the playhead flag, per the CSS comment) survives at every viewport where it already works.

**The test**, at 844x390 and 932x430:

```ts
for (const [width, height] of [[844, 390], [932, 430]] as const) {
	test(`the edge marker is on screen when the strip arrives at ${width}x${height}`, async ({ page }) => {
		await page.setViewportSize({ width, height })
		await page.emulateMedia({ reducedMotion: 'reduce' })
		await page.goto('/')
		await page.locator('.daw').scrollIntoViewIfNeeded()
		const seen = await page.locator('.daw-edge-arrow').evaluateAll(nodes =>
			nodes.some(n => {
				const r = n.getBoundingClientRect()
				return r.top >= 0 && r.bottom <= window.innerHeight
			})
		)
		expect(seen, 'no chevron is visible when the arrangement comes into view').toBe(true)
	})
}
```

---

### POLISH

These are worth doing when the majors and minors are in. None of them would be filed as a bug on their own.

---

#### P1. `safe-area` — no `viewport-fit=cover`, so bands stop short on a notched phone

All pages, notched phones in landscape (the layout viewport is 726x390 or 814x430 rather than 844x390 or 932x430). The meta viewport is Next's default and nothing in `src` uses `env(safe-area-inset-*)`, so iOS insets the layout viewport and paints the cream paper into a 44 to 59px band on each side, and the full-bleed ink bands, the blue hero and the marquee no longer reach the glass. Nothing is hidden, and the conservative default is safe. **Cause:** `src/app/(frontend)/[lang]/layout.tsx` has no `export const viewport`. **Fix, if adopted, must be done in one change or not at all:** export `viewport: { viewportFit: 'cover' }`, introduce `--gutter: max(1.25rem, env(safe-area-inset-left))` and apply it at all twelve places that currently write `px-5 sm:px-8` by hand, add `padding-top: env(safe-area-inset-top)` and horizontal insets to the header (whose gutter is `px-4 sm:px-6`, a different one), and add `padding-bottom: env(safe-area-inset-bottom)` to the footer. Skipping the footer would put its link row under the home indicator, trading a cosmetic border for a real tap problem. **Test:** at 375, assert `document.querySelector('meta[name="viewport"]').content` contains `viewport-fit=cover` and that `.site-footer` computed `padding-bottom` is not `0px`.

#### P2. `header-gutter` — the bar's gutter is 4 to 8px narrower than the page's

All pages (seen most cleanly on legal), 320 to about 1500; aligned from 1536 up where both cap on the shell. The wordmark pill starts at x=16 on phones and x=24 from 640, while the h1, the prose and the footer start at 20 and 32. **Cause:** `site-header.tsx:32` `px-4 sm:px-6` against `px-5 sm:px-8` everywhere else and 20/32px on `.site-footer` (`globals.css:1855-1866`). **Fix:** change the header to `px-5 sm:px-8`. Verified live: the header keeps its exact height at every width, gains no wrap row and adds no overflow. **Test:** at 375 and 1440, assert `[data-nav-home]` left equals the `main` h1's left.

#### P3. `footer-single-column` — the footer is one tall column to 767px

All pages, 320 to 767 (three columns from 768). 672px tall at phone widths and 614px from 540 to 767 with a 170px rail of links beside about 530px of empty black. **Cause:** `globals.css:1868-1878`, `.footer-columns` only gains columns at 48rem. **Fix:** add a `@media (width >= 30rem)` step with two columns, a 1.5rem column gap and the mail row spanning both. Use 30rem rather than 27rem: at 27rem the English track is 184px against a 178px list, six pixels of slack, and one longer link or a user text-size bump wraps "Listen on Bandcamp"; at 30rem the tracks are 208px. **Test:** at 480 and 640, assert `.footer-columns` computed `grid-template-columns` resolves to two tracks.

#### P4. `footer-credit-orphan` — the credit line breaks between fragments

All pages, 300 to 442 (one line from 443). The credit wraps at flex-item boundaries, not by words: the middle dot dangles at the end of line one at 300 to 320, a naked heart glyph opens line two at 330 to 340, "by Cinquin Andy" at 350 to 360, and "Cinquin Andy" alone at 375 to 442. **Cause:** `site-footer.tsx:104-118` emits six separate flex items; `globals.css:1933-1942` lays them out as a wrap row with a 6px gap. **Fix:** wrap "© {year} {siteName}" and "Developed with ♥ by Cinquin Andy" in two `white-space: nowrap` spans (167px and 230px, both fitting a 260px box at 300 viewport, and 167 + 6 + 230 = 403 which is today's single-line width exactly, so the desktop line and the 443 crossover are unchanged), and hide `.footer-sep` below 28rem so the dot never ends a line. **Test:** at 320 and 400, assert `.footer-credit` has at most two rows of items and that no row holds a single item.

#### P5. `title-phone-underfill` — titles surrender 24px of their band below 640

Landing and contact (shared `SectionTitle`), 320 to 639, both locales. The formula subtracts 4rem while the band pads 2 x 1.25rem, so the word stops 48 to 83px short of the right edge while sitting 20px from the left. **Cause:** `section-title.tsx:45` (subtracts 4rem) against `:48` (`px-5 sm:px-8`). **Fix, and this is important:** do **not** hand the formula the extra 24px. Simulated, that pushes PERCORSO 6.5 to 12.6px past the band at every width in the range and ABOUT 13.5 to 23.5px, turning a polish item into the exact overflow the component was written to avoid. Close the gap from the other side instead: make the title band `px-8` at every width, matching what the formula already assumes, so the word sits 32px from each edge with the same balance as the desktop and every existing size is unchanged. Or fold this into the `100cqi` rewrite from M5, which measures the band's real content box and makes the question moot. **Test:** at 320 and 430, assert the title band's left and right gaps to the glyph differ by less than 24px, and that nothing overruns (reuse M5's assertion).

#### P6. `breakpoint-40rem-mixed` — at exactly 640px both phone and desktop rules apply

Landing `05-section-ascolta` and `06-section-percorso`, contact `03-section-enter`; 640px exactly. Three phone rules use `width <= 40rem` while Tailwind's `sm:` is `min-width: 40rem`, so at 640 the page mixes a 5px Folder shadow and 9rem DAW bars with `sm:px-8` gutters. Nothing is cut, nothing overflows. **Cause:** `globals.css:523`, `:1069`, `:1314` use `<=` where `<` was meant. **Fix:** change those three to `width < 40rem`, which only moves 640px onto the values 641px already renders. **Test:** at 639, 640 and 641, assert `getComputedStyle(document.querySelector('.folder')).getPropertyValue('--folder-shadow')` matches the section's padding step.

#### P7. `section-padding-short-viewport` — 160 to 192px of section padding on a 390px-tall screen

Landing `02-` and `03-section-enter`, 844x390 and 932x430 (the same padding applies from width 768 at any height). 188px of furnished green passes before the first card and 196px after the last, and the sections run 4.6 and 2.7 viewports tall. **Cause:** `about.tsx:45` `md:py-48` and `skills.tsx:37` `md:py-40` are fixed regardless of height; every other section is `md:py-20` or `md:py-24`. **Fix:** do **not** use `clamp(5rem, 20svh, 12rem)`: measured, it also cuts 1440x900 to 180px and, at 844x390, the 80px result swallows the magenta cross behind the prose card and runs the arcs into its corner, which is exactly what the corner anchoring exists to prevent. Scope it instead: `@media (min-width: 768px) and (max-height: 520px)` dropping these two to the existing 96px `py-24`, a value the design already uses, and move the ornament offsets with it. **Test:** at 844x390, assert the gap between the title band's bottom and the first card's top is under 140px.

#### P8. `hero-short-viewport` — the hero controls sit just below the fold on landscape phones

Landing `01-section-enter`, any viewport shorter than about 540px CSS: 844x390 (controls 30px under), 932x430 (22px), 896x414, 740x360, and 1024x500 (a 20px sliver of a 60px button). Clear at 1024x550 and up. The first screen is the name and the tagline only. **Cause:** `hero.tsx:60`, the 11.5vw h1 clamp grows the name with width while a landscape viewport's height does not grow; `md:py-14` at `:40`. **Fix:** probably leave it. The hero needs about 510px of its own rhythm against 323px of available height, and the only trim that reaches the controls without shrinking the name is capping the h1 clamp by height as well as width. The proposed `py-8` plus `mt-5` saves 40px and still leaves both controls off screen, so do not ship that as a fix. **Test:** if it is done, at 844x390 assert `[data-hero-listen]` bottom is <= 390.

#### P9. `about-measure-1024` — About prose gets a 34-character measure at 1024

Landing `02-section-enter`, 1024 to 1151 at its worst (nine lines), eight lines to 1279, back to seven from 1279. At 768 the single centred column gives it 49 characters. **Cause:** `about.tsx:59` `lg:grid-cols-[1.3fr_1fr]` switching on at 1024 while `:73` already applies `md:text-[1.6rem]` and `sm:p-12` spends 96px of a 488px card on padding. **Fix:** `lg:p-8 xl:p-12` alongside the existing `sm:p-12`, which returns the content to about 416px at 1024 and 459px at 1100 while leaving the keyline, tilt, tape and shadow untouched. Do **not** move the two-column switch to `xl`: that puts the section back to 1872px at 1024 to 1279 and restores one card alone in a lot of empty green, which is the problem this layout was rebuilt to solve. **Test:** at 1024, assert the About paragraph's content width is over 400px.

#### P10. `contact-facts-card-heights` — a hole under the one-line Lingue card

Contact `03-section-enter`, 640 and up (worst at 1024: a 118px run of yellow under the short card against a 40px grid gap; 92px from 1280 to 3440). **Cause:** the `dl` stretches each `.folder` to the row height, but `.folder` paints nothing and `.folder-body` (`globals.css:553-557`) has no `flex-grow`, so the painted card keeps its content height. **Fix, and it is a taste call:** scoped to the facts `dl` only, `.folder-body { flex: 1 1 auto }` so the two cards in a row share one bottom edge; leave the landing Folders alone. The cost is 52 to 78px of empty card inside a one-line "Lingue", in a design where every other Folder is paper sized to its contents. Shipping as-is is defensible: the rag reads as an index of cards of different lengths. **Test:** at 1024, assert the two cards in the first row have equal bottom edges.

#### P11. `contact-slip-note-orphan` — "qui." alone on a line at 1024 to 1039

Contact `01-section-enter`, Italian only, 1024 to 1039 (1032 still orphans, 1040 is clean). When the arrival goes two-column the address card narrows to 437px, 11px under its `max-w-md`, and the note's last line carries one word. **Cause:** `contact-arrival.tsx:69` sets the note without `text-pretty` while the intro at `:51` has it. **Fix:** add `text-pretty` to `contact-arrival.tsx:69`. Measured, it does not restore three lines (still four) but it rebalances so the last line carries 125px of text instead of 25px, which is the actual complaint, and it is a no-op at every other width. Do not widen the right track to force `max-w-md`: that shifts the arrival's proportions at every large width to buy sixteen pixels. **Test:** at 1024 on `/contact`, assert the note's last line rect is wider than 60px.

---

## 4. What was checked and is fine

Do not re-audit these. Each was reported as a defect, investigated by a second agent who measured the running site, and found to be either correct behaviour or a documented decision.

- **The DAW's height and its year ruler.** The strip is 818px at every width (not viewport-dependent), and the ruler scrolls out of view on a 1366x768 laptop just as it does on a phone. No year information is lost: every lane renders its own period in the lane gutter, which is horizontally sticky, so the label stays pinned beside its clip at every scroll position including the far end.
- **The About card's prose measure on a phone.** 21 characters a line at 320 and 26 at 375 is tight, but at 375 it is set *wider* than the hero intro (25) and the contact CTA copy (24) on the same screen. The rag is even, no orphans, nothing cut. It sits inside the 21 to 30 character band the whole page uses on a phone.
- **`:hover` latching after a tap on touch.** Disproved by driving a real touch drag: a touch pointer's `pointerleave` bubbles to the document and the dither field's existing handler clears the ramp, so nothing latches. In Chromium the CSS half does not latch either, verified against a control experiment. The one rule where a latch would show something false (a record hanging out of a sleeve that is not playing) is already gated behind `(hover: hover) and (pointer: fine)`, and the stylesheet says why.
- **The long DAW clip detail.** The reported "666px, 102-character line" is the element's box, not its text: the rendered line is 494px and 82 characters in Italian, 445px and 76 in English, on one line, unclamped.
- **Corner ornaments drifting on ultrawide screens.** Real geometry, deliberate design. The marks are anchored to the section (the full-bleed canvas), not to the shell (the reading column), and two source comments say so; the team already moved them once and moved them back. At 3440 the canvas is 3440 wide, so its corners are 940px from the column, exactly as specified.
- **The form's required note "running 97 to 109 characters".** The rendered line is 51 characters and 430px, on one line, at every width from 640 up. The 97/105/109 figures come from the audit harness estimating a box's theoretical capacity at half an em per glyph; the real glyph is 0.615em and the box is mostly empty space.
- **Title bands taller than a landscape-phone viewport.** The numbers are right (an ASCOLTA band is 495px on a 390px screen) but the word itself is never more than 0.61 of the viewport, the longest gap with no glyph on screen is 132px, and the same thing happens on a 1366x768 laptop. It is the design's stated rule working.
- **Tall portrait tablets getting 290 to 330px of empty field above the name.** A 2560x1440 desktop carries a larger empty band (344px) than 1024x1366 (323px) and reads as the intended flat field. The hero's documented intent is better served at a tall aspect ratio, not broken.
- **The contact brief points at a 173px column at 320.** Every line is well filled, no orphan, no hyphen break, no collision. The width is a smooth linear function of the viewport with no breakpoint anywhere between 300 and 430, and the 53px offset from the paragraph above is the numeral column, present at every width from 300 to 3440.
- **The arrival paragraph ending on a two-word orphan from 1920 up.** True of the build the captures were taken from (`--measure: 100rem`), not of the current one: since `--measure` became 90rem the last line reads "e un lavoro come un altro." at every width from 1500 to 3440.

---

## 5. What this audit could not see

Everything above was measured in headless Chromium on Linux against `localhost:3000`, with reduced motion, at device scale factor 1. The following need a human with real hardware.

- **Real iOS Safari.** The keyboard-band numbers assume Android's resize-the-layout-viewport behaviour; on iOS only the visual viewport shrinks and the sticky bar can scroll out of it. The `viewport-fit` and safe-area findings (P1) are inferred from documented iOS behaviour, not observed. The sticky-hover latch could not be tested (no WebKit binary installed). **Check on a real iPhone:** fill the contact form with the keyboard up at 320 and 375; rotate the landing page to landscape; tap through the header, the pager and every Folder control and look for anything that stays visibly lifted.
- **Real Firefox and real Safari for the DAW chevron.** The engine gap was confirmed in Firefox 151 and WebKitGTK 2.52 (`CSS.supports('container-type: scroll-state')` is false in both), but not on an actual iPhone or an actual macOS Safari. **Check:** open the training section on an iPad and see whether anything tells you the arrangement continues.
- **A Windows or Linux machine with classic scrollbars.** `100vw` includes the scrollbar, so the PERCORSO overrun (M5) is 9 to 15px worse there than in the captures, and the page gets a horizontal scrollbar at nearly every desktop width. **Check:** open the landing page at 1366 and 1440 on a Windows laptop and look for a scrollbar along the bottom.
- **A screen reader on a phone.** Focus order, the live region after a rejected submit, and the language switch's accessible names were checked mechanically (attributes, `aria-live`, `aria-describedby`), never listened to. The `IT` / `EN` pill change in M2 relies on `aria-label` carrying the full locale name. **Check:** VoiceOver on iOS through the contact form, and through the header after the pill change lands.
- **Slow networks.** The image finding (N4) was measured by byte count, not by timing. A phone currently pulls 281KB of images, more than a 1440 desktop, and the portrait is fetched eagerly; the covers are placeholder PNGs today, so a real photograph of Anna in that slot will be far heavier. **Check:** the landing page on a throttled 3G connection once the real portrait is uploaded.
- **Real content.** Three findings are latent on what Anna enters in the CMS rather than on the seeded placeholders: the address overflow (M7, the placeholder is 16 characters with 7px of slack, an ordinary professional address is 22 to 33), the section titles (M5 and M8 are sized by a character-count heuristic, so a new heading string can overrun), and the images (N4 assumes square covers and a 4:5 portrait). **Check:** after the real copy and images are in, re-run the two title tests and the address test at 320, 375, 768 and 900.