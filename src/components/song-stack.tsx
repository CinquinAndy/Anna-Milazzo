import { Folder } from '@/components/folder'
import { Ornament } from '@/components/ornament'
import type { Home, Song } from '@/payload-types'

/**
 * Every Song, each in its own Folder, stacked down the page in the order Anna set.
 *
 * A list of articles. Every Folder is fully visible with nothing to open or expand, so a
 * Recruiter sees the whole body of work at a glance — which is also why the stack does
 * not overlap: an overlapping card puts one tap target under another, and at 375px the
 * top one wins in ways nobody can predict.
 */
export function SongStack({ songs, labels }: { songs: Song[]; labels: Home['songs'] }) {
	if (songs.length === 0) {
		return null
	}

	return (
		<section
			data-enter
			className="relative border-b-brutal border-border bg-accent px-5 py-14 text-accent-foreground sm:px-8 md:py-20"
			id="ascolta"
			data-song-stack
		>
			<Ornament kind="cross" tone="sheet" rotation={19} className="top-10 right-4 h-8 w-8 sm:right-8 sm:h-11 sm:w-11" />
			<div className="mx-auto max-w-6xl">
				<h2 className="font-display uppercase [font-stretch:88%]">{labels?.heading}</h2>
				{labels?.intro ? <p className="mt-4 max-w-prose font-sans text-lg">{labels.intro}</p> : null}

				<ul className="mt-10 flex list-none flex-col gap-[clamp(2.5rem,8vw,4rem)] p-0">
					{songs.map((song, index) => (
						<li key={song.id}>
							<Folder song={song} index={index} labels={labels} />
						</li>
					))}
				</ul>
			</div>
		</section>
	)
}
