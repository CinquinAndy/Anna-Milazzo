import { defineConfig } from 'vitest/config'

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		// Node, not jsdom: the only things unit-tested here are the player controller and
		// `sendContactMessage`. Presentational components are covered through real routes.
		environment: 'node',
		include: ['src/tests/**/*.test.ts'],
		setupFiles: ['dotenv/config'],
	},
})
