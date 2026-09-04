/**
 * A spectrum analyser sitting in a device panel: bars that move, over a row of knobs and
 * faders that do not.
 *
 * The first version was faders alone, which read as equipment but sat dead on the page.
 * Bars that move read as sound being made right now, and it is the one place on this site
 * where continuous motion is honest — everything else here moves only when pressed.
 *
 * The bars animate `transform: scaleY`, not `height`: scale is composited, so eleven bars
 * looping forever cost nothing per frame, where animating height would relayout the row
 * sixty times a second.
 *
 * Four keyframe variants rather than one, cycled with staggered durations and delays, so
 * the row never falls into step with itself. A single shared animation reads as a barber's
 * pole; this reads as a signal.
 *
 * Decoration throughout: hidden from assistive technology, saying nothing the tags beside
 * it do not, and entirely still when reduced motion is asked for.
 */

const BARS = [
	{ id: 'b1', variant: 'a', tint: 'var(--magenta)', duration: '1.10s', delay: '0s' },
	{ id: 'b2', variant: 'b', tint: 'var(--spring)', duration: '0.86s', delay: '-0.35s' },
	{ id: 'b3', variant: 'c', tint: 'var(--cantaloupe)', duration: '1.34s', delay: '-0.72s' },
	{ id: 'b4', variant: 'd', tint: 'var(--blue)', duration: '0.94s', delay: '-0.18s' },
	{ id: 'b5', variant: 'b', tint: 'var(--lemon)', duration: '1.52s', delay: '-0.94s' },
	{ id: 'b6', variant: 'a', tint: 'var(--spring)', duration: '0.78s', delay: '-0.52s' },
	{ id: 'b7', variant: 'd', tint: 'var(--magenta)', duration: '1.22s', delay: '-0.08s' },
	{ id: 'b8', variant: 'c', tint: 'var(--blue)', duration: '0.90s', delay: '-0.63s' },
	{ id: 'b9', variant: 'b', tint: 'var(--cantaloupe)', duration: '1.40s', delay: '-0.27s' },
	{ id: 'b10', variant: 'a', tint: 'var(--lemon)', duration: '1.02s', delay: '-0.81s' },
	{ id: 'b11', variant: 'd', tint: 'var(--spring)', duration: '1.28s', delay: '-0.44s' },
] as const

/** Static. Rotation here is composition, not animation — a knob that turns by itself is a fault. */
const KNOBS = [
	{ id: 'k1', turn: -38 },
	{ id: 'k2', turn: 24 },
	{ id: 'k3', turn: -12 },
	{ id: 'k4', turn: 41 },
] as const

export function Console({ className }: { className?: string }) {
	return (
		<div className={`console ${className ?? ''}`} aria-hidden="true" data-console>
			<div className="console-meter">
				{BARS.map(bar => (
					<span
						key={bar.id}
						className="console-bar"
						data-variant={bar.variant}
						style={{
							backgroundColor: bar.tint,
							animationDuration: bar.duration,
							animationDelay: bar.delay,
						}}
					/>
				))}
			</div>

			<div className="console-deck">
				{KNOBS.map(knob => (
					<span key={knob.id} className="console-knob" style={{ transform: `rotate(${knob.turn}deg)` }}>
						<span className="console-pointer" />
					</span>
				))}
			</div>
		</div>
	)
}
