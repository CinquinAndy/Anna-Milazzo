import Link from 'next/link'
import { Ornament } from '@/components/ornament'
import { type Locale, localeHref } from '@/lib/locale'
import type { Home } from '@/payload-types'

/**
 * The last thing a Recruiter sees before the footer, and the only thing on the page whose
 * job is to be pressed.
 *
 * A full-width magenta block rather than a heading with a button under it. Magenta is the
 * one colour in the palette barred from being a section, precisely so that when it does
 * appear at this size it cannot be mistaken for the page continuing — it reads as an
 * object placed on the page. Black type on it measures 6.04:1.
 */
export function ContactCta({ cta, locale }: { cta: Home['contactCta']; locale: Locale }) {
	return (
		<section data-enter className="relative px-5 py-14 sm:px-8 md:py-20">
			<div className="shell">
				<div className="relative border-brutal border-border bg-magenta px-6 py-12 text-magenta-foreground shadow-2xl sm:px-12 sm:py-16">
					<Ornament kind="asterisk" tone="sheet" rotation={11} className="top-5 right-5 h-10 w-10 sm:h-14 sm:w-14" />
					<Ornament kind="cross" tone="ink" rotation={-16} className="bottom-8 left-8 h-6 w-6 sm:h-8 sm:w-8" />

					<div className="flex max-w-3xl flex-col items-start gap-6">
						<h2 className="font-display uppercase [font-stretch:88%]">{cta?.heading}</h2>
						{cta?.body ? <p className="max-w-prose font-sans text-lg sm:text-xl">{cta.body}</p> : null}
						{/* Sheet, not ink: a black button on magenta merges with its own black
						    offset shadow into one muddy mass. A near-white fill keeps the keyline
						    and the shadow legible, and is the highest-contrast press target
						    available on this field. */}
						<Link
							href={localeHref('/contact', locale)}
							className="control control-paper text-lg sm:text-xl"
							data-contact-cta
						>
							{cta?.buttonLabel}
						</Link>
					</div>
				</div>
			</div>
		</section>
	)
}
