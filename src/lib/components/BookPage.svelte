<script lang="ts">
	import { addToast } from '$lib/components/Toaster.svelte';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { deleteLibraryBook } from '$lib/hooks/deleteLibraryBook.client';
	import { editLibraryBook } from '$lib/hooks/editLibraryBook.client';
	import { goto } from '$app/navigation';
	import { writable } from 'svelte/store';
	import {
		addUniqueBookshelvesAndUpdateUser,
		updateLibraryBookReadingStatus
	} from '$lib/firebase/bookFirestore';
	import { removeBookFromAllBooks } from '$lib/stores/books.stores';
	import EditBookForm from './EditBookForm.svelte';
	import EditBookshelvesForm from './EditBookshelvesForm.svelte';
	import type { LibraryBookWithId } from '$lib/types/books.types';
	import type { LoggedInUser } from '$lib/types/user.types';

	export let book: LibraryBookWithId;
	export let user: LoggedInUser | null = null;
	export const bookStore = writable({} as LibraryBookWithId);
	let deletingBook = false;
	let editingLibraryBook = false;
	let editingBookshelves = false;
	let updatingReadingStatus = false;

	const {
		elements: { trigger, portalled, overlay, content, title, description, close },
		states: { open }
	} = createDialog();

	bookStore.set(book);

	$: if (!$open) {
		deletingBook = false;
		editingLibraryBook = false;
		editingBookshelves = false;
		updatingReadingStatus = false;
	}

	$: book = $bookStore;

	function editBook() {
		editingLibraryBook = true;
	}

	function editBookshelves() {
		editingBookshelves = true;
	}

	function handleCancel() {
		$open = false;
	}

	function handleDelete() {
		deletingBook = true;
	}

	function updateReadingStatus() {
		updatingReadingStatus = true;
	}

	async function handleUpdateBook(event: CustomEvent) {
		const formData = event.detail;

		if (!user || !user.uid) {
			return;
		}

		console.log('Handling update book', formData);

		try {
			const response = await editLibraryBook(user.uid, {
				...formData,
				_id: book._id
			});

			if (response?.status === 'success') {
				await addUniqueBookshelvesAndUpdateUser(user.uid, book._id, formData.bookshelves);

				bookStore.set({
					...book,
					...formData
				} as LibraryBookWithId);

				editingLibraryBook = false;
				$open = false;

				addToast({
					data: {
						title: 'Success',
						description: 'Book updated successfully',
						status: 'success'
					}
				});
			}

			if (response?.status === 'error') {
				editingLibraryBook = false;
				$open = false;
				addToast({
					data: {
						title: 'Error',
						description: 'Failed to update user',
						status: 'error'
					}
				});
			}
		} catch (error) {
			editingLibraryBook = false;
			$open = false;
			addToast({
				data: {
					title: 'Error',
					description: 'Failed to update user',
					status: 'error'
				}
			});
		}
	}

	async function deleteBook() {
		if (user && user.uid && book._id) {
			try {
				const response = await deleteLibraryBook(user.uid, book._id);

				if (response?.status === 'success') {
					editingLibraryBook = false;
					$open = false;

					removeBookFromAllBooks(book._id);

					goto('/profile/library');

					addToast({
						data: {
							title: 'Success',
							description: `${book.title} has been deleted`,
							status: 'success'
						}
					});
				}
				if (response?.status === 'error') {
					editingLibraryBook = false;
					$open = false;
					addToast({
						data: {
							title: 'Error',
							description: 'Failed to delete book',
							status: 'error'
						}
					});
				}
			} catch (error) {
				editingLibraryBook = false;
				$open = false;
				addToast({
					data: {
						title: 'Error',
						description: 'Failed to delete book',
						status: 'error'
					}
				});
			}
		}
	}

	async function updateBookReadingStatus() {
		if (user && user.uid && book._id) {
			try {
				const response = await updateLibraryBookReadingStatus(
					user.uid,
					book._id,
					book.readingStatus
				);
				if (response?.status === 'success') {
					updatingReadingStatus = false;
					$open = false;

					addToast({
						data: {
							title: 'Success',
							description: 'Reading status updated',
							status: 'success'
						}
					});
				}
			} catch (error) {
				updatingReadingStatus = false;
				$open = false;
				addToast({
					data: {
						title: 'Error',
						description: 'Failed to update reading status',
						status: 'error'
					}
				});
			}
		}
	}
</script>

