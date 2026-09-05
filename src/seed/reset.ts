import { getPayload } from 'payload'
import config from '../payload.config'

/**
 * Deletes every Song and every uploaded file, so `bun run seed` can rebuild from scratch.
 *
 * This exists because `bun run seed` is deliberately non-destructive and there are times
 * a clean slate is the only correct move, the switch from local disk to R2 in ticket 05
 * being the first, since the records survive but the files they point at do not.
 *
 * `DATABASE_URL` points at shared infrastructure, so it refuses to run without
 * `SEED_RESET=yes` in the environment. Page copy is left alone: globals are overwritten
 * by the seed anyway, and blanking them would destroy anything Anna had rewritten.
 */
async function reset(): Promise<void> {
	if (process.env.SEED_RESET !== 'yes') {
		throw new Error(
			'Refusing to delete content. This removes every Song and every uploaded file from ' +
				'the database in DATABASE_URL. Re-run with SEED_RESET=yes if that is what you want.'
		)
	}

	const payload = await getPayload({ config })

	// Songs first: they hold the relationships to the uploads.
	for (const collection of ['songs', 'media', 'audio'] as const) {
		const { docs } = await payload.find({ collection, pagination: false, depth: 0 })
		for (const doc of docs) {
			await payload.delete({ collection, id: doc.id })
		}
		payload.logger.info(`deleted ${docs.length} from ${collection}`)
	}

	payload.logger.info('reset complete, run `bun run seed` to rebuild')
}

await reset()
