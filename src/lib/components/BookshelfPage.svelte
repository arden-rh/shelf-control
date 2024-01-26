<script lang="ts">
	import { addToast } from './Toaster.svelte';
	import { allBookStore } from '$lib/stores/books.stores';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { getBooksByBookshelf, updateLibraryBookBookshelves } from '$lib/firebase/bookFirestore';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import { updateUserLibraryBookshelves } from '$lib/firebase/libraryFirestore';
	import { writable } from 'svelte/store';
	import type { LoggedInUser } from '$lib/types/user.types';
	import type { LibraryBookWithId } from '$lib/types/books.types';
	import type { Writable } from 'svelte/store';

	const currentBookshelfBooks = writable<LibraryBookWithId[]>([]);
	export let bookshelf: string;
	export let user: LoggedInUser | null = null;
	export let bookshelvesStore: Writable<string[]>;
	let addingBookToBookshelf = false;
	let allBooks: LibraryBookWithId[] = [];
	let bookshelfBooks: LibraryBookWithId[] = [];
	let deletingBookshelf = false;
	let newBookId: string = '';

	$: if (bookshelf) {
		getBookshelfBooks();
	}

	$: if (!$open) {
		deletingBookshelf = false;
		addingBookToBookshelf = false;
	}

	const unsubscribeBookStore = allBookStore.subscribe((current: LibraryBookWithId[]) => {
		allBooks = current;
	});

	onDestroy(() => {
		unsubscribeBookStore();
	});

	const {
		elements: { trigger, portalled, overlay, content, title, description, close },
		states: { open }
	} = createDialog();

	function handleAddBookToBookshelf() {
		addingBookToBookshelf = true;
	}

	function handleDeleteBookshelf() {
		deletingBookshelf = true;
	}

	function handleCancel() {
		$open = false;
	}

	async function addBookToBookshelf() {
		if (!user || !user.uid || !newBookId) {
			return;
		}

		try {
			const selectedBook = allBooks.find((book) => book._id === newBookId);

			if (selectedBook) {
				const updatedBookshelves = [...(selectedBook.bookshelves || []), bookshelf];

				const response = await updateLibraryBookBookshelves(
					user.uid,
					selectedBook._id,
					updatedBookshelves
				);

				if (response?.status === 'success') {
					getBookshelfBooks();

					addToast({
						data: {
							title: 'Success',
							description: 'Book added to bookshelf successfully',
							status: 'success'
						}
					});
				}
			}
		} catch (error) {
			console.error(error);
			addToast({
				data: {
					title: 'Error',
					description: 'Failed to add book to bookshelf',
					status: 'error'
				}
			});
		} finally {
			addingBookToBookshelf = false;
			$open = false;
		}
	}

	/**
	 * TODO: Update user library bookshelves and remove bookshelf from all books
	 *
	 */
	async function deleteBookshelf() {
		if (!user || !user.uid) {
			return;
		}

		try {
			const currentBookshelves = $bookshelvesStore;

			const updatedBookshelves = currentBookshelves.filter(
				(bookshelfName) => bookshelfName !== bookshelf
			);

			const response = await updateUserLibraryBookshelves(user.uid, updatedBookshelves);

			if (response?.status === 'success') {
				$bookshelvesStore = updatedBookshelves;

				goto('/profile/library');

				addToast({
					data: {
						title: 'Success',
						description: 'Bookshelf deleted successfully',
						status: 'success'
					}
				});
			}
		} catch (error) {
			addToast({
				data: {
					title: 'Error',
					description: 'Failed to delete bookshelf',
					status: 'error'
				}
			});
		} finally {
			$open = false;
		}
	}

	async function getBookshelfBooks() {
		if (!user || !user.uid) {
			return;
		}

		try {
			const response = await getBooksByBookshelf(user?.uid, bookshelf);

			if (response) {
				bookshelfBooks = response;
				currentBookshelfBooks.set(bookshelfBooks);
			}
		} catch (error) {
			console.error(error);
		}
	}
</script>

