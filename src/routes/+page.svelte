<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { dogBreeds } from "../stores/dogs";
	import type { PageData } from "./$types";

    export let data: PageData;

    onMount(() => {
        dogBreeds.set(data.breeds);
        goto("/game");
    })
</script>

<div class="loading-page flex flex-col items-center justify-center h-screen">
    <p class="text-center p-4 text-gray-500">
        Loading game...
    </p>
</div>

<style lang="scss"></style>