'use client'

import Script from 'next/script'
import { useActionState, useEffect, useId, useRef, useState } from 'react'
import { submitContactMessage } from '@/app/(frontend)/[lang]/contact/actions'
import type { ContactField, ContactResult } from '@/lib/contact/send-contact-message'
import type { Contact } from '@/payload-types'

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

function fieldInvalid(result: ContactResult | null, field: ContactField): boolean {
	return result?.outcome === 'invalid' && result.fields.includes(field)
}

/**
 * Which note a rejected field gets.
 *
 * The server returns the field names with no reason, but the reason is recoverable here:
 * name and message can only ever be empty, and an address rejected while holding text can
 * only ever be malformed. No server change, no third string, and the Recruiter is told what
 * to fix rather than that something is wrong.
 */
function noteFor(field: 'name' | 'email' | 'message', value: string, form: Contact['form']) {
	return field === 'email' && value.trim().length > 0 ? form?.emailNote : form?.missingNote
}

/**
 * The contact form.
 *
 * The fields are controlled, and that is the whole reason: React resets an uncontrolled
 * form once its action completes, so a rejected submission would hand the Recruiter back an
 * empty box and ask them to type it all again. Holding the values in state means a failure
 * costs them nothing.
 *
 * Drawn as a panel of chrome with the paper set into it. The boxes were the only
 * interactive things on the site standing flat on their ground, which is a legibility
 * problem before it is a style one: a shadow here means an object on the surface, which is
 * why the console and the piano both have one and neither can be pressed.
 */
