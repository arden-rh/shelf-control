<script lang="ts">
	import { addToast } from '$lib/components/Toaster.svelte';
	import { bookshelvesStore } from '$lib/stores/books.stores';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { deleteUserAccount, getUserBookshelves } from '$lib/firebase/userFirestore';
	import { favouriteBooksStore } from '$lib/stores/books.stores';
	import { getBooksByBookshelf, getBooksByReadingStatus } from '$lib/firebase/bookFirestore';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import { session } from '$lib/stores/session.stores';
	import { updateUser } from '$lib/firebase/userFirestore';
	import { updateUserLibraryBookshelves } from '$lib/firebase/libraryFirestore';
	import { userStore } from '$lib/stores/user.stores';
	import { writable } from 'svelte/store';
	import EditBookshelvesForm from '$lib/components/EditBookshelvesForm.svelte';
	import EditUserForm from '$lib/components/EditUserForm.svelte';
	import type { AppUser, LoggedInUser } from '$lib/types/user.types';
	import type { LibraryBookWithId } from '$lib/types/books.types';
	import type { SessionState } from '$lib/types/session.types';

	const selectedBook = writable({} as LibraryBookWithId);
	let books: LibraryBookWithId[] = [];
	let bookshelves: string[] = [];
	let currentlyReadingBooks: LibraryBookWithId[] = [];
	let user: LoggedInUser | null = null;
	let appUser: AppUser | undefined;
	let displayName: string | undefined = undefined;
	let editingUserProfile = false;
	let editingBookshelves = false;
	let userId: string | undefined | null = undefined;
	let loading: boolean = true;

	const {
		elements: { trigger, portalled, overlay, content, title, description, close },
		states: { open }
	} = createDialog();

	const unsubscribeSession = session.subscribe((current: SessionState) => {
		user = current?.user;
	});

	const unsubscribeUserStore = userStore.subscribe((current: AppUser) => {
		appUser = current;
	});

	const unsubscribeFavouriteBooksStore = favouriteBooksStore.subscribe(
		(current: LibraryBookWithId[]) => {
			books = current;
		}
	);

	onDestroy(() => {
		unsubscribeSession();
		unsubscribeUserStore();
		unsubscribeFavouriteBooksStore();
	});

	$: if (appUser) {
		loading = true;
		displayName = appUser.displayName?.replace(/\./g, ' ').split('-')[0];
		userId = appUser.uid;
		console.log('appUser', appUser);
		getAllBookshelves();
		getAllCurrentlyReadingBooks();
		getFavouriteShelf();
	}

	$: if (!$open) {
		editingBookshelves = false;
		editingUserProfile = false;
	}

	$: bookshelves = $bookshelvesStore;


	function openBook(book: LibraryBookWithId) {
		selectedBook.set(book);
	}

	function editUser() {
		editingUserProfile = true;
	}

	function editBookShelves() {
		editingBookshelves = true;
	}

	function handleCancel() {
		editingUserProfile = false;
		$open = false;
	}

	/** TODO: Fake function for now */
	async function handleDeleteUser() {
		if (!userId) {
			return;
		}

		try {
			const response = await deleteUserAccount(userId);

			if (response?.status === 'success') {
				session.set({
					loading: false,
					loggedIn: false,
					user: null
				});

				userStore.set({} as AppUser);

				localStorage.removeItem('loggedIn');
				localStorage.removeItem('appUser');

				goto('/login');

				addToast({
					data: {
						title: 'Success',
						description: 'User deleted successfully',
						status: 'success'
					}
				});
			}

			// if (response?.status === 'error') {
			// 	editingUserProfile = false;
			// 	$open = false;
			// 	addToast({
			// 		data: {
			// 			title: 'Error',
			// 			description: response.message,
			// 			status: 'error'
			// 		}
			// 	});
			// }
		} catch (error) {
			console.error('Failed to delete user:', error);

			editingUserProfile = false;
			$open = false;
			addToast({
				data: {
					title: 'Error',
					description: 'Failed to delete user',
					status: 'error',
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

	async function handleUpdateUser(event: CustomEvent) {
		const formData = event.detail;

		if (!userId) {
			return;
		}

		try {
			const response = await updateUser(userId, formData);

			if (response?.status === 'success') {
				userStore.update((current: AppUser) => {
					const updatedUser = {
						...current,
						...formData
					};

					localStorage.setItem('appUser', JSON.stringify(updatedUser));

					return updatedUser;
				});

				editingUserProfile = false;
				$open = false;

				addToast({
					data: {
						title: 'Success',
						description: 'User updated successfully',
						status: 'success'
					}
				});
			}

			if (response?.status === 'error') {
				editingUserProfile = false;
				$open = false;
				addToast({
					data: {
						title: 'Error',
						description: response.message,
						status: 'error'
					}
				});
			}
		} catch (error) {
			console.error('Failed to update user:', error);

			editingUserProfile = false;
			$open = false;
			addToast({
				data: {
					title: 'Error',
					description: 'Failed to update user',
					status: 'error',
				}
			});
		}
	}

	async function getFavouriteShelf() {
		if (appUser?.uid && appUser?.favouriteShelf) {
			const response = await getBooksByBookshelf(appUser.uid, appUser.favouriteShelf);

			if (response) {
				books = response;
				loading = false;
			}
		}
	}

	async function getAllBookshelves() {
		if (appUser?.uid) {
			const response = await getUserBookshelves(appUser.uid);

			if (response) {
				bookshelves = response;
				loading = false;
			}
		}
	}

	async function getAllCurrentlyReadingBooks() {
		if (appUser?.uid) {
			const response = await getBooksByReadingStatus(appUser.uid, 'reading');

			if (response) {
				currentlyReadingBooks = response;
				loading = false;
			}
		}
	}
</script>

<section>
	<div class="profile-page-container">
		<div class="page-header">
			<h1>Profile Page</h1>
		</div>
		<div class="profile-container">
			{#if appUser}
				<div class="profile-actions">
					<a href="/profile/library" class="button button-action">Library</a>
					<a href="/profile/library/add-book" class="button button-action">Add a book</a>
					<button on:click={editUser} use:melt={$trigger} class="button button-action"
						>Edit profile</button
					>
					<button on:click={editBookShelves} use:melt={$trigger} class="button button-action"
					>Edit Bookshelves</button
				>
				</div>
			{/if}
			<section class="profile-info">
				<div class="profile-image">
					<img src="/images/profile-pic_2.png" alt="an illustration of a stack of books"/>
				</div>
				<div class="profile-details">
					<ul>
						{#if appUser}
							<li>
								<span>Display name:</span>{displayName ? displayName : 'Not chosen'}
							</li>
							{#if appUser.privateInfo?.favourites === 'all' || appUser.privateInfo?.favourites === 'users'}
								{#if appUser.favouriteBook}
									<li>
										<span>Favourite book:</span>{appUser.favouriteBook}
									</li>
								{/if}
								{#if appUser.favouriteAuthor}
									<li>
										<span>Favourite author:</span>{appUser.favouriteAuthor}
									</li>
								{/if}
								{#if appUser.favouriteGenre}
									<li>
										<span>Favourite genre:</span>{appUser.favouriteGenre}
									</li>
								{/if}
							{/if}
						{/if}
					</ul>
				</div>
			</section>
			{#if books.length > 0 && !loading}
				<section class="currently-reading">
					<h2>Currently Reading</h2>
					<div class="currently-reading-container">
						{#if currentlyReadingBooks.length > 0}
							{#each currentlyReadingBooks as book}
								<button class="reading-book" on:click={() => openBook(book)} use:melt={$trigger}>
									<img src={book.imageLinks?.smallThumbnail} alt={`Book over of ${book.title}`} />
								</button>
							{/each}
						{:else}
							<p>Not reading anything at the moment.</p>
						{/if}
					</div>
				</section>
			{/if}
			{#if appUser?.privateInfo?.bookshelves === 'all' || appUser?.privateInfo?.bookshelves === 'users'}
				<section class="bookshelves">
					<div class="bookshelves-header-container">
						<h2>Bookshelves</h2>
						<div class="library-link-container">
							<a href="/profile/library" class="button button-primary">Go to Library</a>
						</div>
					</div>
					{#if appUser?.favouriteShelf}
						<h3>Favourite shelf: {appUser?.favouriteShelf}</h3>
						<div class="bookshelves-container">
							{#if books.length > 0 && !loading}
								{#each books as book}
									<button class="book button" on:click={() => openBook(book)} use:melt={$trigger}>
										<h4>{book.title}</h4>
									</button>
								{/each}
							{:else if loading}
								<p>Loading...</p>
							{:else}
								<p>No books added to this bookshelf yet.</p>
							{/if}
						</div>
					{/if}
					{#if bookshelves.length > 0}
						<h3 class="second">All bookshelves</h3>
						<div class="all-bookshelves-container">
							{#each bookshelves.sort() as bookshelf}
								<a class="bookshelves-container" href={`/profile/library?bookshelf=${bookshelf}`}>
									<h4>{bookshelf}</h4>
								</a>
							{/each}
						</div>
					{:else}
						<p>No bookshelves added yet.</p>
					{/if}
				</section>
			{/if}
		</div>
	</div>
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
			{#if $selectedBook && !editingUserProfile && !editingBookshelves}
				<h3 class="dialog-book-title" use:melt={$title}>{$selectedBook.title}</h3>
				<div class="dialog-cover-info">
					<ul>
						<li>
							<span
								>{$selectedBook.authors && $selectedBook.authors.length > 1
									? 'Authors: '
									: 'Author: '}</span
							>
							{$selectedBook.authors ? $selectedBook.authors.join(', ') : 'N/A'}
						</li>
						<li>
							<span>Publisher:</span>
							{$selectedBook.publisher ? $selectedBook.publisher : 'Unknown'}
						</li>
						<li>
							<span>Published:</span>
							{$selectedBook.publishedDate ? $selectedBook.publishedDate : 'Unknown'}
						</li>
						<li>
							<span>Page count:</span>
							{$selectedBook.pageCount ? $selectedBook.pageCount : 'Unknown'}
						</li>
						<li>
							<span>Language:</span>
							{$selectedBook.language ? $selectedBook.language.toUpperCase() : 'Unknown'}
						</li>
						<li>
							<span>Bookshelves:</span>
							{$selectedBook.bookshelves ? $selectedBook.bookshelves.join(', ') : 'Unknown'}
						</li>
					</ul>
				</div>
				{#if $selectedBook.description}
					<p class="dialog-description" use:melt={$description}>{$selectedBook.description}</p>
				{/if}
				<div class="dialog-buttons">
					<a class="button button-primary" href={`profile/library?bookId=${$selectedBook._id}`}
						>Go to book page</a
					>
					<button use:melt={$close} class="button button-close">Close</button>
				</div>
			{:else if editingUserProfile && appUser}
				<EditUserForm
					displayName={appUser.displayName || ''}
					favouriteAuthor={appUser.favouriteAuthor || ''}
					favouriteBook={appUser.favouriteBook || ''}
					favouriteGenre={appUser.favouriteGenre || ''}
					favouriteShelf={appUser.favouriteShelf || ''}
					photoURL={appUser.photoURL || ''}
					privateInfo={appUser.privateInfo || {
						profilePicture: 'users',
						favourites: 'users',
						bookShelves: 'users'
					}}
					bookshelves={bookshelves || []}
					on:cancel={handleCancel}
					on:submit={handleUpdateUser}
					on:delete={handleDeleteUser}
				/>
				{:else if editingBookshelves}
				<EditBookshelvesForm
					{bookshelves}
					on:cancel={handleCancel}
					on:save={handleUpdateBookshelves}
				/>
			{/if}
		</div>
	{/if}
</div>

<style>
	section {
		align-items: center;
		justify-content: center;
		width: 100%;
		background-color: var(--accent-light-blue-grey);
	}

	li {
		font-family: var(--header-font);
		font-size: 1rem;
		letter-spacing: 0.05rem;
		line-height: 1.25rem;
		margin-bottom: 0.5rem;
	}

	li span {
		font-weight: 600;
		display: block;
		text-transform: uppercase;
		color: var(--primary-colour-purple);
	}

	h2 {
		margin-bottom: 0.75rem;
		line-height: 1.75rem;
		border-bottom: 8px solid var(--secondary-colour-purple);
		box-shadow: inset 0 -4px 0px 0px var(--accent-pink-purple);
		padding-bottom: 0.5rem;
	}

	h3 {
		margin-bottom: 0.75rem;
		font-size: 1.2rem;
	}
	h3.second {
		margin-top: 2rem;
		margin-bottom: 0;
	}

	h4 {
		font-size: 0.8rem;
	}

	.all-bookshelves-container {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		justify-content: flex-start;
		width: 100%;
		padding: 0;
		margin-bottom: 5rem;
		flex-wrap: wrap;
		gap: 1.25rem;
	}

	.all-bookshelves-container a {
		align-items: center;
		font-family: var(--header-font);
		display: flex;
		letter-spacing: 0.075rem;
		padding: 0 0.75rem;
		text-transform: uppercase;
		font-weight: 500;
		max-width: calc(50% - 0.75rem);
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
	.book {
		writing-mode: vertical-rl;
		text-orientation: sideways;
		height: fit-content;
		max-height: 200px;
		overflow: hidden;
		padding: 1rem 0.5rem;
		border-radius: 0;
		position: relative;
		box-shadow: 0px 0px 2px 0px var(--primary-black);
		margin: 0 1px;
	}

	.book:nth-child(3n + 1) {
		background-color: var(--accent-blue-grey);
		color: var(--primary-black);
	}

	.book:nth-child(3n + 1):hover,
	.book:nth-child(3n + 2):hover,
	.book:nth-child(3n + 3):hover {
		background-color: var(--accent-dark-blue-grey);
		color: var(--primary-black);
	}

	.book:nth-child(3n + 2) {
		background-color: var(--primary-colour-purple);
		color: var(--primary-white);
	}

	.book:nth-child(3n + 3) {
		background-color: var(--secondary-grey);
		color: var(--primary-black);
	}

	.bookshelves {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		width: 100%;
		padding: 0;
		margin-left: 0.5rem;
	}

	.bookshelves-container {
		display: flex;
		flex-direction: row;
		align-items: flex-end;
		justify-content: flex-end;
		width: 100%;
		border: 12px solid var(--secondary-colour-purple);
		box-shadow: inset -8px -8px 0px 0px var(--accent-pink-purple), 1px 1px 2px 0px rgba(0, 0, 0, 0.4);
		position: relative;
		padding: 0.8rem 1.25rem 1.25rem;
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
	}

	.bookshelves-container::after {
		top: -12px;
		left: -20px;
		width: 8px;
		height: calc(100% + 24px);
		transform-origin: top right;
		transform: skewY(42deg);
	}

	.bookshelves-header-container {
		display: flex;
		justify-content: space-between;
		width: 100%;
		align-items: flex-start;
	}

	.button-action {
		min-height: 2.75rem;
	}

	.currently-reading {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		width: 100%;
		padding: 0;
		margin: 0 0 3rem 0.5rem;
	}

	.currently-reading-container {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		justify-content: flex-start;
		width: 100%;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.dialog-book-title {
		text-transform: uppercase;
	}

	.empty-library {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		width: 100%;
		padding: 0;
		margin: 0 0 3rem 0.5rem;
	}

	.library-link-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-end;
		width: 100%;
	}

	.library-link-container .button {
		height: fit-content;
		padding: 0.4rem 0.8rem;
		margin-right: 0.5rem;
	}

	.profile-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
	}
	.profile-info {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		width: 100%;
		margin-bottom: 2rem;
		padding: 0;
		max-width: 700px;
		align-self: flex-end;
	}

	.profile-image {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		overflow: hidden;
		border: 4px solid var(--accent-blue-grey);
		outline: 8px solid var(--accent-dark-blue-grey);
	}

	.profile-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
	}

	.profile-details {
		border: 12px solid var(--secondary-colour-purple);
		box-shadow: inset -8px -8px 0px 0px var(--accent-pink-purple), 1px 1px 2px 0px rgba(0, 0, 0, 0.4);
		position: relative;
		padding: 0.8rem 1rem 1rem;
		margin-left: 2rem;
		width: calc(100% - 150px - 2rem);
	}

	.profile-details::before,
	.profile-details::after {
		content: '';
		position: absolute;
		background-color: var(--accent-pink-purple);
	}

	.profile-details::before {
		position: absolute;
		content: '';
		background-color: var(--accent-pink-purple);
		top: -19px;
		left: -20px;
		right: 0;
		height: 7px;
		width: calc(100% + 24px);
		transform-origin: top left;
		transform: skewX(48deg);
	}

	.profile-details::after {
		position: absolute;
		content: '';
		background-color: var(--accent-pink-purple);
		top: -12px;
		left: -20px;
		bottom: 0;
		width: 8px;
		height: calc(100% + 24px);
		transform-origin: top right;
		transform: skewY(42deg);
	}

	.profile-actions {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-end;
		margin-bottom: 2rem;
		align-self: flex-end;
	}

	.profile-page-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		max-width: 1000px;
		height: 100%;
	}

	.reading-book {
		position: relative;
		cursor: pointer;
		border: 4px solid var(--primary-colour-purple);
		box-shadow: 2px 2px 2px 0px rgba(0, 0, 0, 0.4);
	}

	.reading-book:hover {
		border-color: var(--accent-dark-blue-grey);
	}

	.reading-book img {
		max-height: 150px;
		object-fit: contain;
		object-position: center;
	}

	.reading-book::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image: linear-gradient(
			to bottom,
			rgba(52, 34, 138, 0.5),
			rgba(52, 34, 138, 0.25),
			rgba(52, 34, 138, 0.5)
		);
		transition: opacity 0.3 ease;
	}

	.reading-book:hover::after {
		opacity: 0;
	}

	@media (min-width: 410px) {
		.button-action {
			min-height: fit-content;
		}
	}

	@media (min-width: 590px) {
		.all-bookshelves-container a {
			max-width: calc(33% - 0.75rem);
			font-size: 1rem;
		}
	}

	@media (min-width: 768px) {
		h2 {
			font-size: 2.5rem;
			padding-bottom: 0.75rem;
		}

		li span {
			display: inline;
			margin-right: 0.25rem;
		}

		.all-bookshelves-container a {
			max-width: calc(25% - 1rem);
		}
	}
</style>
