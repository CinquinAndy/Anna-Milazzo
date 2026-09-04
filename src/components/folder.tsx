import { Portrait } from '@/components/portrait'
import { SongTransport } from '@/components/song-transport'
import type { PlayableSong } from '@/lib/player/controller'
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

	// The audio URL comes from the record, already pointing at the bucket's public
	// domain. A Song without one has nothing to play.
	const trackUrl = typeof song.track === 'object' ? song.track.url : null
	// `reference` is a seed handle and a test selector, hidden from the admin — so every
	// Song Anna creates herself has none. Falling back to the record id keeps the player
	// present for those: gating on `reference` meant her own Songs arrived silently
	// unplayable, with nothing to tell her why.
	const playable: PlayableSong | null = trackUrl
		? { id: song.reference ?? String(song.id), source: trackUrl, durationSeconds: song.durationSeconds }
		: null

	return (
		<article className="folder" data-song={song.reference ?? String(song.id)} data-tab={tabSide}>
			{/* Decorative repetition: the number carries no information the heading does not. */}
			<div className="folder-tab" aria-hidden="true">
				{position}
			</div>

			<div className="folder-body grid gap-6 p-5 sm:p-7 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-8">
				<div className="relative w-full max-w-[16rem] justify-self-center md:justify-self-start">
					<Portrait
						image={song.cover}
						sizes="(min-width: 768px) 16rem, 70vw"
						className="block w-full border-brutal border-border bg-sheet"
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

					{playable === null ? null : (
						<SongTransport
							song={playable}
							playLabel={labels?.listenLabel ?? 'Play'}
							pauseLabel={labels?.pauseLabel ?? 'Pause'}
							seekLabel={labels?.seekLabel ?? 'Seek'}
						/>
					)}

					{/* No link at all rather than a dead one. */}
					{song.platformUrl ? (
						<a
							href={song.platformUrl}
							className="control control-paper mt-4 inline-flex"
							rel="noreferrer noopener"
							target="_blank"
							data-platform-link
						>
							{labels?.platformLabel}
						</a>
					) : null}
				</div>
			</div>
		</article>
	)
}
