import { DawEdge } from '@/components/daw-edge'
import { SectionTitle } from '@/components/section-title'
import { TimelineClip } from '@/components/timeline-clip'
import type { Locale } from '@/lib/locale'
import { KIND_FILLS, KIND_LABELS, kindOf, TIMELINE_COPY, TIMELINE_KINDS } from '@/lib/timeline/kinds'
import { arrange } from '@/lib/timeline/span'
import type { Home } from '@/payload-types'

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
export function Timeline({
	timeline,
	scrollLabel,
	locale,
}: {
	timeline: Home['timeline']
	scrollLabel: string
	locale: Locale
}) {
	const entries = timeline?.entries ?? []
	const arrangement = arrange(entries, entry => entry.period)

	if (entries.length === 0 || arrangement === null) {
		return null
	}

	// The colour of a clip is the kind of thing it is: a degree, a certificate, a project, or
	// an experience. Said in words in the lane's gutter as well, because a colour on its own
	// is not something a reader can be asked to rely on, and keyed once above the strip, but
	// only the kinds Anna has actually used, and only when there is more than one to tell apart.
	const kinds = TIMELINE_KINDS.filter(kind => arrangement.lanes.some(lane => kindOf(lane.entry.kind) === kind))
	const copy = TIMELINE_COPY[locale]

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
					{kinds.length > 1 ? (
						<ul className="daw-legend" aria-hidden="true">
							{kinds.map(kind => (
								<li key={kind} className="daw-legend-item">
									<span className={`daw-swatch ${KIND_FILLS[kind]}`} />
									{KIND_LABELS[kind][locale]}
								</li>
							))}
						</ul>
					) : null}

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
								{arrangement.lanes.map(lane => {
									const kind = kindOf(lane.entry.kind)

									return (
										<li key={lane.entry.id ?? lane.entry.period} className="daw-lane">
											<div className="daw-lane-header">
												<span className="daw-period">{lane.entry.period}</span>
												<span className="daw-kind">
													<span className={`daw-swatch ${KIND_FILLS[kind]}`} aria-hidden="true" />
													{KIND_LABELS[kind][locale]}
												</span>
												<span className="daw-switches" aria-hidden="true">
													<span className="daw-switch">S</span>
													<span className="daw-switch">M</span>
												</span>
											</div>
											<div className="daw-track">
												<TimelineClip
													className={`daw-clip ${KIND_FILLS[kind]}`}
													style={{ '--offset': lane.offset, '--length': lane.length } as React.CSSProperties}
													title={lane.entry.label}
													expandLabel={copy.expand}
													collapseLabel={copy.collapse}
												>
													<h3 className="daw-clip-title">{lane.entry.label}</h3>
													{lane.entry.detail ? <p className="daw-clip-detail">{lane.entry.detail}</p> : null}
												</TimelineClip>
											</div>
										</li>
									)
								})}
							</ol>

							{/* Static, and unmistakable anyway. Lemon rather than magenta: on grape,
							    lemon measures 3.84:1 and magenta 1.58:1, which would vanish. */}
							<span
								className="daw-playhead"
								style={{ '--offset': playhead } as React.CSSProperties}
								aria-hidden="true"
							/>

							{/* The arrangement is wider than the strip at every viewport below about
							    1700px, and 74% of it is off-screen on a phone, where two of the five
							    lanes render as completely empty track. This says the strip continues,
							    and it says it only while it is true: its presence is a scroll-state
							    query on the strip itself, with a JavaScript fallback for the engines
							    that cannot answer it, so it is drawn when there is arrangement to the
							    right and gone when there is not. Inside the scroller, because that is
							    what the query can reach, and sticky so a drag cannot carry it away
							    from the edge it describes. */}
							<DawEdge />
						</div>
					</section>
				</div>
			</div>
		</section>
	)
}
