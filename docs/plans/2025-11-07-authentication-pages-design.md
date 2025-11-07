# Authentication Pages Design

**Date:** 2025-11-07
**Status:** Approved

## Overview

Design for Login and Registration pages in Omakase, integrated with BetterAuth and Convex. Uses a minimal, clean UI with ShadCN-Svelte components.

## Architecture & Data Flow

### Structure
- Two page routes:
  - `/auth/login` - Email & password sign-in
  - `/auth/register` - Username, email, password & confirm password sign-up
- Supporting files:
  - `src/lib/schemas/auth.ts` - Zod validation schemas
  - `+page.server.ts` files for form initialization

### Data Flow
1. Client-side validation using sveltekit-superforms with Zod
2. Form submission handled by BetterAuth client (`authClient.signIn/signUp`)
3. Success redirects to home or original destination
4. Errors displayed inline with friendly messages

### Visual Approach
- Clean, minimal centered layout
- White/light background (no gradient)
- Simple card with form fields
- Clear error/success messaging

## BetterAuth Integration

### Current Setup (Already in Place)
- BetterAuth configured in `convex/auth.ts` with email/password enabled
- Client initialized in `lib/auth-client.ts` with Convex plugin
- API handler at `/api/auth/[...all]/+server.ts`

### Registration Flow
1. User fills: username, email, password, confirm password
2. Client-side validation:
   - Username: alphanumeric only, 3-20 characters
   - Email: valid email format
   - Password: 8+ chars, must contain uppercase, lowercase, and number
   - Confirm password: must match password
3. Call `authClient.signUp.email({ email, password, name: username })`
   - BetterAuth's "name" field stores the username
   - Confirm password validated client-side only (not sent to server)
4. On success: redirect to home
5. On error: display BetterAuth error message

### Login Flow
1. User fills: email, password
2. Client-side validation: basic format checks
3. Call `authClient.signIn.email({ email, password })`
4. On success: redirect to home
5. On error: display error

### Key Decision
BetterAuth's "name" field will store the username (not full name). This means `user.name` = username.

## Form Validation & Schemas

### Registration Schema
```typescript
registerSchema = z.object({
	username: z.string()
		.min(3, 'Username must be at least 3 characters')
		.max(20, 'Username must be less than 20 characters')
		.regex(/^[a-z0-9]+$/i, 'Username can only contain letters and numbers')
		.trim(),
	email: z.email('Please enter a valid email address')
		.toLowerCase()
		.trim(),
	password: z.string()
		.min(8, 'Password must be at least 8 characters')
		.max(128, 'Password must be less than 128 characters')
		.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and a number'),
	confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
	message: 'Passwords don\'t match',
	path: ['confirmPassword']
})
```

### Login Schema
```typescript
loginSchema = z.object({
	email: z.email('Please enter a valid email address')
		.toLowerCase()
		.trim(),
	password: z.string().min(1, 'Password is required')
})
```

### Form Initialization
Each page has a `+page.server.ts` that initializes superform with the appropriate schema.

## UI Components & User Experience

### Register Page
**Fields (in order):**
1. Username - placeholder "johndoe"
2. Email - placeholder "john@example.com"
3. Password - with description about requirements
4. Confirm Password - placeholder "••••••••"

**Features:**
- Field components with Label, Input, and Error
- Submit button disabled until all fields valid
- Spinner component during submission
- Success/error messages in colored alert boxes
- Link to login page at bottom

### Login Page
**Fields:**
1. Email
2. Password

**Features:**
- Same form structure as register
- Submit button disabled until both fields filled
- Spinner during submission
- Success/error messages
- Link to register page at bottom

### Visual Styling (Minimal)
- Centered layout: `flex min-h-screen items-center justify-center`
- Simple background (white or light gray)
- Form in a card with border and padding
- Clean typography with simple headers
- No gradient backgrounds
- Standard Tailwind spacing

### Form Behavior
- sveltekit-superforms for validation
- Real-time validation as user types
- Clear error messages under each field
- Disabled submit prevents invalid submissions
- Redirect parameter support from query string

## Files to Create/Modify

1. `src/lib/schemas/auth.ts` - New file with validation schemas
2. `src/routes/auth/register/+page.svelte` - Registration form
3. `src/routes/auth/register/+page.server.ts` - Form initialization
4. `src/routes/auth/login/+page.svelte` - Login form
5. `src/routes/auth/login/+page.server.ts` - Form initialization
