import { create } from 'zustand';

import type { PersistedAuth } from './authPersistence';

export type AuthPhase =
	| 'unknown'
	| 'guest'
	| 'validating'
	| 'authed'
	| 'auth_error';

interface AuthState {
	phase: AuthPhase;
	siteUrl: string | null;
	apiToken: string | null;
	userId: string | null;
	displayName: string | null;
	authError: string | null;
	setGuest: () => void;
	setValidating: () => void;
	setAuthed: (session: PersistedAuth) => void;
	setAuthError: (message: string) => void;
	reset: () => void;
}

const initial = {
	phase: 'unknown' as AuthPhase,
	siteUrl: null as string | null,
	apiToken: null as string | null,
	userId: null as string | null,
	displayName: null as string | null,
	authError: null as string | null,
};

export const useAuthStore = create<AuthState>((set) => ({
	...initial,
	setGuest: () => set({ ...initial, phase: 'guest' }),
	setValidating: () =>
		set({ phase: 'validating', authError: null }),
	setAuthed: (session) =>
		set({
			phase: 'authed',
			siteUrl: session.siteUrl,
			apiToken: session.apiToken,
			userId: session.userId,
			displayName: session.displayName,
			authError: null,
		}),
	setAuthError: (message) =>
		set({
			phase: 'auth_error',
			authError: message,
		}),
	reset: () => set(initial),
}));
