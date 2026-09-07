import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { fontVariables } from '../(frontend)/fonts'
import '../(frontend)/globals.css'

export const metadata: Metadata = {
	title: 'Theme specimen, Anna Milazzo',
	// Not part of the Portfolio: three pages is the whole site (ADR-0002). This is a
	// proof sheet for the theme layer, reachable but never indexed.
	robots: { index: false, follow: false },
}

/**
 * A third root layout, alongside the Portfolio's and the Payload admin's. The specimen
 * sits outside `[lang]` because it is not part of the Portfolio and has no locale, the
 * proxy excludes `/specimen` from the rewrite for the same reason.
 */
export default function SpecimenLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className={fontVariables}>
			<head>
				<script async crossOrigin="anonymous" src="https://tweakcn.com/live-preview.min.js" />
			</head>
			<body>{children}</body>
		</html>
	)
}
