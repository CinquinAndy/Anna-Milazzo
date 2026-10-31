/**
 * Is the live site up, and is it the site? Run on a schedule by `.github/workflows/prod-smoke.yml`.
 *
 *   bun scripts/prod-smoke.mjs [base url]
 *
 * Dependencies merge themselves (ADR-0012) and Coolify deploys whatever reaches main, so the
 * last thing standing between a bad bump and a visitor is what was tested before the merge.
 * That covers a great deal and it cannot cover the live environment: the real database, the
 * real bucket, the real domain. This is the other side of the same promise, a look at the
 * running site every few hours that fails loudly when something is wrong, instead of being
 * found by Anna.
 *
 * Read-only and cheap, a few GETs. It asks whether the pages answer with the site in them,
 * whether the CMS answers with its content, whether the editor loads and whether the share
 * card renders. It does not assert any wording, because the wording is Anna's and changes.
 */
const BASE = (process.argv[2] ?? process.env.SMOKE_URL ?? 'https://anna-milazzo.com').replace(/\/$/, '')
const failures = []

const check = async (name, run) => {
	try {
		await run()
		console.log(`ok    ${name}`)
	} catch (error) {
		failures.push(name)
		console.log(`FAIL  ${name}: ${error instanceof Error ? error.message : error}`)
	}
}

const get = async path => {
	const response = await fetch(`${BASE}${path}`, { redirect: 'follow', signal: AbortSignal.timeout(20_000) })
	return { response, text: await response.text() }
}

const expect = (condition, message) => {
	if (!condition) throw new Error(message)
}

for (const path of ['/', '/en', '/contact', '/en/contact', '/legal', '/en/legal']) {
	await check(`page ${path}`, async () => {
		const { response, text } = await get(path)
		expect(response.status === 200, `status ${response.status}`)
		expect(response.headers.get('content-type')?.includes('text/html'), 'not html')
		expect(/<title>[^<]+<\/title>/.test(text), 'no title')
		expect(text.includes('Anna Milazzo'), 'does not name the site')
		expect(!/Application error|Internal Server Error|digest:/.test(text), 'shows an error page')
	})
}

await check('the timeline is on the landing page', async () => {
	const { text } = await get('/')
	expect(text.includes('id="percorso"'), 'no timeline section')
	expect((text.match(/class="daw-lane"/g) ?? []).length > 0, 'no entries in it')
})

for (const locale of ['it', 'en']) {
	await check(`the CMS answers in ${locale}`, async () => {
		const { response, text } = await get(`/api/globals/home?locale=${locale}&depth=0`)
		expect(response.status === 200, `status ${response.status}`)
		const home = JSON.parse(text)
		expect((home.timeline?.entries?.length ?? 0) > 0, 'no timeline entries')
		expect(Boolean(home.hero?.name), 'no hero name')
	})
}

await check('the songs collection answers', async () => {
	const { response, text } = await get('/api/songs?limit=1&depth=0')
	expect(response.status === 200, `status ${response.status}`)
	expect(Array.isArray(JSON.parse(text).docs), 'no docs array')
})

await check('the editor loads', async () => {
	const { response, text } = await get('/admin/login')
	expect(response.status === 200, `status ${response.status}`)
	expect(/Payload|Login/i.test(text), 'not the admin login')
})

await check('the share card renders', async () => {
	const { text } = await get('/')
	const url = text.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/)?.[1]
	expect(url, 'no og:image')
	const response = await fetch(url, { signal: AbortSignal.timeout(20_000) })
	expect(response.status === 200, `status ${response.status}`)
	expect(response.headers.get('content-type')?.startsWith('image/'), `type ${response.headers.get('content-type')}`)
})

if (failures.length > 0) {
	console.log(`\n${failures.length} of the checks failed against ${BASE}: ${failures.join(', ')}`)
	process.exit(1)
}
console.log(`\nAll checks passed against ${BASE}`)