<section>
	<h2>{book.title}</h2>
	<div class="book-page-container">
		<div class="book-actions">
			<a href="/profile/library" class="button button-action">Library</a>
			<button on:click={editBook} use:melt={$trigger} class="button button-action">Edit Book</button
			>
			<button on:click={editBookshelves} use:melt={$trigger} class="button button-action"
				>Edit Bookshelves</button
			>
			<button on:click={handleDelete} use:melt={$trigger} class="button button-action"
				>Delete Book</button
			>
		</div>
		<div class="book-info-container">
			<div class="book-info">
				<div class="book-image">
					{#if book.imageLinks?.thumbnail}
						<img src={book.imageLinks.thumbnail} alt={book.title} />
					{:else}
						<div class="placeholder-thumbnail">Cover Missing</div>
					{/if}
				</div>
				<div class="book-details">
					<ul>
						<li>
							<span>{book.authors && book.authors.length > 1 ? 'Authors: ' : 'Author: '}</span>
							{book.authors.join(', ')}
						</li>
						<li>
							<span>Published:</span>
							{book.publishedDate}
						</li>
						<li>
							<span>Publisher:</span>
							{book.publisher}
						</li>
						<li>
							<span>Print type:</span>
							{book.printType}
						</li>
						<li>
							<span>Page count:</span>
							{book.pageCount >= 0 ? book.pageCount : 'Unknown'}
						</li>
						<li>
							<span>Industry Identifier:</span>
							{book.industryIdentifyer}
						</li>
						<li>
							<span>Language:</span>
							{book.language.toUpperCase()}
						</li>
						<li>
							<span>Categories:</span>
							{book.categories.join(', ')}
						</li>
					</ul>
					<div>
						<div class="bookshelves-info">
							<h3>Bookshelves:</h3>
							<ul>
								{#if book.bookshelves && book.bookshelves.length > 0}
									{#each book.bookshelves as bookshelf}
										<li class="bookshelf-link">
											<a href={`/profile/library?bookshelf=${bookshelf}`}>{bookshelf}</a>
										</li>
									{/each}
								{:else}
									Not added
								{/if}
							</ul>
						</div>
						<button on:click={updateReadingStatus} use:melt={$trigger} class="button reading-status"
							>Reading status: {book.readingStatus}</button
						>
					</div>
				</div>
			</div>
			<div class="book-description">
				<p>{book.description}</p>
			</div>
		</div>
	</div>
	<div use:melt={$portalled}>
		{#if $open}
			<div class="fixed inset-0 z-50 bg-black/50" use:melt={$overlay} />
			<div
				class="dialog fixed left-[50%] top-[50%] z-50 max-h-[85vh]
            w-[90vw] max-w-[550px] translate-x-[-50%] translate-y-[-50%]
            rounded-md p-6 shadow-lg"
				use:melt={$content}
			>
				{#if editingBookshelves}
					<EditBookshelvesForm
						bookshelves={book.bookshelves}
						on:cancel={handleCancel}
						on:save={handleUpdateBook}
					/>
				{:else if updatingReadingStatus}
					<div class="update-reading-status-form">
						<form on:submit|preventDefault={updateBookReadingStatus}>
							<label for="reading-status">Reading Status</label>
							<select id="reading-status" bind:value={book.readingStatus}>
								<option value="to-read">To read</option>
								<option value="reading">Reading</option>
								<option value="read">Read</option>
							</select>
							<div class="button-group">
								<button class="button button-primary" type="submit">Save Changes</button>
								<button class="button button-secondary" type="button" on:click={handleCancel}
									>Cancel</button
								>
							</div>
						</form>
					</div>
				{:else if editingLibraryBook}
					<EditBookForm
						title={book.title}
						authors={book.authors}
						description={book.description}
						categories={book.categories}
						language={book.language}
						industryIdentifier={book.industryIdentifyer}
						pageCount={book.pageCount}
						bookImage={book.imageLinks?.thumbnail}
						publishedDate={book.publishedDate}
						printType={book.printType}
						publisher={book.publisher}
						bookshelves={book.bookshelves}
						readingStatus={book.readingStatus}
						on:cancel={handleCancel}
						on:submit={handleUpdateBook}
						on:delete={handleDelete}
					/>
				{:else if deletingBook}
					<div>
						<h3>Are you sure you want to delete this book?</h3>
						<div class="button-group">
							<button class="button button-primary" type="button" on:click={deleteBook}>Yes</button>
							<button class="button button-secondary" type="button" on:click={handleCancel}
								>No</button
							>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</section>

<style>
	section {
		padding: 0;
		align-items: center;
	}

	h2 {
		margin-bottom: 1rem;
		text-transform: uppercase;
		font-size: 1.5rem;
		align-self: flex-start;
		line-height: 1.75rem;
	}

	h3 {
		font-size: 1rem;
		text-transform: uppercase;
	}

	.book-image {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.book-image img {
		width: auto;
		object-position: center;
		object-fit: contain;
		max-height: 250px;
		height: 250px;
		border: 4px solid var(--primary-colour-purple);
	}

	.book-info {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		justify-content: flex-start;
		gap: 1rem;
		width: 100%;
		flex-wrap: wrap;
	}

	.book-info-container {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
		gap: 1rem;
		width: 100%;
		margin-bottom: 1rem;
	}

	.book-page-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		width: 100%;
		margin-bottom: 5rem;
	}

	.book-page-container ul li {
		font-size: 0.85rem;
		line-height: 1rem;
		margin-bottom: 0.25rem;
	}

	.book-page-container ul li span {
		font-weight: 700;
		letter-spacing: 0.03rem;
	}

	.book-actions {
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

	.book-description {
		font-size: 0.9rem;
		background-color: var(--primary-white);
		padding: 1rem;
	}

	.book-details {
		margin-bottom: 1rem;
	}

	.book-details span {
		font-weight: 600;
		letter-spacing: 0.03rem;
		font-family: var(--header-font);
		text-transform: uppercase;
		color: var(--primary-colour-purple);
	}
	.book-details ul {
		list-style: none;
		padding: 0;
		margin-top: 0.25rem;
	}

	.bookshelf-link {
		font-size: 0.75rem;
		background-color: var(--primary-grey);
		padding: 0.5rem;
		box-shadow: 2px 2px 2px 0px rgba(0, 0, 0, 0.6);
	}

	.bookshelves-info {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
		width: 100%;
		margin-top: 0.75rem;
	}

	.bookshelf-link:hover {
		background-color: var(--secondary-grey);
	}

	.bookshelves-info h3 {
		display: block;
		font-size: 1.25rem;
		font-weight: 500;
		color: var(--primary-black);
	}

	.bookshelves-info ul {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding: 0;
		margin-bottom: 0.5rem;
	}

	.dialog {
		overflow-y: scroll;
	}

	.reading-status {
		font-size: 0.9rem;
		background-color: var(--accent-blue-grey);
		width: 100%;
		padding: 0.5rem;
		box-shadow: 2px 2px 2px 0px rgba(0, 0, 0, 0.6);
	}

	.reading-status:hover {
		background-color: var(--accent-dark-blue-grey);
	}

	.update-reading-status-form {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		width: 100%;
	}

	.update-reading-status-form label {
		align-items: center;
		justify-content: center;
		font-family: var(--header-font);
		font-size: 0.8rem;
		display: flex;
		height: 2.75rem;
		letter-spacing: 0.075rem;
		text-transform: uppercase;
		border: 2px solid var(--primary-grey);
		color: var(--primary-black);
		font-weight: 400;
		background-color: var(--primary-grey);
		min-width: 35%;
		flex: 0 0 auto;
		margin-bottom: 0.5rem;
	}

	.update-reading-status-form select {
		border: 2px solid var(--primary-colour-purple);
		background-color: var(--accent-light-blue-grey);
		padding: 0.5rem;
		margin-bottom: 0.5rem;
		width: 100%;
		font-size: 0.9rem;
	}

	@media (min-width: 400px) {
		.button-action {
			min-height: fit-content;
		}
	}

	@media (min-width: 550px) {
		.book-image {
			width: fit-content;
		}
	}

	@media (min-width: 768px) {
		h2 {
			font-size: 2rem;
			line-height: 2.25rem;
		}

		.book-description {
			max-width: 60%;
		}

		.book-details ul {
			margin-top: 0;
		}

		.bookshelves-info ul {
			max-width: 200px;
		}

		.book-image {
			width: 100%;
			justify-content: flex-start;
		}

		.book-image img {
			max-height: none;
			min-height: 300px;
		}

		.book-info {
			flex-direction: column;
			max-width: fit-content;
		}

		.book-info-container {
			flex-direction: row;
			justify-content: flex-end;
		}

		.placeholder-thumbnail {
			width: 100%;
			height: 300px;
			font-size: 1.25rem;
		}
		.reading-status {
			max-width: 200px;
		}
	}
</style>
