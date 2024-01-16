<script lang="ts">
	import { getUserLibraryBook } from '$lib/firebase/firebase.client';
	import { onMount } from 'svelte';
	import { session } from '$lib/session';
	import { page } from '$app/stores';
	import type { LoggedInUser } from '$lib/types/user.types';
	import type { SessionState } from '$lib/types/session.types';
	import type { LibraryBookWithId } from '$lib/types/books.types';

    let user: LoggedInUser | null = null;
	let bookId: string = '';
	// let book = {} as LibraryBookWithId;
	let book: LibraryBookWithId | undefined;


    session.subscribe((current: SessionState) => {
        user = current?.user;
	});

	$: bookId = $page.params.bookId;

	$: if (user && bookId) {
		fetchBooks()
	}

	async function fetchBooks() {
		if (user && user.uid && bookId) {
			try {
				const response = await getUserLibraryBook(user.uid, bookId);
				book = response;
				console.log(book);
			} catch (error) {
				console.error(error);
			}
		}
	}

	async function deleteBook() {
		if (user && user.uid && bookId) {
			try {
				const response = await deleteUserLibraryBook(user.uid, bookId);
				console.log(response);
			} catch (error) {
				console.error(error);
			}
		}
	}

	async function updateBook() {
		if (user && user.uid && bookId) {
			try {
				const response = await updateUserLibraryBook(user.uid, bookId, book);
				console.log(response);
			} catch (error) {
				console.error(error);
			}
		}
	}
	
	async function addBookShelves() {
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
    <h1>Book Details</h1>
	<div>
		{#if book}
			{book.title}
		{:else}
			Loading...
		{/if}
	</div>
</section>