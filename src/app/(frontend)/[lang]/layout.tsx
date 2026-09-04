import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { isLocale } from '@/lib/locale'
import { fontVariables } from '../fonts'
import '../globals.css'

export const metadata: Metadata = {
	title: 'Anna Milazzo',
}

/**
 * Root layout for the Portfolio. The Payload admin has its own root layout under
 * `(payload)`, and neither the font variables nor the theme layer belong there — the
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
			<body>{children}</body>
		</html>
	)
}
