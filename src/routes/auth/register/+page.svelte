<script lang='ts'>
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { authClient } from '$lib/auth-client'
	import { Button } from '$lib/components/ui/button'
	import * as Field from '$lib/components/ui/field'
	import { Input } from '$lib/components/ui/input'
	import { Spinner } from '$lib/components/ui/spinner'
	import { registerSchema } from '$lib/schemas/auth'
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
		validators: zod4(registerSchema),
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
	const isFormValid = $derived(
		!!(
			$formData.username
			&& $formData.email
			&& $formData.password
			&& $formData.confirmPassword
			&& $allErrors.length === 0
		),
	)

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
			await authClient.signUp.email({
				email: $formData.email,
				password: $formData.password,
				name: $formData.username,
			})

			successMessage = 'Registration successful! Welcome to Indie Omakase.'

			// Redirect to original destination or home after a brief delay
			setTimeout(() => {
				goto(redirectTo)
			}, 500)
		}
		catch (error) {
			console.error('Registration error:', error)
			// BetterAuth errors have a specific structure
			if (error && typeof error === 'object' && 'error' in error) {
				const authError = error as { error: { message: string } }
				errorMessage = authError.error.message
			}
			else {
				errorMessage
					= error instanceof Error
						? error.message
						: 'An unexpected error occurred. Please try again.'
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
			<h1 class='text-3xl font-bold tracking-tight'>Create your account</h1>
			<p class='text-muted-foreground mt-2 text-sm'>Join Indie Omakase and get started today</p>
		</div>

		<!-- Form Card -->
		<div class='bg-card rounded-lg border p-8 shadow-sm'>
			<form class='space-y-6' method='POST' use:enhance>
				<!-- Username -->
				<Field.Field>
					<Field.Label for='username'>Username</Field.Label>
					<Input
						aria-invalid={$errors.username ? 'true' : undefined}
						autocomplete='username'
						bind:value={$formData.username}
						id='username'
						name='username'
						placeholder='johndoe'
						type='text'
					/>
					<Field.Error errors={toFieldErrors($errors.username)} />
				</Field.Field>

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
						autocomplete='new-password'
						bind:value={$formData.password}
						id='password'
						name='password'
						placeholder='••••••••'
						type='password'
					/>
					<Field.Description>
						Must be at least 8 characters with uppercase, lowercase, and a number.
					</Field.Description>
					<Field.Error errors={toFieldErrors($errors.password)} />
				</Field.Field>

				<!-- Confirm Password -->
				<Field.Field>
					<Field.Label for='confirmPassword'>Confirm Password</Field.Label>
					<Input
						aria-invalid={$errors.confirmPassword ? 'true' : undefined}
						autocomplete='new-password'
						bind:value={$formData.confirmPassword}
						id='confirmPassword'
						name='confirmPassword'
						placeholder='••••••••'
						type='password'
					/>
					<Field.Error errors={toFieldErrors($errors.confirmPassword)} />
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
						Create account
					{/if}
				</Button>
			</form>
		</div>

		<!-- Sign In Link -->
		<p class='text-muted-foreground mt-6 text-center text-sm'>
			Already have an account?
			<a class='text-primary font-medium hover:underline' href='/auth/login'> Sign in </a>
		</p>
	</div>
</div>
