import { Ornament } from '@/components/ornament'
import type { Home } from '@/payload-types'

/** The fills cycle so consecutive steps read as distinct blocks on the track. */
/* Three real colours on the dark strip. The first build cycled card/secondary/accent,
 * two of which were near-identical beiges, so consecutive steps merged. */
const FILLS = ['bg-sheet', 'bg-lemon', 'bg-spring'] as const

/**
 * Anna's training and experience as a sequencer track: rectangular blocks laid along a
 * time ruler, each one a step in her path, readable in one scan.
 *
 * An ordered list, because that is what it is. Drawing it as an image would put the whole
 * of her history out of reach of a screen reader, and the visual is only a layout of the
 * same list.
 */
export function Timeline({ timeline, scrollLabel }: { timeline: Home['timeline']; scrollLabel: string }) {
	const entries = timeline?.entries ?? []
	if (entries.length === 0) {
		return null
	}

	return (
		<section
			className="relative border-b-brutal border-border bg-grape px-5 py-14 text-grape-foreground sm:px-8 md:py-20"
			data-enter
			data-timeline
		>
			<Ornament kind="blob" tone="sheet" rotation={-24} className="top-8 right-5 h-9 w-9 sm:right-12 sm:h-12 sm:w-12" />
			<div className="mx-auto max-w-6xl">
				<h2 className="font-display uppercase [font-stretch:88%]">{timeline?.heading}</h2>

				{/* The strip scrolls inside its own container, never the page. `tabIndex` is
				    what makes a scrollable region reachable without a pointer. */}
				{/* biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region has to be
				    reachable without a pointer — WCAG 2.1.1 — and `tabindex` is the only way to
				    give a scroll container keyboard focus. */}
				<section className="mt-10 overflow-x-auto pb-4" tabIndex={0} aria-label={scrollLabel} data-timeline-scroller>
					<ol className="flex min-w-max list-none items-stretch gap-0 border-t-brutal border-sheet p-0 pt-0">
						{entries.map((entry, index) => (
							<li key={entry.id ?? entry.period} className="relative flex min-w-[14rem] max-w-[18rem] flex-col">
								{/* The ruler tick: where this step begins on the track. */}
								<div aria-hidden="true" className="h-4 w-1 bg-sheet" />
								<div
									className={`flex h-full flex-col border-brutal border-border text-foreground ${FILLS[index % FILLS.length]} -ml-[2px] p-4`}
								>
									<span className="font-mono text-xs tracking-wider">{entry.period}</span>
									<h3 className="mt-2 font-display text-h5 uppercase [font-stretch:90%]">{entry.label}</h3>
									{entry.detail ? (
										<p className="mt-2 font-sans text-sm leading-snug whitespace-pre-line">{entry.detail}</p>
									) : null}
								</div>
							</li>
						))}
					</ol>
				</section>
			</div>
		</section>
	)
}
