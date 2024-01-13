import type { LoggedInUser } from '$lib/types/user.types';

export type SessionState = {
	user: LoggedInUser | null;
	loading: boolean;
	loggedIn: boolean;
};