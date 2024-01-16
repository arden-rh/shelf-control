<script lang="ts">
	import { faRectangleXmark } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session';
	import { userStore } from '$lib/stores/user';
	import { writable } from 'svelte/store';
	import type { LibraryBookWithId } from '$lib/types/books.types';
	import type { AppUser, LoggedInUser } from '$lib/types/user.types';
	import type { SessionState } from '$lib/types/session.types';

	let newBookShelves = ['Fantasy', 'Bestsellers'];
	let favouriteShelf = writable('');
	const selectedBook = writable({} as LibraryBookWithId);
	let books: LibraryBookWithId[] = [];
	let user: LoggedInUser | null = null;
	let appUser: AppUser | null = null;

	const {
		elements: { trigger, portalled, overlay, content, title, description, close },
		states: { open }
	} = createDialog();

	session.subscribe((current: SessionState) => {
		user = current?.user;
	});

	userStore.subscribe((current: AppUser) => {
		appUser = current;
	});

	function openBook(book: LibraryBookWithId) {
		selectedBook.set(book);
	}
</script>

<section>
	<div class="page-header">
		<h1>Profile Page</h1>
	</div>
	<div class="profile-container">
		<div class="profile-actions">
			<a href="/profile/add-book" class="button button-primary">Add a book</a>
			<a href="/profile/library" class="button button-primary">Library</a>
			<a href="/profile/edit" class="button button-primary">Edit profile</a>
		</div>
		<section class="profile-info">
			<div class="profile-image">
				<img src="https://via.placeholder.com/150" alt="profile picture" />
			</div>
			<div class="profile-details">
				<ul>
					{#if appUser}
						<li>
							<span>Display name:</span>{appUser.displayName ? appUser.displayName : 'Not chosen'}
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
			<h3>Favourite shelf</h3>
			<div class="bookshelves-container">
				{#each books as book}
					<button class="book">
						<h4>{book.title}</h4>
					</button>
				{/each}
			</div>
		</section>
	</div>
</section>

<style>
	section {
		align-items: center;
		justify-content: center;
		width: 100%;
		max-width: 800px;
	}

	li {
		font-family: var(--header-font);
		font-size: 1rem;
		letter-spacing: 0.05rem;
	}

	li span {
		font-weight: 600;
		display: block;
		text-transform: uppercase;
		line-height: 1.25rem;
	}

	h1::before {
		content: '';
		position: absolute;
		background-color: var(--accent-purple);
		left: -4px;
		bottom: -10px;
		width: 4px;
		height: 10px;
		transform-origin: top right;
		transform: skewY(42deg);
		z-index: 1;
	}

	h1::after {
		content: '';
		position: absolute;
		background-color: var(--accent-purple);
		left: -4px;
		bottom: 0;
		width: 4px;
		height: 4px;
		z-index: 1;
	}
	h2 {
		margin-bottom: 0.5rem;
		line-height: 1.75rem;
	}

	h3 {
		margin-bottom: 0.5rem;
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
		align-items: center;
		justify-content: flex-start;
		width: 98%;
		border: 12px solid var(--secondary-color);
		box-shadow: inset -8px -8px 0px 0px rgba(178, 152, 220, 1);
		position: relative;
		padding: 0.8rem 1rem 1rem;
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
		border: 12px solid var(--secondary-color);
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
		background-color: var(--secondary-color);
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
		color: var(--primary-color);
	}

	.profile-actions .button:nth-child(2) {
		border-left: 1px solid var(--primary-grey);
		border-right: 1px solid var(--primary-grey);
	}

	.profile-actions .button:hover {
		background-color: var(--primary-color);
		color: var(--primary-white);
	}
</style>
