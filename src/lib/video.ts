import type { Locale } from '@/lib/locale'

/**
 * Turning the link Anna pastes into the one address the page will ever embed.
 *
 * She pastes whatever she copied from the browser or the share button: a watch page, a
 * short link, a Shorts link, a Vimeo page. None of that is used as it is. The page keeps
 * the provider and the id, validates them, and builds the embed address itself from those
 * two things, so what ends up in an `<iframe src>` is a fixed shape with one validated
 * token in it and never a string a person typed. A link that is not recognised is not
 * embedded at all, and the admin says so when she saves it.
 *
 * YouTube is embedded from `youtube-nocookie.com`, its privacy-enhanced mode, and Vimeo
 * with `dnt=1`. Neither is requested until a reader asks for the video: see
 * `song-video.tsx` and ADR-0013.
 */
export type Video = {
	provider: 'youtube' | 'vimeo'
	/** The video's id on the provider, validated: it is the only part of the link that survives. */
	id: string
	/** What the `<iframe>` loads, with autoplay because it is only ever built after a click. */
	embedUrl: string
	/** The ordinary page for the video, the fallback when the embed cannot be used. */
	watchUrl: string
}

const YOUTUBE_ID = /^[\w-]{11}$/
const VIMEO_ID = /^\d{5,12}$/
const VIMEO_HASH = /^[0-9a-f]{6,16}$/i

const YOUTUBE_HOSTS = new Set([
	'youtube.com',
	'www.youtube.com',
	'm.youtube.com',
	'music.youtube.com',
	'youtube-nocookie.com',
	'www.youtube-nocookie.com',
])
const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'])

function youtube(id: string | undefined): Video | null {
	if (id === undefined || !YOUTUBE_ID.test(id)) {
		return null
	}
	return {
		provider: 'youtube',
		id,
		embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`,
		watchUrl: `https://www.youtube.com/watch?v=${id}`,
	}
}

function vimeo(id: string | undefined, hash: string | null): Video | null {
	if (id === undefined || !VIMEO_ID.test(id)) {
		return null
	}
	// An unlisted video carries a hash that the player needs, and only a hash of the shape
	// Vimeo issues is passed on.
	const privacy = hash !== null && VIMEO_HASH.test(hash) ? `&h=${hash}` : ''
	return {
		provider: 'vimeo',
		id,
		embedUrl: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1${privacy}`,
		watchUrl: `https://vimeo.com/${id}`,
	}
}

/** The video a pasted link points at, or `null` for anything this site does not embed. */
export function parseVideo(value: string | null | undefined): Video | null {
	const text = value?.trim()
	if (!text) {
		return null
	}

	let url: URL
	try {
		url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(text) ? text : `https://${text}`)
	} catch {
		return null
	}
	if (url.protocol !== 'https:' && url.protocol !== 'http:') {
		return null
	}

	const host = url.hostname.toLowerCase()
	const parts = url.pathname.split('/').filter(Boolean)

	if (host === 'youtu.be') {
		return youtube(parts[0])
	}
	if (YOUTUBE_HOSTS.has(host)) {
		if (parts[0] === 'watch') {
			return youtube(url.searchParams.get('v') ?? undefined)
		}
		if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live' || parts[0] === 'v') {
			return youtube(parts[1])
		}
		return null
	}
	if (VIMEO_HOSTS.has(host)) {
		// player.vimeo.com/video/123, vimeo.com/123, vimeo.com/123/abcdef0123 (unlisted),
		// and vimeo.com/channels/staffpicks/123: the id is the first run of digits.
		const index = parts.findIndex(part => VIMEO_ID.test(part))
		if (index < 0) {
			return null
		}
		const next = parts[index + 1]
		return vimeo(parts[index], url.searchParams.get('h') ?? (next !== undefined && VIMEO_HASH.test(next) ? next : null))
	}
	return null
}

/** For the admin's field: empty is fine, and anything else has to be a link the site can embed. */
export function validateVideoUrl(value: string | null | undefined): true | string {
	if (!value || value.trim() === '') {
		return true
	}
	return parseVideo(value) === null
		? 'Paste a YouTube or Vimeo link, for example https://youtu.be/… · Incolla un link di YouTube o Vimeo, per esempio https://youtu.be/…'
		: true
}

/** The words of the control, per locale. Shown, so never left to the reader's guess. */
export const VIDEO_COPY: Record<Locale, { watch: string }> = {
	it: { watch: 'Guarda il video' },
	en: { watch: 'Watch the video' },
}
