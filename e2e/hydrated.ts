import { expect, type Page } from '@playwright/test'

/**
 * Waits until React has hydrated the page.
 *
 * The server sends a page that is already complete, so Playwright's `load` fires, the
 * markup is there, and a control can be focused and typed into long before any React
 * effect has run. Controls whose behaviour lives in an effect — the seek slider commits on
 * a native `change` listener attached in `useEffect`, the pager moves on an `onClick` — do
 * nothing at all until then, and the keystroke that arrived early is simply lost: the
 * range's value moved, so pressing again will not produce a second `change` either. On a
 * loaded runner that window is wide enough to fail a test that passes every time on a
 * quiet machine.
 *
 * `--header-h` is the signal because HeaderHeight publishes it from an effect, on every
 * page, as an inline style that is absent from the server's HTML. React flushes the
 * passive effects of a commit together, so once it is there the rest of the tree's
 * listeners are attached too.
 */
export async function hydrated(page: Page): Promise<void> {
	await expect
		.poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue('--header-h')), {
			message: 'the page never hydrated',
			// Long, because this is a wait and not a measurement. A loaded runner is slow,
			// and a test that fails here for being slow would be the same flake in a new
			// place. What it must not do is return early.
			timeout: 30_000,
		})
		.not.toBe('')
}