export function ContactForm({
	copy,
	locale,
	contactEmail,
}: {
	copy: Contact
	locale: string
	/** From Settings, so the failure message can offer somewhere else to write. */
	contactEmail: string | null | undefined
}) {
	const [result, action, pending] = useActionState<ContactResult | null, FormData>(submitContactMessage, null)
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [body, setBody] = useState('')
	// Identity, not value: each submission produces a fresh result object.
	const clearedFor = useRef<ContactResult | null>(null)
	const focusedFor = useRef<ContactResult | null>(null)
	const nameRef = useRef<HTMLInputElement | null>(null)
	const emailRef = useRef<HTMLInputElement | null>(null)
	const bodyRef = useRef<HTMLTextAreaElement | null>(null)
	const checkRef = useRef<HTMLDivElement | null>(null)
	const ids = useId()
	const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

	const form = copy.form
	const outcome = copy.outcome

	// Sent is the one outcome that should clear the box: leaving the text sitting there
	// invites the Recruiter to send it twice. Once per result, though, `useActionState`
	// holds the last outcome until the next submission, so a condition on the field values
	// instead would erase every keystroke they typed afterwards and read as a broken form.
	if (result?.outcome === 'sent' && clearedFor.current !== result) {
		clearedFor.current = result
		setName('')
		setEmail('')
		setBody('')
	}

	// The live region announces the summary, and leaves a keyboard visitor standing on the
	// send button several hundred pixels below the thing that was rejected. `validate()`
	// pushes in document order, so the first entry is the first box on the form, and the
	// token case lands on the check compartment, which is the one rejection with no box.
	useEffect(() => {
		if (result?.outcome !== 'invalid' || focusedFor.current === result) {
			return
		}
		focusedFor.current = result
		const first = result.fields[0]
		const target =
			first === 'name'
				? nameRef.current
				: first === 'email'
					? emailRef.current
					: first === 'message'
						? bodyRef.current
						: checkRef.current
		target?.focus()
	}, [result])

	return (
		<>
			<Script src={TURNSTILE_SCRIPT} strategy="afterInteractive" />

			<div className="form-panel" data-form-panel>
				{/* Always in the DOM, so the region is live before anything lands in it. */}
				<div aria-live="polite" data-contact-outcome={result?.outcome ?? 'none'}>
					{result?.outcome === 'sent' ? (
						<p className="outcome outcome-sent">
							<svg className="outcome-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
								<path d="M4 12l5 5L20 6" fill="none" stroke="currentColor" strokeWidth="2.5" />
							</svg>
							<span>{outcome?.success}</span>
						</p>
					) : null}

					{result?.outcome === 'failed' || result?.outcome === 'rejected' ? (
						<p className="outcome">
							<svg className="outcome-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
								<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.5" />
							</svg>
							{/* The sentence tells them to write directly, so it carries the address. */}
							<span>
								{outcome?.failure} {contactEmail ? <a href={`mailto:${contactEmail}`}>{contactEmail}</a> : null}
							</span>
						</p>
					) : null}

					{result?.outcome === 'invalid' ? (
						<p className="outcome">
							<svg className="outcome-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
								<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.5" />
							</svg>
							<span>{outcome?.invalid}</span>
						</p>
					) : null}
				</div>

				{/* `noValidate` keeps the server as the single validator, so every message stays in
				    Anna's two languages rather than the browser's. */}
				<form
					action={action}
					aria-labelledby="scrivetemi"
					aria-describedby={form?.requiredNote ? `${ids}-required` : undefined}
					className="form-fields"
					data-contact-form
					noValidate
				>
					{form?.requiredNote ? (
						<p id={`${ids}-required`} className="field-note">
							{form.requiredNote}
						</p>
					) : null}

					<div className="grid gap-7 sm:grid-cols-2">
						<div className="field">
							<label htmlFor={`${ids}-name`} className="field-label">
								{form?.nameLabel}
							</label>
							<input
								id={`${ids}-name`}
								ref={nameRef}
								name="name"
								type="text"
								autoComplete="name"
								required
								value={name}
								onChange={event => setName(event.target.value)}
								aria-invalid={fieldInvalid(result, 'name')}
								aria-describedby={fieldInvalid(result, 'name') ? `${ids}-name-note` : undefined}
								className="field-box"
							/>
							{fieldInvalid(result, 'name') ? (
								<p id={`${ids}-name-note`} className="field-note">
									{noteFor('name', name, form)}
								</p>
							) : null}
						</div>

						<div className="field">
							<label htmlFor={`${ids}-email`} className="field-label">
								{form?.emailLabel}
							</label>
							<input
								id={`${ids}-email`}
								ref={emailRef}
								name="email"
								type="email"
								autoComplete="email"
								required
								value={email}
								onChange={event => setEmail(event.target.value)}
								aria-invalid={fieldInvalid(result, 'email')}
								aria-describedby={fieldInvalid(result, 'email') ? `${ids}-email-note` : undefined}
								className="field-box"
							/>
							{fieldInvalid(result, 'email') ? (
								<p id={`${ids}-email-note`} className="field-note">
									{noteFor('email', email, form)}
								</p>
							) : null}
						</div>
					</div>

					<div className="field">
						<label htmlFor={`${ids}-message`} className="field-label">
							{form?.messageLabel}
						</label>
						<textarea
							id={`${ids}-message`}
							ref={bodyRef}
							name="message"
							required
							data-multiline
							value={body}
							onChange={event => setBody(event.target.value)}
							aria-invalid={fieldInvalid(result, 'message')}
							aria-describedby={fieldInvalid(result, 'message') ? `${ids}-message-note` : undefined}
							className="field-box"
						/>
						{fieldInvalid(result, 'message') ? (
							<p id={`${ids}-message-note`} className="field-note">
								{noteFor('message', body, form)}
							</p>
						) : null}
					</div>

					{/* A fieldset, because a caption over a control is exactly what one is for, and
					    the iframe cannot take a `<label>`. `tabIndex -1` on the well so focus can be
					    moved there when the check itself is what failed, which is the one rejection
					    with no box of its own. */}
					<fieldset className="field check-field">
						<legend className="field-label">{form?.checkLabel}</legend>
						<div
							ref={checkRef}
							tabIndex={-1}
							className="check-well"
							data-check-well
							data-invalid={fieldInvalid(result, 'token') ? 'true' : undefined}
							aria-describedby={fieldInvalid(result, 'token') ? `${ids}-check-note` : undefined}
						>
							{/* Cloudflare replaces this with the widget and puts the token in a hidden
							    `cf-turnstile-response` field inside the form. `light` because the widget
							    otherwise follows the operating system and goes black on a site that has
							    no dark mode; `flexible` because a 300px card adrift in a wide well is
							    the one place this page looked unfinished. */}
							<div
								className="cf-turnstile"
								data-sitekey={siteKey}
								data-language={locale}
								data-theme="light"
								data-size="flexible"
								data-turnstile
							/>
						</div>
						{fieldInvalid(result, 'token') ? (
							<p id={`${ids}-check-note`} className="field-note">
								{form?.checkNote}
							</p>
						) : null}
					</fieldset>

					<div className="form-foot">
						{form?.privacyNote ? <p className="form-note">{form.privacyNote}</p> : null}
						<button type="submit" className="control control-primary text-lg" disabled={pending}>
							{pending ? form?.sendingLabel : form?.submitLabel}
						</button>
					</div>
				</form>
			</div>
		</>
	)
}
