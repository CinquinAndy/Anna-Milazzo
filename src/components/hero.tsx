import Link from 'next/link'
import { DitherField } from '@/components/dither-field'
import { Ornament } from '@/components/ornament'
import { Piano } from '@/components/piano'
import { Portrait } from '@/components/portrait'
import { Badge, Vinyl } from '@/components/vinyl'
import type { Home } from '@/payload-types'

/**
 * The first two seconds.
 *
 * The first build set the name and a line of text beside a bordered rectangle, which said
 * who she is but nothing about what she does. Here the composition carries the second
 * half: a record sits behind the portrait, a badge overlaps its corner, the portrait is
 * tilted so it reads as an object placed on the page rather than a slot filled with an
 * image. The record is the only thing on the page that says "music" before a word is read.
 *
 * Full viewport on desktop, minus the sticky header's own height. The composition is
 * centred in whatever is left and the keyboard sits at the foot, so the first screenful is
 * the whole introduction rather than the top of it.
 *
 * Laid out to the Italian string: the tagline runs 74 characters in Italian against 62 in
 * English, and short strings expand 200-300%, so the column widths are set by the Italian.
 */

export function Hero({
	hero,
	listenLabel,
	contactLabel,
	contactHref,
}: {
	hero: Home['hero']
	listenLabel?: string | undefined
	contactLabel?: string | undefined
	contactHref: string
}) {
	return (
		<section
			data-enter
			className="relative flex flex-col overflow-hidden border-b-brutal border-border bg-primary px-5 py-16 sm:px-8 md:min-h-[calc(100svh-var(--header-h))] md:justify-between md:py-14"
		>
			{/* The corner marks stay on the section. Moved into the wrapper below, their
			    top-6 / bottom-8 offsets resolved against the field's box instead and the
			    asterisk slid down onto the name. */}
			<Ornament kind="asterisk" tone="sheet" rotation={-13} className="top-6 left-4 h-10 w-10 sm:h-14 sm:w-14" />
			<Ornament kind="cross" tone="magenta" rotation={22} className="bottom-8 left-8 h-7 w-7 sm:h-10 sm:w-10" />

			{/* The field's box ends where the keyboard begins, so the bars stand on it rather
			    than behind it. Scoped by a wrapper rather than by a bottom inset: the keyboard's
			    height differs between the mobile and desktop padding, and a hardcoded offset
			    would drift the moment either changed. */}
			<div className="relative flex flex-1 flex-col justify-center">
				<DitherField />

				<div className="shell grid items-center gap-12 md:grid-cols-[1.25fr_0.85fr] md:gap-10">
					<div className="relative">
						{/* Larger than the h1 token, which is sized for section headings. The hero
					    name is the one place on the site that should be as big as it can be and
					    still hold the Italian on two lines at 375px. */}
						<h1 className="font-display text-[clamp(3rem,11.5vw,11rem)] leading-display text-primary-foreground uppercase break-words [font-stretch:76%] [letter-spacing:-0.025em]">
							{hero?.name}
						</h1>
						<p className="mt-7 max-w-[40ch] font-sans text-xl text-primary-foreground sm:text-2xl md:text-[1.75rem] md:leading-snug">
							{hero?.tagline}
						</p>
						{/* Somewhere to go. Both labels are strings Anna already writes — the works
					    heading and the contact button — so the hero cannot promise a word the rest
					    of the page does not use. */}
						<div className="mt-9 flex flex-wrap items-center gap-4">
							{listenLabel ? (
								<a href="#ascolta" className="control control-accent text-lg" data-hero-listen>
									{listenLabel}
								</a>
							) : null}
							{contactLabel ? (
								<Link href={contactHref} className="control control-paper text-lg" data-hero-contact>
									{contactLabel}
								</Link>
							) : null}
						</div>

						{/* The arrow leans toward the portrait: it is the one ornament here doing
					    compositional work rather than filling a corner. */}
						<Ornament kind="arrow" tone="sheet" rotation={-6} className="-bottom-12 left-2 hidden h-10 w-24 md:block" />
					</div>

					{/* The composition. Everything is positioned against this square so the record,
				    the portrait and the badge keep their relationship at every width. */}
					<div className="relative mx-auto aspect-square w-full max-w-[22rem] md:mx-0 md:ms-auto md:max-w-[26rem]">
						{/* Behind and low, so a wide arc of the disc clears the photograph. Fully
					    hidden it is not composition, it is a wasted asset. */}
						<Vinyl
							className="absolute right-[-3%] bottom-[1%] block h-[66%] w-[66%]"
							label="var(--accent)"
							rotation={-6}
						/>
						<Portrait
							image={hero?.portrait}
							priority
							sizes="(min-width: 768px) 20rem, 60vw"
							className="absolute top-0 left-0 block w-[72%] -rotate-3 border-brutal border-border bg-sheet shadow-2xl"
						/>
						<Badge className="absolute top-[-5%] right-[8%] block h-[27%] w-[27%]" rotation={-10} />
					</div>
				</div>
			</div>

			{/* Piano is her first instrument, so the keyboard is about her rather than about
			    music in general. It plays a phrase to itself: a loop, because audio is periodic
			    and periodic graphics read as sound, where a one-shot ease reads as interface. */}
			<div className="shell mt-14 md:mt-16">
				<Piano />
			</div>
		</section>
	)
}
