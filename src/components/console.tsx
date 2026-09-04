/**
 * A strip of mixing-desk channels: a knob and a fader per channel, caps at different
 * heights so the row reads as a desk somebody has set rather than a graphic.
 *
 * Chosen over the more obvious music objects because a fader says "studio" instantly and
 * costs almost nothing to draw — no glyphs, no illustration, no asset. It is also the one
 * device on the page that reads as equipment rather than as ornament, which is what stops
 * the skills field from being a list floating in a colour.
 *
 * Decoration throughout: hidden from assistive technology, carrying nothing the tags
 * beside it do not already say, and nothing here moves.
 */

const CHANNELS = [
	{ id: 'c1', cap: 72, turn: -38, tint: 'var(--magenta)' },
	{ id: 'c2', cap: 34, turn: 24, tint: 'var(--sheet)' },
	{ id: 'c3', cap: 58, turn: -12, tint: 'var(--spring)' },
	{ id: 'c4', cap: 86, turn: 41, tint: 'var(--blue)' },
	{ id: 'c5', cap: 46, turn: -27, tint: 'var(--cantaloupe)' },
	{ id: 'c6', cap: 64, turn: 8, tint: 'var(--sheet)' },
	{ id: 'c7', cap: 28, turn: -45, tint: 'var(--magenta)' },
	{ id: 'c8', cap: 78, turn: 33, tint: 'var(--spring)' },
] as const

export function Console({ className }: { className?: string }) {
	return (
		<div className={`console ${className ?? ''}`} aria-hidden="true" data-console>
			{CHANNELS.map(channel => (
				<div key={channel.id} className="console-strip">
					<span className="console-knob" style={{ transform: `rotate(${channel.turn}deg)` }}>
						<span className="console-pointer" />
					</span>
					<span className="console-track">
						<span className="console-cap" style={{ insetBlockEnd: `${channel.cap}%`, backgroundColor: channel.tint }} />
					</span>
				</div>
			))}
		</div>
	)
}
