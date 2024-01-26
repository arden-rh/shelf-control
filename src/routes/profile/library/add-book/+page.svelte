<script lang="ts">
	import { addToast } from '$lib/components/Toaster.svelte';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { createLibraryBook } from '$lib/hooks/createLibraryBook.client';
	import { get, writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session.stores';
	import { toLibraryBook } from '$lib/utility/toLibraryBook';
	import type { LibraryBook, VolumeInfo } from '$lib/types/books.types';
	import type { LoggedInUser } from '$lib/types/user.types';
	import type { PageData } from './$types';
	import type { SessionState } from '$lib/types/session.types';

	const q = writable('');
	const author = writable('');
	const selectedBook = writable({} as VolumeInfo);
	let user: LoggedInUser | null = null;

	export let data: PageData;

	const {
		elements: { trigger, portalled, overlay, content, title, description, close },
		states: { open }
	} = createDialog();

	session.subscribe((current: SessionState) => {
		user = current?.user;
	});

	function openDialog(book: VolumeInfo) {
		selectedBook.set(book);
	}

	async function addBook() {
		const selectedBookValue = get(selectedBook);

		const bookValue = toLibraryBook(selectedBookValue);

		console.log('Book value:', bookValue);

		if (!user || !user.uid) {
			return;
		}

		const userId = user.uid;

		const book: LibraryBook = {
			...bookValue,
			userId
		};

		const response = await createLibraryBook(userId, book);

		if (response?.success) {
			addToast({
				data: {
					title: 'Book added',
					description: `${selectedBookValue.title} has been added to your library`,
					status: 'success'
				}
			});

			goto(`/profile/library?bookId=${response.bookId}`);
		} else {
			console.error('Failed to add book:', response?.error);
		}
	}
</script>

<section>
	<div class="page-header">
		<h1>Add a book</h1>
	</div>
	<div class="add-book-form">
		<h2>Search for a book</h2>
		<form data-sveltekit-keepfocus action="/profile/library/add-book" method="get">
			<div class="input-group">
				<span>
					<label for="q">Search query*</label>
					<input
						id="q"
						name="q"
						bind:value={$q}
						type="text"
						placeholder="Book title"
						aria-describedby="asteriskExplanation"
						required
					/>
				</span>
				<span>
					<label for="author">Author</label>
					<input id="author" name="author" bind:value={$author} type="text" placeholder="Author" />
				</span>
			</div>

			<small id="asteriskExplanation">* Required field</small>

			<div class="button-group">
				<button type="submit" class="button button-primary">Search</button>
				<button type="reset" class="button button-secondary">Reset</button>
			</div>
		</form>
	</div>
	{#if data}
		{#if data.status === 200}
			{#if data.props.data.items}
				<ul class="book-list">
					{#each data.props.data.items as book}
						<li class="book-list-item mb-3 flex">
							<button
								on:click={() => openDialog(book.volumeInfo)}
								use:melt={$trigger}
								class="book-list-item-button flex flex-row items-center gap-5 px-3"
							>
								<div class="thumbnail-container">
									{#if book.volumeInfo.imageLinks?.thumbnail}
										<img
											src={book.volumeInfo.imageLinks.thumbnail}
											alt={book.volumeInfo.title}
											class="max-h-36 max-w-24 object-cover object-center"
										/>
									{:else}
										<div class="placeholder-thumbnail max-h-36">Cover Missing</div>
									{/if}
								</div>
								<div class="book-info">
									<h3><span>Title:</span> {book.volumeInfo.title}</h3>
									<h4>
										<span
											>{book.volumeInfo.authors && book.volumeInfo.authors.length > 1
												? 'Authors:'
												: 'Author:'}</span
										>
										{book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'N/A'}
									</h4>
									<h4>
										<span>Published:</span>
										{book.volumeInfo.publishedDate ? book.volumeInfo.publishedDate : 'Unknown'}
									</h4>
								</div>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		{:else if data.status === 400}
			<div>Not found</div>
		{:else if data.status === 500}
			<div>Server error</div>
		{/if}
	{:else}
		<div class="">Loading...</div>
	{/if}
</section>
<!-- Dialog -->
<div use:melt={$portalled}>
	{#if $open && $selectedBook}
		<div class="fixed inset-0 z-50 bg-black/50" use:melt={$overlay} />
		<div
			class="dialog fixed left-[50%] top-[50%] z-50 max-h-[85vh]
            w-[90vw] max-w-[550px] translate-x-[-50%] translate-y-[-50%]
            rounded-md p-6 shadow-lg"
			use:melt={$content}
		>
			<h3 use:melt={$title}>{$selectedBook.title}</h3>
			<div class="dialog-cover-info">
				{#if $selectedBook.imageLinks?.thumbnail}
					<img src={$selectedBook.imageLinks.thumbnail} alt={$selectedBook.title} />
				{:else}
					<div class="placeholder-thumbnail">Cover Missing</div>
				{/if}
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
						<span>Print Type:</span>
						{$selectedBook.printType ? $selectedBook.printType : 'Unknown'}
					</li>
					<li>
						<span>Page Count:</span>
						{$selectedBook.pageCount ? $selectedBook.pageCount : 'Unknown'}
					</li>
					<li>
						<span>Language:</span>
						{$selectedBook.language ? $selectedBook.language.toUpperCase() : 'Unknown'}
					</li>
					<li>
						<span>Industry Identifier:</span>
						{$selectedBook.industryIdentifiers
							? $selectedBook.industryIdentifiers[0].identifier
							: 'Unknown'}
					</li>
					<li>
						<span>Categories:</span>
						{$selectedBook.categories ? $selectedBook.categories.join(', ') : 'Unknown'}
					</li>
				</ul>
			</div>
			{#if $selectedBook.description}
				<p class="dialog-description">{$selectedBook.description}</p>
			{/if}
			<div class="dialog-buttons">
				<button class="button button-primary" on:click={() => addBook()}>Add book</button>
				<button use:melt={$close} class="close-button button">Close</button>
			</div>
		</div>
	{/if}
</div>

<style>
	h1 {
		padding: 0 0.8rem 0 1.25rem;
	}

	h2 {
		font-size: 1.2rem;
		letter-spacing: 0.025rem;
		text-transform: uppercase;
	}

	h3 {
		font-size: 1rem;
		line-height: 1.25rem;
		margin-bottom: 0.25rem;
		color: var(--primary-black);
		font-weight: 400;
		text-transform: uppercase;
	}

	h4 {
		font-size: 0.75rem;
		line-height: 1rem;
		margin-bottom: 0.25rem;
	}

	h3 span,
	h4 span {
		font-weight: 700;
		letter-spacing: 0.05rem;
		font-family: var(--header-font);
		text-transform: uppercase;
		display: block;
	}

	small {
		font-size: 0.75rem;
		color: var(--primary-black);
		margin-bottom: 1rem;
		width: 100%;
		text-align: end;
		font-family: var(--header-font);
		text-transform: uppercase;
		letter-spacing: 0.05rem;
	}

	.add-book-form {
		display: flex;
		flex-direction: column;
		margin-bottom: 2rem;
	}

	.book-info {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		text-align: start;
	}

	.book-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.book-list-item {
		background-color: var(--secondary-colour-purple);
	}

	.book-list-item:nth-child(even) {
		background-color: var(--accent-light-blue-grey);
	}

	.book-list-item:hover {
		background-color: var(--primary-colour-purple);
		color: var(--primary-white);
	}
	.book-list-item-button {
		width: 100%;
		padding: 1rem;
	}

	.book-list-item-button:hover h3 {
		color: var(--primary-white);
	}

	.button-group {
		margin-top: 0.5rem;
	}

	.dialog h3 {
		color: var(--primary-colour-purple);
		font-size: 1.5rem;
		line-height: 1.75rem;
		font-family: var(--header-font);
		font-weight: 600;
		letter-spacing: 0.05rem;
		margin-bottom: 0.75rem;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		margin-top: 1rem;
		width: 100%;
	}

	.input-group input {
		border: 2px solid var(--primary-colour-purple);
		padding: 0.5rem;
		margin-bottom: 0.5rem;
		flex-grow: 1;
		font-size: 0.9rem;
		width: calc(100% - 30% - 5rem);
	}
	.input-group label {
		align-items: center;
		font-family: var(--header-font);
		font-size: 0.9rem;
		display: flex;
		height: 2.75rem;
		letter-spacing: 0.075rem;
		text-transform: uppercase;
		border: 2px solid var(--primary-grey);
		color: var(--primary-black);
		font-weight: 400;
		background-color: var(--primary-grey);
		min-width: 30%;
		flex: 0 0 auto;
		margin-bottom: 0.5rem;
		justify-content: center;
	}

	.input-group span {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: center;
		width: 100%;
		max-width: 100%;
	}

	@media (min-width: 590px) {
		.add-book-form {
			max-width: 80%;
		}
	}

	@media (min-width: 768px) {
		h3 span,
		h4 span {
			display: inline;
		}

		.add-book-form {
			max-width: 60%;
		}
	}

	@media (min-width: 1024px) {
		.add-book-form {
			max-width: 50%;
		}
	}
</style>
