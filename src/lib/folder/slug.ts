/** The longest fragment, in characters. */
const MAX = 48

/**
 * The fragment each Song answers to, `/#nocturnal-ashes`, so a Tab can be linked to.
 *
 * A fragment and not a page (ADR-0002 still holds: a Song has no URL of its own) and not a
 * query string either: reading `searchParams` would make the whole landing page dynamic,
 * while a fragment never reaches the server. ADR-0014.
 *
 * Taken from the title in the language of the page, so the English page links to
 * `#why-the-storm` and the Italian one to `#perche-il-temporale`. A title that leaves
 * nothing after the accents and punctuation are taken out falls back to the record id, and
 * a second Song with the same title is told apart by a counter.
 */
export function slugify(title: string): string {
	const slug = title
		.normalize('NFKD')
		// The combining marks the decomposition split off the letters: è becomes e.
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
	if (slug.length <= MAX) {
		return slug
	}
	// Long enough to say which work it is, short enough to read in an address bar, and cut
	// between two words rather than through one.
	const cut = slug.slice(0, MAX + 1)
	const lastBreak = cut.lastIndexOf('-')
	return (lastBreak > MAX / 3 ? cut.slice(0, lastBreak) : slug.slice(0, MAX)).replace(/-+$/g, '')
}

/** One fragment per Song, in order, never two the same. */
export function songSlugs(songs: readonly { id: number | string; title: string | null | undefined }[]): string[] {
	const taken = new Set<string>()
	return songs.map(song => {
		const base = slugify(song.title ?? '') || `song-${song.id}`
		let slug = base
		for (let n = 2; taken.has(slug); n++) {
			slug = `${base}-${n}`
		}
		taken.add(slug)
		return slug
	})
}
