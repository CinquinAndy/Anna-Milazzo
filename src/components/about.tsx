import type { Home } from '@/payload-types'

/** Who Anna is, in her own words. Every string comes from Payload (ADR-0003). */
export function About({ about }: { about: Home['about'] }) {
	if (!about?.heading && !about?.body) {
		return null
	}

	return (
		<section className="border-b-brutal border-border px-5 py-14 sm:px-8 md:py-20">
			<div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[minmax(0,18rem)_1fr] md:gap-14">
				<h2 className="font-display uppercase [font-stretch:88%]">{about?.heading}</h2>
				{/* `whitespace-pre-line` so Anna can break a paragraph in the CMS without HTML. */}
				<p className="max-w-prose font-sans text-lg leading-relaxed whitespace-pre-line">{about?.body}</p>
			</div>
		</section>
	)
}
