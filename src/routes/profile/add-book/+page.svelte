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

	async function addBook() {
		const selectedBookValue = get(selectedBook);

		const bookValue = toLibraryBook(selectedBookValue);

		const book: LibraryBook = {
			...bookValue,
			userId: testUserId
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

<section>
	<h1 class="page-header">Add a book to your library</h1>
	<!-- {#if $queryResult.status === 'loading'}
		<div>Loading...</div>
	{:else if $queryResult.error instanceof Error}
		<div>Error: {$queryResult.error.message}</div>
	{:else if $queryResult.status === 'success'}
		<div>Success!</div>
	{/if} -->
	<div class="add-book-form">
		<h2>Search for a book</h2>
		<form data-sveltekit-keepfocus action="/profile/add-book" method="get">
			<label>
				<input type="text" name="q" bind:value={$q} aria-label="Search for a book" />
				<button type="submit">Search</button>
			</label>
		</form>
	</div>

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
				<ul class="book-list">
					{#each data.props.data.items as book}
						<li class="book-list-item mb-3 flex">
							<button
								on:click={() => openDialog(book.volumeInfo)}
								use:melt={$trigger}
								class="book-list-item-button flex flex-row items-center gap-5 px-3"
							>
								<!-- {book.volumeInfo.title} <button class="border" use:melt={$trigger}>Read more</button> -->
								{#if book.volumeInfo.imageLinks?.thumbnail}
									<img
										src={book.volumeInfo.imageLinks.thumbnail}
										alt={book.volumeInfo.title}
										class="max-h-36 object-cover object-center"
									/>
								{:else}
									<div class="placeholder-thumbnail max-h-36">Cover Missing</div>
								{/if}
								<h3>{book.volumeInfo.title}</h3>
								<!-- <button class="" on:click={() => openDialog(book.volumeInfo)} use:melt={$trigger}
									>Read more</button
								> -->
							</button>
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
		<div class="">Loading...</div>
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
				<div class="flex flex-row justify-between">
					<h2 use:melt={$title}>{$selectedBook.title}</h2>
					<button use:melt={$close}>Close Dialog</button>
				</div>
				{#if $selectedBook.description}
					<p use:melt={$description}>{$selectedBook.description}</p>
				{/if}
				<button class="hover:bg-black" on:click={() => addBook()}>Add book</button>
			</div>
		{/if}
	</div>
</section>

<style>
	/* @import '/src/app.pcss'; */

	.add-book-form {
		display: flex;
		flex-direction: column;
		margin-bottom: 2rem;
	}

	.add-book-form form label {
		display: flex;
		gap: 0.75rem;
	}

	.add-book-form label button {
		background-color: var(--primary-color);
		border: 2px solid var(--primary-color);
		color: var(--primary-white);
		border-radius: 5px;
		padding: 0.5rem 1rem;
	}

	.add-book-form label button:hover {
		background-color: var(--secondary-color);
		color: var(--primary-color);
	}

	.add-book-form label input {
		border: 2px solid var(--primary-color);
		border-radius: 5px;
		padding: 0.5rem;
		width: 100%;
	}

	.book-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.book-list-item {
		background-color: var(--secondary-color);
		border-radius: 5px;
	}

	.book-list-item:nth-child(even) {
		background-color: var(--primary-white);
	}

	.book-list-item-button {
		width: 100%;
		padding: 1rem;
	}

	.book-list-item:hover {
		background-color: var(--primary-color);
		color: var(--primary-white);
	}

	.placeholder-thumbnail {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100px;
		/* height: [Your Thumbnail Height] */
		height: 308px;
		background-color: var(--secondary-color); 
		color: var(--primary-color);
		font-size: 1rem;
	}

	@media (min-width: 768px) {
		.add-book-form label input {
			max-width: 50%;
		}
	}
</style>
