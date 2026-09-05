import { Portrait } from '@/components/portrait'
import { SongTransport } from '@/components/song-transport'
import { Vinyl } from '@/components/vinyl'
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

/**
 * Tape tints, cycled down the stack. Deterministic for the same reason as the angles, and
 * paired so the two strips on one cover are never the same colour — real tape comes off
 * whichever roll is nearest, and a matched pair reads as a printed graphic.
 */
const TAPE_TINTS = [
	['var(--spring)', 'var(--lemon)'],
	['var(--blue)', 'var(--magenta)'],
	['var(--lemon)', 'var(--spring)'],
	['var(--magenta)', 'var(--blue)'],
] as const

function tapeTint(index: number, side: 'start' | 'end'): string {
	const pair = TAPE_TINTS[index % TAPE_TINTS.length] ?? TAPE_TINTS[0]
	return side === 'start' ? pair[0] : pair[1]
}

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
	// Measured from the file on upload and stored on the audio record, so the waveform
	// is right on the first frame and costs the visitor nothing to draw.
	const trackPeaks = typeof song.track === 'object' ? (song.track.peaks ?? null) : null
	// Measured beside the waveform on upload: where the track's energy sits in the spectrum
	// over its length, which is what gives each bar its colour.
	const trackTone = typeof song.track === 'object' ? (song.track.tone ?? null) : null

	// `Portrait` renders nothing for an upload that is missing or that came back as a bare
	// id, and a record with no sleeve in front of it is a black circle sitting on the paper.
	// Both or neither, decided from the same value.
	const cover = song.cover !== null && song.cover !== undefined && typeof song.cover !== 'number' ? song.cover : null
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

			<div className="folder-body grid gap-6 p-5 sm:p-7 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-10">
				<div className="folder-sleeve relative w-full max-w-[16rem] justify-self-center md:justify-self-start">
					{/* Turning only while this Song plays. A disc that spins regardless is
					    wallpaper; one that spins exactly when there is sound is the clearest
					    "this is playing" signal there is, and it answers the complaint that you
					    could not tell the control was a play control. */}
					{cover === null ? null : <Vinyl className="folder-disc" label="var(--lemon)" />}
					<Portrait
						image={cover}
						sizes="(min-width: 768px) 16rem, 70vw"
						className="relative z-10 block w-full border-brutal border-border bg-sheet"
					/>
					{/* Siblings that overflow the cover, not children clipped by it: the strip
					    has to bridge the image and the paper behind it or the illusion dies. */}
					<span
						aria-hidden="true"
						className="tape -top-2 -left-5"
						style={
							{
								transform: `rotate(${tapeAngle(index, 'start')}deg)`,
								'--tape-tint': tapeTint(index, 'start'),
							} as React.CSSProperties
						}
					/>
					<span
						aria-hidden="true"
						className="tape -top-2 -right-5"
						style={
							{
								transform: `rotate(${tapeAngle(index, 'end')}deg)`,
								'--tape-tint': tapeTint(index, 'end'),
							} as React.CSSProperties
						}
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
							peaks={trackPeaks}
							tone={trackTone}
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
