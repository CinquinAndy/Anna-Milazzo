import { Ornament } from '@/components/ornament'
import { SectionTitle } from '@/components/section-title'
import { Arcs, ShapeStack } from '@/components/shapes'
import { Vinyl } from '@/components/vinyl'
import type { Home } from '@/payload-types'

/**
 * Who Anna is, in her own words. Every string comes from Payload (ADR-0003).
 *
 * This section has been rebuilt three times and each rebuild was the client being right.
 * First a heading beside a paragraph — another line in a CV. Then the ground ruled as a
 * musical stave, which was a second texture where the answer was not a texture at all. It
 * is now a colour field like every other section: green, the only surface in the palette
 * not already spoken for between the blue above and the lemon below, and separated from
 * the lemon by the black band that opens the next section.
 *
 * What was still wrong was that it held one card in a lot of empty green. The words Anna
 * has written are two sentences, and no amount of layout makes two sentences fill a screen.
 * So the section is furnished instead — a record, a cassette, a set of arcs, stars — and
 * the card sits among them rather than alone in the middle. Every one of those objects is
 * decoration, and the section reads correctly with all of them deleted, which is the test
 * that keeps this layer additive rather than load-bearing.
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

			<div className="relative px-5 py-20 sm:px-8 md:py-32">
				{/* Anchored to the section's corners rather than to the content, so they frame
				    the column instead of crowding it. */}
				<Arcs className="pointer-events-none absolute -top-10 -right-12 hidden h-52 w-52 rotate-180 sm:block md:h-72 md:w-72" />
				<Vinyl
					className="pointer-events-none absolute -bottom-28 -left-24 hidden h-72 w-72 md:block"
					label="var(--cantaloupe)"
					rotation={12}
				/>

				<Ornament kind="sparkle" tone="ink" rotation={-14} className="top-6 left-6 h-8 w-8 sm:h-12 sm:w-12" />
				<Ornament kind="sparkle" tone="sheet" rotation={9} className="right-8 bottom-16 h-7 w-7 sm:h-10 sm:w-10" />
				<Ornament kind="cross" tone="magenta" rotation={24} className="top-24 right-1/3 h-6 w-6 sm:h-9 sm:w-9" />

				<div className="shell relative grid items-center gap-14 lg:grid-cols-[1.35fr_1fr] lg:gap-20">
					{about?.body ? (
						<div className="relative mx-auto w-full max-w-2xl lg:mx-0">
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
							<p className="rotate-[-0.6deg] border-brutal border-border bg-sheet p-7 font-sans text-lg leading-relaxed whitespace-pre-line shadow-2xl sm:p-10 sm:text-xl md:text-2xl">
								{about.body}
							</p>
							<Ornament kind="underline" tone="magenta" rotation={-3} className="-bottom-8 left-10 h-4 w-48 sm:w-64" />
						</div>
					) : null}

					{/* Shapes, not a thing. Three objects were rejected here in a row; the client
					    asked for "formes" and kept being handed things to recognise. */}
					<div className="relative mx-auto w-full max-w-sm lg:mx-0">
						<ShapeStack className="block w-full" />
						<Ornament
							kind="sparkle"
							tone="magenta"
							rotation={-8}
							className="-top-10 -right-2 h-10 w-10 sm:h-14 sm:w-14"
						/>
						<Ornament kind="asterisk" tone="ink" rotation={17} className="-bottom-12 left-2 h-9 w-9 sm:h-12 sm:w-12" />
					</div>
				</div>
			</div>
		</section>
	)
}
