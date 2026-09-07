import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { AudioEngine } from '@/components/audio-engine'
import { HeaderHeight } from '@/components/header-height'
import { isLocale } from '@/lib/locale'
import { SITE_ORIGIN } from '@/lib/site'
import { fontVariables } from '../fonts'
import '../globals.css'

export const metadata: Metadata = {
	title: 'Anna Milazzo',
	// Every page already declares its canonical and its two `hreflang` alternates as
	// locale-free paths. They only mean anything to a search engine once there is an origin
	// to resolve them against, and this is the one place to say it.
	metadataBase: new URL(SITE_ORIGIN),
}

/**
 * Root layout for the Portfolio. The Payload admin has its own root layout under
 * `(payload)`, and neither the font variables nor the theme layer belong there, the
 * stylesheet's Preflight would zero the admin's own margins, padding and borders.
 *
 * `lang` is read from `params` rather than `next/root-params`: root-param types are
 * emitted by typegen, and `validate` typechecks before it builds, so the getter would
 * be `any` at the point it matters.
 */
export default async function FrontendLayout({
	children,
	params,
}: {
	children: ReactNode
	params: Promise<{ lang: string }>
}) {
	const { lang } = await params

	// The proxy rewrites everything unprefixed onto `/it` and redirects `/it/*` away,
	// so only `it` and `en` can reach here. Checked anyway, because the day the matcher
	// changes this is where a stray segment would otherwise render an empty page.
	if (!isLocale(lang)) {
		notFound()
	}

	return (
		<html lang={lang} className={fontVariables}>
			<head>
				<script async crossOrigin="anonymous" src="https://tweakcn.com/live-preview.min.js" />
			</head>
			<body>
				<HeaderHeight />
				<AudioEngine>{children}</AudioEngine>
			</body>
		</html>
	)
}
