<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { getUserLibraryBook } from '$lib/firebase/bookFirestore';
	import {
		deleteUserLibrary,
		getUserLibraryBooks,
		updateUserLibraryBookshelves
	} from '$lib/firebase/libraryFirestore';
	import { addToast } from '$lib/components/Toaster.svelte';
	import { getUserBookshelves } from '$lib/firebase/userFirestore';
	import { onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { session } from '$lib/stores/session.stores';
	import { userStore } from '$lib/stores/user.stores';
	import { writable } from 'svelte/store';
	import BookPage from '$lib/components/BookPage.svelte';
	import EditBookshelvesForm from '$lib/components/EditBookshelvesForm.svelte';
	import type { AppUser, LoggedInUser } from '$lib/types/user.types';
	import type { LibraryBookWithId } from '$lib/types/books.types';
	import type { SessionState } from '$lib/types/session.types';
	import { allBookStore } from '$lib/stores/books.stores';

	let appUser: AppUser | undefined;
	let book: LibraryBookWithId | undefined;
	let books: LibraryBookWithId[] = [];
	let bookshelves: string[] = [];
	let loading: boolean = true;
	let user: LoggedInUser | null = null;
	let editingBookshelves = false;
	let deletingLibrary = false;
	export const bookshelvesStore = writable([] as string[]);

	$: if (user?.uid) {
		loadBooks(user.uid);
	}

	$: if (user && bookId) {
		fetchBook();
	}

	$: if (appUser) {
		loading = true;
		getAllBookshelves();
	}

	$: if (!$open) {
		editingBookshelves = false;
		deletingLibrary = false;
	}

	$: bookId = $page.url.searchParams.get('bookId');
	$: bookshelf = $page.url.searchParams.get('bookshelf');
	$: noQuery = !$page.url.searchParams.has('bookId') && !$page.url.searchParams.has('bookshelf');
	$: bookshelves = $bookshelvesStore;
	$: books = $allBookStore;

	const {
		elements: { trigger, portalled, overlay, content, title, description, close },
		states: { open }
	} = createDialog();

	const unsubscribeBookStore = allBookStore.subscribe((current: LibraryBookWithId[]) => {
		books = current;
	});

	const unsubscribeSession = session.subscribe((current: SessionState) => {
		user = current?.user;
		loading = current?.loading;
	});

	const unsubscribeUserStore = userStore.subscribe((current: AppUser) => {
		appUser = current;
	});

	onDestroy(() => {
		unsubscribeBookStore();
		unsubscribeSession();
		unsubscribeUserStore();
	});

	function editBookShelves() {
		editingBookshelves = true;
	}

	function deleteLibrary() {
		deletingLibrary = true;
	}

	function handleCancel() {
		$open = false;
	}

	async function handleDeleteLibrary() {
		if (!user || !user.uid) {
			return;
		}
		try {
			await deleteUserLibrary(user.uid);

			allBookStore.set([]);
			$open = false;

			addToast({
				data: {
					title: 'Success',
					description: 'Library deleted successfully',
					status: 'success'
				}
			});
		} catch (error) {
			addToast({
				data: {
					title: 'Error',
					description: 'Failed to delete library',
					status: 'error'
				}
			});
		}
	}

	async function handleUpdateBookshelves(event: CustomEvent) {
		const formData = event.detail;

		if (!user || !user.uid) {
			return;
		}
		try {
			await updateUserLibraryBookshelves(user.uid, formData.bookshelves);

			bookshelvesStore.set(formData.bookshelves);

			editingBookshelves = false;
			$open = false;

			addToast({
				data: {
					title: 'Success',
					description: 'Bookshelves updated successfully',
					status: 'success'
				}
			});
		} catch (error) {
			addToast({
				data: {
					title: 'Error',
					description: 'Failed to update bookshelves',
					status: 'error'
				}
			});
		}
	}

	async function loadBooks(userId: string) {
		try {
			books = await getUserLibraryBooks(userId);
			allBookStore.set(books);
		} catch (error) {
			console.error('Error fetching books:', error);
		}
	}

	async function getAllBookshelves() {
		if (appUser?.uid) {
			const response = await getUserBookshelves(appUser.uid);

			if (response) {
				bookshelves = response;
				bookshelvesStore.set(bookshelves);
				loading = false;
			}
		}
	}

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
</script>

<section>
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
				<div class="library-actions">
					<a href="/profile/library/add-book" class="button button-primary">Add book</a>
					<button on:click={editBookShelves} use:melt={$trigger} class="button button-primary"
						>Edit Bookshelves</button
					>
				</div>
				<section class="no-books">
					<p>
						This was a very empty library! Maybe you want to add your first book or a bookshelf?
					</p>
					<div class="link-container">
						<a href="/profile/library/add-book" class="button button-primary">Add Book</a>
						<button on:click={editBookShelves} use:melt={$trigger} class="button button-primary"
							>Edit Bookshelves</button
						>
					</div>
				</section>
			{:else}
				<div class="library-actions">
					<a href="/profile/library/add-book" class="button button-primary">Add book</a>
					<button on:click={editBookShelves} use:melt={$trigger} class="button button-primary"
						>Edit Bookshelves</button
					>
					<button
						on:click={deleteLibrary}
						use:melt={$trigger}
						class="button button-primary delete-button">Delete Library</button
					>
				</div>
			{/if}
			<section>
				{#if bookshelves.length > 0}
					<h2>Bookshelves</h2>
					<div class="all-bookshelves-container">
						{#each bookshelves.sort() as bookshelf}
							<a
								class="bookshelves-container small"
								href={`/profile/library?bookshelf=${bookshelf}`}
							>
								<h4>{bookshelf}</h4>
							</a>
						{/each}
					</div>
				{:else}
					<div class="no-bookshelves">
						<h2>Bookshelves</h2>
						<p>No bookshelves added yet.</p>
					</div>
				{/if}
			</section>
			<section class="all-books">
				{#if books.length === 0}
					<div class="no-books">
						<h2>All books</h2>
						<p>No books added yet.</p>
					</div>
				{:else}
					<h2>All books</h2>
					<div class="grid-container bookshelves-container">
						{#each books as book}
							<div class="grid-item">
								<a href={`/profile/library?bookId=${book._id}`}>
									<img src={book.imageLinks?.thumbnail} alt={book.title} />
									<h3>{book.title}</h3>
								</a>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		</div>
	{:else if loading}
		<p>Loading...</p>
	{/if}
</section>
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
			{#if editingBookshelves}
				<EditBookshelvesForm
					{bookshelves}
					on:cancel={handleCancel}
					on:save={handleUpdateBookshelves}
				/>
			{:else if deletingLibrary}
				<div class="delete-library-container">
					<h3>Are you sure you want to delete your library?</h3>
					<div class="button-group">
						<button class="button button-primary" on:click={handleDeleteLibrary}>Yes</button>
						<button class="button button-secondary" on:click={handleCancel}>No</button>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	h2 {
		margin-bottom: 1rem;
		line-height: 1.75rem;
		border-bottom: 8px solid var(--secondary-colour-purple);
		box-shadow: inset 0 -4px 0px 0px var(--accent-pink-purple);
		padding-bottom: 0.5rem;
		align-self: flex-start;
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

	.all-books h2 {
		margin-bottom: 1.75rem;
	}

	.all-bookshelves-container {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		justify-content: space-between;
		width: 100%;
		padding: 0;
		margin-bottom: 2rem;
		flex-wrap: wrap;
	}

	.all-bookshelves-container a {
		align-items: center;
		font-family: var(--header-font);
		display: flex;
		letter-spacing: 0.075rem;
		padding: 0 0.75rem;
		text-transform: uppercase;
		font-weight: 500;
		max-width: calc(50% - 0.5rem);
		margin-top: 0.75rem;
		cursor: pointer;
	}

	.all-bookshelves-container a:hover {
		border-color: var(--accent-blue-grey);
		box-shadow: inset -8px -8px 0px 0px var(--accent-dark-blue-grey);
	}

	.all-bookshelves-container a:hover::before,
	.all-bookshelves-container a:hover::after {
		background-color: var(--accent-dark-blue-grey);
	}

	.all-bookshelves-container h4 {
		font-size: 0.9rem;
	}

	.bookshelves-container {
		width: 100%;
		position: relative;
		padding: 0;
	}

	.bookshelves-container.small {
		border: 12px solid var(--secondary-colour-purple);
		box-shadow: inset -8px -8px 0px 0px var(--accent-pink-purple);
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

	.bookshelves-container.small::before,
	.bookshelves-container.small::after {
		display: block;
	}

	.delete-library-container h3 {
		font-size: 1rem;
		text-transform: uppercase;
	}

	.library-actions {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		margin-bottom: 1.5rem;
		align-self: flex-end;
	}
	.library-actions .button {
		font-size: 0.7rem;
		height: fit-content;
		padding: 0.5rem 1rem;
		border: none;
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
		width: 100%;
		margin-bottom: 5rem;
	}

	.grid-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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
		width: 150px;
		min-height: 150px;
		overflow: hidden;
		justify-self: center;
		background-color: var(--primary-grey);
		padding: 1rem;
		box-shadow: 2px 2px 2px 0px rgba(0, 0, 0, 0.6);
		cursor: pointer;
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

	.no-books,
	.no-bookshelves {
		margin: 1rem 0 3rem;
		width: 100%;
	}

	.no-books p,
	.no-bookshelves p {
		font-size: 0.9rem;
		text-align: center;
	}

	.no-books h2,
	.no-bookshelves h2 {
		margin-bottom: 2rem;
	}

	@media (min-width: 590px) {
		.all-bookshelves-container a {
			max-width: calc(33% - 0.5rem);
			font-size: 1rem;
		}

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

		.all-bookshelves-container a {
			max-width: calc(25% - 1rem);
		}

		.bookshelves-container {
			padding: 0.8rem 1.5rem 1.5rem 1.25rem;
		}

		.grid-container {
			grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
			background-color: var(--primary-grey);
			padding: 1rem;
			box-shadow: 2px 2px 2px 0px rgba(0, 0, 0, 0.6);
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
