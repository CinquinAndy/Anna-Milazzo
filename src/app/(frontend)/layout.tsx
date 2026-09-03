import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
	title: 'Anna Milazzo',
}

/**
 * Root layout for the Portfolio. The Payload admin has its own root layout under
 * `(payload)`, so there is deliberately no `app/layout.tsx`.
 */
export default function FrontendLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="it">
			<body>{children}</body>
		</html>
	)
}
