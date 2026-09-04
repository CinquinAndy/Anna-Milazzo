import Link from 'next/link'
import { type Locale, localeHref } from '@/lib/locale'
import type { Setting } from '@/payload-types'

/**
 * The chrome at the foot of every page. The legals link lives here so it is reachable
 * from anywhere, which is the criterion.
 */
export function SiteFooter({ settings, locale }: { settings: Setting; locale: Locale }) {
	const links = settings.socialLinks ?? []

	return (
		<footer className="border-t-brutal border-border bg-ink px-5 py-10 text-sheet sm:px-8" data-site-footer>
			<div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6">
				<ul className="flex flex-wrap gap-4">
					{links.map(link => (
						<li key={link.id ?? link.url}>
							<a href={link.url} className="font-sans underline" rel="noreferrer noopener" target="_blank">
								{link.label}
							</a>
						</li>
					))}
				</ul>
				<Link href={localeHref('/legal', locale)} className="font-mono text-xs uppercase underline" data-legals-link>
					{settings.legalsLinkLabel}
				</Link>
			</div>
		</footer>
	)
}
