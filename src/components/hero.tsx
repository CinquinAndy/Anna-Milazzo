import { Portrait } from '@/components/portrait'
import type { Home } from '@/payload-types'

/**
 * The first two seconds. Anna's name set typographically, the line that says what she
 * does, and her face — so the person feels real rather than a list of files.
 *
 * Laid out to the Italian string: the tagline is 74 characters in Italian against 62 in
 * English, and the composition has to hold at the longer one.
 */
export function Hero({ hero }: { hero: Home['hero'] }) {
	return (
		<section className="relative border-b-brutal border-border bg-primary px-5 py-14 sm:px-8 md:py-20">
			<div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.2fr_1fr] md:gap-14">
				<div>
					<h1 className="font-display text-primary-foreground uppercase break-words [font-stretch:85%]">
						{hero?.name}
					</h1>
					<p className="mt-6 max-w-prose font-sans text-lg text-primary-foreground sm:text-xl md:text-2xl">
						{hero?.tagline}
					</p>
				</div>

				{/* The portrait as a physical object: black keyline, hard offset shadow, sitting
				    on the colour block rather than floating over it. */}
				<div className="justify-self-center md:justify-self-end">
					<Portrait
						image={hero?.portrait}
						priority
						sizes="(min-width: 768px) 24rem, 60vw"
						className="block w-full max-w-[18rem] border-brutal border-border bg-card shadow-xl md:max-w-[24rem]"
					/>
				</div>
			</div>
		</section>
	)
}
