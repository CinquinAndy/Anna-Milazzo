import { Ornament } from '@/components/ornament'
import { Vinyl } from '@/components/vinyl'
import type { Home } from '@/payload-types'

/**
 * Who Anna is, in her own words. Every string comes from Payload (ADR-0003).
 *
 * The first build set a heading beside a paragraph, which the client fairly called another
 * line in a CV. Two things change that without inventing content she has not written: the
 * ground is ruled as a musical stave — five lines with nothing on them, which says "this
 * is where music gets written" without a single glyph — and the paragraph is lifted onto
 * a tilted, taped card, so the text reads as a statement placed on the page rather than as
 * body copy filling a column.
 */
export function About({ about }: { about: Home['about'] }) {
	if (!about?.heading && !about?.body) {
		return null
	}

	return (
		<section
			data-enter
			className="stave-ground relative overflow-hidden border-b-brutal border-border px-5 py-16 sm:px-8 md:py-24"
			data-about
		>
			<Ornament kind="arrow" rotation={7} className="top-8 right-5 h-8 w-16 sm:right-10 sm:h-10 sm:w-20" />
			{/* Half off the section's own left edge and well below the heading. Anchored to the
			    section rather than to the heading column, where it covered the words. */}
			<Vinyl
				className="pointer-events-none absolute -bottom-16 -left-20 hidden h-56 w-56 md:block"
				label="var(--spring)"
				rotation={12}
			/>

			<div className="relative mx-auto grid max-w-6xl items-start gap-10 md:grid-cols-[minmax(0,20rem)_1fr] md:gap-14">
				<h2 className="font-display uppercase [font-stretch:88%]">{about?.heading}</h2>

				{about?.body ? (
					<div className="relative">
						<span aria-hidden="true" className="tape -top-2 left-8 [--tape-tint:var(--blue)] rotate-[-42deg]" />
						<span aria-hidden="true" className="tape -top-2 right-10 [--tape-tint:var(--lemon)] rotate-[41deg]" />
						{/* `whitespace-pre-line` so Anna can break a paragraph in the CMS without
						    HTML. Set larger than body copy: this is the only prose on the landing
						    page a Recruiter is guaranteed to read. */}
						<p className="rotate-[-0.6deg] border-brutal border-border bg-sheet p-6 font-sans text-lg leading-relaxed whitespace-pre-line shadow-xl sm:p-8 sm:text-xl">
							{about.body}
						</p>
					</div>
				) : null}
			</div>
		</section>
	)
}
