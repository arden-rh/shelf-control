import type { LibraryBookWithId } from "./books.types";

export interface LoggedInUser {
	email?: string | null;
	displayName?: string | null;
	photoURL?: string | null;
	uid?: string | null;
};

export interface AppUser extends LoggedInUser {
	library?: LibraryBookWithId[];
	allBookshelves?: string[];
	currentlyReading?: string[];
	favouriteShelf?: string;
	favouriteBook?: string;
	favouriteAuthor?: string;
	favouriteGenre?: string;
	privateInfo: {
		profilePicture: 'all' | 'users' | 'none';
		favourites: 'all' | 'users' | 'none';
		bookshelves: 'all' | 'users' | 'none';
	}
}