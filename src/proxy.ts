import { type NextRequest, NextResponse } from 'next/server'

/**
 * Locale routing. Italian is served unprefixed at `/`; English lives under `/en`
 * (ADR-0001). The `[lang]` segment is real, so an unprefixed request is rewritten onto
 * the Italian tree — rewritten, not redirected, so the Recruiter's URL stays clean.
 *
 * The matcher is the load-bearing part. Payload owns `/admin` and `/api`, and the naive
 * matcher in the Next.js i18n guide rewrites both onto `/it/...`, which takes the admin
 * panel down. Framework internals and anything with a file extension are excluded too.
 */
export default function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl

	// `/it/*` is not a public URL. Italian has no prefix, so serving it at a second
	// address would publish every page twice. 307 rather than 308 while the URL shape
	// is still young: ADR-0001 notes it is expensive to reverse once indexed, and a
	// permanent redirect is cached by browsers indefinitely.
	if (pathname === '/it' || pathname.startsWith('/it/')) {
		const url = request.nextUrl.clone()
		url.pathname = pathname.slice(3) || '/'
		return NextResponse.redirect(url, 307)
	}

	// English is already on the tree it renders from.
	if (pathname === '/en' || pathname.startsWith('/en/')) {
		return NextResponse.next()
	}

	const url = request.nextUrl.clone()
	// `/` must become `/it`, not `/it/` — the trailing slash is a different path.
	url.pathname = pathname === '/' ? '/it' : `/it${pathname}`
	return NextResponse.rewrite(url)
}

export const config = {
	// Cannot be built from a variable: Next reads this statically at build time.
	//   api      — Payload's REST API
	//   admin    — the Payload admin panel
	//   specimen — the theme proof sheet, which has no locale and its own root layout
	//   _next    — framework internals, including /_next/static and /_next/image
	//   .*\..*   — anything with a file extension: favicon.ico, robots.txt, images
	matcher: ['/((?!api|admin|specimen|_next|.*\\..*).*)'],
}
