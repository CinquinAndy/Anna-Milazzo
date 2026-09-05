export type Bar = { readonly id: string; readonly height: number }

/**
 * Positions carry their own identity so a bar can be keyed by what it is rather than by
 * where it sits. The phrases are fixed and never reorder, but a list keyed by index is a
 * standing invitation for the next person to sort one.
 */
function withIds(heights: readonly number[]): readonly Bar[] {
	return heights.map((height, index) => ({ id: `b${index}`, height }))
}

/**
 * An authored amplitude phrase, in percentages of the rail height.
 *
 * Not generated and not uniform. A uniform pitch is what made the first transport read as
 * a loading bar rather than as audio: the eye needs a phrase, quiet openings, a swell, a
 * couple of transients, a decay, before it accepts a row of bars as sound. These values
 * were shaped by hand for that reading, so do not sort them or smooth them.
 *
 * This is now the fallback rather than the default. Every track carries its own waveform,
 * measured from the file when it was uploaded and stored on the audio record, and the
 * transport draws that. The phrase stands in only for a track the decoder could not read,
 * where the choice is between a shape that reads as audio and a rail of dead equal blocks.
 */
export const BAR_PHRASE = withIds([
	22, 34, 28, 46, 38, 62, 54, 78, 66, 92, 74, 58, 44, 52, 36, 48, 30, 42, 56, 70, 88, 96, 82, 68, 54, 62, 46, 58, 40,
	50, 34, 44, 60, 76, 90, 72, 56, 42, 52, 38, 46, 30, 36, 24,
])

/**
 * A shorter, louder phrase for the divider strip, where the bars are ornament rather than
 * a control and are mirrored about the centre line.
 */
export const BAND_PHRASE = withIds([
	38, 64, 46, 82, 58, 94, 70, 52, 86, 60, 40, 74, 90, 56, 68, 44, 78, 50, 88, 62, 36, 72, 84, 48, 66, 92, 54, 42, 76,
	58, 80, 46,
])
