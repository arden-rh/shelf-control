import type { User } from '$lib/types/user.types';
import { writable, type Writable } from 'svelte/store';

export type SessionState = {
	user: User | null;
	loading: boolean;
	loggedIn: boolean;
};

export const session = <Writable<SessionState>>writable();
