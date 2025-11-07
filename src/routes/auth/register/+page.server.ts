import { registerSchema } from '$lib/schemas/auth'
import { superValidate } from 'sveltekit-superforms'
import { zod4 } from 'sveltekit-superforms/adapters'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(registerSchema))

	return {
		form,
	}
}
