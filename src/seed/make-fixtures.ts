/**
 * Generates the placeholder tracks in `fixtures/`.
 *
 * Run by hand — `bun run src/seed/make-fixtures.ts` — and needs `ffmpeg` on PATH for the
 * MP3 encode. Deliberately not a project dependency and not part of any build: the output
 * is committed, and the two MP3 encoders on npm are both LGPL and unmaintained since 2023.
 *
 * WHY THESE EXIST AT ALL. The first placeholders were pairs of pure sine tones. That was
 * fine while the page only drew an authored bar phrase, and it became a problem the moment
 * anything measured the audio. Measured on those files, 0.00% of the energy sat above
 * 1 kHz, and the mean correlation between frequency bands was 0.87 — every band of a
 * spectrum analysis was the same line, so the visualiser would have drawn one shape
 * pulsing rather than a spectrum. These replacements carry a harmonic series, a bass, and
 * a hi-hat, which puts real and DIFFERENT content in each band: the same measurement gives
 * 0.42, and all twenty bands move independently.
 *
 * They are still placeholders. Anna's own recordings replace them, and nothing here is
 * meant to be listened to for pleasure.
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures')
const RATE = 44100

/** One track's character. Durations match `durationSeconds` in `content.ts`. */
const TRACKS = [
	// A nocturne: slow, low, sparse, no hats on the offbeats.
	{
		reference: 'notturno-per-tram-vuoto',
		seconds: 24,
		bpm: 64,
		root: 45,
		mode: [0, 2, 3, 7, 8],
		hats: 0.5,
		bright: 0.7,
	},
	// A storm: fast, dense, the widest register.
	{ reference: 'perche-il-temporale', seconds: 31, bpm: 132, root: 52, mode: [0, 1, 5, 7, 10], hats: 1, bright: 1.15 },
	// Four in the morning: mid tempo, thin, high.
	{ reference: 'citta-alle-quattro', seconds: 18, bpm: 96, root: 57, mode: [0, 2, 4, 7, 9], hats: 0.8, bright: 1 },
	// A study for two hands: even quavers, no drums at all, close intervals.
	{ reference: 'studio-per-due-mani', seconds: 27, bpm: 88, root: 50, mode: [0, 2, 3, 5, 7], hats: 0, bright: 0.85 },
	// Closer than expected: a warm mid tempo that opens up.
	{
		reference: 'piu-vicino-del-previsto',
		seconds: 35,
		bpm: 108,
		root: 48,
		mode: [0, 3, 5, 7, 10],
		hats: 0.65,
		bright: 0.95,
	},
] as const

const midiToHz = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

/**
 * A deterministic generator.
 *
 * Never `Math.random()`: these files are committed, and a regenerated fixture that differs
 * from the one in git would show up as a binary diff nobody can review.
 */
function makeNoise(seed: number) {
	let state = seed
	return () => {
		state = (state * 1103515245 + 12345) & 0x7fffffff
		return (state / 0x7fffffff) * 2 - 1
	}
}

