<script lang="ts">
	import {
		addUniqueBookshelvesAndUpdateUser,
		getUserLibraryBook
	} from '$lib/firebase/bookFirestore';
	import { getUserLibraryBooks } from '$lib/firebase/libraryFirestore';
	import { page } from '$app/stores';
	import { session } from '$lib/stores/session';
	import { writable } from 'svelte/store';
	import type { LibraryBookWithId } from '$lib/types/books.types';
	import type { SessionState } from '$lib/types/session.types';
	import type { LoggedInUser } from '$lib/types/user.types';
	import BookPage from '$lib/components/BookPage.svelte';
	import { load } from '../../+layout';

	const selectedBook = writable({} as LibraryBookWithId);
	let loading: boolean = true;
	let loggedIn: boolean = false;
	let user: LoggedInUser | null = null;
	let books: LibraryBookWithId[] = [];
	let book: LibraryBookWithId | undefined;
	let newBookshelves = ['fantasy', 'read-in-2021'];
	let staticSite = false;

	$: bookId = $page.url.searchParams.get('bookId');
	$: bookshelf = $page.url.searchParams.get('bookshelf');
	$: noQuery = !$page.url.searchParams.has('bookId') && !$page.url.searchParams.has('bookshelf');

	session.subscribe((current: SessionState) => {
		loading = current?.loading;
		loggedIn = current?.loggedIn;
		user = current?.user;
	});

	$: if (user?.uid) {
		loadBooks(user.uid);
	}

	$: if (user && bookId) {
		fetchBook();
	}

	$: if (books.length === 0) {
		staticSite = true;
	}

	$: if (books.length > 0) {
		staticSite = false;
	}

	function editBookShelves(book: LibraryBookWithId) {
		selectedBook.set(book);
		updateBookShelves();
	}

	async function updateBookShelves() {
		if (!user?.uid) {
			return;
		}

		try {
			await addUniqueBookshelvesAndUpdateUser(user.uid, $selectedBook._id, newBookshelves);
			console.log('Bookshelves updated successfully');
			// Handle successful update
		} catch (error) {
			console.error('Failed to update bookshelves:', error);
			// Handle error
		}
	}

	async function loadBooks(userId: string) {
		try {
			books = await getUserLibraryBooks(userId);
		} catch (error) {
			console.error('Error fetching books:', error);
		}
	}

	/** Book Page functions */
	async function fetchBook() {

		loading = true;
		if (user && user.uid && bookId) {
			try {
				const response = await getUserLibraryBook(user.uid, bookId);
				book = response;
				loading = false;
			} catch (error) {
				console.error(error);
			}
		}
	}

	// async function deleteBook() {
	// 	if (user && user.uid && bookId) {
	// 		try {
	// 			const response = await deleteUserLibraryBook(user.uid, bookId);
	// 			console.log(response);
	// 		} catch (error) {
	// 			console.error(error);
	// 		}
	// 	}
	// }

	// async function updateBook() {
	// 	if (user && user.uid && bookId) {
	// 		try {
	// 			const response = await updateUserLibraryBook(user.uid, bookId, book);
	// 			console.log(response);
	// 		} catch (error) {
	// 			console.error(error);
	// 		}
	// 	}
	// }

	// async function addBookShelves() {
	// 	if (user && user.uid && bookId) {
	// 		try {
	// 			const response = await updateUserLibraryBookShelves(user.uid, bookId, book);
	// 			console.log(response);
	// 		} catch (error) {
	// 			console.error(error);
	// 		}
	// 	}
	// }
</script>

<section class={staticSite ? 'staticSite' : ''}>
	<div class="page-header">
		<a href="library"><h1>Library</h1></a>
	</div>
	{#if bookId && book && !loading}
		<BookPage {book} {user} />
	{:else if bookshelf && !loading}
		<p>hej</p>
	{:else if noQuery && !loading}
		<div class="library-container">
			{#if books.length === 0}
				<p>This was a very empty library! Maybe you want to add your first book or a bookshelf?</p>
				<div class="link-container">
					<a href="/profile/add-book" class="button button-primary">Add Book</a>
					<a href="/profile/add-bookshelf" class="button button-secondary">Add Bookshelf</a>
				</div>
			{/if}
			<div class="library-actions">
				<a href="/profile/library/add-book" class="button button-secondary">Add book</a>
				<button class="button button-secondary">Add bookshelf</button>
				<!-- <button on:click={editBookShelves} use:melt={$trigger} class="button button-secondary"
					>Edit Bookshelves</button
				> -->
				<button class="button button-secondary">Delete Book</button>
			</div>
			<div class="grid-container">
				{#each books as book}
					<div class="grid-item">
						<a href={`/profile/library?bookId=${book._id}`}>
							<img src={book.imageLinks?.thumbnail} alt={book.title} />
							<h2>{book.title}</h2>
							<!-- <p>{book.authors}</p> -->
						</a>
						<button on:click={() => editBookShelves(book)} class="button">
							Edit bookshelves
						</button>
					</div>
				{/each}
			</div>
		</div>
	{:else if loading}
		<p>Loading...</p>
	{/if}
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		max-width: 1000px;
	}

	.staticSite {
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
		height: calc(100vh - 5rem);
		max-width: none;
	}
	.link-container {
		margin-top: 2rem;
		display: flex;
		flex-direction: row;
		gap: 1rem;
	}

	.library-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		/* height: calc(100vh - 5rem); */
		width: 100%;
		margin-bottom: 5rem;
	}

	.grid-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 20px;
		justify-content: center;
		width: 100%;
	}

	.grid-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		text-align: center;
		width: 180px;
		min-height: 300px;
		overflow: hidden;
		justify-self: center;
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

	.grid-item img {
		width: auto;
		height: 200px;
		object-fit: contain;
		object-position: center;
	}

	.grid-item h2 {
		margin-top: 10px;
		font-size: 1em;
		word-wrap: break-word;
	}
</style>
