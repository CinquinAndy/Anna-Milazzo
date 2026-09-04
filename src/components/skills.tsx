import { Console } from '@/components/console'
import { Ornament } from '@/components/ornament'
import { SectionTitle } from '@/components/section-title'
import type { Home } from '@/payload-types'

/**
 * What Anna claims she can do, so a Recruiter can match her to a role.
 *
 * A list, not a paragraph: a screen reader announces how many there are, and the tags
 * wrap rather than scroll at 375px.
 *
 * The tags alone left most of the lemon field empty, which read as a list floating in a
 * colour. A mixing desk fills it — equipment rather than ornament, and the one thing here
 * that says studio without a word.
 */

/* Cycled so no two neighbours share a fill. Every one of these carries black type and a
 * black keyline, so the ground they sit on does not constrain them — which is what lets
 * them be loud on the lemon. The first build made every tag `bg-card`: white on sand. */
const TAG_FILLS = ['bg-sheet', 'bg-spring', 'bg-magenta', 'bg-accent'] as const

/* Tilts, in degrees. Deterministic rather than random — a random angle differs between the
 * server render and the client — and never zero, so no tag sits square to the grid. This
 * is what makes them read as things stuck on rather than cells in a table. */
const TAG_TILTS = [-2.2, 1.6, -1.1, 2.4, -1.8, 1.2, -2.6, 0.9] as const

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

					<div className="grid items-end gap-10 lg:grid-cols-[1fr_auto] lg:gap-14">
						<ul className="flex flex-wrap gap-3 sm:gap-4">
							{entries.map((entry, index) => (
								<li
									key={entry.id ?? entry.name}
									style={{ transform: `rotate(${TAG_TILTS[index % TAG_TILTS.length]}deg)` }}
									className={`border-brutal border-border ${TAG_FILLS[index % TAG_FILLS.length]} px-4 py-2 font-mono text-sm text-foreground shadow-md sm:text-base`}
								>
									{entry.name}
								</li>
							))}
						</ul>

						{/* Hidden below 1024px: at that width it would either shrink to eight
						    unreadable slivers or push the tags into a column. */}
						<Console className="hidden lg:flex" />
					</div>
				</div>
			</div>
		</section>
	)
}
