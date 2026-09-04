import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { en } from 'payload/i18n/en'
import { it } from 'payload/i18n/it'
import sharp from 'sharp'
import { Audio } from './collections/audio'
import { Media } from './collections/media'
import { Songs } from './collections/songs'
import { Users } from './collections/users'
import { Contact } from './globals/contact'
import { Home } from './globals/home'
import { Legals } from './globals/legals'
import { Settings } from './globals/settings'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
	admin: {
		importMap: {
			baseDir: path.resolve(dirname),
		},
		user: Users.slug,
	},
	collections: [Songs, Media, Audio, Users],
	globals: [Home, Contact, Legals, Settings],
	db: postgresAdapter({
		migrationDir: path.resolve(dirname, 'migrations'),
		pool: {
			connectionString: process.env.DATABASE_URL ?? '',
		},
		// Schema changes always travel as a committed migration, never as a push — mixing
		// the two is what leaves an environment half-applied.
		push: false,
	}),
	editor: lexicalEditor(),
	// The language of the CONTENT. Italian is the default and English falls back to it,
	// so a Song Anna has not translated yet renders its Italian rather than a blank.
	localization: {
		locales: [
			{ code: 'it', label: { en: 'Italian', it: 'Italiano' } },
			{ code: 'en', label: { en: 'English', it: 'Inglese' } },
		],
		defaultLocale: 'it',
		fallback: true,
	},
	// The language of the ADMIN CHROME, which is a separate thing from the content locale
	// and should stay separate: Anna edits in Italian, and an English-speaking editor
	// could work on the Italian content. `supportedLanguages` replaces the built-in set,
	// so English has to be listed too or it disappears from the admin entirely.
	i18n: {
		supportedLanguages: { en, it },
		fallbackLanguage: 'it',
	},
	secret: process.env.PAYLOAD_SECRET ?? '',
	sharp,
	typescript: {
		outputFile: path.resolve(dirname, 'payload-types.ts'),
	},
})
