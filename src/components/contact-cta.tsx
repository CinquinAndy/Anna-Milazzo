import Link from 'next/link'
import { DitherPanel } from '@/components/dither-panel'
import { Ornament } from '@/components/ornament'
import { type Locale, localeHref } from '@/lib/locale'
import type { Home } from '@/payload-types'

/**
 * The last thing a Recruiter sees before the footer, and the only thing on the page whose
 * job is to be pressed.
 *
 * A full-width magenta block rather than a heading with a button under it. Magenta is the
 * one colour in the palette barred from being a section, precisely so that when it does
 * appear at this size it cannot be mistaken for the page continuing — it reads as an object
 * placed on the page. Black type on it measures 6.04:1.
 *
 * The client asked for the shape of a shader card he had found: a dithered field drifting
 * behind a badge, a large heading and one button. That card is not usable here — it wants a
 * WebGL package this project already evaluated and turned down, a dark mode this project
 * forbids, and blurs, gradients and a 48px radius the system has no room for — so the
 * composition is borrowed and the drawing is the page's own. The field is the hero's
 * dithering, the badge is a hard-edged block rather than a pill, and the button is the
 * `.control` every other press target on the site already uses.
 */
export function ContactCta({ cta, locale }: { cta: Home['contactCta']; locale: Locale }) {
	return (
		<section data-enter className="relative px-5 py-14 sm:px-8 md:py-20">
			<div className="shell">
				<div className="cta-block relative overflow-hidden border-brutal border-border bg-magenta text-magenta-foreground shadow-2xl">
					{/* First child, so it paints under the ornaments rather than over them:
					    between positioned siblings the later one wins. */}
					<DitherPanel />

					<Ornament kind="asterisk" tone="sheet" rotation={11} className="top-5 right-5 h-10 w-10 sm:h-14 sm:w-14" />
					<Ornament kind="cross" tone="ink" rotation={-16} className="bottom-8 left-8 h-6 w-6 sm:h-8 sm:w-8" />

					<div className="relative z-10 flex w-full flex-col items-center gap-8 px-6 py-16 text-center sm:px-12 sm:py-24">
						{cta?.badge ? (
							<p className="cta-badge">
								{/* A square, not a dot. Nothing on this page is round unless the thing
								    it draws is round, and a status light is a light. It blinks in two
								    steps rather than fading, which is the motion vocabulary the rest of
								    the page keeps to. */}
								<span aria-hidden="true" className="cta-badge-light" />
								{cta.badge}
							</p>
						) : null}

						<h2 className="max-w-4xl font-display text-balance uppercase [font-stretch:88%]">{cta?.heading}</h2>

						{cta?.body ? <p className="max-w-2xl font-sans text-lg text-pretty sm:text-xl">{cta.body}</p> : null}

						{/* Sheet, not ink: a black button on magenta merges with its own black offset
						    shadow into one muddy mass. A near-white fill keeps the keyline and the
						    shadow legible, and is the highest-contrast press target on this field. */}
						<Link
							href={localeHref('/contact', locale)}
							className="control control-paper cta-button text-lg sm:text-xl"
							data-contact-cta
						>
							{cta?.buttonLabel}
							{/* Drawn rather than imported. The reference reaches for an icon package
							    for one arrow; this is nine bytes of path and it inherits the weight of
							    the type beside it. */}
							<svg className="cta-arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
								<path d="M4 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.5" />
							</svg>
						</Link>
					</div>
				</div>
			</div>
		</section>
	)
}
