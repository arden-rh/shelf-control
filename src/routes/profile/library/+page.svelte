<script lang="ts">
	import {
		addUniqueBookshelvesAndUpdateUser,
		getUserLibraryBook
	} from '$lib/firebase/firebase.client';
	import { getUserLibraryBooks } from '$lib/firebase/firebase.client';
	import { page } from '$app/stores';
	import { session } from '$lib/stores/session';
	import { writable } from 'svelte/store';
	import type { LibraryBookWithId } from '$lib/types/books.types';
	import type { SessionState } from '$lib/types/session.types';
	import type { LoggedInUser } from '$lib/types/user.types';
	import BookPage from '$lib/components/BookPage.svelte';
	import { load } from '../../+layout';

	const selectedBook = writable({} as LibraryBookWithId);
	// const bookId = writable('');
	let loading: boolean = true;
	let loggedIn: boolean = false;
	let user: LoggedInUser | null = null;
	let books: LibraryBookWithId[] = [];
	let book: LibraryBookWithId | undefined;
	let newBookShelves = ['fantasy', 'read-in-2021'];

	$: bookId = $page.url.searchParams.get('bookId');
	$: bookshelf = $page.url.searchParams.get('booshelf');
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

	function editBookShelves(book: LibraryBookWithId) {
		selectedBook.set(book);
		updateBookShelves();
	}

	async function updateBookShelves() {
		if (!user?.uid) {
			return;
		}

		try {
			await addUniqueBookshelvesAndUpdateUser(user.uid, $selectedBook._id, newBookShelves);
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
		console.log('fetching book');
		console.log(user);
		console.log(bookId);

		loading = true;
		if (user && user.uid && bookId) {
			try {
				const response = await getUserLibraryBook(user.uid, bookId);
				book = response;
				loading = false;
				console.log(book);
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

<section>
	<div class="page-header">
		<h1>Library</h1>
	</div>
	{#if bookId && book && !loading}
		<BookPage {book} />
	{:else if bookshelf && !loading}
		<p>hej</p>
	{:else if noQuery && !loading}
		<div>
			<ul>
				{#each books as book}
					<li>
						<a href={`/profile/library/${book._id}`}>
							<img src={book.imageLinks?.thumbnail} alt={book.title} />
							<h2>{book.title}</h2>
							<p>{book.authors}</p>
						</a>
						<button on:click={() => editBookShelves(book)} class="button">
							Edit bookshelves
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{:else if loading}
		<p>Loading...</p>
	{/if}
</section>
