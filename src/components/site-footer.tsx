import Link from 'next/link'
import { type Locale, localeHref } from '@/lib/locale'
import type { Setting } from '@/payload-types'

/** A page or a section of one, as the header already models them. */
type FooterLink = { label: string; href: string }

/**
 * The chrome at the foot of every page.
 *
 * It was two rows of small underlined text: the social links and the legals link, which is
 * the only thing the acceptance criteria required of it. That left it as the one part of
 * the site with no route anywhere, so a visitor who reached the bottom of the legals page
 * had the browser's back button and nothing else.
 *
 * Now it carries every page, the links out, and the address, in three columns on ink. The
 * columns are the same voice the rest of the site uses for machine strings: mono, small,
 * tracked for the headings, and sheet on ink measures 18.7:1.
 */
export function SiteFooter({
	settings,
	locale,
	nav = [],
	siteName,
}: {
	settings: Setting
	locale: Locale
	/* Explicitly `| undefined`: exactOptionalPropertyTypes is on, so a caller that computes
	 * these conditionally cannot pass the optional form without it. */
	nav?: FooterLink[] | undefined
	/** For the copyright line. Anna's name is hers, so it comes from the CMS. */
	siteName?: string | undefined
}) {
	const links = settings.socialLinks ?? []
	const email = settings.contactEmail
	// Rendered on the server on every request, so it does not need anyone to remember to
	// rebuild the site in January.
	const year = new Date().getFullYear()

	return (
		<footer className="site-footer" data-site-footer>
			<div className="shell">
				<div className="footer-columns">
					{nav.length > 0 ? (
						<nav aria-labelledby="footer-pages">
							<h2 id="footer-pages" className="footer-heading">
								{settings.navHeading}
							</h2>
							<ul className="footer-list">
								{nav.map(link => (
									<li key={link.href}>
										{/* An in-page anchor on another route is not a route change, so those stay
										    plain anchors and the real pages get the router. */}
										{link.href.includes('#') ? (
											<a href={link.href} className="footer-link">
												{link.label}
											</a>
										) : (
											<Link href={link.href} className="footer-link">
												{link.label}
											</Link>
										)}
									</li>
								))}
							</ul>
						</nav>
					) : null}

					{links.length > 0 ? (
						<div>
							<h2 className="footer-heading">{settings.elsewhereHeading}</h2>
							<ul className="footer-list">
								{links.map(link => (
									<li key={link.id ?? link.url}>
										<a href={link.url} className="footer-link" rel="noreferrer noopener" target="_blank">
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>
					) : null}

					{/* No heading over the address: there is no word for it in the CMS, and inventing
					    one in code is the rule this project keeps. It is a control instead, which
					    says what it is by being pressable. */}
					{email ? (
						<p className="footer-mail-row">
							<a href={`mailto:${email}`} className="control control-paper control-wrap font-mono text-sm">
								{email}
							</a>
						</p>
					) : null}
				</div>

				<div className="footer-foot">
					<Link href={localeHref('/legal', locale)} className="footer-link" data-legals-link>
						{settings.legalsLinkLabel}
					</Link>

					{/* The one line on this site that is not Anna's to edit, because it is not about
					    her: it is the signature of whoever built it. The name beside it still comes
					    from the CMS, since that part is hers. */}
					<p className="footer-credit" data-credit>
						© {year} {siteName}
						<span className="footer-sep">·</span>
						Developed with
						<svg className="footer-heart" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
							<path
								d="M12 21s-7.5-4.7-9.6-9.2C.6 8.1 2.6 4.5 6.2 4.5c2.2 0 3.6 1.2 4.4 2.3l1.4 1.8 1.4-1.8c.8-1.1 2.2-2.3 4.4-2.3 3.6 0 5.6 3.6 3.8 7.3C19.5 16.3 12 21 12 21z"
								fill="currentColor"
							/>
						</svg>
						by{' '}
						<a href="https://andy-cinquin.com" className="footer-link" rel="noreferrer noopener" target="_blank">
							Cinquin Andy
						</a>
					</p>
				</div>
			</div>
		</footer>
	)
}
