'use client'

import { useEffect } from 'react'

/**
 * Publishes the sticky bar's real height as `--header-h` on the document element.
 *
 * The token was a 67px constant, which is only true once the bar is one row. It is two
 * rows on a phone, and the width at which it collapses depends on the language, because
 * the Italian labels are longer than the English ones. Anything that has to clear the bar
 * (the scroll padding for anchors and focus, the hero's full-screen height, the works
 * pager) was therefore reserving the wrong number on exactly the screens where the bar is
 * tallest.
 *
 * A ResizeObserver rather than breakpoints: no arithmetic can predict the wrap width for
 * copy Anna is free to change in the CMS, and this measures whatever is actually there.
 * The stylesheet still carries a per-breakpoint default, so the page is close to right
 * before this runs and correct after.
 */
export function HeaderHeight() {
	useEffect(() => {
		const header = document.querySelector('[data-site-header]')
		if (header === null) {
			return
		}

		const publish = () => {
			// Rounded up: half a pixel short puts the keyline of whatever scrolled to the
			// top back under the bar, which is the whole failure this exists to prevent.
			const height = Math.ceil(header.getBoundingClientRect().height)
			document.documentElement.style.setProperty('--header-h', `${height}px`)
		}

		publish()
		const observer = new ResizeObserver(publish)
		observer.observe(header)
		return () => observer.disconnect()
	}, [])

	return null
}
