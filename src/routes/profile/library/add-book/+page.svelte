<script lang="ts">
	import { createLibraryBook } from '$lib/hooks/createLibraryBook.client';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { faRectangleXmark } from '@fortawesome/free-solid-svg-icons';
	import { get, writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session';
	import { toLibraryBook } from '$lib/utility/toLibraryBook';
	import { useQuery } from '@sveltestack/svelte-query';
	import Fa from 'svelte-fa';
	import type { LibraryBook, VolumeInfo } from '$lib/types/books.types';
	import type { PageData } from './$types';
	import type { SessionState } from '$lib/types/session.types';
	import type { LoggedInUser } from '$lib/types/user.types';

	const q = writable('');
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
			console.log('Book added successfully:');

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
			<label>
				<input type="text" name="q" bind:value={$q} aria-label="Search for a book" />
				<button type="submit" class="button button-primary submit-button">Search</button>
			</label>
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
										<span>Published:</span>{book.volumeInfo.publishedDate
											? book.volumeInfo.publishedDate
											: 'Unknown'}
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
							<span>Page count:</span>
							{$selectedBook.pageCount ? $selectedBook.pageCount : 'Unknown'}
						</li>
						<li>
							<span>Language:</span>
							{$selectedBook.language ? $selectedBook.language.toUpperCase() : 'Unknown'}
						</li>
						<li>
							<span>ISBN:</span>
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
					<p class="dialog-description" use:melt={$description}>{$selectedBook.description}</p>
				{/if}
				<div class="dialog-buttons">
					<button class="button button-primary" on:click={() => addBook()}>Add book</button>
					<button use:melt={$close} class="close-button button">
						<Fa icon={faRectangleXmark} size="3x" />
					</button>
				</div>
			</div>
		{/if}
	</div>
</section>

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

	.add-book-form {
		display: flex;
		flex-direction: column;
		margin-bottom: 2rem;
	}

	.add-book-form form label {
		display: flex;
		gap: 0.75rem;
	}

	.add-book-form label input {
		border: 2px solid var(--primary-colour-purple);
		padding: 0.5rem;
		width: 100%;
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
		border-radius: 5px;
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

	.submit-button {
		height: 2.75rem;
	}

	@media (min-width: 768px) {
		h3 span,
		h4 span {
			display: inline;
		}
		.add-book-form label input {
			max-width: 400px;
		}
	}
</style>
