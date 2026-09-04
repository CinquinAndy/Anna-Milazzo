'use client'

import Script from 'next/script'
import { useActionState, useId, useRef, useState } from 'react'
import { submitContactMessage } from '@/app/(frontend)/[lang]/contact/actions'
import type { ContactResult } from '@/lib/contact/send-contact-message'
import type { Contact } from '@/payload-types'

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

function fieldInvalid(result: ContactResult | null, field: 'name' | 'email' | 'message'): boolean {
	return result?.outcome === 'invalid' && result.fields.includes(field)
}

/**
 * The contact form.
 *
 * The fields are controlled, and that is the whole reason: React resets an uncontrolled
 * form once its action completes, so a rejected submission would hand the Recruiter back
 * an empty box and ask them to type it all again. Holding the values in state means a
 * failure costs them nothing.
 */
export function ContactForm({ copy, locale }: { copy: Contact; locale: string }) {
	const [result, action, pending] = useActionState<ContactResult | null, FormData>(submitContactMessage, null)
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [body, setBody] = useState('')
	// Identity, not value: each submission produces a fresh result object.
	const clearedFor = useRef<ContactResult | null>(null)
	const ids = useId()
	const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

	const form = copy.form
	const outcome = copy.outcome

	// Sent is the one outcome that should clear the box: leaving the text sitting there
	// invites the Recruiter to send it twice. Once per result, though — `useActionState`
	// holds the last outcome until the next submission, so a condition on the field values
	// instead would erase every keystroke they typed afterwards and read as a broken form.
	if (result?.outcome === 'sent' && clearedFor.current !== result) {
		clearedFor.current = result
		setName('')
		setEmail('')
		setBody('')
	}

	return (
		<>
			<Script src={TURNSTILE_SCRIPT} strategy="afterInteractive" />

			{/* Announced the moment it appears, whatever the Recruiter is focused on. */}
			<div aria-live="polite" data-contact-outcome={result?.outcome ?? 'none'}>
				{result?.outcome === 'sent' ? (
					<p className="border-brutal border-border bg-accent p-4 font-sans text-accent-foreground shadow-md">
						{outcome?.success}
					</p>
				) : null}
				{result?.outcome === 'failed' || result?.outcome === 'rejected' ? (
					<p className="border-brutal border-border bg-card p-4 font-sans shadow-md">{outcome?.failure}</p>
				) : null}
				{result?.outcome === 'invalid' ? (
					<p className="border-brutal border-border bg-card p-4 font-sans shadow-md">{outcome?.invalid}</p>
				) : null}
			</div>

			<form action={action} className="mt-8 grid max-w-xl gap-6" data-contact-form noValidate>
				<div className="grid gap-2">
					<label htmlFor={`${ids}-name`} className="font-mono text-sm uppercase">
						{form?.nameLabel}
					</label>
					<input
						id={`${ids}-name`}
						name="name"
						type="text"
						autoComplete="name"
						required
						value={name}
						onChange={event => setName(event.target.value)}
						aria-invalid={fieldInvalid(result, 'name')}
						className="border-brutal border-input bg-card p-3 font-sans"
					/>
				</div>

				<div className="grid gap-2">
					<label htmlFor={`${ids}-email`} className="font-mono text-sm uppercase">
						{form?.emailLabel}
					</label>
					<input
						id={`${ids}-email`}
						name="email"
						type="email"
						autoComplete="email"
						required
						value={email}
						onChange={event => setEmail(event.target.value)}
						aria-invalid={fieldInvalid(result, 'email')}
						className="border-brutal border-input bg-card p-3 font-sans"
					/>
				</div>

				<div className="grid gap-2">
					<label htmlFor={`${ids}-message`} className="font-mono text-sm uppercase">
						{form?.messageLabel}
					</label>
					<textarea
						id={`${ids}-message`}
						name="message"
						rows={6}
						required
						value={body}
						onChange={event => setBody(event.target.value)}
						aria-invalid={fieldInvalid(result, 'message')}
						className="border-brutal border-input bg-card p-3 font-sans"
					/>
				</div>

				{/* Cloudflare replaces this with the widget and puts the token in a hidden
				    `cf-turnstile-response` field inside the form. */}
				<div className="cf-turnstile" data-sitekey={siteKey} data-language={locale} data-turnstile />

				<button type="submit" className="control control-primary justify-self-start" disabled={pending}>
					{pending ? form?.sendingLabel : form?.submitLabel}
				</button>
			</form>
		</>
	)
}
