import { Azeret_Mono, Bricolage_Grotesque, Instrument_Sans } from 'next/font/google'

/**
 * The three faces (ADR-0008). One instance per family — every call to a loader
 * self-hosts another copy, so they live here and are imported from this file.
 *
 * `weight` is deliberately absent: next/font then takes the variable cut, and `axes` is
 * rejected outright if a weight is given. Axes other than `wght` are dropped from the
 * build unless named, which is the whole reason Bricolage was chosen — `wdth` is what
 * absorbs Italian's expansion over English without shrinking the type.
 *
 * `latin-ext` is included for breadth, but note it is not what carries Italian: à è é ì
 * ò ù and their capitals all live in the `latin` subset. The claim in
 * `docs/research/folder-ui-and-typography.md` §4.2(b) that omitting `latin-ext` breaks
 * Italian mid-word is wrong — measured against Google's own published unicode-ranges.
 */
export const bricolage = Bricolage_Grotesque({
	subsets: ['latin', 'latin-ext'],
	axes: ['opsz', 'wdth'],
	display: 'swap',
	variable: '--font-bricolage',
})

export const instrument = Instrument_Sans({
	subsets: ['latin', 'latin-ext'],
	axes: ['wdth'],
	display: 'swap',
	variable: '--font-instrument',
})

// Azeret Mono publishes no axis but `wght`; passing `axes` here is a build error.
export const azeret = Azeret_Mono({
	subsets: ['latin', 'latin-ext'],
	display: 'swap',
	variable: '--font-azeret',
})

/** Every font variable, for the `<html>` element of a root layout. */
export const fontVariables = `${bricolage.variable} ${instrument.variable} ${azeret.variable}`
