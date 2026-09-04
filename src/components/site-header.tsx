import Link from 'next/link'
import { LanguageSwitch } from '@/components/language-switch'
import { type Locale, localeHref } from '@/lib/locale'

/** The chrome at the top of every page: a way home, and a way to the other language. */
export function SiteHeader({ path, locale }: { path: string; locale: Locale }) {
	return (
		<header className="border-b-brutal border-border px-5 py-4 sm:px-8">
			<div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
				{path === '/' ? (
					<span />
				) : (
					<Link href={localeHref('/', locale)} className="font-mono text-xs uppercase underline">
						Anna Milazzo
					</Link>
				)}
				<LanguageSwitch path={path} locale={locale} />
			</div>
		</header>
	)
}
