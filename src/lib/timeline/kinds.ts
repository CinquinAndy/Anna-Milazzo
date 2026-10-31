import type { Locale } from '@/lib/locale'

/**
 * What kind of thing a timeline entry is, which decides the colour of its clip.
 *
 * Anna asked for it herself: her degrees, her certificates and her projects are three
 * different things and the arrangement was colouring them in rotation, so the colour said
 * nothing. A fourth, `experience`, takes what is none of the three (the first time she
 * opened a DAW, the singing school) and is what an entry holds until someone chooses.
 *
 * The values are what the database stores, so they are never renamed. The words are what
 * the reader sees, and live here rather than in the CMS because they are the site's own
 * vocabulary, not Anna's writing: the admin's dropdown and the page read the same table.
 */
export const TIMELINE_KINDS = ['degree', 'certificate', 'project', 'experience'] as const

export type TimelineKind = (typeof TIMELINE_KINDS)[number]

/** What an entry is until it is told otherwise, and what an unknown value reads as. */
export const DEFAULT_KIND: TimelineKind = 'experience'

export function kindOf(value: string | null | undefined): TimelineKind {
	return (TIMELINE_KINDS as readonly string[]).includes(value ?? '') ? (value as TimelineKind) : DEFAULT_KIND
}

export const KIND_LABELS: Record<TimelineKind, Record<Locale, string>> = {
	degree: { it: 'Laurea', en: 'Degree' },
	certificate: { it: 'Certificato', en: 'Certificate' },
	project: { it: 'Progetto', en: 'Project' },
	experience: { it: 'Esperienza', en: 'Experience' },
}

/**
 * One fill each, written out whole so Tailwind sees every class. The same four the clips
 * already used, now with a meaning. White is the quiet one on purpose: it is the default,
 * and an entry nobody has filed should not shout.
 */
export const KIND_FILLS: Record<TimelineKind, string> = {
	degree: 'bg-accent',
	certificate: 'bg-spring',
	project: 'bg-lemon',
	experience: 'bg-sheet',
}

/** The words of the controls, per locale. Shown, so never left to the reader's guess. */
export const TIMELINE_COPY: Record<Locale, { expand: string; collapse: string }> = {
	it: { expand: 'Leggi tutto', collapse: 'Riduci' },
	en: { expand: 'Read more', collapse: 'Show less' },
}
