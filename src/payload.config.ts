import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { Users } from './collections/users'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
	admin: {
		importMap: {
			baseDir: path.resolve(dirname),
		},
		user: Users.slug,
	},
	collections: [Users],
	db: postgresAdapter({
		migrationDir: path.resolve(dirname, 'migrations'),
		pool: {
			connectionString: process.env.DATABASE_URL ?? '',
		},
		// Schema changes always travel as a committed migration, never as a push — mixing the
		// two is what leaves an environment half-applied.
		push: false,
	}),
	editor: lexicalEditor(),
	secret: process.env.PAYLOAD_SECRET ?? '',
	sharp,
	typescript: {
		outputFile: path.resolve(dirname, 'payload-types.ts'),
	},
})
