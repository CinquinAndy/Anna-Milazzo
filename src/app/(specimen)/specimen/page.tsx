const COLOUR_TOKENS = [
	'--background',
	'--foreground',
	'--card',
	'--card-foreground',
	'--popover',
	'--popover-foreground',
	'--primary',
	'--primary-foreground',
	'--secondary',
	'--secondary-foreground',
	'--muted',
	'--muted-foreground',
	'--accent',
	'--accent-foreground',
	'--destructive',
	'--destructive-foreground',
	'--border',
	'--input',
	'--ring',
	'--decor-lime',
	'--chart-1',
	'--chart-2',
	'--chart-3',
	'--chart-4',
	'--chart-5',
] as const

const SHADOW_STEPS = [
	'--shadow-2xs',
	'--shadow-xs',
	'--shadow-sm',
	'--shadow',
	'--shadow-md',
	'--shadow-lg',
	'--shadow-xl',
	'--shadow-2xl',
] as const

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const

/** The Italian string every heading size is checked against. */
const ACCENT_STRING = 'ÈÀÙ PERCHÉ PIÙ CITTÀ PERÒ'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section style={{ marginBlockEnd: '5rem' }}>
			<h2 style={{ marginBlockEnd: '1.5rem' }}>{title}</h2>
			{children}
		</section>
	)
}

