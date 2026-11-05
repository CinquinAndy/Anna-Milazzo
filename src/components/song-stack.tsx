import { Folder, type FolderTab } from '@/components/folder'
import { Ornament } from '@/components/ornament'
import { SectionTitle } from '@/components/section-title'
import { pad, SongSheet } from '@/components/song-sheet'
import { songSlugs } from '@/lib/folder/slug'
import { tabColour } from '@/lib/folder/tab-colours'
import type { Locale } from '@/lib/locale'
import { playableSong } from '@/lib/song-sound'
import type { Home, Song } from '@/payload-types'

/** The Tabs' group name when the section has no heading: what a screen reader calls the row. */
const TABS_LABEL: Record<Locale, string> = { it: 'Brani', en: 'Works' }

/**
 * Every Song, filed in one Folder in the order Anna set, one numbered Tab each (ADR-0014).
 *
 * The sheets are rendered here, on the server, and handed to the Folder as they are: the
 * Folder only decides which one is open.
 */
export function SongStack({ songs, labels, locale }: { songs: Song[]; labels: Home['songs']; locale: Locale }) {
	if (songs.length === 0) {
		return null
	}

	const slugs = songSlugs(songs)
	const tabs: FolderTab[] = songs.map((song, index) => {
		const colour = tabColour(index)
		return {
			slug: slugs[index] ?? `song-${song.id}`,
			number: pad(index + 1),
			title: song.title,
			playId: playableSong(song)?.id ?? null,
			fill: colour.fill,
			ink: colour.ink,
		}
	})

	return (
		<section
			data-enter
			className="relative border-b-brutal border-border bg-accent text-accent-foreground"
			id="ascolta"
			data-song-stack
		>
			{/* The work is what this page is for, so its heading is the loudest thing on it.
			    Solid rather than hollow: outlined letters read as lighter than filled ones at
			    the same size, and this heading should not be the quiet one on the page. */}
			{labels?.heading ? <SectionTitle>{labels.heading}</SectionTitle> : null}

			<div className="relative px-5 py-14 sm:px-8 md:py-20">
				<Ornament
					kind="cross"
					tone="sheet"
					rotation={19}
					className="top-10 right-4 h-8 w-8 sm:right-8 sm:h-11 sm:w-11"
				/>
				<div className="shell">
					<Folder tabs={tabs} label={labels?.heading ?? TABS_LABEL[locale]}>
						{songs.map((song, index) => (
							<SongSheet key={song.id} song={song} index={index} count={songs.length} labels={labels} locale={locale} />
						))}
					</Folder>
				</div>
			</div>
		</section>
	)
}
