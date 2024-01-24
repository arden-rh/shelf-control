<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let bookTitle: string = '';
	let bookAuthors: string = '';
	export let bookAuthorsArray: string[] = [];
	export let bookPublisher: string = '';
	export let bookDate: Date;
	export let bookPrintType: string = '';
	export let bookPageCount: number = 0;
	export let bookLanguage: string = '';
	export let bookIsbn: string = '';
	let bookCategories: string = '';
	export let bookCategoriesArray: string[] = [];
	export let bookDescription: string = '';
	export let bookImage: string = '';

	async function handleSubmit() {

		addAuthorsToList();
		addCategoriesToList();

		const formData = {
			bookTitle,
			bookAuthorsArray,
			bookPublisher,
			bookDate,
			bookPrintType,
			bookPageCount,
			bookLanguage,
			bookIsbn,
			bookCategoriesArray,
			bookDescription,
			bookImage
		};

		dispatch('submit', formData);
	}

	function handleCancel() {
		dispatch('cancel');
	}

	function handleDelete() {
		dispatch('delete');
	}

	function addAuthorsToList() {
		bookAuthorsArray = bookAuthors.split('/');
	}

	function addCategoriesToList() {
		bookCategoriesArray = bookCategories.split('/');
	}

</script>

<form on:submit|preventDefault={handleSubmit} class="edit-book-form">
	<div class="input-group">
		<span>
			<label for="book-title">Book Title</label>
			<input id="book-title" bind:value={bookTitle} placeholder="Book Title" required />
		</span>
		<span>
			<label for="book-authors">Authors</label>
			<small>Separate authors with a forward slash (/)</small>
			<input id="book-authors" bind:value={bookAuthors} placeholder="Book Authors" />
		</span>

		<span>
			<label for="book-publisher">Publisher</label>
			<input id="book-publisher" bind:value={bookPublisher} placeholder="Book Publisher" />
		</span>

		<span>
			<label for="book-date">Published Date</label>
			<input id="book-date" type="date" bind:value={bookDate} />
		</span>

		<span>
			<label for="book-print-type">Print Type</label>
			<input id="book-print-type" bind:value={bookPrintType} />
		</span>

		<span>
			<label for="book-page-count">Page Count</label>
			<input id="book-page-count" type="number" bind:value={bookPageCount} />
		</span>

		<span>
			<label for="book-language">Language</label>
			<input id="book-language" bind:value={bookLanguage} placeholder="Book Language" />
		</span>

		<span>
			<label for="book-isbn">ISBN</label>
			<input id="book-isbn" bind:value={bookIsbn} placeholder="Book ISBN" />
		</span>

		<span>
			<label for="book-categories">Categories</label>
			<small>Separate authors with a forward slash (/)</small>
			<input id="book-categories" bind:value={bookCategories} placeholder="Book Categories" />
		</span>

		<span>
			<label for="book-description">Description</label>
			<textarea id="book-description" bind:value={bookDescription} placeholder="Book Description" />
		</span>

		<!-- <span>
			<label for="book-image">Image URL</label>
			<input id="book-image" bind:value={bookImage} placeholder="Book Image URL" />
		</span> -->

		<div class="button-group">
			<button class="button button-primary" type="submit">Save Changes</button>
			<button class="button button-secondary" type="button" on:click={handleCancel}>Cancel</button>
			<button class="button button-secondary button-delete" type="button" on:click={handleDelete}>Delete</button>
		</div>
	</div>
</form>

<style>
	h3 {
		font-size: 1rem;
	}

	.button-group {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.edit-book-form {
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
	}
	.input-group label {
		align-items: center;
		justify-content: center;
		border-radius: 5px;
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
		border-radius: 5px;
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
</style>
