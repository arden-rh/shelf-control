<script lang="ts">
	import type { LibraryBookWithId } from '$lib/types/books.types';

	export let book: LibraryBookWithId;
</script>

<section>
	<h2>{book.title}</h2>
	<div class="book-info-container">
		<div class="book-info">
			<div class="book-image">
				{#if book.imageLinks?.thumbnail}
					<img
						src={book.imageLinks.thumbnail}
						alt={book.title}
						class="object-cover object-center"
					/>
				{:else}
					<div class="placeholder-thumbnail">Cover Missing</div>
				{/if}
			</div>
			<div class="book-details">
				<ul>
					<li>
						<span>{book.authors && book.authors.length > 1 ? 'Authors: ' : 'Author: '}</span>
						{book.authors ? book.authors.join(', ') : 'N/A'}
					</li>
					<li>
						<span>Published:</span>
						{book.publishedDate ? book.publishedDate : 'Unknown'}
					</li>
					<li>
						<span>Page count:</span>
						{book.pageCount ? book.pageCount : 'Unknown'}
					</li>
					<li>
						<span>Categories:</span>
						{book.categories ? book.categories.join(', ') : 'Unknown'}
					</li>
					<li>
						<span>ISBN:</span>
						{book.industryIdentifiers ? book.industryIdentifiers[0].identifier : 'Unknown'}
					</li>
					<li>
						<span>Language:</span>
						{book.language ? book.language : 'Unknown'}
					</li>
					<li>
						<span>Bookshelf:</span>
						{book.bookshelves ? book.bookshelves.join(', ') : 'Not added'}
					</li>
				</ul>
			</div>
		</div>
		<div class="book-description">
			<p>{book.description}</p>
		</div>
	</div>
</section>

<style>
	section {
		padding: 0;
		align-items: center;
	}

	h2 {
		margin-bottom: 1rem;
	}
	.book-image {
		width: 100%;
		margin-bottom: 2rem;
	}
	.book-image img {
		width: 100%;
		height: 100%;
	}

	.book-info-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		width: 100%;
	}

	.book-info-container ul li {
		font-size: 0.85rem;
		line-height: 1rem;
		margin-bottom: 0.25rem;
	}

	.book-info-container ul li span {
		font-weight: 700;
		letter-spacing: 0.03rem;
	}
</style>
