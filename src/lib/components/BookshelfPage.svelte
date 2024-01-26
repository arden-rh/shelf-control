<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { getBooksByBookshelf } from '$lib/firebase/bookFirestore';
	import { writable } from 'svelte/store';
	import type { LibraryBookWithId } from '$lib/types/books.types';
	import type { LoggedInUser } from '$lib/types/user.types';

	export let bookshelf: string;
	export let user: LoggedInUser | null = null;
	const currentBookshelfBooks = writable<LibraryBookWithId[]>([]);
	let bookshelfBooks: LibraryBookWithId[] = [];
	let deletingBookshelf = false;
	let editingBookshelf = false;
	let addingBookToBookshelf = false;

	$: if (bookshelf) {
		getBookshelfBooks();
	}

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

	function handleEditBookshelves() {
		editingBookshelf = true;
	}

	function editBookshelves() {
		console.log('edit bookshelves');
	}

	function addBookToBookshelf() {
		console.log('add book to bookshelf');
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
		{#if bookshelfBooks.length > 0}
			<div class="bookshelf-actions">
				<a href="/profile/library" class="button button-primary">Library</a>
				<button
					on:click={handleAddBookToBookshelf}
					use:melt={$trigger}
					class="button button-primary">Add book to bookshelf</button
				>
				<button on:click={handleEditBookshelves} use:melt={$trigger} class="button button-primary"
					>Edit Bookshelf</button
				>
				<button on:click={handleDeleteBookshelf} use:melt={$trigger} class="button button-primary"
					>Delete Bookshelf</button
				>
			</div>
			<div class="grid-container bookshelves-container">
				{#each bookshelfBooks as book}
					<div class={bookshelfBooks.length > 1 ? 'grid-item' : 'grid-item single'}>
						<a href={`/profile/library?bookId=${book._id}`}>
							<img src={book.imageLinks?.thumbnail} alt={book.title} />
							<h3>{book.title}</h3>
						</a>
					</div>
				{/each}
			</div>
		{:else}
			<div class="bookshelf-actions">
				<a href="/profile/library" class="button button-primary">Library</a>
				<button
					on:click={handleAddBookToBookshelf}
					use:melt={$trigger}
					class="button button-primary">Add book to bookshelf</button
				>
				<button on:click={handleEditBookshelves} use:melt={$trigger} class="button button-primary"
					>Edit Bookshelf</button
				>
			</div>
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
				{#if editingBookshelf}
					hej
				{:else if addingBookToBookshelf}
					nej
				{:else if deletingBookshelf}
					<div class="delete-bookshelf-container">
						<h3>Are you sure you want to delete your bookshelf?</h3>
						<div class="button-group">
							<button class="button button-primary" on:click={handleDeleteBookshelf}>Yes</button>
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
		border-bottom: 8px solid var(--secondary-colour-purple);
		box-shadow: inset 0px -4px 0px 0px var(--accent-pink-purple);
		padding-bottom: 0.5rem;
		width: 100%;
		line-height: 1.75rem;
	}

	h3 {
		text-transform: uppercase;
		font-weight: 400;
		color: var(--priamry-black);
		line-height: 1.25rem;
	}

	section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		max-width: 1000px;
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
	.bookshelf-actions .button {
		font-size: 0.7rem;
		padding: 0.75rem 1rem;
		border: none;
		line-height: 1rem;
		min-height: 2.5rem;
	}

	.grid-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1.25rem;
		justify-content: flex-start;
		width: 100%;
		flex-wrap: wrap;
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

	.grid-item img {
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
			font-size: 2.5rem;
			padding-bottom: 0.75rem;
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

		.grid-item img {
			width: auto;
			height: 200px;
			object-fit: contain;
			object-position: center;
			border: 4px solid var(--primary-colour-purple);
		}
	}
</style>
