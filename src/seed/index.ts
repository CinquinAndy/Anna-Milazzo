import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload, type Payload } from 'payload'
import config from '../payload.config'
import {
	SEED_CONTACT,
	SEED_HOME,
	SEED_LEGALS,
	SEED_PORTRAIT,
	SEED_SETTINGS,
	SEED_SONGS,
	type SeedSong,
} from './content'

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures')

/**
 * Fills the Portfolio with convincing bilingual content so every later ticket has
 * something real to render.
 *
 * Upsert-only, never destructive. `DATABASE_URL` points at a shared VPS Postgres, and a
 * seed that deletes first would take Anna's work with it the first time someone runs it
 * on the wrong database. That is also why this is its own script and is deliberately not
 * part of `validate`: routine validation must not write to shared infrastructure.
 *
 * Run it with `bun run seed`. Note the CLI goes through Node, not Bun, Payload's lexical
 * editor cannot be evaluated by Bun's runtime.
 */

/** Finds an upload by filename, or creates it. Uploads are unique on filename. */
async function upsertUpload(
	payload: Payload,
	collection: 'media' | 'audio',
	filename: string,
	alt?: { it: string; en: string }
): Promise<number> {
	const existing = await payload.find({
		collection,
		where: { filename: { equals: filename } },
		limit: 1,
		pagination: false,
	})

	const found = existing.docs[0]
	if (found !== undefined) {
		// Alt text is copy and may have been rewritten here since the last run.
		if (alt !== undefined) {
			await payload.update({ collection, id: found.id, locale: 'it', data: { alt: alt.it } })
			await payload.update({ collection, id: found.id, locale: 'en', data: { alt: alt.en } })
		}
		// The fixture on disk may have been regenerated since it was uploaded. Size is a
		// cheap and sufficient tell, and without this check the bucket keeps serving the old
		// audio while the record carries an analysis of the new one, the visualiser would
		// then be drawing a track nobody is hearing.
		//
		// The fixture is re-uploaded every run, unconditionally.
		//
		// Comparing sizes first was the obvious saving and it does not work: these are
		// constant-bitrate MP3s, so the size is a function of the DURATION alone. A track
		// regenerated with different notes, a different mix and a fixed click at its start
		// came back byte-for-byte the same length, the seed skipped it, and the bucket went
		// on serving audio that no longer matched the analysis stored beside it. Six small
		// files on a hand-run script is the cheaper mistake.
		//
		// `overwriteExistingFiles` is what keeps the name. Without it Payload sees the old
		// object still in the bucket and sidesteps the collision by appending `-1`, after
		// which this function can no longer find the record by filename and the next run
		// creates a duplicate. Deleting the record first is not an option either:
		// `songs.track` is required, so Postgres refuses while a Song still points at it.
		//
		// Only ever touches a name this seed owns. Anna's own uploads are named by Payload
		// and never collide with `track-<reference>.mp3`.
		await payload.update({
			collection,
			id: found.id,
			filePath: path.join(FIXTURES, filename),
			overwriteExistingFiles: true,
			data: {},
		})
		return found.id
	}

	const created = await payload.create({
		collection,
		locale: 'it',
		data: alt === undefined ? {} : { alt: alt.it },
		filePath: path.join(FIXTURES, filename),
	})
	if (alt !== undefined) {
		await payload.update({ collection, id: created.id, locale: 'en', data: { alt: alt.en } })
	}
	return created.id
}

async function upsertSong(payload: Payload, song: SeedSong): Promise<void> {
	const coverAlt = {
		it: `Copertina di “${song.it.title}”.`,
		en: `Cover of “${song.en.title}”.`,
	}
	const cover = await upsertUpload(payload, 'media', `cover-${song.reference}.png`, coverAlt)
	const track = await upsertUpload(payload, 'audio', `track-${song.reference}.mp3`)

	const shared = {
		cover,
		track,
		order: song.order,
		durationSeconds: song.durationSeconds,
		// Explicitly null rather than omitted: an omitted key leaves whatever is stored,
		// so a Song that is meant to have no link would keep an old one forever.
		platformUrl: song.platformUrl ?? null,
		reference: song.reference,
	}

	const existing = await payload.find({
		collection: 'songs',
		where: { reference: { equals: song.reference } },
		limit: 1,
		pagination: false,
		locale: 'it',
	})

	const found = existing.docs[0]
	const id =
		found?.id ?? (await payload.create({ collection: 'songs', locale: 'it', data: { ...shared, ...song.it } })).id

	if (found !== undefined) {
		await payload.update({ collection: 'songs', id, locale: 'it', data: { ...shared, ...song.it } })
	}

	// The untranslated Song writes `story: null`, not an omitted key. Omitting it would
	// leave any English text already stored in place, and the fallback would stay dead.
	await payload.update({
		collection: 'songs',
		id,
		locale: 'en',
		data: { title: song.en.title, story: song.en.story ?? null },
	})
}

/** A minimal Lexical document: one paragraph per string. */
function paragraphs(lines: readonly string[]) {
	return {
		root: {
			type: 'root',
			format: '' as const,
			indent: 0,
			version: 1,
			direction: 'ltr' as const,
			children: lines.map(text => ({
				type: 'paragraph',
				format: '' as const,
				indent: 0,
				version: 1,
				direction: 'ltr' as const,
				textFormat: 0,
				children: [{ type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }],
			})),
		},
	}
}

