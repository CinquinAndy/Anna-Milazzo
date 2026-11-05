import { Portrait } from '@/components/portrait'
import { SongTransport } from '@/components/song-transport'
import { SongVideo } from '@/components/song-video'
import { Vinyl } from '@/components/vinyl'
import type { Locale } from '@/lib/locale'
import type { PlayableSong } from '@/lib/player/controller'
import { parseVideo, VIDEO_COPY } from '@/lib/video'
import type { Audio, Home, Media, Song } from '@/payload-types'

/**
 * Tape angles, by position in the Folder.
 *
 * Deterministic rather than random: a random angle differs between the server render and
 * the client, and the same value on every strip reads as a repeated component, which is
 * the tell the design is trying to avoid. Never zero, never the same twice in a row.
 */
const TAPE_ANGLES = [-44, -39, -47, -41, -45, -38] as const

/**
 * Tape tints, cycled through the Folder. Deterministic for the same reason as the angles,
 * and paired so the two strips on one cover are never the same colour, real tape comes off
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

/** Two digits, so the Songs read as a numbered set, the way the Tabs above them do. */
export const pad = (n: number) => String(n).padStart(2, '0')

/**
 * A relationship is a record, an id, or nothing. Only a record can be drawn.
 *
 * `typeof null` is `'object'`, which is why the check is spelt out: the old
 * `typeof song.track === 'object'` was true for a Song with no audio and then read `.url`
 * off `null`.
 */
function populated<T extends object>(value: T | number | null | undefined): T | null {
	return value !== null && value !== undefined && typeof value === 'object' ? value : null
}

/**
 * One Song, as the sheet of paper filed in the Folder: a typed header, the cover taped on,
 * and the title, story, player, video and link beside it.
 *
 * What the cover becomes depends on what the Song carries:
 *
 * - **Audio**: the cover is a record sleeve, with the record tucked behind it, which comes
 *   out and turns while the Song plays.
 * - **A video and no audio**: there is no record, because there is no track to turn. The
 *   cover is the video's screen instead, and pressing it plays the video in its place. A
 *   short film or a sound-design exercise is not a single, and a record on it read as one.
 * - **Both**: the sleeve and the record, and the video below the transport.
 */
export function SongSheet({
	song,
	index,
	count,
	labels,
	locale,
}: {
	song: Song
	index: number
	count: number
	labels: Home['songs']
	locale: Locale
}) {
	const track = populated<Audio>(song.track)
	// The audio URL comes from the record, already pointing at the bucket's public domain.
	const trackUrl = track?.url ?? null
	// Measured from the file on upload and stored on the audio record, so the waveform is
	// right on the first frame and costs the visitor nothing to draw.
	const trackPeaks = track?.peaks ?? null
	// Measured beside the waveform on upload: where the track's energy sits in the spectrum
	// over its length, which is what gives each bar its colour.
	const trackTone = track?.tone ?? null

	// The link Anna pasted, or nothing: a link that is not a video this site embeds is not
	// shown, rather than shown broken. The admin refuses one when she saves.
	const video = parseVideo(song.videoUrl)

	// `Portrait` renders nothing for an upload that is missing or that came back as a bare
	// id, and a record with no sleeve in front of it is a black circle sitting on the paper.
	const cover = populated<Media>(song.cover)
	// `reference` is a seed handle and a test selector, hidden from the admin, so every
	// Song Anna creates herself has none. Falling back to the record id keeps the player
	// present for those.
	const handle = song.reference ?? String(song.id)
	const playable: PlayableSong | null =
		trackUrl && song.durationSeconds ? { id: handle, source: trackUrl, durationSeconds: song.durationSeconds } : null

	// The cover is the video's screen when the video is all there is to play.
	const screen = playable === null && video !== null
	const videoLabel = VIDEO_COPY[locale].watch

	return (
		<article className="song-sheet" data-song={handle} data-kind={screen ? 'video' : 'audio'}>
			{/* The typed header from the reference: where this sheet sits in the Folder, and a
			    perforation-dotted rule. The number is the Tab's, so a reader who arrived by
			    scrolling, or without JavaScript, still knows which Tab this is. */}
			<p className="sheet-header" aria-hidden="true">
				<span>
					{pad(index + 1)} / {pad(count)}
				</span>
				<span className="sheet-rule" />
			</p>

			<div className="sheet-body">
				<div className={screen ? 'folder-screen relative' : 'folder-sleeve relative'}>
					{screen && video !== null ? (
						<SongVideo
							embedUrl={video.embedUrl}
							watchUrl={video.watchUrl}
							title={song.title}
							label={videoLabel}
							poster={cover}
						/>
					) : (
						<>
							{/* Turning only while this Song plays. A disc that spins regardless is
							    wallpaper; one that spins exactly when there is sound is the clearest
							    "this is playing" signal there is. No audio, no record. */}
							{cover === null || playable === null ? null : <Vinyl className="folder-disc" label="var(--lemon)" />}
							<Portrait
								image={cover}
								sizes="(min-width: 768px) 16rem, 70vw"
								className="relative z-10 block w-full border-brutal border-border bg-sheet"
							/>
						</>
					)}
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

					{video === null || screen ? null : (
						<SongVideo embedUrl={video.embedUrl} watchUrl={video.watchUrl} title={song.title} label={videoLabel} />
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
