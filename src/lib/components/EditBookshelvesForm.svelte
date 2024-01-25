<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { createTagsInput, melt } from '@melt-ui/svelte';
	import { writable } from 'svelte/store';
	import { X } from 'lucide-svelte';
	import type { Tag } from '@melt-ui/svelte';

	const dispatch = createEventDispatcher();

	export let bookshelves: string[] = [];

	const bookshelvesWithIds: Tag[] = bookshelves.map((bookshelf) => {
		return { id: bookshelf, value: bookshelf };
	});

	let bookshelvesTags = writable(bookshelvesWithIds);

	const {
		elements: { root, input, tag, deleteTrigger, edit },
		states: { tags }
	} = createTagsInput({
		tags: bookshelvesTags,
		unique: true,
		add(tag) {
			return { id: tag, value: tag.toLowerCase() };
		},
		addOnPaste: true
	});


    function handleSaveChanges() {

        const formData = {
            bookshelves: $tags.map((tag) => tag.value)
        };

        dispatch('save', formData);
    }

    function handleCancel() {
        dispatch('cancel');
    }
</script>

<h3>Bookshelves</h3>
<small>Use dash (-) instead of space for bookshelves with several words</small>
<div class="flex flex-col items-start justify-center gap-1">
	<div
		use:melt={$root}
		class="focus-within:ring-magnum-400 tag-container flex min-w-[280px] flex-row flex-wrap gap-2.5 bg-white
    px-3 py-2 focus-within:ring"
	>
		{#each $tags as t}
			<div
				use:melt={$tag(t)}
				class="0 flex items-center overflow-hidden [word-break:break-word] data-[disabled]:hover:cursor-default data-[disabled]:focus:!outline-none data-[disabled]:focus:!ring-0"
			>
				<span class="bookshelf-tag flex items-center border-r">{t.value}</span>
				<button use:melt={$deleteTrigger(t)} class="flex h-full items-center px-1 delete-button">
					<X class="square-3" />
				</button>
			</div>
			<div
				use:melt={$edit(t)}
				class="data-[invalid-edit]:focus flex items-center overflow-hidden px-1.5 [word-break:break-word]"
			/>
		{/each}

		<input
			use:melt={$input}
			type="text"
			placeholder="Enter bookshelves..."
			class="data-[invalid] min-w-[4.5rem] shrink grow basis-0 border-0 text-black outline-none focus:!ring-0"
		/>
	</div>
	<div class="button-group">
		<button class="button button-primary" type="button" on:click={handleSaveChanges}>Save Changes</button>
		<button class="button button-secondary" type="button" on:click={handleCancel}>Cancel</button>
	</div>
</div>

<style>
	[data-disabled] {
		pointer-events: none;
	}

	[data-selected] {
		background-color: var(--primary-colour-purple);
		color: var(--primary-white);
	}

	[data-invalid] {
		border-color: var(--primary-colour-purple);
	}

	[data-invalid-edit] {
		border-color: var(--primary-colour-purple);
	}

	[data-invalid-edit]:focus {
		outline-color: var(--primary-colour-purple);
	}

	[data-invalid-edit]:focus ~ [data-delete-trigger] {
		background-color: var(--primary-colour-purple);
	}

	.delete-button {
		font-size: 0.9rem;
		color: var(--primary-white);
		background-color: var(--primary-colour-purple);
		cursor: pointer;
	}

	button:enabled:hover {
		color: var(--primary-colour-purple);
		background-color: var(--primary-grey);
	}

	h3 {
		text-transform: uppercase;
	}

	input {
		font-size: 0.9rem;
	}

	small {
		font-size: 0.7rem;
		color: var(--primary-black);
		margin-bottom: 0.5rem;
		max-width: 80%;
	}

	span {
		font-size: 0.9rem;
	}

	.bookshelf-tag {
		background-color: var(--primary-colour-purple);
		color: var(--primary-white);
		padding: 0.25rem 0.5rem;
	}

	.bookshelf-tag:hover {
		background-color: var(--primary-grey);
		color: var(--primary-colour-purple);
	}

	.tag-container {
		width: 100%;
	}
</style>
