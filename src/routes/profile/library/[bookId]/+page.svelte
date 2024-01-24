<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { faRectangleXmark } from '@fortawesome/free-solid-svg-icons';
	import { fetchGoogleBooks } from '$lib/queries/books';
	import { get, writable } from 'svelte/store';
	import { getUserLibraryBook } from '$lib/firebase/bookFirestore';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { session } from '$lib/stores/session';
	import { toLibraryBook } from '$lib/utility/toLibraryBook';
	import { useQuery } from '@sveltestack/svelte-query';
	import Fa from 'svelte-fa';
	import type { LibraryBookWithId } from '$lib/types/books.types';
	import type { LoggedInUser } from '$lib/types/user.types';
	import type { SessionState } from '$lib/types/session.types';
	import { editLibraryBook } from '$lib/hooks/editLibraryBook.client';
	import EditBookForm from '$lib/components/EditBookForm.svelte';

	let user: LoggedInUser | null = null;
	let bookId: string = '';
	// let book = {} as LibraryBookWithId;
	let book: LibraryBookWithId | undefined;
	const q = writable('');
	const selectedBook = writable({} as LibraryBookWithId);

	const {
		elements: { trigger, portalled, overlay, content, title, description, close },
		states: { open }
	} = createDialog();

	session.subscribe((current: SessionState) => {
		user = current?.user;
	});

	$: bookId = $page.params.bookId;

	$: if (user && bookId) {
		fetchBook();
	}

	function openDialog(book: LibraryBookWithId) {
		selectedBook.set(book);
	}

	async function editBook() {
		const selectedBookValue = get(selectedBook);

		const bookValue = toLibraryBook(selectedBookValue);

		if (!user || !user.uid) {
			return;
		}

		const userId = user.uid;

		const book: LibraryBookWithId = {
			...bookValue,
			userId
		};

		const response = await editLibraryBook(user.uid, bookId, book);

		if (response?.success) {
			console.log('Book edited successfully:');

			goto(`/profile/library?bookId=${response.bookId}`);
		} else {
			console.error('Failed to edit book:', response?.error);
		}
	}

	async function fetchBook() {
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

	// async function editBook() {
	// 	if (user && user.uid && bookId) {
	// 		try {
	// 			const response = await editLibraryBook(user.uid, bookId, book);
	// 			console.log(response);
	// 		} catch (error) {
	// 			console.error(error);
	// 		}
	// 	}
	// }

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
	{#if book}
		<h1>{book.title}</h1>
		<div>
			{book.title}
		</div>
	{:else}
		Loading...
	{/if}
	<div use:melt={$portalled}>
		{#if $open}
			<div class="fixed inset-0 z-50 bg-black/50" use:melt={$overlay} />
			<div
				class="dialog fixed left-[50%] top-[50%] z-50 max-h-[85vh]
            w-[90vw] max-w-[550px] translate-x-[-50%] translate-y-[-50%]
            rounded-md p-6 shadow-lg"
				use:melt={$content}
			>
				<h3 use:melt={$title}>{$selectedBook.title}</h3>

				<div class="dialog-buttons">
					<button class="button button-primary" on:click={() => editBook()}>Edit book</button>
					<button use:melt={$close} class="close-button button">
						<Fa icon={faRectangleXmark} size="3x" />
					</button>
				</div>
			</div>
			{#if editingBookshelves}
			<div>Editing bookshelves</div>
			{:else if editingLibraryBook}
			<EditBookForm
				bookTitle={book?.title}
				bookAuthorsArray={book?.authors}
				bookDescription={book?.description}
				bookCategoriesArray={book?.categories}
				bookLanguage={book?.language}
				bookIsbn={book?.industryIdentifiers[0].identifier}
				bookPageCount={book?.pageCount}
				bookImage={book?.imageLinks?.thumbnail}
				bookDate={book?.publishedDate}
				bookPrintType={book?.printType}
				
			 />
			{/if}
		{/if}

	</div>
</section>