<section>
	<h2>Bookshelf: {bookshelf}</h2>
	<div class="bookshelf-container">
		<div class="bookshelf-actions">
			<a href="/profile/library" class="button button-action">Library</a>
			<button on:click={handleAddBookToBookshelf} use:melt={$trigger} class="button button-action"
				>Add book to bookshelf</button
			>
			<button on:click={handleDeleteBookshelf} use:melt={$trigger} class="button button-action"
				>Delete bookshelf</button
			>
		</div>
		{#if bookshelfBooks.length > 0}
			<div class="grid-container bookshelves-container">
				{#each bookshelfBooks as book}
					<div class={bookshelfBooks.length > 1 ? 'grid-item' : 'grid-item single'}>
						<a href={`/profile/library?bookId=${book._id}`}>
							{#if book.imageLinks?.thumbnail}
								<img src={book.imageLinks.thumbnail} alt={book.title} class="img" />
							{:else}
								<div class="placeholder-thumbnail img">Cover Missing</div>
							{/if}
							<h3>{book.title}</h3>
						</a>
					</div>
				{/each}
			</div>
		{:else}
			<p>No books added to this bookshelf yet.</p>
		{/if}
	</div>
	<!-- Dialog -->
	<div id="dialog" use:melt={$portalled}>
		{#if $open}
			<div class="fixed inset-0 z-50 bg-black/50" use:melt={$overlay} />
			<div
				class="dialog fixed left-[50%] top-[50%] z-50 max-h-[85vh]
        w-[90vw] max-w-[550px] translate-x-[-50%] translate-y-[-50%]
        rounded-md p-6 shadow-lg"
				use:melt={$content}
			>
				{#if addingBookToBookshelf}
					<div class="add-book-container">
						<h3>Add one of your current books or add a new one</h3>
						<form on:submit|preventDefault={addBookToBookshelf}>
							<select id="reading-status" bind:value={newBookId}>
								{#each allBooks as book}
									<option value={book._id}>{book.title}</option>
								{/each}
							</select>
							<div class="button-group">
								<button class="button button-primary" type="submit">Add book</button>
								<a href="/profile/library/add-book" class="button button-primary">Add new book</a>
								<button class="button button-secondary" on:click={handleCancel}>Cancel</button>
							</div>
						</form>
					</div>
				{:else if deletingBookshelf}
					<div class="delete-bookshelf-container">
						<h3>Are you sure you want to delete your bookshelf?</h3>
						<div class="button-group">
							<button class="button button-primary" on:click={deleteBookshelf}>Yes</button>
							<button class="button button-secondary" on:click={handleCancel}>No</button>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</section>

<style>
	h2 {
		margin-bottom: 1rem;
		text-transform: uppercase;
		font-size: 1.5rem;
		align-self: flex-start;
		line-height: 1.75rem;
	}

	h3 {
		text-transform: uppercase;
		font-weight: 400;
		color: var(--priamry-black);
		line-height: 1.25rem;
	}

	section {
		padding: 0;
		align-items: center;
	}

	.add-book-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
	}

	.add-book-container h3 {
		font-size: 1.25rem;
		text-transform: uppercase;
		margin-top: 1rem;
	}

	.add-book-container form {
		display: flex;
		flex-direction: column;
		max-width: 400px;
		margin: 2rem auto;
		align-items: center;
	}

	.add-book-container select {
		width: 100%;
		border: 2px solid var(--primary-colour-purple);
		background-color: var(--accent-light-blue-grey);
		padding: 0.5rem;
		margin-bottom: 0.5rem;
		font-size: 0.8rem;
	}

	.bookshelf-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
	}

	.bookshelves-container {
		width: 100%;
		position: relative;
		padding: 0;
	}

	.bookshelves-container::before,
	.bookshelves-container::after {
		content: '';
		position: absolute;
		background-color: var(--accent-pink-purple);
	}

	.bookshelves-container::before {
		top: -19px;
		left: -20px;
		height: 7px;
		width: calc(100% + 24px);
		transform-origin: top left;
		transform: skewX(48deg);
		display: none;
	}

	.bookshelves-container::after {
		top: -12px;
		left: -20px;
		width: 8px;
		height: calc(100% + 24px);
		transform-origin: top right;
		transform: skewY(42deg);
		display: none;
	}

	.delete-bookshelf-container h3 {
		font-size: 1rem;
		text-transform: uppercase;
	}

	.bookshelf-actions {
		display: flex;
		flex-direction: row;
		justify-content: center;
		margin-bottom: 1rem;
		align-items: stretch;
		align-self: flex-end;
	}
	.button-action {
		min-height: 2.75rem;
	}

	.grid-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1.25rem;
		justify-content: flex-start;
		width: 100%;
		flex-wrap: wrap;
		margin-bottom: 5rem;
	}

	.grid-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		text-align: center;
		width: 150px;
		min-height: 150px;
		overflow: hidden;
		background-color: var(--primary-grey);
		padding: 1rem;
		box-shadow: 2px 2px 2px 0px rgba(0, 0, 0, 0.6);
		cursor: pointer;
		justify-self: center;
	}

	.grid-item.single {
		justify-self: flex-start;
	}

	.grid-item a {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		text-align: center;
		width: 100%;
		height: 100%;
	}

	.grid-item:hover {
		background-color: var(--secondary-grey);
	}

	.grid-item .img {
		width: auto;
		height: 120px;
		object-fit: contain;
		object-position: center;
		border: 4px solid var(--primary-colour-purple);
	}

	.grid-item h3 {
		margin-top: 10px;
		font-size: 1em;
		word-wrap: break-word;
	}

	@media (min-width: 450px) {
		.button-action {
			min-height: fit-content;
		}
	}

	@media (min-width: 590px) {
		.bookshelves-container {
			border: 12px solid var(--secondary-colour-purple);
			box-shadow: inset -8px -8px 0px 0px var(--accent-pink-purple);
			padding: 0.8rem 1.25rem 1.25rem;
		}

		.bookshelves-container::before,
		.bookshelves-container::after {
			display: block;
		}
	}

	@media (min-width: 768px) {
		h2 {
			font-size: 2rem;
			line-height: 2.25rem;
		}

		.bookshelves-container {
			padding: 0.8rem 1.5rem 1.5rem 1.25rem;
		}

		.grid-container {
			grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		}

		.grid-item {
			width: 180px;
			min-height: 300px;
		}

		.grid-item .img {
			width: auto;
			height: 200px;
			object-fit: contain;
			object-position: center;
			border: 4px solid var(--primary-colour-purple);
		}
	}
</style>