export default function SpecimenPage() {
	return (
		<main style={{ maxWidth: '72rem', margin: '0 auto', padding: '3rem 1.5rem' }}>
			<h1 style={{ marginBlockEnd: '3rem' }}>Theme specimen</h1>

			<Section title="Colore">
				<ul
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fill, minmax(11rem, 1fr))',
						gap: '1rem',
						listStyle: 'none',
						padding: 0,
					}}
				>
					{COLOUR_TOKENS.map(token => (
						<li key={token}>
							{/* The label sits on the paper ground, never on the swatch: half these
							    tokens are pure black or pure white and a label inside would be
							    invisible on its own fill. */}
							<div
								data-token={token}
								style={{
									height: '4.5rem',
									backgroundColor: `var(${token})`,
									border: 'var(--border-brutal) solid var(--border)',
									boxShadow: 'var(--shadow-sm)',
								}}
							/>
							<code
								style={{
									display: 'block',
									marginBlockStart: '0.5rem',
									fontFamily: 'var(--font-mono)',
									fontSize: '0.75rem',
								}}
							>
								{token}
							</code>
						</li>
					))}
				</ul>
			</Section>

			<Section title="Scala tipografica">
				{HEADING_LEVELS.map(level => {
					const Tag = `h${level}` as 'h1'
					return (
						<div key={level} style={{ marginBlockEnd: '1.5rem' }}>
							<Tag data-heading={level}>Anna Milazzo — compositrice</Tag>
							<code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>h{level}</code>
						</div>
					)
				})}
			</Section>

			<Section title="Accenti italiani">
				{/* The two-line case is the one that bites: at line-height 0.9 the accents on
				    the second line rise into the first line's glyphs. The frame gives the
				    pixel scan a known ground and clear margins on every side. */}
				{/* No border on the frame: the pixel scan reads its ground from the corner
				    pixel, and a black rule there would make every paper row count as ink. */}
				<div
					data-accent-frame
					style={{
						backgroundColor: 'var(--background)',
						padding: '3rem 2rem',
					}}
				>
					<h2 data-accent-hero style={{ fontSize: 'var(--text-h1)', margin: 0 }}>
						ÈÀÙ PERCHÉ PIÙ
						<br />
						CITTÀ PERÒ
					</h2>
				</div>
				{/* The same three capitals with and without their marks, at the same size in
				    identical frames. If the accents were being cut off, the two would have
				    ink starting at the same row. */}
				<div style={{ display: 'flex', gap: '2rem', marginBlockStart: '2rem' }}>
					<div data-accent-probe="accented" style={{ backgroundColor: 'var(--background)', padding: '2rem' }}>
						<h2 style={{ fontSize: 'var(--text-h1)', margin: 0 }}>ÈÀÙ</h2>
					</div>
					<div data-accent-probe="plain" style={{ backgroundColor: 'var(--background)', padding: '2rem' }}>
						<h2 style={{ fontSize: 'var(--text-h1)', margin: 0 }}>EAU</h2>
					</div>
				</div>
				<p data-accent-single style={{ fontSize: 'var(--text-h3)', fontFamily: 'var(--font-display)' }}>
					{ACCENT_STRING}
				</p>
			</Section>

			<Section title="Asse di larghezza">
				{/* Inline-block, not block: a block box measures the full column whatever the
				    glyphs do, which would make the comparison meaningless. */}
				<p
					data-axis="wdth-100"
					style={{
						display: 'inline-block',
						fontFamily: 'var(--font-display)',
						fontSize: '2rem',
						fontStretch: '100%',
						margin: 0,
					}}
				>
					{ACCENT_STRING}
				</p>
				<br />
				<p
					data-axis="wdth-75"
					style={{
						display: 'inline-block',
						fontFamily: 'var(--font-display)',
						fontSize: '2rem',
						fontStretch: '75%',
						margin: 0,
					}}
				>
					{ACCENT_STRING}
				</p>
			</Section>

			<Section title="Ombre">
				<ul
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fill, minmax(11rem, 1fr))',
						gap: '2.5rem',
						listStyle: 'none',
						padding: 0,
					}}
				>
					{SHADOW_STEPS.map(step => (
						<li key={step}>
							<div
								data-shadow={step}
								style={{
									height: '4.5rem',
									backgroundColor: 'var(--card)',
									border: 'var(--border-brutal) solid var(--border)',
									boxShadow: `var(${step})`,
								}}
							/>
							<code
								style={{
									display: 'block',
									marginBlockStart: '0.75rem',
									fontFamily: 'var(--font-mono)',
									fontSize: '0.75rem',
								}}
							>
								{step}
							</code>
						</li>
					))}
				</ul>
			</Section>

			<Section title="Comandi">
				{/* All three states rendered side by side. Driving hover and press only from
				    the test would leave a human opening this page seeing one of them. */}
				<div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
					<span>
						<button type="button" className="control control-primary" data-control-state="rest">
							Ascolta
						</button>
						<code
							style={{
								display: 'block',
								marginBlockStart: '0.75rem',
								fontFamily: 'var(--font-mono)',
								fontSize: '0.75rem',
							}}
						>
							rest
						</code>
					</span>
					<span>
						<span className="control control-primary is-hover" data-control-state="hover">
							Ascolta
						</span>
						<code
							style={{
								display: 'block',
								marginBlockStart: '0.75rem',
								fontFamily: 'var(--font-mono)',
								fontSize: '0.75rem',
							}}
						>
							hover — lifts, shadow grows
						</code>
					</span>
					<span>
						<span className="control control-primary is-press" data-control-state="press">
							Ascolta
						</span>
						<code
							style={{
								display: 'block',
								marginBlockStart: '0.75rem',
								fontFamily: 'var(--font-mono)',
								fontSize: '0.75rem',
							}}
						>
							press — into the shadow, collapsed
						</code>
					</span>
				</div>
				<div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBlockStart: '2rem' }}>
					<button type="button" className="control control-accent">
						Mettiamoci in contatto
					</button>
					<button type="button" className="control control-paper">
						Scopri di più
					</button>
				</div>
			</Section>

			<Section title="Focus">
				{/* Every focusable here sits on the paper ground. The blue ring clears 3:1
				    against paper; against the cantaloupe block it measures 2.78:1, which is
				    why no control is placed on cantaloupe. */}
				<div data-focus-row style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
					<button type="button" className="control control-primary" data-focusable>
						Pulsante
					</button>
					<a href="#focus-target" className="control control-paper" data-focusable>
						Collegamento
					</a>
					<input
						type="text"
						aria-label="Campo di testo"
						data-focusable
						style={{
							border: 'var(--border-brutal) solid var(--input)',
							padding: '0.75rem',
							backgroundColor: 'var(--card)',
							fontFamily: 'var(--font-sans)',
						}}
					/>
				</div>
				<p id="focus-target" style={{ fontFamily: 'var(--font-sans)', marginBlockStart: '1rem' }}>
					Tab through the row above: the indicator is a blue outline offset from the element&rsquo;s own black keyline,
					so the two never read as one doubled border.
				</p>
			</Section>
		</main>
	)
}
