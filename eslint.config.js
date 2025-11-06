import antfu from '@antfu/eslint-config'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'

export default antfu(
	{
		svelte: true,
		typescript: true,
		formatters: {
			css: true,
			html: true,
		},
		stylistic: {
			indent: 'tab',
			quotes: 'single',
		},
		ignores: ['**/migrations*', '*.md', '**/_generated/**'],
	},
	// Better Tailwind CSS
	{
		plugins: {
			'better-tailwindcss': betterTailwindcss,
		},
		rules: {
			'better-tailwindcss/sort-classes': 'warn',
			'better-tailwindcss/no-conflicting-classes': 'error',
		},
	},
	// Custom rules
	{
		rules: {
			'perfectionist/sort-imports': [
				'error',
				{
					tsconfigRootDir: '.',
				},
			],
			'ts/no-redeclare': 'off',
			'ts/consistent-type-definitions': ['error', 'type'],
			'no-console': ['warn'],
			'antfu/no-top-level-await': ['off'],
			'node/prefer-global/process': ['off'],
			'node/no-process-env': ['error'],
			'unicorn/filename-case': [
				'error',
				{
					case: 'kebabCase',
					ignore: ['README.md'],
				},
			],
		},
	},
	// Svelte-specific tweaks
	{
		files: ['**/*.svelte'],
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^\\$\\$(Props|Events|Slots|Generic)$',
				},
			],
			// Disable conflicting indent rules - let svelte/indent handle all indentation
			'style/indent-binary-ops': 'off',
		},
	},
)
