import { writable, type Writable } from 'svelte/store';
import type { AppUser } from '../types/user.types';

export const userStore = <Writable<AppUser>>writable();