function render(track: (typeof TRACKS)[number]) {
	const count = Math.floor(RATE * track.seconds)
	const left = new Float64Array(count)
	const right = new Float64Array(count)
	const noise = makeNoise(track.root * 7919 + track.seconds)
	const beat = 60 / track.bpm

	/**
	 * A struck tone: a harmonic series whose partials die at different rates.
	 *
	 * This is the whole reason these files exist. A single sine puts all its energy in one
	 * band; sixteen partials at 1/n^1.3, each decaying faster than the last, put energy
	 * right across the spectrum and take it away again at different speeds — which is what
	 * makes the bands of an analysis move independently.
	 */
	const pluck = (start: number, midi: number, duration: number, gain: number, pan: number) => {
		const root = midiToHz(midi)
		const from = Math.floor(start * RATE)
		const length = Math.floor(duration * RATE)
		for (let partial = 1; partial <= 16; partial++) {
			const hz = root * partial * (partial > 1 ? 1 + partial * 0.0007 : 1)
			if (hz > RATE / 2 - 1200) {
				break
			}
			const amplitude = (gain / partial ** 1.3) * (partial > 4 ? track.bright : 1)
			const decay = 2.4 + partial * 0.72
			const phase = noise() * Math.PI
			for (let i = 0; i < length; i++) {
				const seconds = i / RATE
				const envelope = Math.exp(-seconds * decay) * Math.min(1, seconds * 420)
				const value = Math.sin(2 * Math.PI * hz * seconds + phase) * amplitude * envelope
				const at = from + i
				if (at < count) {
					left[at] = (left[at] as number) + value * (1 - pan)
					right[at] = (right[at] as number) + value * pan
				}
			}
		}
	}

	/** Pitch falling fast is what a drum is; a steady low sine is a hum. */
	const kick = (start: number) => {
		const from = Math.floor(start * RATE)
		const length = Math.floor(0.34 * RATE)
		for (let i = 0; i < length; i++) {
			const seconds = i / RATE
			const hz = 112 * Math.exp(-seconds * 25) + 41
			const value = Math.sin(2 * Math.PI * hz * seconds) * Math.exp(-seconds * 8.5) * 0.46
			const at = from + i
			if (at < count) {
				left[at] = (left[at] as number) + value
				right[at] = (right[at] as number) + value
			}
		}
	}

	/** Filtered noise, and the only source of anything above 8 kHz. */
	const hat = (start: number, gain: number) => {
		const from = Math.floor(start * RATE)
		const length = Math.floor(0.085 * RATE)
		let filtered = 0
		let previous = 0
		for (let i = 0; i < length; i++) {
			const raw = noise()
			// A one-pole high-pass. Written out because the obvious `y = a * (y + x)` is a
			// LOW-pass, and removes exactly the octaves this exists to provide.
			filtered = 0.93 * (filtered + raw - previous)
			previous = raw
			const value = filtered * Math.exp(-(i / RATE) * 46) * gain
			const at = from + i
			if (at < count) {
				left[at] = (left[at] as number) + value * 0.62
				right[at] = (right[at] as number) + value * 0.38
			}
		}
	}

	const degree = (step: number) => {
		const scale = track.mode
		return (
			track.root +
			(scale[((step % scale.length) + scale.length) % scale.length] as number) +
			12 * Math.floor(step / scale.length)
		)
	}

	// A short lead-in before anything sounds. Starting on the downbeat put every instrument
	// on sample zero at once, which is a click rather than a chord — measured, the first
	// analysis bucket came out four times louder than anything after it.
	const LEAD_IN = 0.06
	const bars = Math.floor((track.seconds - LEAD_IN) / (beat * 4))
	for (let bar = 0; bar < bars; bar++) {
		const at = LEAD_IN + bar * beat * 4
		// A chord under the bar, and a bass note two octaves down.
		// Spread across a few milliseconds rather than struck together. Two hands do not
		// land three notes on the same sample, and stacking them there is what turns a chord
		// into a transient.
		for (const [index, step] of [0, 2, 4].entries()) {
			pluck(at + index * 0.011, degree(step + bar) - 12, beat * 3.4, 0.15, 0.3 + index * 0.2)
		}
		pluck(at, degree(bar) - 24, beat * 3.8, 0.2, 0.5)
		for (let eighth = 0; eighth < 8; eighth++) {
			const when = at + eighth * beat * 0.5
			if (track.hats > 0) {
				if (eighth % 4 === 0) {
					kick(when)
				}
				hat(when, (eighth % 2 === 0 ? 0.105 : 0.05) * track.hats)
			}
			if (eighth % 2 === 0) {
				pluck(when, degree(bar * 3 + eighth), beat * 1.6, 0.125, 0.34 + (eighth % 3) * 0.15)
			}
		}
	}

	// Fade the very ends. An MP3 that starts or stops on a non-zero sample clicks, and the
	// click is loud enough to become the loudest thing a measurement finds in the file.
	const fade = Math.floor(0.03 * RATE)
	for (let i = 0; i < fade; i++) {
		const gain = i / fade
		left[i] = (left[i] as number) * gain
		right[i] = (right[i] as number) * gain
		const j = count - 1 - i
		left[j] = (left[j] as number) * gain
		right[j] = (right[j] as number) * gain
	}

	let peak = 0
	for (let i = 0; i < count; i++) {
		peak = Math.max(peak, Math.abs(left[i] as number), Math.abs(right[i] as number))
	}
	const scale = peak > 0 ? 0.89 / peak : 1

	// 16-bit stereo WAV, which ffmpeg turns into the MP3 that is committed.
	const buffer = Buffer.alloc(44 + count * 4)
	buffer.write('RIFF', 0)
	buffer.writeUInt32LE(36 + count * 4, 4)
	buffer.write('WAVE', 8)
	buffer.write('fmt ', 12)
	buffer.writeUInt32LE(16, 16)
	buffer.writeUInt16LE(1, 20)
	buffer.writeUInt16LE(2, 22)
	buffer.writeUInt32LE(RATE, 24)
	buffer.writeUInt32LE(RATE * 4, 28)
	buffer.writeUInt16LE(4, 32)
	buffer.writeUInt16LE(16, 34)
	buffer.write('data', 36)
	buffer.writeUInt32LE(count * 4, 40)
	const clamp = (value: number) => Math.max(-32768, Math.min(32767, Math.round(value * scale * 32767)))
	for (let i = 0; i < count; i++) {
		buffer.writeInt16LE(clamp(left[i] as number), 44 + i * 4)
		buffer.writeInt16LE(clamp(right[i] as number), 46 + i * 4)
	}
	return buffer
}

const scratch = mkdtempSync(path.join(tmpdir(), 'fixtures-'))
try {
	for (const track of TRACKS) {
		const wav = path.join(scratch, `${track.reference}.wav`)
		writeFileSync(wav, render(track))
		const mp3 = path.join(FIXTURES, `track-${track.reference}.mp3`)
		execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '128k', mp3])
		// biome-ignore lint/suspicious/noConsole: a hand-run generator whose only output is this
		console.log(`wrote ${path.basename(mp3)} (${track.seconds}s, ${track.bpm} bpm)`)
	}
} finally {
	rmSync(scratch, { recursive: true, force: true })
}
