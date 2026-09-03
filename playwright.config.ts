import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

// A port of its own, not 3000: on the usual dev port an unrelated project's server answers
// and the suite silently tests the wrong application. Nor is an existing server on this
// port reused — a `next start` left over from an earlier build would let the gate pass
// against code no longer on disk.
const baseURL = 'http://localhost:3111'

export default defineConfig({
	testDir: './e2e',
	forbidOnly: !!process.env.CI,
	reporter: 'list',
	use: {
		baseURL,
		trace: 'on-first-retry',
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	// Runs against the production build, so `bun run build` has to have happened first —
	// which is why `validate` builds before it gets here.
	webServer: {
		command: 'bun run start',
		env: { PORT: '3111' },
		reuseExistingServer: false,
		timeout: 120_000,
		url: baseURL,
	},
})
