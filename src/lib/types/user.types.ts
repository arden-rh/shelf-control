import type { LibraryBookWithId } from "./books.types";

export interface LoggedInUser {
	email?: string | null;
	displayName?: string | null;
	photoURL?: string | null;
	uid?: string | null;
};

export interface AppUser extends LoggedInUser {
	library?: LibraryBookWithId[];
	allBookShelves?: string[];
	favouriteShelf?: string;
	favouriteBook?: string;
	favouriteAuthor?: string;
	favouriteGenre?: string;
	privateInfo?: {
		profilePicture?: 'all' | 'users' | 'none';
		favorites?: 'all' | 'users' | 'none';
		bookShelves?: 'all' | 'users' | 'none';
	}
}