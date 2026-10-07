/**
 * Umami, the one piece of code on this site that comes from another origin.
 *
 * Self-hosted on Andy's own server rather than a vendor's: no third party is being
 * trusted with what visitors do here, the instance is cookieless, and nothing is sent
 * to an advertising network. That is what makes it an acceptable exception to the rule
 * `e2e/third-party.spec.ts` enforces, and the rule still holds for everything else.
 *
 * The tracker only. Umami also ships `recorder.js`, which replays how an individual
 * moved through a page, and that is a different question under ePrivacy than counting
 * page views without a cookie: the CNIL's audience-measurement exemption is written for
 * the latter. Keeping the tracker alone is what lets this site measure its audience with
 * no consent banner, so the recorder stays out. See ADR-0010.
 *
 * Off unless `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set, which is the whole gate:
 *
 * - local development does not count your own page loads as traffic;
 * - the test suite stays honest, because a build with no id loads nothing at all and
 *   `third-party.spec.ts` can keep asserting the strict rule;
 * - a preview deployment does not pollute the production figures.
 *
 * `NEXT_PUBLIC_` is inlined at build time, so Coolify has to mark it build-enabled, the
 * same note the Turnstile site key carries in `.env.example`.
 */

/** The instance. Not a secret, and in the page source of every production page anyway. */
export const UMAMI_ORIGIN = 'https://umami.wadefade.fr'

/** The host on its own, for the test that has to recognise it on the wire. */
export const UMAMI_HOST = new URL(UMAMI_ORIGIN).host

const CONFIGURED = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim()

/** The site's id in that instance, or `null` when this build is not measuring anything. */
export const umamiWebsiteId = CONFIGURED !== undefined && CONFIGURED.length > 0 ? CONFIGURED : null

/**
 * What gets loaded. One entry, and the list shape is the point: it is what
 * `e2e/third-party.spec.ts` asserts the page declares, so adding `recorder.js` back here
 * would fail the test that says exactly which scripts the exception buys, rather than
 * slipping in. Deliberately re-enabling it means reading ADR-0010 and the legal notice.
 *
 * `defer`, so it does not compete with the page for the main thread while it is arriving.
 */
export const umamiScripts = [`${UMAMI_ORIGIN}/script.js`] as const
