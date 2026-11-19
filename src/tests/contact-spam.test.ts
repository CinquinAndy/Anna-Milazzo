import { describe, expect, it } from 'vitest'
import { containsLink, isRandomLetters, isTrapFilled, looksLikeRobotText } from '@/lib/contact/spam'

// Names and messages robots sent to cinquin-maeva.com in November 2026 (same kind of form).
const ROBOTS = [
	'FzEwOOmxoOoDAyMmIDdgBtPG',
	'DIIcuBUdTijuxupeyQZCu',
	'YTjgOendxRAwpRhFc',
	'lMNsKJWhgXBFKlpsReGMt',
	'oKcQzvnDkccQlIuC',
	'KNsdbXkdzJFzisWQ',
]

// What a person may type: never caught.
const PEOPLE = [
	'Giulia Ferrari',
	'Gian-Luca',
	'McDonald',
	'DUPONTMARTIN',
	'Buongiorno',
	'Cerco musica per un cortometraggio. Possiamo parlarne?',
	'MarieClaire',
]

describe('isRandomLetters', () => {
	it.each(ROBOTS)('catches %s', text => {
		expect(isRandomLetters(text)).toBe(true)
	})

	it.each(PEOPLE)('lets %s through', text => {
		expect(isRandomLetters(text)).toBe(false)
	})

	it('ignores anything that is not text', () => {
		expect(isRandomLetters(undefined)).toBe(false)
		expect(isRandomLetters({ toString: () => 'FzEwOOmxoOoDAyMmIDdgBtPG' })).toBe(false)
	})
})

describe('looksLikeRobotText', () => {
	it('needs both the name and the message to be random', () => {
		expect(looksLikeRobotText({ name: 'FzEwOOmxoOoDAyMmIDdgBtPG', message: 'oKcQzvnDkccQlIuC' })).toBe(true)
		expect(looksLikeRobotText({ name: 'GiuliaFERRARI', message: 'Ciao, una domanda.' })).toBe(false)
		expect(looksLikeRobotText({ name: 'Giulia', message: 'oKcQzvnDkccQlIuC' })).toBe(false)
	})
})

describe('isTrapFilled', () => {
	it('is false when empty or absent', () => {
		expect(isTrapFilled(undefined)).toBe(false)
		expect(isTrapFilled('')).toBe(false)
		expect(isTrapFilled('  ')).toBe(false)
	})

	it('is true when filled', () => {
		expect(isTrapFilled('https://spam.example')).toBe(true)
	})
})

describe('containsLink', () => {
	it.each(['see https://example.invalid/offer', 'my site www.example.it'])('finds a link in %s', text => {
		expect(containsLink(text)).toBe(true)
	})

	it('finds none in a plain message', () => {
		expect(containsLink('Ciao, una domanda sul brano.')).toBe(false)
	})
})
