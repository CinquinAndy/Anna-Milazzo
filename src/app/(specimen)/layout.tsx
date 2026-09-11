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
				{/* The tweakcn live-preview tool, which lets the theme be edited from the browser
					    against the running site. Behind a flag and off unless it is set, because it
					    is a third party's script with full access to every page: it is not in the
					    lockfile, Renovate cannot see it, whoever serves it can change what it does
					    between one visitor and the next, and on the contact page the page it has
					    access to is the one somebody is typing a message into.

					    Turn it on for a session with NEXT_PUBLIC_TWEAKCN_PREVIEW=1 in .env.local. */}
				{process.env.NEXT_PUBLIC_TWEAKCN_PREVIEW === '1' ? (
					<script async crossOrigin="anonymous" src="https://tweakcn.com/live-preview.min.js" />
				) : null}
			</head>
			<body>{children}</body>
		</html>
	)
}
