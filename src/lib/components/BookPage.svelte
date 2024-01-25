<script lang="ts">
	import { addToast } from '$lib/components/Toaster.svelte';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { editLibraryBook } from '$lib/hooks/editLibraryBook.client';
	import { faRectangleXmark } from '@fortawesome/free-solid-svg-icons';
	import { fetchGoogleBooks } from '$lib/queries/books';
	import { get, writable } from 'svelte/store';
	import {
		addUniqueBookshelvesAndUpdateUser,
		getUserLibraryBook
	} from '$lib/firebase/bookFirestore';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { session } from '$lib/stores/session';
	import { toLibraryBook } from '$lib/utility/toLibraryBook';
	import { useQuery } from '@sveltestack/svelte-query';
	import EditBookForm from './EditBookForm.svelte';
	import Fa from 'svelte-fa';
	import type { LibraryBookWithId } from '$lib/types/books.types';
	import type { LoggedInUser } from '$lib/types/user.types';
	import type { SessionState } from '$lib/types/session.types';
	import { deleteLibraryBook } from '$lib/hooks/deleteLibraryBook.client';

	export let book: LibraryBookWithId;
	export let user: LoggedInUser | null = null;
	let editingLibraryBook = false;
	let editingBookshelves = false;

	const {
		elements: { trigger, portalled, overlay, content, title, description, close },
		states: { open }
	} = createDialog();

	function editBook() {
		editingLibraryBook = true;
	}

	function handleCancel() {
		editingLibraryBook = false;
		$open = false;
	}

	function handleDelete() {
		deleteBook();
		editingLibraryBook = false;
		$open = false;
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

				editingLibraryBook = false;
				$open = false;

				addToast({
					data: {
						title: 'Success',
						description: 'Book updated successfully',
						color: 'green'
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
						color: 'red'
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
					color: 'red'
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

					goto('/profile/library');

					addToast({
						data: {
							title: 'Success',
							description: 'Book deleted',
							color: 'green'
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
							color: 'red'
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
						color: 'red'
					}
				});
			}
		}
	}

	async function editBookShelves() {
		editingBookshelves = true;
		if (user && user.uid && bookId) {
			try {
				const response = await updateUserLibraryBookShelves(user.uid, bookId, book);
				console.log(response);
			} catch (error) {
				console.error(error);
			}
		}
	}
</script>

<section>
	<h2>{book.title}</h2>
	<div class="book-page-container">
		<div class="book-actions">
			<a href="/profile/library" class="button button-primary">Library</a>
			<button on:click={editBook} use:melt={$trigger} class="button button-primary"
				>Edit Book</button
			>
			<button on:click={editBookShelves} use:melt={$trigger} class="button button-primary"
				>Edit Bookshelves</button
			>
			<button on:click={deleteBook} class="button button-primary">Delete Book</button>
		</div>
		<div class="book-info-container">
			<div class="book-info">
				<div class="book-image">
					{#if book.imageLinks?.thumbnail}
						<img
							src={book.imageLinks.thumbnail}
							alt={book.title}
							class="object-cover object-center"
						/>
					{:else}
						<div class="placeholder-thumbnail">Cover Missing</div>
					{/if}
				</div>
				<div class="book-details">
					<ul>
						<li>
							<span>{book.authors && book.authors.length > 1 ? 'Authors: ' : 'Author: '}</span>
							{book.authors ? book.authors.join(', ') : 'N/A'}
						</li>
						<li>
							<span>Published:</span>
							{book.publishedDate ? book.publishedDate : 'Unknown'}
						</li>
						<li>
							<span>Publisher:</span>
							{book.publisher ? book.publisher : 'Unknown'}
						</li>
						<li>
							<span>Print type:</span>
							{book.printType ? book.printType : 'Unknown'}
						<li>
							<span>Page count:</span>
							{book.pageCount ? book.pageCount : 'Unknown'}
						</li>
						<li>
							<span>ISBN:</span>
							{book.isbn ? book.isbn : 'Unknown'}
						</li>
						<li>
							<span>Language:</span>
							{book.language ? book.language.toUpperCase() : 'Unknown'}
						</li>
						<li>
							<span>Categories:</span>
							{book.categories ? book.categories.join(', ') : 'No assigned categories'}
						</li>
						<li>
							<span>Bookshelves:</span>
							{book.bookshelves && book.bookshelves.length > 0 ? book.bookshelves.join(', ') : 'Not added'}
						</li>
					</ul>
				</div>
				<div class="reading-status">Reading status: {book.readingStatus}</div>
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
					<div>Editing bookshelves</div>
				{:else if editingLibraryBook}
					<EditBookForm
						title={book.title}
						authors={book.authors}
						description={book.description}
						categories={book.categories}
						language={book.language}
						isbn={book.isbn}
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
	}
	.book-image {
		width: fit-content;
		border: 4px solid var(--primary-colour-purple);
	}
	.book-image img {
		width: 100%;
		object-position: center;
		object-fit: contain;
		max-height: 250px;
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

	.book-page-container ul li:nth-last-child(1) {
		margin-bottom: 0rem;
	}

	.book-page-container ul li span {
		font-weight: 700;
		letter-spacing: 0.03rem;
	}

	.book-actions {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		margin-bottom: 1rem;
	}
	.book-actions .button {
		font-size: 0.7rem;
		height: fit-content;
		padding: 0.5rem 1rem;
		border: none;
	}

	.book-description {
		font-size: 0.9rem;
		background-color: var(--primary-white);
		padding: 1rem;
		/* box-shadow: 2px 2px 2px 0px rgba(0, 0, 0, 0.6); */
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
	.dialog {
		overflow-y: scroll;
	}

	.reading-status {
		font-size: 0.9rem;
		font-weight: 400;
		letter-spacing: 0.03rem;
		font-family: var(--header-font);
		text-transform: uppercase;
		background-color: var(--primary-grey);
		width: 100%;
		padding: 0.5rem;
		box-shadow: 2px 2px 2px 0px rgba(0, 0, 0, 0.6);
	}

	@media (min-width: 768px) {

		.book-actions {
			align-self: flex-end;
		}
		.book-description {
			max-width: 60%;
		}

		.book-details ul {
			margin-top: 0;
		}

		.book-image {
			width: 100%;
		}

		.book-image img {
			max-height: none;
			min-height: 300px;
		}

		.book-info {
			/* align-items: flex-end; */
			flex-direction: column;
			max-width: fit-content;
		}

		.book-info-container {
			flex-direction: row;
			align-items: flex-start;
			justify-content: flex-end;
		}
	}
</style>
