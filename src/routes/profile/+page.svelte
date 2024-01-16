<script lang="ts">
	let userId = 'user-id';
	let bookId = 'book-id';
	let newBookShelves = ['Fantasy', 'Bestsellers'];


</script>

<section>
	<h1>Profile Page</h1>
	<div class="profile-container">
		<div class="profile-info">
			<div class="profile-image">
				<img src="https://via.placeholder.com/150" alt="profile image" />
			</div>
			<div class="profile-details">
				<h2>Username</h2>
				<p>email</p>
			</div>
		</div>
		<div class="profile-actions">
			<a href="/profile/add-book" class="button button-secondary">Add a book</a>
			<a href="/profile/edit" class="button button-secondary">Edit profile</a>
		</div>
	</div>
</section>
