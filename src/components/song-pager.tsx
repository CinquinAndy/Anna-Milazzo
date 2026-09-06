'use client'

import { Children, type ReactNode, useEffect, useRef, useState } from 'react'

/**
 * How many works one page holds. Three: a Folder is tall, and three of them is about
 * as much as anyone reads before they want to know whether there is more.
 */
const PER_PAGE = 3

/** Two digits, so the pages read as a set rather than as a running count. */
const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Deals the stack of works out in pages.
 *
 * Every work stays in the document and the ones off the current page are `hidden`, so
 * the whole body of work is still there to be indexed and the one that is playing keeps
 * its transport wired to the single audio element. Paging is not navigation: nothing is
 * fetched, nothing unmounts, and a track that is playing keeps playing.
 *
 * The strip sits below the works because that is where you arrive from reading them.
 * Changing page moves focus to the list, which both scrolls the new page's first work to
 * the top and puts a screen reader at the start of what just changed.
 */
export function SongPager({
	previousLabel,
	nextLabel,
	children,
}: {
	previousLabel: string | null | undefined
	nextLabel: string | null | undefined
	children: ReactNode
}) {
	const items = Children.toArray(children)
	const pages = Math.max(1, Math.ceil(items.length / PER_PAGE))
	const [page, setPage] = useState(0)
	const listRef = useRef<HTMLUListElement>(null)

	const go = (next: number) => {
		// The ends are announced with aria-disabled rather than the disabled attribute:
		// a button that goes inert under the finger that pressed it drops keyboard focus
		// to the body, so it stays focusable and does nothing instead.
		if (next === page || next < 0 || next >= pages) {
			return
		}
		setPage(next)
	}

	// After the commit, never inside the click. Focusing the list from the handler scrolled
	// the OLD three-work list into view, and because that list is taller than the screen the
	// browser bottom-aligned it; React then swapped in a shorter page under a scroll position
	// computed for a list that no longer existed, and the reader landed on the next section
	// entirely. `preventScroll` and then one explicit scroll, so there is a single movement
	// rather than a centre followed by a start. The landing point is the document's own
	// scroll padding, which already clears the sticky bar.
	const shown = useRef(page)
	useEffect(() => {
		// Equal on the first render, which is the one time the reader has not asked to be
		// taken anywhere.
		if (shown.current === page) {
			return
		}
		shown.current = page
		const list = listRef.current
		if (list === null) {
			return
		}
		list.focus({ preventScroll: true })
		list.scrollIntoView({ block: 'start' })
	}, [page])

	const first = page * PER_PAGE
	const numbers = Array.from({ length: pages }, (_, index) => index)

	return (
		<div data-song-pager>
			<ul
				ref={listRef}
				tabIndex={-1}
				className="song-list mt-10 flex list-none flex-col gap-[clamp(2.5rem,8vw,4rem)] p-0"
			>
				{items.map((item, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: position in the stack is the identity here
					<li key={index} hidden={index < first || index >= first + PER_PAGE}>
						{item}
					</li>
				))}
			</ul>

			{pages > 1 ? (
				<div className="song-pager mt-12">
					<button
						type="button"
						className="nav-pill song-pager-step"
						aria-label={previousLabel ?? undefined}
						aria-disabled={page === 0}
						onClick={() => go(page - 1)}
					>
						<Arrow direction="back" />
					</button>

					{numbers.map(number => (
						<button
							key={number}
							type="button"
							className="nav-pill song-pager-page"
							aria-current={number === page ? 'page' : undefined}
							onClick={() => go(number)}
						>
							{pad(number + 1)}
						</button>
					))}

					<button
						type="button"
						className="nav-pill song-pager-step"
						aria-label={nextLabel ?? undefined}
						aria-disabled={page === pages - 1}
						onClick={() => go(page + 1)}
					>
						<Arrow direction="on" />
					</button>
				</div>
			) : null}
		</div>
	)
}

/** A solid triangle. Flat fill and no stroke, like every other mark on the page. */
function Arrow({ direction }: { direction: 'back' | 'on' }) {
	return (
		<svg viewBox="0 0 8 10" width="8" height="10" aria-hidden="true" focusable="false">
			<path d={direction === 'back' ? 'M8 0 0 5l8 5Z' : 'M0 0l8 5-8 5Z'} fill="currentColor" />
		</svg>
	)
}
