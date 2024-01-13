import { writable, type Writable } from 'svelte/store';
import type { SessionState } from './types/session.types';

export const session = <Writable<SessionState>>writable();
