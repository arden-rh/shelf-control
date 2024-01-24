<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { faRectangleXmark } from '@fortawesome/free-solid-svg-icons';
	import { favouriteBooksStore } from '$lib/stores/books';
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session';
	import { userStore } from '$lib/stores/user';
	import { writable } from 'svelte/store';
	import { onDestroy } from 'svelte';
	import { addToast } from '$lib/components/Toaster.svelte';
	import { getBooksByBookshelf } from '$lib/firebase/bookFirestore';
	import { getUserBookshelves } from '$lib/firebase/userFirestore';
	import { updateUser } from '$lib/firebase/userFirestore';
	import EditUserForm from '$lib/components/EditUserForm.svelte';
	import Fa from 'svelte-fa'
	import type { LibraryBookWithId } from '$lib/types/books.types';
	import type { AppUser, LoggedInUser } from '$lib/types/user.types';
	import type { SessionState } from '$lib/types/session.types';

	let newBookshelves = ['Fantasy', 'Bestsellers'];
	const selectedBook = writable({} as LibraryBookWithId);
	let books: LibraryBookWithId[] = [];
	let bookshelves: string[] = [];
	let user: LoggedInUser | null = null;
	let appUser: AppUser | undefined;
	let displayName: string | undefined = undefined;
	let editingUserProfile = false;
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
		getFavouriteShelf();
		getAllBookshelves();
	}

	function openBook(book: LibraryBookWithId) {
		selectedBook.set(book);
	}

	function editUser() {
		editingUserProfile = true;
	}

	function handleCancel() {
		editingUserProfile = false;
		$open = false;
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
						color: 'green'
					}
				});
			}

			if (response?.status === 'error') {
				addToast({
					data: {
						title: 'Error',
						description: response.message,
						color: 'red'
					}
				});
			}
		} catch (error) {
			console.error('Failed to update user:', error);
			addToast({
				data: {
					title: 'Error',
					description: 'Failed to update user',
					color: 'red'
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
</script>

<section>
	<div class="profile-page-container">
		<div class="page-header">
			<h1>Profile Page</h1>
		</div>
		<div class="profile-container">
			<div class="profile-actions">
				<a href="/profile/library/add-book" class="button button-primary">Add a book</a>
				<a href="/profile/library" class="button button-primary">Library</a>
				<button on:click={editUser} use:melt={$trigger} class="button button-primary"
					>Edit profile</button
				>
			</div>
			<section class="profile-info">
				<div class="profile-image">
					<img src="https://via.placeholder.com/150" alt="profile picture" />
				</div>
				<div class="profile-details">
					<ul>
						{#if appUser}
							<li>
								<span>Display name:</span>{displayName ? displayName : 'Not chosen'}
							</li>
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
					</ul>
				</div>
			</section>
			<section class="bookshelves">
				<h2>Bookshelves</h2>
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
					<h3 class="second">Other bookshelves</h3>
					<div class="bookshelves-container second">
						{#each bookshelves as bookshelf}
							<a class="button button-secondary" href={`/profile/library?bookshelf=${bookshelf}`}>
								<h4>{bookshelf}</h4>
							</a>
						{/each}
					</div>
				{:else}
					<p>No bookshelves added yet.</p>
				{/if}
			</section>
		</div>
	</div>
</section>

<div id="dialog" use:melt={$portalled}>
	{#if $open}
		<div class="fixed inset-0 z-50 bg-black/50" use:melt={$overlay} />
		<div
			class="dialog fixed left-[50%] top-[50%] z-50 max-h-[85vh]
        w-[90vw] max-w-[550px] translate-x-[-50%] translate-y-[-50%]
        rounded-md p-6 shadow-lg"
			use:melt={$content}
		>
			{#if $selectedBook && !editingUserProfile}
				<h3 use:melt={$title}>{$selectedBook.title}</h3>
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
					<button use:melt={$close} class="close-button">
						<Fa icon={faRectangleXmark} class="close-icon" />
					</button>
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
		margin-bottom: 0.5rem;
		line-height: 1.75rem;
	}

	h3 {
		margin-bottom: 0.5rem;
	}
	h3.second {
		margin-top: 2rem;
	}

	h4 {
		font-size: 0.8rem;
	}

	.book {
		writing-mode: vertical-rl;
		text-orientation: sideways;
		height: fit-content;
		padding: 1rem 0.5rem;
		border-radius: 0;
	}

	.book:nth-child(3n + 1) {
		background-color: var(--accent-blue-grey);
		color: var(--primary-black);
	}

	.book:nth-child(3n + 1):hover,
	.book:nth-child(3n + 2):hover {
		background-color: var(--secondary-grey);
		color: var(--primary-black);
	}

	.book:nth-child(3n + 2) {
		background-color: var(--primary-colour-purple);
		color: var(--primary-white);
	}

	.book:nth-child(3n + 3) {
		background-color: var(--accent-light-blue-grey);
		color: var(--primary-black);
	}

	.bookshelves {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		width: 100%;
		padding: 0;
	}

	.bookshelves-container {
		display: flex;
		flex-direction: row;
		align-items: flex-end;
		justify-content: flex-end;
		width: 98%;
		border: 12px solid var(--secondary-colour-purple);
		box-shadow: inset -8px -8px 0px 0px rgba(178, 152, 220, 1);
		position: relative;
		padding: 0.8rem 0 0;
		padding: 0.8rem 1.25rem 1.25rem;
		margin-left: 0.5rem;
	}

	.bookshelves-container::before,
	.bookshelves-container::after {
		content: '';
		position: absolute;
		background-color: var(--accent-purple);
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

	.button-secondary {
		background-color: var(--secondary-grey);
		color: var(--primary-black);
		border: none;
		border-radius: 0;
		margin: 0 0.5rem 0 0.5rem;
	}

	.button-secondary:hover {
		background-color: var(--primary-colour-purple);
		color: var(--primary-white);
	}

	.profile-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		max-width: 800px;
	}
	.profile-info {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		width: 100%;
		margin-bottom: 2rem;
		padding: 0;
	}

	.profile-image {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		overflow: hidden;
	}

	.profile-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
	}

	.profile-details {
		border: 12px solid var(--secondary-colour-purple);
		box-shadow: inset -8px -8px 0px 0px rgba(178, 152, 220, 1);
		position: relative;
		padding: 0.8rem 1rem 1rem;
		margin-left: 2rem;
		width: calc(100% - 150px - 2rem);
	}

	.profile-details::before,
	.profile-details::after {
		content: '';
		position: absolute;
		background-color: var(--accent-purple);
	}

	.profile-details::before {
		position: absolute;
		content: '';
		background-color: var(--accent-purple);
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
		background-color: var(--accent-purple);
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
		margin-bottom: 1rem;
		align-self: flex-end;
		background-color: var(--secondary-colour-purple);
		border-radius: 5px;
		overflow: hidden;
	}
	.profile-actions .button {
		font-size: 0.7rem;
		height: fit-content;
		padding: 0.5rem 1rem;
		border-radius: 0;
		background-color: var(--accent-purple);
		border: none;
		color: var(--primary-colour-purple);
	}

	.profile-actions .button:nth-child(2) {
		border-left: 1px solid var(--accent-light-blue-grey);
		border-right: 1px solid var(--accent-light-blue-grey);
	}

	.profile-actions .button:hover {
		background-color: var(--primary-colour-purple);
		color: var(--primary-white);
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

	.bookshelves-container.second {
		margin: 0 0 5rem 0.5rem;
		justify-content: flex-start;
	}
</style>
