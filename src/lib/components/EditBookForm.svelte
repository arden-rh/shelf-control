<script lang="ts">
	import { addUniqueBookshelvesAndUpdateUser } from '$lib/firebase/bookFirestore';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let title: string = '';
	let authorsString: string = '';
	export let authors: string[] = [];
	export let publisher: string = '';
	export let publishedDate: string = '';
	export let printType: string = '';
	export let pageCount: number = 0;
	export let language: string = '';
	export let industryIdentifier: string = '';
	let categoriesString: string = '';
	export let categories: string[] = [];
	export let description: string = '';
	export let bookImage: string = '';
	let bookshelvesString: string = '';
	export let bookshelves: string[] = [];
	export let readingStatus: 'read' | 'reading' | 'to-read';

	authorsString = authors.join('/');
	categoriesString = categories.join('/');
	bookshelvesString = bookshelves.join('/');

	console.log('categoriesString', categoriesString);
	console.log('categories', categories);

	async function handleSubmit() {
		authors = authorsString.split('/');
		categories = categoriesString.split('/');
		bookshelves = bookshelvesString.split('/');
		console.log('categories', categories);

		const formData = {
			title,
			authors,
			publisher,
			publishedDate,
			printType,
			pageCount,
			language,
			industryIdentifier,
			categories,
			description,
			bookImage,
			bookshelves,
			readingStatus
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

<form on:submit|preventDefault={handleSubmit} class="edit-book-form">
	<div class="input-group">
		<span>
			<label for="book-title">Book Title</label>
			<input id="book-title" bind:value={title} placeholder="Book Title" required />
		</span>
		<span>
			<label for="book-authors">Authors</label>
			<div class="input-with-help-text">
				<input id="book-authors" bind:value={authorsString} placeholder="Book Authors" />
				<small>Separate authors with a forward slash (/)</small>
			</div>
		</span>

		<span>
			<label for="book-publisher">Publisher</label>
			<input id="book-publisher" bind:value={publisher} placeholder="Book Publisher" />
		</span>

		<span>
			<label for="book-date">Published Date</label>
			<input id="book-date" type="date" bind:value={publishedDate} />
		</span>

		<span>
			<label for="book-print-type">Print Type</label>
			<input id="book-print-type" bind:value={printType} />
		</span>

		<span>
			<label for="book-page-count">Page Count</label>
			<input id="book-page-count" type="number" bind:value={pageCount} />
		</span>

		<span>
			<label for="book-language">Language</label>
			<input id="book-language" bind:value={language} placeholder="Book Language" />
		</span>

		<span>
			<label for="book-industry-identifier">Industry Identifier</label>
			<input id="book-industry-identifier" bind:value={industryIdentifier} placeholder="Book Industry Identifier" />
		</span>

		<span>
			<label for="book-categories">Categories</label>
			<div class="input-with-help-text">
				<input id="book-categories" bind:value={categoriesString} placeholder="Book Categories" />
				<small>Separate categories with a forward slash (/)</small>
			</div>
		</span>
		<span>
			<label for="bookshelves">Bookshelves</label>
			<div class="input-with-help-text">
				<input id="bookshelves" bind:value={bookshelvesString} placeholder="Bookshelves" />
				<small
					>Separate bookshelves with a forward slash (/) and use a dash (-) instead of space</small
				>
			</div>
		</span>

		<span>
			<label for="book-description">Description</label>
			<textarea id="book-description" bind:value={description} placeholder="Book Description" />
		</span>

		<!-- <span>
			<label for="book-image">Image URL</label>
			<input id="book-image" bind:value={bookImage} placeholder="Book Image URL" />
		</span> -->

		<span>
			<label for="reading-status">Reading Status</label>
			<select id="reading-status" bind:value={readingStatus}>
				<option value="to-read">To read</option>
				<option value="reading">Reading</option>
				<option value="read">Read</option>
			</select>
		</span>

		<div class="button-group">
			<button class="button button-primary" type="submit">Save Changes</button>
			<button class="button button-secondary button-delete" type="button" on:click={handleDelete}
				>Delete Book</button
			>
			<button class="button button-secondary" type="button" on:click={handleCancel}>Cancel</button>
		</div>
	</div>
</form>

<style>

	.edit-book-form {
		display: flex;
		flex-direction: column;
		max-width: 400px;
		margin: 2rem auto;
		align-items: center;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		width: 90%;
	}

	.input-group input {
		border: 2px solid var(--primary-colour-purple);
		border-radius: 5px;
		padding: 0.5rem;
		flex-grow: 1;
		margin-bottom: 0.25rem;
		font-size: 0.8rem;
	}
	.input-group label {
		align-items: center;
		justify-content: center;
		font-family: var(--header-font);
		font-size: 0.8rem;
		display: flex;
		height: 2.5rem;
		letter-spacing: 0.075rem;
		text-transform: uppercase;
		border: 2px solid var(--primary-grey);
		color: var(--primary-black);
		font-weight: 400;
		background-color: var(--primary-grey);
		min-width: 35%;
		flex: 0 0 auto;
		margin-bottom: 0.5rem;
		font-size: 0.8rem;
	}

	.input-group select {
		border: 2px solid var(--primary-colour-purple);
		background-color: var(--accent-light-blue-grey);
		padding: 0.5rem;
		margin-bottom: 0.5rem;
		width: 50%;
		font-size: 0.8rem;
	}

	.input-group span {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: flex-start;
		width: 100%;
		max-width: 100%;
	}

	.input-group textarea {
		border: 2px solid var(--primary-colour-purple);
		border-radius: 5px;
		padding: 0.5rem;
		margin-bottom: 0.5rem;
		font-size: 0.8rem;
		width: 100%;
	}

	.input-with-help-text {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		width: 100%;
	}
	.input-with-help-text input {
		width: 100%;
	}

	.input-with-help-text small {
		font-size: 0.7rem;
		color: var(--primary-black);
		margin-bottom: 0.5rem;
		max-width: 80%;
	}
</style>
