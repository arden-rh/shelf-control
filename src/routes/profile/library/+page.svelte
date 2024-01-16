<script lang="ts">
	import { getUserLibraryBooks } from '$lib/firebase/firebase.client';
	import { session } from '$lib/session';
	import { addUniqueBookshelvesAndUpdateUser } from '$lib/firebase/firebase.client';

	import type { LibraryBookWithId } from '$lib/types/books.types';
	import type { SessionState } from '$lib/types/session.types';
	import type { LoggedInUser } from '$lib/types/user.types';
	import { writable } from 'svelte/store';

	const selectedBook = writable({} as LibraryBookWithId);
	let loading: boolean = true;
	let loggedIn: boolean = false;
	let user: LoggedInUser | null = null;
	let books: LibraryBookWithId[] = [];
	let newBookShelves = ['fantasy', 'read-in-2021'];

	session.subscribe((current: SessionState) => {
		loading = current?.loading;
		loggedIn = current?.loggedIn;
		user = current?.user;
	});

	$: if (user?.uid) {
		loadBooks(user.uid);
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
</script>

<section>
	<h1>Library</h1>
	<div>
		<ul>
			{#each books as book}
				<li>
					<a href={`/profile/library/${book._id}`}>
						<img src={book.imageLinks?.thumbnail} alt={book.title} />
						<h2>{book.title}</h2>
						<p>{book.authors}</p>
					</a>
					<button
						on:click={() => editBookShelves(book)}
						class="button"
					>
                    Edit bookshelves
					</button>
				</li>
			{/each}
		</ul>
	</div>
</section>
