<script lang="ts">
	let userId = 'user-id';
	let bookId = 'book-id';
	let newBookShelves = ['Fantasy', 'Bestsellers'];
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
					<li>Display name:</li>
					<li>Favourite book:</li>
					<li>Favourite genre:</li>
					<li>Favourite author:</li>
				</ul>
			</div>
		</section>
		<section class="bookshelves">
			<h2>Bookshelves</h2>
			<div class="bookshelves-container">
				<h3>Favourite shelf</h3>
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
		font-weight: 600;
		letter-spacing: 0.05rem;
		text-transform: uppercase;
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

    .page-header {
        width: 100%;
        position: relative;
        align-self: flex-end;
    }

    .page-header::before {
        content: '';
        position: absolute;
        background-color: var(--accent-purple);
		top: 20px;
		right: 4px;
		width: 10px;
		height: 4px;
		transform-origin: top left;
		transform: skewX(48deg);
        z-index: 1;
    }

    .page-header::after {
        content: '';
        position: absolute;
        background-color: var(--accent-purple);
		top: 20px;
		right: 8px;
		width: 6px;
		height: 4px;
        z-index: 2;
    }

	h2 {
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
		width: 100%;
		padding: 0;
		position: relative;
		border: 12px solid var(--secondary-color);
		box-shadow: inset -8px -8px 0px 0px rgba(178, 152, 220, 1);
		position: relative;
		padding: 0.8rem 1rem 1rem;
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
		gap: 1rem;
	}

	.profile-actions .button {
		font-size: 0.75rem;
		height: fit-content;
		padding: 0.5rem 1rem;
	}

	@media (min-width: 768px) {
		.profile-actions {
			margin-bottom: 0.75rem;
		}

        .page-header {
            width: fit-content;
        }
	}
</style>
