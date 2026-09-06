/**
 * Where the Portfolio lives, named once.
 *
 * Needed as an absolute origin in three places that cannot use a relative path: the
 * `metadataBase` every canonical and `hreflang` link is resolved against, the Open Graph
 * tags a link preview reads, and the footer of the email a contact message arrives in.
 *
 * From the environment so a preview deployment declares itself rather than claiming to be
 * production, with the real domain as the default because that is what it is almost always
 * serving. `NEXT_PUBLIC_` because the value is not a secret and a Client Component may
 * need it.
 */
const CONFIGURED = process.env.NEXT_PUBLIC_SITE_URL?.trim()

export const SITE_ORIGIN = CONFIGURED && CONFIGURED.length > 0 ? CONFIGURED : 'https://anna-milazzo.com'

/** The domain on its own, for the places that show it rather than link to it. */
export const SITE_DOMAIN = new URL(SITE_ORIGIN).host
