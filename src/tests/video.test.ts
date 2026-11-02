import { describe, expect, it } from 'vitest'
import { LOCALES } from '@/lib/locale'
import { parseVideo, VIDEO_COPY, validateVideoUrl } from '@/lib/video'

const ID = 'M7lc1UVf-VE'

describe('YouTube links', () => {
	it.each([
		['a watch page', `https://www.youtube.com/watch?v=${ID}`],
		['a watch page with other parameters in front', `https://www.youtube.com/watch?feature=share&v=${ID}&t=42s`],
		['a mobile watch page', `https://m.youtube.com/watch?v=${ID}`],
		['YouTube Music', `https://music.youtube.com/watch?v=${ID}&si=abc`],
		['a short link', `https://youtu.be/${ID}`],
		['a short link with a tracking parameter', `https://youtu.be/${ID}?si=Zx9`],
		['a Shorts link', `https://www.youtube.com/shorts/${ID}`],
		['a live link', `https://www.youtube.com/live/${ID}`],
		['an embed address', `https://www.youtube.com/embed/${ID}`],
		['the privacy-enhanced embed address', `https://www.youtube-nocookie.com/embed/${ID}`],
		['a link pasted without its scheme', `youtu.be/${ID}`],
		['a link with spaces around it', `  https://youtu.be/${ID}\n`],
		['an uppercase host', `https://WWW.YOUTUBE.COM/watch?v=${ID}`],
	])('reads %s', (_, link) => {
		const video = parseVideo(link)
		expect(video?.provider).toBe('youtube')
		expect(video?.id).toBe(ID)
	})

	it('builds the embed address itself, from the id alone, in privacy-enhanced mode', () => {
		const video = parseVideo(`https://youtu.be/${ID}?si=whatever&list=PLx`)
		expect(video?.embedUrl).toBe(`https://www.youtube-nocookie.com/embed/${ID}?autoplay=1&rel=0&playsinline=1`)
		expect(video?.watchUrl).toBe(`https://www.youtube.com/watch?v=${ID}`)
	})

	it.each([
		['an id of the wrong length', 'https://youtu.be/short'],
		['an id with a character that is not one', 'https://youtu.be/abc$def!ghij'],
		['a channel page', 'https://www.youtube.com/@anna'],
		['a playlist', 'https://www.youtube.com/playlist?list=PLabcdefghijk'],
		['the home page', 'https://www.youtube.com/'],
		['a watch page with no id', 'https://www.youtube.com/watch'],
	])('refuses %s', (_, link) => {
		expect(parseVideo(link)).toBeNull()
	})
})

describe('Vimeo links', () => {
	it.each([
		['a page', 'https://vimeo.com/123456789'],
		['a player address', 'https://player.vimeo.com/video/123456789?h=abc123def4'],
		['a channel page', 'https://vimeo.com/channels/staffpicks/123456789'],
		['an unlisted page with its hash', 'https://vimeo.com/123456789/abc123def4'],
	])('reads %s', (_, link) => {
		const video = parseVideo(link)
		expect(video?.provider).toBe('vimeo')
		expect(video?.id).toBe('123456789')
	})

	it('keeps the hash an unlisted video needs, and nothing else', () => {
		expect(parseVideo('https://vimeo.com/123456789/abc123def4')?.embedUrl).toBe(
			'https://player.vimeo.com/video/123456789?autoplay=1&dnt=1&h=abc123def4'
		)
		expect(parseVideo('https://vimeo.com/123456789?x=1')?.embedUrl).toBe(
			'https://player.vimeo.com/video/123456789?autoplay=1&dnt=1'
		)
	})

	it('drops a hash that is not the shape Vimeo issues', () => {
		expect(parseVideo('https://vimeo.com/123456789?h=<script>')?.embedUrl).toBe(
			'https://player.vimeo.com/video/123456789?autoplay=1&dnt=1'
		)
	})

	it.each([
		['the home page', 'https://vimeo.com/'],
		['a user page', 'https://vimeo.com/someone'],
	])('refuses %s', (_, link) => {
		expect(parseVideo(link)).toBeNull()
	})
})

describe('anything else', () => {
	it.each([
		['empty', ''],
		['whitespace', '   '],
		['null', null],
		['undefined', undefined],
		['another site', 'https://example.com/watch?v=M7lc1UVf-VE'],
		['a look-alike host', 'https://youtube.com.evil.example/watch?v=M7lc1UVf-VE'],
		['a host that ends the same', 'https://notyoutube.com/watch?v=M7lc1UVf-VE'],
		['a look-alike short host', 'https://youtu.be.evil.example/M7lc1UVf-VE'],
		['a javascript address', 'javascript:alert(1)'],
		['a data address', 'data:text/html,<script>alert(1)</script>'],
		['a file address', 'file:///etc/passwd'],
		['words', 'my video'],
	])('is not a video: %s', (_, link) => {
		expect(parseVideo(link)).toBeNull()
	})

	it('never lets a typed string into the embed address', () => {
		const video = parseVideo(`https://www.youtube.com/watch?v=${ID}"><script>alert(1)</script>`)
		// The id has to be exactly eleven characters of the right alphabet, so this is no video.
		expect(video).toBeNull()
		// Extra parameters are dropped, not passed on: the address is rebuilt from the id.
		expect(parseVideo(`https://youtu.be/${ID}?autoplay=0&x="onload="alert(1)`)?.embedUrl).toBe(
			`https://www.youtube-nocookie.com/embed/${ID}?autoplay=1&rel=0&playsinline=1`
		)
		// A path that climbs out of /embed/ is normalised by the URL parser into some other page.
		expect(parseVideo(`https://www.youtube.com/embed/${ID}/../../x`)).toBeNull()
	})
})

describe('the admin field', () => {
	it('accepts an empty field and a link the site can embed', () => {
		expect(validateVideoUrl('')).toBe(true)
		expect(validateVideoUrl(null)).toBe(true)
		expect(validateVideoUrl(undefined)).toBe(true)
		expect(validateVideoUrl(`https://youtu.be/${ID}`)).toBe(true)
	})

	it('refuses anything else, in both languages, with something to do about it', () => {
		const message = validateVideoUrl('https://example.com/clip.mp4')
		expect(message).toEqual(expect.stringContaining('YouTube'))
		expect(message).toEqual(expect.stringContaining('Incolla'))
	})
})

describe('the words', () => {
	it('exist in both languages', () => {
		for (const locale of LOCALES) {
			expect(VIDEO_COPY[locale].watch.trim()).not.toBe('')
		}
	})
})
