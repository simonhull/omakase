<script lang='ts'>
	import '../app.css'
	import favicon from '$lib/assets/favicon.svg'
	import Button from '$lib/components/ui/button/button.svelte'

	const { children } = $props()
</script>

<svelte:head>
	<link rel='icon' href={favicon} />
</svelte:head>

<header class='flex w-full flex-row items-center justify-between bg-white p-4'>
	<h1 class='text-lg font-bold'>Indie Omakase</h1>
	<Button>Sign In</Button>
</header>
<main class='min-h-screen w-full bg-gray-50'>
	{@render children()}
</main>
