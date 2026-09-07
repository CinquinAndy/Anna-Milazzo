import { OgFrame, OgHeadline } from '@/components/og-frame'
import { OG } from '@/lib/og/palette'

/**
 * The card the contact page unfurls with.
 *
 * A different ground from the site card, cantaloupe rather than blue, so the two are told
 * apart at a glance in a feed. Cantaloupe carries black type only, 2.078:1 against white,
 * which is the rule the stylesheet states beside the token.
 *
 * It leads with the action rather than the name, because somebody arriving at this link
 * has already been told who she is. The address is set as its own object, in the same
 * paper pill on the same hard shadow the arrival card uses on the page itself, so the
 * card is useful without anybody clicking it.
 */
export function OgContactCard({
	heading,
	who,
	email,
	domain,
}: {
	heading: string
	who: string
	email: string
	domain: string
}) {
	return (
		<OgFrame ground={OG.cantaloupe} domain={domain}>
			<OgHeadline colour={OG.ink}>{heading}</OgHeadline>

			<div style={{ marginTop: 26, maxWidth: 940, fontSize: 33, lineHeight: 1.32, color: OG.ink }}>{who}</div>

			<div tw="flex" style={{ marginTop: 34 }}>
				<div
					tw="flex"
					style={{
						backgroundColor: OG.sheet,
						color: OG.ink,
						fontFamily: 'Azeret',
						fontSize: 30,
						letterSpacing: '0.02em',
						padding: '16px 24px',
						border: `4px solid ${OG.ink}`,
						boxShadow: `8px 8px 0 0 ${OG.ink}`,
					}}
				>
					{email}
				</div>
			</div>
		</OgFrame>
	)
}
