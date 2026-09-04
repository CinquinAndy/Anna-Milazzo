import { Portrait } from '@/components/portrait'
import type { Home, Song } from '@/payload-types'

/**
 * Tape angles, by position in the stack.
 *
 * Deterministic rather than random: a random angle differs between the server render and
 * the client, and the same value on every strip reads as a repeated component, which is
 * the tell the design is trying to avoid. Never zero, never the same twice in a row.
 */
const TAPE_ANGLES = [-44, -39, -47, -41, -45, -38] as const

function tapeAngle(index: number, side: 'start' | 'end'): number {
	const base = TAPE_ANGLES[index % TAPE_ANGLES.length] ?? -43
	// The two strips mirror each other across the cover.
	return side === 'start' ? base : -base + 3
}

/**
 * One Song, presented as a paper folder: a tabbed shape with the cover taped on and the
 * title, story and link beside it.
 *
 * An `<article>` inside a list item — never a tab interface. The shape is a filing
 * metaphor; the content is a body of work that is all visible at once. `role="tab"` would
 * promise arrow-key navigation between mutually exclusive panels and announce "tab 1 of
 * 5, selected" for something that is simply always there.
 */
export function Folder({ song, index, labels }: { song: Song; index: number; labels: Home['songs'] }) {
	// Alternating down the column, so tabs never collide as the stack scrolls.
	const tabSide = index % 2 === 0 ? 'start' : 'end'
	const position = String(index + 1).padStart(2, '0')

	return (
		<article className="folder" data-song={song.reference ?? undefined} data-tab={tabSide}>
			{/* Decorative repetition: the number carries no information the heading does not. */}
			<div className="folder-tab" aria-hidden="true">
				{position}
			</div>

			<div className="folder-body grid gap-6 p-5 sm:p-7 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-8">
				<div className="relative w-full max-w-[16rem] justify-self-center md:justify-self-start">
					<Portrait
						image={song.cover}
						sizes="(min-width: 768px) 16rem, 70vw"
						className="block w-full border-brutal border-border bg-background"
					/>
					{/* Siblings that overflow the cover, not children clipped by it: the strip
					    has to bridge the image and the paper behind it or the illusion dies. */}
					<span
						aria-hidden="true"
						className="tape -top-3 -left-6"
						style={{ transform: `rotate(${tapeAngle(index, 'start')}deg)` }}
					/>
					<span
						aria-hidden="true"
						className="tape -top-3 -right-6"
						style={{ transform: `rotate(${tapeAngle(index, 'end')}deg)` }}
					/>
				</div>

				<div className="min-w-0">
					<h3 className="font-display uppercase [font-stretch:88%]">{song.title}</h3>

					{song.story ? (
						<p className="mt-4 max-w-prose font-sans leading-relaxed whitespace-pre-line">{song.story}</p>
					) : null}

					<div className="mt-6 flex flex-wrap items-center gap-3">
						{/* Present, and does nothing until ticket 08 wires the player. */}
						<button type="button" className="control control-primary" data-play={song.reference ?? undefined}>
							{labels?.listenLabel}
						</button>

						{/* No link at all rather than a dead one. */}
						{song.platformUrl ? (
							<a
								href={song.platformUrl}
								className="control control-paper"
								rel="noreferrer noopener"
								target="_blank"
								data-platform-link
							>
								{labels?.platformLabel}
							</a>
						) : null}
					</div>
				</div>
			</div>
		</article>
	)
}
