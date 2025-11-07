<script lang='ts'>
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { authClient } from '$lib/auth-client'
	import { Button } from '$lib/components/ui/button'
	import * as Field from '$lib/components/ui/field'
	import { Input } from '$lib/components/ui/input'
	import { Spinner } from '$lib/components/ui/spinner'
	import { loginSchema } from '$lib/schemas/auth'
	import { superForm } from 'sveltekit-superforms'
	import { zod4 } from 'sveltekit-superforms/adapters'

	import type { PageData } from './$types'

	const { data }: { data: PageData } = $props()

	// Get redirect URL from query params
	const redirectTo = $derived($page.url.searchParams.get('redirect') || '/')

	let submitting = $state(false)
	let errorMessage = $state<string | null>(null)
	let successMessage = $state<string | null>(null)

	const form = superForm(data.form, {
		validators: zod4(loginSchema),
		// Don't use default form submission - we'll handle it manually
		onSubmit: async ({ cancel }) => {
			// Cancel the default submission
			cancel()

			// Reset messages
			errorMessage = null
			successMessage = null

			// Manually trigger our custom submit
			await handleBetterAuthSubmit()
		},
	})

	const { form: formData, errors, allErrors, enhance } = form

	// Check if form is valid (all required fields filled and no errors)
	const isFormValid = $derived(!!($formData.email && $formData.password && $allErrors.length === 0))

	// Helper to convert superforms errors to Field.Error format
	function toFieldErrors(errors: any): { message?: string }[] | undefined {
		if (!errors)
			return undefined
		if (Array.isArray(errors)) {
			return errors.map(error => ({ message: error }))
		}
		return undefined
	}

	async function handleBetterAuthSubmit() {
		submitting = true

		try {
			await authClient.signIn.email({
				email: $formData.email,
				password: $formData.password,
			})

			successMessage = 'Login successful! Welcome back.'

			// Redirect to original destination or home after a brief delay
			setTimeout(() => {
				goto(redirectTo)
			}, 500)
		}
		catch (error) {
			console.error('Login error:', error)
			// BetterAuth errors have a specific structure
			if (error && typeof error === 'object' && 'error' in error) {
				const authError = error as { error: { message: string } }
				errorMessage = authError.error.message
			}
			else {
				errorMessage
					= error instanceof Error ? error.message : 'Invalid email or password. Please try again.'
			}
		}
		finally {
			submitting = false
		}
	}
</script>

<div class='flex min-h-screen items-center justify-center px-4 py-12'>
	<div class='w-full max-w-md'>
		<!-- Header -->
		<div class='mb-8 text-center'>
			<h1 class='text-3xl font-bold tracking-tight'>Welcome back</h1>
			<p class='text-muted-foreground mt-2 text-sm'>Sign in to your Indie Omakase account</p>
		</div>

		<!-- Form Card -->
		<div class='bg-card rounded-lg border p-8 shadow-sm'>
			<form class='space-y-6' method='POST' use:enhance>
				<!-- Email -->
				<Field.Field>
					<Field.Label for='email'>Email</Field.Label>
					<Input
						aria-invalid={$errors.email ? 'true' : undefined}
						autocomplete='email'
						bind:value={$formData.email}
						id='email'
						name='email'
						placeholder='john@example.com'
						type='email'
					/>
					<Field.Error errors={toFieldErrors($errors.email)} />
				</Field.Field>

				<!-- Password -->
				<Field.Field>
					<Field.Label for='password'>Password</Field.Label>
					<Input
						aria-invalid={$errors.password ? 'true' : undefined}
						autocomplete='current-password'
						bind:value={$formData.password}
						id='password'
						name='password'
						placeholder='••••••••'
						type='password'
					/>
					<Field.Error errors={toFieldErrors($errors.password)} />
				</Field.Field>

				<!-- Form Message -->
				{#if successMessage}
					<div
						class='rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800'
						role='alert'
					>
						{successMessage}
					</div>
				{/if}
				{#if errorMessage}
					<div
						class='rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800'
						role='alert'
					>
						{errorMessage}
					</div>
				{/if}

				<!-- Submit Button -->
				<Button class='w-full' disabled={!isFormValid || submitting} type='submit'>
					{#if submitting}
						<Spinner />
					{:else}
						Sign In
					{/if}
				</Button>
			</form>
		</div>

		<!-- Register Link -->
		<p class='text-muted-foreground mt-6 text-center text-sm'>
			Don't have an account?
			<a class='text-primary font-medium hover:underline' href='/auth/register'>
				Create account
			</a>
		</p>
	</div>
</div>
