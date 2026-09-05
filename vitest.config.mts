import { defineConfig } from 'vitest/config'

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		// Node, not jsdom: the only things unit-tested here are the player controller and
		// `sendContactMessage`. Presentational components are covered through real routes.
		environment: 'node',
		// `.tsx` too: the email template is a component, and the only honest way to test one is
		// to render it.
		include: ['src/tests/**/*.test.ts', 'src/tests/**/*.test.tsx'],
		setupFiles: ['dotenv/config'],
	},
})
