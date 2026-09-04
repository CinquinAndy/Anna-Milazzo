import { Ornament } from '@/components/ornament'
import { SectionTitle } from '@/components/section-title'
import { Vinyl } from '@/components/vinyl'
import type { Home } from '@/payload-types'

/**
 * Who Anna is, in her own words. Every string comes from Payload (ADR-0003).
 *
 * The first build set a heading beside a paragraph, which the client fairly called another
 * line in a CV. It then spent a pass ruled as a musical stave, which he did not want
 * either — and he was right that the answer was not a second texture. So the section is a
 * colour field like every other one: green, the only surface in the palette not already
 * spoken for between the blue above it and the lemon below, and separated from the lemon
 * by the black band that opens the next section.
 *
 * The paragraph is lifted onto a tilted, taped card, so the text reads as a statement
 * placed on the page rather than as body copy filling a column.
 */
export function About({ about }: { about: Home['about'] }) {
	if (!about?.heading && !about?.body) {
		return null
	}

	return (
		<section
			data-enter
			className="relative overflow-hidden border-b-brutal border-border bg-spring text-spring-foreground"
			data-about
		>
			{about?.heading ? <SectionTitle>{about.heading}</SectionTitle> : null}
			<div className="relative px-5 py-16 sm:px-8 md:py-20">
				<Ornament kind="arrow" rotation={7} className="top-2 right-5 h-8 w-16 sm:right-10 sm:h-10 sm:w-20" />
				{/* Half off the section's own left edge. The label takes the cantaloupe so the
				    record is not a green disc on a green field. */}
				<Vinyl
					className="pointer-events-none absolute -bottom-24 -left-24 hidden h-64 w-64 md:block"
					label="var(--cantaloupe)"
					rotation={12}
				/>

				<div className="relative mx-auto max-w-4xl">
					{about?.body ? (
						<div className="relative">
							<span
								aria-hidden="true"
								className="tape tape-on-colour -top-2 left-8 [--tape-tint:var(--sheet)] rotate-[-42deg]"
							/>
							<span
								aria-hidden="true"
								className="tape tape-on-colour -top-2 right-10 [--tape-tint:var(--lemon)] rotate-[41deg]"
							/>
							{/* `whitespace-pre-line` so Anna can break a paragraph in the CMS without
						    HTML. Set larger than body copy: this is the only prose on the landing
						    page a Recruiter is guaranteed to read. */}
							<p className="rotate-[-0.6deg] border-brutal border-border bg-sheet p-6 font-sans text-lg leading-relaxed whitespace-pre-line shadow-xl sm:p-8 sm:text-xl">
								{about.body}
							</p>
						</div>
					) : null}
				</div>
			</div>
		</section>
	)
}
