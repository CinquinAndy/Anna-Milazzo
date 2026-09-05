import { ContactForm } from '@/components/contact-form'
import { Ornament } from '@/components/ornament'
import { SectionTitle } from '@/components/section-title'
import type { Contact } from '@/payload-types'

/**
 * The desk: what to write, and where to write it.
 *
 * Cantaloupe because that is the ground the five Song folders already sit on, so a sixth
 * sheet of the same paper needs no explaining.
 *
 * The note comes first in the DOM at every width, so the reading order is "here is what to
 * say" and then "here is where to say it". The real cost of a bare textarea is the round
 * trip: "can you make music for my film" takes four questions before either party learns
 * anything, and five points collect the project, the length, the deadline, the budget and a
 * reference without adding a single control to the form.
 */
export function ContactDesk({
	copy,
	locale,
	contactEmail,
}: {
	copy: Contact
	locale: string
	contactEmail: string | null | undefined
}) {
	const brief = copy.brief
	const points = brief?.points ?? []

	return (
		<section
			data-enter
			aria-labelledby="scrivetemi"
			className="relative overflow-hidden border-b-brutal border-border bg-accent text-accent-foreground"
		>
			{copy.form?.heading ? <SectionTitle id="scrivetemi">{copy.form.heading}</SectionTitle> : null}

			<div className="relative px-5 py-16 sm:px-8 md:py-24">
				<Ornament kind="sparkle" tone="ink" rotation={7} className="top-10 right-6 h-8 w-8 sm:h-11 sm:w-11" />

				<div className="shell grid items-start gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
					{brief?.heading ? (
						<div className="relative mx-auto w-full max-w-xl lg:mx-0">
							<span
								aria-hidden="true"
								className="tape tape-on-colour -top-2 left-10 z-10 [--tape-tint:var(--sheet)] rotate-[-39deg]"
							/>
							<span
								aria-hidden="true"
								className="tape tape-on-colour -top-2 right-8 z-10 [--tape-tint:var(--blue)] rotate-[43deg]"
							/>
							<div className="rotate-[-0.7deg] border-brutal border-border bg-card p-6 shadow-2xl sm:p-8">
								{/* The ornament is absolutely positioned by construction, so it needs a
								    positioned box of its own or it lands wherever the card's corner is. */}
								<span className="relative inline-block">
									<h3 className="font-display text-2xl uppercase [font-stretch:92%]">{brief.heading}</h3>
									<Ornament kind="underline" tone="magenta" rotation={-9} className="-bottom-2 left-0 h-3 w-full" />
								</span>
								<div className="mt-5" />
								{brief.intro ? <p className="font-sans text-base leading-relaxed">{brief.intro}</p> : null}
								{points.length > 0 ? (
									// An ordered list, so the count is announced. The drawn numerals are a CSS
									// counter and are generated content, which assistive technology skips.
									<ol className="brief-list mt-6">
										{points.map(point => (
											<li key={point.id ?? point.text} className="brief-point font-sans text-base leading-relaxed">
												<span>{point.text}</span>
											</li>
										))}
									</ol>
								) : null}
							</div>
						</div>
					) : null}

					{/* Square to the page, and the only object in this section that is: a tilted card
					    can be read and cannot be written on, and rotating a container skews every
					    focus outline inside it. */}
					<ContactForm copy={copy} locale={locale} contactEmail={contactEmail} />
				</div>
			</div>
		</section>
	)
}
