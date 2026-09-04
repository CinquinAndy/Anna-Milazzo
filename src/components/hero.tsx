import { Ornament } from '@/components/ornament'
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
 * Laid out to the Italian string: the tagline runs 74 characters in Italian against 62 in
 * English, and short strings expand 200-300%, so the column widths are set by the Italian.
 */
export function Hero({ hero }: { hero: Home['hero'] }) {
	return (
		<section
			data-enter
			className="relative overflow-hidden border-b-brutal border-border bg-primary px-5 py-16 sm:px-8 md:py-24"
		>
			<Ornament kind="asterisk" tone="sheet" rotation={-13} className="top-6 left-4 h-10 w-10 sm:h-14 sm:w-14" />
			<Ornament kind="cross" tone="magenta" rotation={22} className="bottom-8 left-8 h-7 w-7 sm:h-10 sm:w-10" />

			<div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.05fr_1fr] md:gap-10">
				<div className="relative">
					{/* Larger than the h1 token, which is sized for section headings. The hero
					    name is the one place on the site that should be as big as it can be and
					    still hold the Italian on two lines at 375px. */}
					<h1 className="font-display text-[clamp(3rem,10vw,7.5rem)] leading-display text-primary-foreground uppercase break-words [font-stretch:76%] [letter-spacing:-0.025em]">
						{hero?.name}
					</h1>
					<p className="mt-6 max-w-prose font-sans text-lg text-primary-foreground sm:text-xl md:text-2xl">
						{hero?.tagline}
					</p>
					{/* The arrow leans toward the portrait: it is the one ornament here doing
					    compositional work rather than filling a corner. */}
					<Ornament kind="arrow" tone="sheet" rotation={-6} className="-bottom-10 left-2 hidden h-10 w-24 md:block" />
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
		</section>
	)
}
