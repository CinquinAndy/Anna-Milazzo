'use client'

import {
	Children,
	createContext,
	type KeyboardEvent,
	type MouseEvent,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react'
import { useAudioEngine } from '@/components/audio-engine'
import { tabId } from '@/lib/folder/slug'
import { isPlaying } from '@/lib/player/controller'

/** What the Folder needs to draw one Tab. Everything else is on the sheet it opens. */
export type FolderTab = {
	/** The fragment the Song answers to, and the id of its sheet. */
	slug: string
	/** `01`, `02`… */
	number: string
	/** The Song's full title, in the language of the page. */
	title: string
	/** The handle the player knows the Song by, or null for a Song with no audio. */
	playId: string | null
	/** A colour token and the type colour that goes on it, from `tabColour`. */
	fill: string
	ink: string
}

/** Whether the sheet this is rendered in is the one open in the Folder. */
const SheetOpen = createContext(true)

/** For what lives on a sheet and must stop when the sheet is put away: the video player. */
export function useSheetOpen(): boolean {
	return useContext(SheetOpen)
}

/**
 * The one Folder every Song is filed in, with a numbered Tab per Song along its top edge.
 *
 * Anna's reference, and what she asked for on 5 November: one folder, the tabs side by
 * side above it, each its own colour. Pressing a Tab pulls it forward and shows its Song on
 * the sheet inside. ADR-0014.
 *
 * It is a tab interface and says so: `tablist`, `tab` and `tabpanel`, the arrow keys move
 * between Tabs and select as they go, Home and End reach the ends. Every sheet is rendered
 * on the server and stays in the document, so the whole body of work is still there to be
 * indexed, and the one that is playing keeps its transport wired to the single audio
 * element when another Tab is opened.
 *
 * Without JavaScript nothing is hidden. The Tabs are links to each sheet's fragment and the
 * sheets are stacked one under the other; the stylesheet hides the closed ones only under
 * `@media (scripting: enabled)`. The roles are added once the page has hydrated, so a
 * reader without the script is never told about a tab interface that does nothing.
 */
export function Folder({ tabs, label, children }: { tabs: readonly FolderTab[]; label: string; children: ReactNode }) {
	const sheets = Children.toArray(children)
	const [open, setOpen] = useState(0)
	// False on the server and for the first client render, so the two agree.
	const [live, setLive] = useState(false)
	const tabRefs = useRef<(HTMLAnchorElement | null)[]>([])
	const folderRef = useRef<HTMLDivElement>(null)
	const rowRef = useRef<HTMLDivElement>(null)
	// Which ends of the row have Tabs scrolled out of sight past them, so the stylesheet can
	// fade that edge. The scrollbar is hidden, and a row cut off cleanly at a Tab boundary
	// otherwise looks like the whole set.
	const [more, setMore] = useState({ start: false, end: false })
	const { state } = useAudioEngine()

	const show = useCallback(
		(index: number, focus: boolean) => {
			const tab = tabs[index]
			if (tab === undefined) {
				return
			}
			setOpen(index)
			// The address follows the open Tab, so it can be copied and sent. Replaced, not
			// pushed: flicking through five Tabs should not take five presses of Back to undo,
			// and assigning `location.hash` would scroll the page to the sheet.
			history.replaceState(history.state, '', `#${tab.slug}`)
			const node = tabRefs.current[index]
			if (focus) {
				node?.focus({ preventScroll: true })
			}
			// On a phone the row scrolls sideways, and the open Tab must be in it.
			node?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
		},
		[tabs]
	)

	// After hydration, never during it: the server cannot know the fragment, so it renders
	// the first Tab, and the one the address names is opened here.
	useEffect(() => {
		setLive(true)
		const fromAddress = () => {
			const slug = decodeURIComponent(location.hash.slice(1))
			const index = tabs.findIndex(tab => tab.slug === slug)
			if (index < 0) {
				return
			}
			setOpen(index)
			// The browser tried to scroll to the sheet while it was hidden. The Folder is
			// brought into view instead, under the sticky bar (`scroll-padding`).
			folderRef.current?.scrollIntoView({ block: 'start' })
		}
		fromAddress()
		window.addEventListener('hashchange', fromAddress)
		return () => window.removeEventListener('hashchange', fromAddress)
	}, [tabs])

	useEffect(() => {
		const row = rowRef.current
		if (row === null) {
			return
		}
		const measure = () => {
			// A pixel of slack: a fractional scroll position never quite reaches the end.
			const start = row.scrollLeft > 1
			const end = row.scrollLeft + row.clientWidth < row.scrollWidth - 1
			setMore(previous => (previous.start === start && previous.end === end ? previous : { start, end }))
		}
		measure()
		const observer = new ResizeObserver(measure)
		observer.observe(row)
		row.addEventListener('scroll', measure, { passive: true })
		return () => {
			observer.disconnect()
			row.removeEventListener('scroll', measure)
		}
	}, [])

	const onKeyDown = (event: KeyboardEvent<HTMLAnchorElement>, index: number) => {
		const last = tabs.length - 1
		const moves: Record<string, number> = {
			ArrowRight: index === last ? 0 : index + 1,
			ArrowLeft: index === 0 ? last : index - 1,
			Home: 0,
			End: last,
		}
		const target = moves[event.key]
		if (target === undefined) {
			return
		}
		event.preventDefault()
		show(target, true)
	}

	const onClick = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
		// A link opened in a new tab or window is the browser's to handle: the Tab is a real
		// link, and its address is worth keeping.
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
			return
		}
		// A link without the script, a Tab with it.
		event.preventDefault()
		show(index, false)
	}

	const current = tabs[open] ?? tabs[0]

	return (
		// The frame holds the Folder and, outside its drop shadow, the fades that say the row
		// of Tabs goes on past an edge.
		<div className="song-folder-frame">
			<div
				ref={folderRef}
				className="song-folder"
				data-folder
				style={{ '--folder-fill': current?.fill, '--folder-ink': current?.ink } as React.CSSProperties}
			>
				{/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: the role is `tablist` once hydrated, and the label is only set then. */}
				<div
					ref={rowRef}
					className="song-tabs"
					role={live ? 'tablist' : undefined}
					aria-label={live ? label : undefined}
					data-more-start={more.start ? 'true' : undefined}
					data-more-end={more.end ? 'true' : undefined}
				>
					{tabs.map((tab, index) => {
						const selected = index === open
						const sounding = tab.playId !== null && isPlaying(state, tab.playId)
						return (
							// biome-ignore lint/a11y/useAriaPropsSupportedByRole: the link is a `tab` once hydrated, and the ARIA state is only set then.
							<a
								key={tab.slug}
								ref={node => {
									tabRefs.current[index] = node
								}}
								href={`#${tab.slug}`}
								id={tabId(tab.slug)}
								className="song-tab"
								role={live ? 'tab' : undefined}
								aria-selected={live ? selected : undefined}
								aria-controls={live ? tab.slug : undefined}
								// The roving tab stop: Tab reaches the open one, the arrows the rest.
								tabIndex={live && !selected ? -1 : undefined}
								data-open={selected ? 'true' : 'false'}
								data-sounding={sounding ? 'true' : 'false'}
								style={
									{
										'--tab-fill': tab.fill,
										'--tab-ink': tab.ink,
										// Each Tab lies on the one after it, as in the reference.
										'--tab-z': tabs.length - index,
									} as React.CSSProperties
								}
								onClick={event => onClick(event, index)}
								onKeyDown={event => onKeyDown(event, index)}
							>
								<span className="song-tab-number">{tab.number}</span>
								{/* Read after the number, so the name starts with what is drawn (WCAG
							    2.5.3) and "click 02" works by voice. Shown, truncated, from tablet
							    width up, where a title chooses better than a number does. */}
								<span className="song-tab-title max-md:sr-only">{tab.title}</span>
								{/* The Song that is sounding, wherever the reader has gone since. */}
								<span className="song-tab-disc" aria-hidden="true" />
							</a>
						)
					})}
				</div>

				<div className="song-folder-body">
					{sheets.map((sheet, index) => {
						const tab = tabs[index]
						if (tab === undefined) {
							return null
						}
						const selected = index === open
						return (
							<section
								key={tab.slug}
								id={tab.slug}
								className="song-panel"
								role={live ? 'tabpanel' : undefined}
								aria-labelledby={live ? tabId(tab.slug) : undefined}
								// Focusable so a keyboard reader can step from the Tab into the sheet.
								tabIndex={live ? 0 : undefined}
								data-open={selected ? 'true' : 'false'}
							>
								<SheetOpen.Provider value={selected}>{sheet}</SheetOpen.Provider>
							</section>
						)
					})}
				</div>
			</div>
			{/* Not a mask on the row: a mask makes the row a stacking context of its own, and
			    the open Tab could no longer be drawn over the body it is welded to. Not inside
			    the Folder either, where the drop shadow would draw one under the fade too. */}
			{more.start ? <span className="song-tabs-fade" data-side="start" aria-hidden="true" /> : null}
			{more.end ? <span className="song-tabs-fade" data-side="end" aria-hidden="true" /> : null}
		</div>
	)
}
