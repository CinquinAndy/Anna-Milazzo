import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

/**
 * The seed replaces every global outright, and the site is live on the database the
 * repository is configured against. Running it would put the placeholder text back over
 * whatever Anna has written, with no drafts and no versions to restore from.
 *
 * So it has to refuse, and the refusal has to be the default rather than something a tired
 * person remembers. This runs the real script and reads the real exit code, because a test
 * that greps the source would pass on a guard that never runs.
 */
describe('the seed', () => {
	it('refuses to run unless it is told to, and says why', () => {
		const run = spawnSync('bun', ['run', 'payload', 'run', 'src/seed/index.ts'], {
			encoding: 'utf8',
			timeout: 120_000,
			env: { ...process.env, SEED_OVERWRITE_LIVE_CONTENT: '' },
		})

		expect(run.status, 'the seed did not refuse').toBe(1)
		const said = `${run.stdout}${run.stderr}`
		expect(said, 'the refusal does not say what would be lost').toMatch(/overwrite|Refusing to seed/i)
		expect(said, 'the refusal does not say how to proceed on purpose').toContain('SEED_OVERWRITE_LIVE_CONTENT=yes')
	}, 130_000)
})
