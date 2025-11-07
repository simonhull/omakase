import { z } from 'zod'

export const registerSchema = z
	.object({
		username: z
			.string()
			.min(3, 'Username must be at least 3 characters')
			.max(20, 'Username must be less than 20 characters')
			.regex(/^[a-z0-9]+$/i, 'Username can only contain letters and numbers')
			.trim(),
		email: z.email('Please enter a valid email address').toLowerCase().trim(),
		password: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.max(128, 'Password must be less than 128 characters')
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				'Password must contain uppercase, lowercase, and a number',
			),
		confirmPassword: z.string(),
	})
	.refine(data => data.password === data.confirmPassword, {
		message: 'Passwords don\'t match',
		path: ['confirmPassword'],
	})

export type RegisterSchema = typeof registerSchema

export const loginSchema = z.object({
	email: z.email('Please enter a valid email address').toLowerCase().trim(),
	password: z.string().min(1, 'Password is required'),
})

export type LoginSchema = typeof loginSchema
