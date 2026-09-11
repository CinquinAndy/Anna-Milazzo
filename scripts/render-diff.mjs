/**
 * Compares two fingerprints and says, in a form a person can act on, what moved.
 *
 *   bun scripts/render-diff.mjs <base file> <head file> [markdown summary out]
 *
 * Exits 1 when anything differs. A handful of rows is the known floor: the hero's grid
 * row settles a fraction of a pixel differently depending on when the portrait decodes,
 * and that is noise rather than a regression, so TOLERANCE rows are allowed through and
 * reported.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const [basePath, headPath, summaryPath] = process.argv.slice(2)
if (!basePath || !headPath) {
	console.error('usage: bun scripts/render-diff.mjs <base> <head> [summary.md]')
	process.exit(1)
}

/**
 * Zero, and it is allowed to be zero because the fingerprint is anchored on the page's own
 * landmarks rather than walked from `body`. Measured: two runs of an unchanged tree produce
 * byte-identical files, 17,946 elements, no differing rows. So one differing row is one
 * real difference, and there is nothing to forgive.
 */
const TOLERANCE = 0

const read = path =>
	new Map(
		readFileSync(path, 'utf8')
			.split('\n')
			.filter(Boolean)
			.map(line => {
				const [key, hash] = line.split('\t')
				return [key, hash]
			})
	)

const base = read(basePath)
const head = read(headPath)

const changed = []
const gone = []
const added = []
for (const [key, hash] of base) {
	const other = head.get(key)
	if (other === undefined) {
		gone.push(key)
	} else if (other !== hash) {
		changed.push(key)
	}
}
for (const key of head.keys()) {
	if (!base.has(key)) {
		added.push(key)
	}
}

const total = changed.length + gone.length + added.length
const where = new Map()
for (const key of [...changed, ...gone, ...added]) {
	const [route, viewport] = key.split(' ')
	const at = `${route} ${viewport}`
	where.set(at, (where.get(at) ?? 0) + 1)
}

const lines = []
lines.push(`Base: ${base.size} elements. Head: ${head.size}.`)
lines.push(`Changed ${changed.length}, gone ${gone.length}, new ${added.length}.`)
if (total > 0) {
	lines.push('')
	lines.push('Where:')
	for (const [at, count] of [...where].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
		lines.push(`  ${count.toString().padStart(6)}  ${at}`)
	}
	lines.push('')
	lines.push('First few:')
	for (const key of [...changed, ...gone, ...added].slice(0, 15)) {
		lines.push(`  ${key}`)
	}
}
const report = lines.join('\n')
console.log(report)

if (summaryPath) {
	const verdict =
		total === 0
			? 'Nothing moved. Every element on every page renders identically at every viewport.'
			: total <= TOLERANCE
				? `${total} elements differ, which is at or under the tolerance. Treated as noise.`
				: `**${total} elements render differently.** This is what the change did to the page.`
	writeFileSync(summaryPath, `### Render comparison\n\n${verdict}\n\n\`\`\`\n${report}\n\`\`\`\n`)
}

if (total > TOLERANCE) {
	process.exit(1)
}
