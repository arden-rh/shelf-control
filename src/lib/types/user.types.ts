import type { LibraryBookWithId } from "./books.types";

export interface LoggedInUser {
	email?: string | null;
	displayName?: string | null;
	photoURL?: string | null;
	uid?: string | null;
};

export interface User extends LoggedInUser {
	libary?: LibraryBookWithId[];
	allBookShelves?: string[];
}