<script>
	import '../app.postcss';
	import { navigating } from "$app/stores"
</script>

<svelte:head>
	<title>
		Guess The Doggo
	</title>
</svelte:head>
<slot />

{#if $navigating}
	<div class="preloader">
		Loading...
	</div>
{/if}
<style lang="scss">
	.preloader {
		position: absolute;
		top: 50vw;
		left: 50vh;
		transform: translate(-50%, -50%);
		z-index: 10000;
		background-color: #333;
		color: white;
		padding: 1rem;
		border-radius: 0.5rem;
	}
</style>