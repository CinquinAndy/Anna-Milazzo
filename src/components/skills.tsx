import { Ornament } from '@/components/ornament'
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
		<section
			className="relative border-b-brutal border-border bg-secondary px-5 py-14 sm:px-8 md:py-20"
			data-enter
			data-skills
		>
			<div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[minmax(0,18rem)_1fr] md:gap-14">
				<div className="relative self-start">
					<h2 className="font-display uppercase [font-stretch:88%]">{skills?.heading}</h2>
					{/* Below the heading box, not behind the glyphs: an ornament under type is
					    the one way this layer could cost contrast. */}
					<Ornament kind="underline" tone="magenta" rotation={-2} className="-bottom-6 left-0 h-4 w-40" />
				</div>
				<ul className="flex flex-wrap gap-3">
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
		</section>
	)
}
