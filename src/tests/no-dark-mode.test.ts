import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SOURCE = join(process.cwd(), 'src')
const CHECKED = new Set(['.css', '.ts', '.tsx'])

/** `src/tests` is skipped: this file names the patterns it is looking for. */
const SKIPPED = new Set(['tests'])

function sourceFiles(dir: string): string[] {
	return readdirSync(dir).flatMap(entry => {
		const path = join(dir, entry)
		if (statSync(path).isDirectory()) {
			return SKIPPED.has(entry) ? [] : sourceFiles(path)
		}
		return CHECKED.has(extname(path)) ? [path] : []
	})
}

/**
 * ADR-0004: the Portfolio ships one theme. The `.dark` block from the source tweakcn
 * theme was deleted rather than left half-correct, and this is what keeps it deleted, * a dark block reappears the moment anyone copies a fresh shadcn component in.
 */
describe('no dark mode', () => {
	const files = sourceFiles(SOURCE)

	it('finds source to check', () => {
		expect(files.length).toBeGreaterThan(0)
	})

	it('declares no .dark block and no dark: variants anywhere in src', () => {
		const offenders = files.filter(path => {
			const body = readFileSync(path, 'utf8')
			return /\.dark\b/.test(body) || /\bdark:[a-z[]/.test(body) || /prefers-color-scheme/.test(body)
		})

		expect(offenders.map(p => p.replace(`${process.cwd()}/`, ''))).toEqual([])
	})
})
