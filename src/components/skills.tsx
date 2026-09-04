import { Ornament } from '@/components/ornament'
import { SectionTitle } from '@/components/section-title'
import type { Home } from '@/payload-types'

/**
 * What Anna claims she can do, so a Recruiter can match her to a role.
 *
 * A list, not a paragraph: a screen reader announces how many there are, and the tags
 * wrap rather than scroll at 375px.
 */
/* Cycled so no two neighbours share a fill. Every one of these carries black type and a
 * black keyline, so the ground they sit on does not constrain them — which is what lets
 * them be loud on the lemon. The first build made every tag `bg-card`: white on sand. */
const TAG_FILLS = ['bg-sheet', 'bg-spring', 'bg-magenta', 'bg-accent'] as const

export function Skills({ skills }: { skills: Home['skills'] }) {
	const entries = skills?.entries ?? []
	if (entries.length === 0) {
		return null
	}

	return (
		<section className="relative border-b-brutal border-border bg-secondary" data-enter data-skills>
			{skills?.heading ? <SectionTitle>{skills.heading}</SectionTitle> : null}

			<div className="relative px-5 py-14 sm:px-8 md:py-20">
				{/* No column for a heading any more — it lives in the band above — so the tags
				    take the whole measure rather than sitting in a well beside an empty gutter. */}
				<div className="relative mx-auto max-w-6xl">
					<Ornament kind="underline" tone="magenta" rotation={-2} className="-top-7 left-1 h-4 w-40" />
					<ul className="flex flex-wrap gap-3 sm:gap-4">
						{entries.map((entry, index) => (
							<li
								key={entry.id ?? entry.name}
								className={`border-brutal border-border ${TAG_FILLS[index % TAG_FILLS.length]} px-4 py-2 font-mono text-sm text-foreground shadow-sm`}
							>
								{entry.name}
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	)
}
