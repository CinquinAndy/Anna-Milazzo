import { Ornament } from '@/components/ornament'
import { SectionTitle } from '@/components/section-title'
import type { Contact, Setting } from '@/payload-types'

/**
 * The card index: the four questions that decide whether a Recruiter writes at all.
 *
 * Reply time, languages, where she is and how fees work were all unanswered, and every one
 * of them is the kind of thing somebody sends an email to ask before sending the email they
 * actually wanted to send.
 *
 * Drawn with the landing's own Folder classes, so the last thing the page says is her
 * filing system answering questions. A description list rather than cards with headings:
 * these are terms and their values, and that is what a `dl` is.
 *
 * Every value is deliberately dateless. A claim with a date in it is a claim she has to
 * remember to change, and a stale one reads as an abandoned site.
 */
export function ContactFacts({ copy, settings }: { copy: Contact; settings: Setting }) {
	const practical = copy.practical
	const entries = practical?.entries ?? []
	const links = settings.socialLinks ?? []
	const elsewhere = copy.direct?.elsewhereHeading

	if (entries.length === 0 && links.length === 0) {
		return null
	}

	return (
		<section
			data-enter
			aria-labelledby="in-pratica"
			className="relative border-b-brutal border-border bg-secondary text-secondary-foreground"
		>
			{practical?.heading ? <SectionTitle id="in-pratica">{practical.heading}</SectionTitle> : null}

			<div className="relative px-5 py-16 sm:px-8 md:py-24">
				<Ornament kind="asterisk" tone="ink" rotation={31} className="top-10 right-6 h-9 w-9 sm:h-12 sm:w-12" />
				<Ornament kind="cross" tone="ink" rotation={14} className="bottom-10 left-6 h-6 w-6 sm:h-8 sm:w-8" />

				<div className="shell grid items-start gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
					{entries.length > 0 ? (
						<dl className="grid gap-10 sm:grid-cols-2">
							{entries.map((entry, index) => (
								// Alternating, so two tabs never collide down a column.
								<div key={entry.id ?? entry.term} className="folder" data-tab={index % 2 === 0 ? 'start' : 'end'}>
									<dt className="folder-tab">{entry.term}</dt>
									<dd className="folder-body p-5 font-sans text-base leading-relaxed sm:p-6">{entry.value}</dd>
								</div>
							))}
						</dl>
					) : null}

					{links.length > 0 && elsewhere ? (
						<div className="justify-self-start">
							<h3 className="font-display text-2xl uppercase [font-stretch:92%]">{elsewhere}</h3>
							{/* Full size controls rather than the 12px underlined text in the footer: a
							    Recruiter who wants to hear more before writing should not have to hunt
							    in the colophon. */}
							<ul className="mt-6 flex list-none flex-col items-start gap-4 p-0">
								{links.map(link => (
									<li key={link.id ?? link.url}>
										<a
											href={link.url}
											target="_blank"
											rel="noreferrer noopener"
											className="control control-paper control-wrap text-base"
										>
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>
					) : null}
				</div>
			</div>
		</section>
	)
}
