import { DitherPanel } from '@/components/dither-panel'
import { Ornament } from '@/components/ornament'
import type { Contact } from '@/payload-types'

/**
 * The top of the contact page: what she takes on, and where to write.
 *
 * Full bleed and left aligned, carrying the page's `h1`. Deliberately not the shape of the
 * landing's call to action, which is a bounded centred block with an `h2` in it: if the
 * thing you arrive at looks like the thing you pressed, the press reads as a no-op.
 *
 * The address is above the form rather than below it. Somebody who is not going to fill in
 * a web form should not have to scroll past one to find an email address, and the form's
 * own failure message already tells them to write directly.
 */
export function ContactArrival({
	copy,
	contactEmail,
}: {
	copy: Contact
	/** From Settings, and the only place the address lives. */
	contactEmail: string | null | undefined
}) {
	if (!copy.heading) {
		return null
	}

	const direct = copy.direct

	return (
		<section
			data-enter
			aria-labelledby="contatti"
			className="relative overflow-hidden border-b-brutal border-border bg-primary text-primary-foreground"
		>
			{/* First child, so it paints under the ornaments rather than over them. Darkening
			    rather than lightening, because the type here is sheet: measured, lightening the
			    blue takes it to 3.68:1 and darkening takes it to 8.15:1. */}
			<DitherPanel ground="--blue" toward="--ink" />

			<div className="relative z-10 px-5 py-16 sm:px-8 md:py-28">
				<Ornament kind="asterisk" tone="sheet" rotation={-21} className="top-8 right-6 h-10 w-10 sm:h-14 sm:w-14" />
				<Ornament kind="cross" tone="sheet" rotation={27} className="bottom-8 left-6 h-6 w-6 sm:h-9 sm:w-9" />

				<div className="shell grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
					<div>
						<h1 id="contatti" className="font-display uppercase [font-stretch:88%]">
							{copy.heading}
						</h1>
						{copy.intro ? (
							<p className="mt-6 max-w-prose font-sans text-xl text-pretty sm:text-2xl">{copy.intro}</p>
						) : null}
					</div>

					{/* The address slip. Taped and tilted like everything else pinned to this page's
					    wall, and absent entirely when there is no address to put on it. */}
					{contactEmail && direct?.heading ? (
						<div className="relative mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end">
							<span
								aria-hidden="true"
								className="tape tape-on-colour -top-2 left-8 z-10 [--tape-tint:var(--lemon)] rotate-[-44deg]"
							/>
							<span
								aria-hidden="true"
								className="tape tape-on-colour -top-2 right-10 z-10 [--tape-tint:var(--cantaloupe)] rotate-[41deg]"
							/>
							<div className="rotate-[1.1deg] border-brutal border-border bg-card p-6 text-foreground shadow-2xl sm:p-8">
								<h2 className="font-display text-2xl uppercase [font-stretch:92%]">{direct.heading}</h2>
								{direct.note ? <p className="mt-3 font-sans text-base leading-relaxed">{direct.note}</p> : null}
								{/* Set as a control so it is a press target, and as text so it can be
								    copied by somebody who would rather paste it into their own client. */}
								<a href={`mailto:${contactEmail}`} className="control control-accent mt-6 font-mono text-base">
									{contactEmail}
								</a>
							</div>
						</div>
					) : null}
				</div>
			</div>
		</section>
	)
}
