<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let displayName: string = '';
	export let favouriteAuthor: string = '';
	export let favouriteBook: string = '';
	export let favouriteGenre: string = '';
	export let favouriteShelf: string = '';
	export let photoURL: string = '';
	export let privateInfo: {
		profilePicture: 'all' | 'users' | 'none';
		favourites: 'all' | 'users' | 'none';
		bookshelves: 'all' | 'users' | 'none';
	} = { profilePicture: 'users', favourites: 'users', bookshelves: 'users' };

	export let bookshelves: string[] = [];

	async function handleSubmit() {
		const formData = {
			displayName,
			favouriteAuthor,
			favouriteBook,
			favouriteGenre,
			favouriteShelf,
			photoURL,
			privateInfo
		};

		dispatch('submit', formData);
	}

	function handleCancel() {
		dispatch('cancel');
	}

	function handleDelete() {
		dispatch('delete');
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="edit-user-form">
	<div class="input-group">
		<span>
			<label for="display-name">Display Name</label>
			<input id="display-name" bind:value={displayName} placeholder="Display Name" />
		</span>
		<span>
			<label for="favourite-book">Favourite Book</label>
			<input id="favourite-book" bind:value={favouriteBook} placeholder="Favourite Book" />
		</span>

		<span>
			<label for="favourite-author">Favourite Author</label>
			<input id="favourite-author" bind:value={favouriteAuthor} placeholder="Favourite Author" />
		</span>

		<span>
			<label for="favourite-genre">Favourite Genre</label>
			<input id="favourite-genre" bind:value={favouriteGenre} placeholder="Favourite Genre" />
		</span>

		<span>
			{#if bookshelves}
				<label for="favourite-shelf">Favourite Shelf</label>
				<select id="favourite-shelf" bind:value={favouriteShelf}>
					{#each bookshelves as bookshelf}
						<option value={bookshelf}>{bookshelf}</option>
					{/each}
				</select>
			{/if}
		</span>

		<span><h3>Privacy Options</h3></span>
		<span>
			<label for="profile-picture">Profile Picture</label>
			<select id="profile-picture" bind:value={privateInfo.profilePicture}>
				<option value="all">All</option>
				<option value="users">Users</option>
				<option value="none">None</option>
			</select>
		</span>

		<span>
			<label for="favourites">Favourites</label>
			<select id="favourites" bind:value={privateInfo.favourites}>
				<option value="all">All</option>
				<option value="users">Users</option>
				<option value="none">None</option>
			</select>
		</span>
		<span>
			<label for="bookshelves">Bookshelves</label>
			<select id="bookshelves" bind:value={privateInfo.bookshelves}>
				<option value="all">All</option>
				<option value="users">Users</option>
				<option value="none">None</option>
			</select>
		</span>
	</div>

	<div class="button-group">
		<button class="button button-primary" type="submit">Save Changes</button>
		<button class="button button-secondary button-delete" type="button" on:click={handleDelete}
			>Delete Account</button
		>
		<button class="button button-secondary" type="button" on:click={handleCancel}>Cancel</button>
	</div>
</form>

<style>
	h3 {
		font-size: 1rem;
		text-transform: uppercase;
	}

	.button {
		line-height: 1rem;
		min-height: 3rem;
	}

	.edit-user-form {
		display: flex;
		flex-direction: column;
		max-width: 400px;
		margin: 2rem auto;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		width: 100%;
	}

	.input-group input {
		border: 2px solid var(--primary-colour-purple);
		border-radius: 5px;
		padding: 0.5rem;
		margin-bottom: 0.5rem;
		flex-grow: 1;
		width: calc(100% - 30% - 5rem);
		font-size: 0.9rem;
	}
	.input-group label {
		align-items: center;
		justify-content: center;
		font-family: var(--header-font);
		font-size: 0.8rem;
		display: flex;
		height: 2.75rem;
		letter-spacing: 0.075rem;
		text-transform: uppercase;
		border: 2px solid var(--primary-grey);
		color: var(--primary-black);
		font-weight: 400;
		background-color: var(--primary-grey);
		min-width: 35%;
		flex: 0 0 auto;
		margin-bottom: 0.5rem;
	}

	.input-group select {
		border: 2px solid var(--primary-colour-purple);
		background-color: var(--accent-light-blue-grey);
		padding: 0.5rem;
		margin-bottom: 0.5rem;
		width: 100%;
	}

	.input-group span {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: center;
		width: 100%;
		max-width: 100%;
	}

	@media (min-width: 768px) {
		.button {
			min-height: fit-content;
		}
	}
</style>
