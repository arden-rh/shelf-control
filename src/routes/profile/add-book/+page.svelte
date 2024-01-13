<script lang="ts">
	import { createBook } from '$lib/hooks/createUserBook.client';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { doc, setDoc } from 'firebase/firestore';
	import { fetchGoogleBooks } from '$lib/queries/books';
	import { FirebaseError } from '@firebase/util';
	import { get, writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { toLibraryBook } from '$lib/utility/toLibraryBook';
	import { useQuery } from '@sveltestack/svelte-query';
	import type { LibraryBook, VolumeInfo } from '$lib/types/books.types';
	import type { PageData } from './$types';

	const q = writable('');
	const selectedBook = writable({} as VolumeInfo);
	const testUserId = 'jB9gd9zwX8gP9Dcosxz3';

	export let data: PageData;

	const {
		elements: { trigger, portalled, overlay, content, title, description, close },
		states: { open }
	} = createDialog();

	function openDialog(book: VolumeInfo) {
		selectedBook.set(book);
	}

	async function addBook () {

		const selectedBookValue = get(selectedBook);

		const bookValue = toLibraryBook(selectedBookValue)

		const book: LibraryBook = {
			...bookValue,
			userId: testUserId,
		};

		const userId = testUserId;

		await createBook(userId, book);
	}

	// const queryResult = useQuery<BooksResponse>(
	// 	['books', $query],
	// 	async () => {
	// 		console.log('query', $query);
	// 		if ($query) {
	// 			const result = await fetchGoogleBooks($query, index);
	// 			console.log('waiting');
	// 			return result;
	// 		}
	// 		return null;
	// 	},
	// 	{
	// 		enabled: $query !== ''
	// 	}
	// );
</script>

<div>
	<h1>Books</h1>
	<!-- {#if $queryResult.status === 'loading'}
		<div>Loading...</div>
	{:else if $queryResult.error instanceof Error}
		<div>Error: {$queryResult.error.message}</div>
	{:else if $queryResult.status === 'success'}
		<div>Success!</div>
	{/if} -->
	<form data-sveltekit-keepfocus action="/profile/add-book" method="get">
		<label>
			Search:
			<input type="text" name="q" bind:value={$q} />
			<button type="submit">Search</button>
		</label>
	</form>
	<!-- {#if $queryResult.status === 'success' && $queryResult.data}
		<ul>
			{#each $queryResult.data.items as book}
				<li>
					{book.volumeInfo.title}
				</li>
			{/each}
		</ul>
	{/if} -->
	{#if data}
		{#if data.status === 200}
			{#if data.props.data.items}
				<ul>
					{#each data.props.data.items as book}
						<li>
							<!-- {book.volumeInfo.title} <button class="border" use:melt={$trigger}>Read more</button> -->
							{book.volumeInfo.title}
							<button
								class="border"
								on:click={() => openDialog(book.volumeInfo)}
								use:melt={$trigger}>Read more</button
							>
						</li>
					{/each}
				</ul>
			{/if}
		{:else if data.status === 400}
			<div>Not found</div>
		{:else if data.status === 500}
			<div>Server error</div>
		{/if}
	{:else}
		<div class="bg-red">Loading...</div>
	{/if}

	<div use:melt={$portalled}>
		{#if $open && $selectedBook}
			<div class="fixed inset-0 z-50 bg-black/50" use:melt={$overlay} />
			<div
				class="fixed left-[50%] top-[50%] z-50 max-h-[85vh] w-[90vw]
            max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-md bg-white
            p-6 shadow-lg"
				use:melt={$content}
			>
				<h2 use:melt={$title}>{$selectedBook.title}</h2>
				{#if $selectedBook.description}
					<p use:melt={$description}>{$selectedBook.description}</p>
				{/if}
				<button use:melt={$close}>Close Dialog</button>
				<button on:click={() => addBook()}>Add book</button>
			</div>
		{/if}
	</div>
</div>
