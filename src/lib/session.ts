import type { LoggedInUser } from '$lib/types/user.types';
import { writable, type Writable } from 'svelte/store';

export type SessionState = {
	user: LoggedInUser | null;
	loading: boolean;
	loggedIn: boolean;
};

export const session = <Writable<SessionState>>writable();
