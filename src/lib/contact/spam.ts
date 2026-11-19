/**
 * Telling robot submissions apart from people, without ever turning a person away.
 *
 * Same rules as the other contact forms Andy runs (cinquin-maeva.com, November 2026): robots
 * there called the form's action directly and filled both the name and the message with a run of
 * random letters ("FzEwOOmxoOoDAyMmIDdgBtPG", "oKcQzvnDkccQlIuC"). A submission caught here gets
 * the ordinary "sent" answer and nothing is delivered, so the robot has no reason to adapt.
 */

/** The trap field's name. Hidden from people and from assistive technology: only a robot fills it. */
export const TRAP_FIELD = 'website'

/**
 * A random "word": at least 10 letters, no space or punctuation, and at least 3 capitals after the
 * first letter. No real name or message has that shape ("McDonald", "DUPONT", "Gian-Luca",
 * "Buongiorno" do not).
 */
export function isRandomLetters(value: unknown): boolean {
	if (typeof value !== 'string') {
		return false
	}
	const text = value.trim()
	if (text.length < 10 || !/^[A-Za-z]+$/.test(text)) {
		return false
	}
	if (text === text.toUpperCase()) {
		return false
	}
	return text.slice(1).replace(/[^A-Z]/g, '').length >= 3
}

/** True when the trap field holds anything at all. */
export function isTrapFilled(value: unknown): boolean {
	return typeof value === 'string' && value.trim() !== ''
}

/**
 * True when the name AND the message are both random letters, as in every robot submission seen.
 * Both are required: a run-together name such as "GiuliaFERRARI" looks random on its own, and a
 * person caught here would see "sent" while nobody ever read them.
 */
export function looksLikeRobotText(fields: { name?: unknown; message?: unknown }): boolean {
	return isRandomLetters(fields.name) && isRandomLetters(fields.message)
}

/** True when the message carries a link: flagged in the email's subject, where the scams sit. */
export function containsLink(value: unknown): boolean {
	return typeof value === 'string' && /(https?:\/\/|www\.)\S+/i.test(value)
}
