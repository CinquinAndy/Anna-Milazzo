/**
 * Umami, the one piece of code on this site that comes from another origin.
 *
 * Self-hosted on Andy's own server rather than a vendor's: no third party is being
 * trusted with what visitors do here, the instance is cookieless, and nothing is sent
 * to an advertising network. That is what makes it an acceptable exception to the rule
 * `e2e/third-party.spec.ts` enforces, and the rule still holds for everything else.
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
 * The two scripts, in the order Umami wants them: the recorder registers itself and the
 * tracker then drives it. `defer` on both, so neither competes with the page for the
 * main thread while it is still arriving.
 */
export const umamiScripts = [`${UMAMI_ORIGIN}/recorder.js`, `${UMAMI_ORIGIN}/script.js`] as const
