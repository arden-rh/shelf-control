<script lang="ts" context="module">
	import { createToaster, melt } from '@melt-ui/svelte';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { X } from 'lucide-svelte';

	export type ToastData = {
		title: string;
		description: string;
		status: string;
	};

	const {
		elements: { content, title, description, close },
		helpers,
		states: { toasts },
		actions: { portal }
	} = createToaster<ToastData>();

	export const addToast = helpers.addToast;
</script>

<div
	use:portal
	class="fixed right-0 top-0 z-50 m-4 flex flex-col items-end gap-2 md:bottom-0 md:top-auto"
>
	{#each $toasts as { id, data } (id)}
		<div
			use:melt={$content(id)}
			animate:flip={{ duration: 500 }}
			in:fly|global={{ duration: 150, x: '100%' }}
			out:fly|global={{ duration: 150, x: '100%' }}
			class="bg-toast shadow-md"
		>
			<div
				class="relative flex w-[20rem] max-w-[calc(100vw-2rem)] items-center justify-between gap-4 p-5"
			>
				<div>
					<h3 use:melt={$title(id)} class="flex items-center gap-2">
						{data.title}
					</h3>
					<div use:melt={$description(id)}>
						{data.description}
					</div>
				</div>
				<button use:melt={$close(id)} aria-label="close notification" class="absolute right-4 top-4 grid place-items-center rounded-full">
					<X class="square-4" />
				</button>
			</div>
		</div>
	{/each}
</div>

<style>
	h3 {
		font-size: 1rem;
		font-weight: 500;
		letter-spacing: 0.05rem;
		margin-bottom: 0.5rem;
		text-transform: uppercase;
	}
	.bg-toast {
		background-color: var(--secondary-colour-purple);
	}
</style>