/**
 * Attaches the stored row ids to a set of array rows, positionally.
 *
 * Without them Payload treats every incoming row as new, replaces the stored ones and
 * drops the other locale's text for that row. Positional matching is safe here because
 * the seed writes the same rows in the same order in both languages.
 */
function withRowIds<T extends object>(rows: readonly T[], stored?: ReadonlyArray<{ id?: string | null }> | null) {
	return rows.map((row, index) => {
		const id = stored?.[index]?.id
		return id == null ? { ...row } : { ...row, id }
	})
}

function homeData(
	copy: (typeof SEED_HOME)['it'],
	portrait: number,
	stored?: {
		skills?: ReadonlyArray<{ id?: string | null }> | null | undefined
		timeline?: ReadonlyArray<{ id?: string | null }> | null | undefined
	}
) {
	return {
		hero: { ...copy.hero, portrait },
		about: copy.about,
		skills: {
			heading: copy.skills.heading,
			entries: withRowIds(
				copy.skills.entries.map(name => ({ name })),
				stored?.skills
			),
		},
		songs: copy.songs,
		timeline: {
			heading: copy.timeline.heading,
			scrollLabel: copy.timeline.scrollLabel,
			entries: withRowIds(copy.timeline.entries, stored?.timeline),
		},
		contactCta: copy.contactCta,
	}
}

/**
 * The contact page's copy, with its arrays carrying the row ids Postgres already gave them.
 *
 * This exists for the same reason `homeData` does, and it did not exist while the global
 * held no arrays. The moment it does, writing English without the Italian row ids replaces
 * the rows rather than translating them, and the Italian text goes with them. Silently.
 */
function contactData(
	copy: (typeof SEED_CONTACT)['it'],
	stored?: {
		points?: ReadonlyArray<{ id?: string | null }> | null | undefined
		entries?: ReadonlyArray<{ id?: string | null }> | null | undefined
	}
) {
	return {
		heading: copy.heading,
		intro: copy.intro,
		form: copy.form,
		outcome: copy.outcome,
		brief: {
			heading: copy.brief.heading,
			intro: copy.brief.intro,
			points: withRowIds(
				copy.brief.points.map(text => ({ text })),
				stored?.points
			),
		},
		practical: {
			heading: copy.practical.heading,
			entries: withRowIds(copy.practical.entries, stored?.entries),
		},
		direct: copy.direct,
	}
}

function legalsData(copy: (typeof SEED_LEGALS)['it']) {
	return { heading: copy.heading, body: paragraphs(copy.paragraphs) }
}

function settingsData(
	copy: (typeof SEED_SETTINGS)['it'],
	stored?: ReadonlyArray<{ id?: string | null }> | null | undefined
) {
	return {
		contactEmail: SEED_SETTINGS.contactEmail,
		navHeading: copy.navHeading,
		elsewhereHeading: copy.elsewhereHeading,
		legalsLinkLabel: copy.legalsLinkLabel,
		socialLinks: withRowIds(copy.socialLinks, stored),
	}
}

export async function seed(): Promise<void> {
	const payload = await getPayload({ config })

	const portrait = await upsertUpload(payload, 'media', SEED_PORTRAIT.file, {
		it: SEED_PORTRAIT.it,
		en: SEED_PORTRAIT.en,
	})

	for (const song of SEED_SONGS) {
		await upsertSong(payload, song)
		payload.logger.info(`seeded song ${song.reference}`)
	}

	// Globals have no `create`, and `locale: 'all'` is a read-side feature only, a write
	// with it silently discards every localized value. One call per locale, always.
	//
	// Array rows are shared across locales, and Payload matches an incoming row to a
	// stored one strictly by `id`. Writing the second locale's rows without those ids
	// replaces the rows outright and takes the first locale's text with them, silently.
	// So: write Italian, read the ids back, then write English carrying them.
	await payload.updateGlobal({ slug: 'home', locale: 'it', data: homeData(SEED_HOME.it, portrait) })
	await payload.updateGlobal({ slug: 'contact', locale: 'it', data: contactData(SEED_CONTACT.it) })
	await payload.updateGlobal({ slug: 'legals', locale: 'it', data: legalsData(SEED_LEGALS.it) })
	await payload.updateGlobal({ slug: 'settings', locale: 'it', data: settingsData(SEED_SETTINGS.it) })
	payload.logger.info('seeded page copy in it')

	const storedHome = await payload.findGlobal({ slug: 'home', locale: 'it' })
	const storedContact = await payload.findGlobal({ slug: 'contact', locale: 'it' })
	const storedSettings = await payload.findGlobal({ slug: 'settings', locale: 'it' })

	await payload.updateGlobal({
		slug: 'home',
		locale: 'en',
		data: homeData(SEED_HOME.en, portrait, {
			skills: storedHome.skills?.entries,
			timeline: storedHome.timeline?.entries,
		}),
	})
	await payload.updateGlobal({
		slug: 'contact',
		locale: 'en',
		data: contactData(SEED_CONTACT.en, {
			points: storedContact.brief?.points,
			entries: storedContact.practical?.entries,
		}),
	})
	await payload.updateGlobal({ slug: 'legals', locale: 'en', data: legalsData(SEED_LEGALS.en) })
	await payload.updateGlobal({
		slug: 'settings',
		locale: 'en',
		data: settingsData(SEED_SETTINGS.en, storedSettings.socialLinks),
	})
	payload.logger.info('seeded page copy in en')

	payload.logger.info('seed complete')
}

await seed()
