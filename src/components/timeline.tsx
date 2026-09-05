import { SectionTitle } from '@/components/section-title'
import { arrange } from '@/lib/timeline/span'
import type { Home } from '@/payload-types'

/** The fills cycle so no two neighbouring clips share a colour on the dark ground. */
const CLIP_FILLS = ['bg-sheet', 'bg-lemon', 'bg-spring', 'bg-accent'] as const

/**
 * Anna's training and experience as a DAW arrangement.
 *
 * The concept was right the first time and the execution was not: a row of blocks on a
 * line is a Gantt chart, and a Gantt chart is the least memorable object in software. What
 * turns it into an arrangement is the chrome around the blocks, a ruler whose ticks have
 * a hierarchy, named track lanes in a gutter that stays put while the arrangement scrolls,
 * a playhead, and clips whose width is their duration rather than a uniform card size.
 * Three years at the conservatory is genuinely three times a one-year commission.
 *
 * The S and M squares on each lane are solo and mute. They are `<span>`, never `<button>`:
 * a control that looks pressable and does nothing is both an accessibility trap and a lie.
 * Free to anyone who has opened a DAW, invisible to everyone else.
 *
 * Still an ordered list underneath. The list is the content; the arrangement is a layout
 * of it, and drawing it as an image would put Anna's whole history out of reach of a
 * screen reader.
 */
export function Timeline({ timeline, scrollLabel }: { timeline: Home['timeline']; scrollLabel: string }) {
	const entries = timeline?.entries ?? []
	const arrangement = arrange(entries, entry => entry.period)

	if (entries.length === 0 || arrangement === null) {
		return null
	}

	// The playhead parks where the most recent entry begins, "now" in her arrangement. The
	// ruler counts DOWN, so now is the smallest offset rather than the largest.
	const playhead = Math.min(...arrangement.lanes.map(lane => lane.offset))
	// Counted down from the last bar, so the leftmost year is the most recent one.
	const bars = Array.from(
		{ length: arrangement.years },
		(_, index) => arrangement.firstYear + arrangement.years - 1 - index
	)

	return (
		<section
			className="relative border-b-brutal border-border bg-grape text-grape-foreground"
			data-enter
			id="percorso"
			data-timeline
		>
			{timeline?.heading ? <SectionTitle>{timeline.heading}</SectionTitle> : null}

			<div className="relative px-5 py-14 sm:px-8 md:py-20">
				<div className="shell">
					{/* The arrangement scrolls inside its own container, never the page.
					    `tabIndex` is what makes a scrollable region reachable without a pointer. */}
					{/* biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region has to be
					    reachable without a pointer, WCAG 2.1.1, and `tabindex` is the only way to
					    give a scroll container keyboard focus. */}
					<section className="daw" tabIndex={0} aria-label={scrollLabel} data-timeline-scroller>
						<div className="daw-grid">
							<div className="daw-ruler" aria-hidden="true">
								<div className="daw-ruler-gutter" />
								<div className="daw-ruler-track">
									{bars.map(year => (
										<span key={year} className="daw-bar">
											{year}
										</span>
									))}
								</div>
							</div>

							<ol className="daw-lanes">
								{arrangement.lanes.map((lane, index) => (
									<li key={lane.entry.id ?? lane.entry.period} className="daw-lane">
										<div className="daw-lane-header">
											<span className="daw-period">{lane.entry.period}</span>
											<span className="daw-switches" aria-hidden="true">
												<span className="daw-switch">S</span>
												<span className="daw-switch">M</span>
											</span>
										</div>
										<div className="daw-track">
											<div
												className={`daw-clip ${CLIP_FILLS[index % CLIP_FILLS.length]}`}
												style={{ '--offset': lane.offset, '--length': lane.length } as React.CSSProperties}
											>
												<h3 className="daw-clip-title">{lane.entry.label}</h3>
												{lane.entry.detail ? <p className="daw-clip-detail">{lane.entry.detail}</p> : null}
											</div>
										</div>
									</li>
								))}
							</ol>

							{/* Static, and unmistakable anyway. Lemon rather than magenta: on grape,
							    lemon measures 3.84:1 and magenta 1.58:1, which would vanish. */}
							<span
								className="daw-playhead"
								style={{ '--offset': playhead } as React.CSSProperties}
								aria-hidden="true"
							/>
						</div>
					</section>
				</div>
			</div>
		</section>
	)
}
