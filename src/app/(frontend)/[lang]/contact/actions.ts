'use server'

import { contactCollaborators } from '@/lib/contact/collaborators'
import { type ContactResult, sendContactMessage } from '@/lib/contact/send-contact-message'

/**
 * The form's submit handler. All it does is read the fields and hand them to the boundary
 * module, which is where the interesting behaviour and all the tests live.
 */
export async function submitContactMessage(_previous: ContactResult | null, form: FormData): Promise<ContactResult> {
	return sendContactMessage(
		{
			name: String(form.get('name') ?? ''),
			email: String(form.get('email') ?? ''),
			message: String(form.get('message') ?? ''),
			token: String(form.get('cf-turnstile-response') ?? ''),
		},
		contactCollaborators()
	)
}
