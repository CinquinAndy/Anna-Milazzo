/**
 * Compares two fingerprints and says, in a form a person can act on, what moved.
 *
 *   bun scripts/render-diff.mjs <base file> <head file> [markdown summary out]
 *
 * Exits 1 when anything differs at all. There is no floor and no noise to forgive; if
 * this reports something, either the page changed or the measurement is wrong, and both
 * are worth stopping for.
 *
 * Each row carries two hashes, the element's box and its computed style, so a difference
 * is reported as `geometry`, `style` or `both`. That distinction is the difference between
 * "the layout moved" and "a property changed under a box that did not move", and it is the
 * first thing anyone needs to know.
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
				const [key, geometry, style] = line.split('\t')
				return [key, { geometry, style }]
			})
	)

const base = read(basePath)
const head = read(headPath)

const changed = []
const gone = []
const added = []
/** How many changed rows moved their box, changed a property, or both. */
const kinds = { geometry: 0, style: 0, both: 0 }
for (const [key, row] of base) {
	const other = head.get(key)
	if (other === undefined) {
		gone.push(key)
		continue
	}
	const movedBox = other.geometry !== row.geometry
	const movedStyle = other.style !== row.style
	if (!(movedBox || movedStyle)) {
		continue
	}
	const kind = movedBox && movedStyle ? 'both' : movedBox ? 'geometry' : 'style'
	kinds[kind] += 1
	changed.push(`${key}\t[${kind}]`)
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
if (changed.length > 0) {
	lines.push(
		`Of the changed: ${kinds.geometry} moved only their box, ${kinds.style} only a property, ${kinds.both} both.`
	)
}
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
