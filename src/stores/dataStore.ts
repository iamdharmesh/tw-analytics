import { create } from 'zustand';

import type { Project, TimeEntry } from '../types/models';

export const CACHE_TTL_MS = 5 * 60 * 1000;
export const PERSIST_CACHE_TTL_MS = 15 * 60 * 1000;

export interface CachedPeriod {
	entries: TimeEntry[];
	fetchedAt: number;
}

interface DataState {
	projects: Project[] | null;
	projectsFetchedAt: number | null;
	loading: boolean;
	loadError: string | null;
	rateLimitResetAt: number | null;
	cache: Record<string, CachedPeriod>;
	setProjects: (projects: Project[], fetchedAt: number) => void;
	setLoading: (v: boolean) => void;
	setLoadError: (msg: string | null) => void;
	setRateLimit: (epoch: number | null) => void;
	getCached: (key: string) => CachedPeriod | null;
	isCacheFresh: (key: string) => boolean;
	setCached: (key: string, data: CachedPeriod) => void;
	persistCacheToStorage: (key: string, data: CachedPeriod) => void;
	loadPersistedCache: (key: string) => CachedPeriod | null;
	reset: () => void;
}

function cacheStorageKey(key: string): string {
	return `tw_cache_${key}`;
}

export const useDataStore = create<DataState>((set, get) => ({
	projects: null,
	projectsFetchedAt: null,
	loading: false,
	loadError: null,
	rateLimitResetAt: null,
	cache: {},

	setProjects: (projects, fetchedAt) =>
		set({ projects, projectsFetchedAt: fetchedAt }),

	setLoading: (loading) => set({ loading }),
	setLoadError: (loadError) => set({ loadError }),
	setRateLimit: (rateLimitResetAt) => set({ rateLimitResetAt }),

	getCached: (key) => get().cache[key] ?? null,

	isCacheFresh: (key) => {
		const c = get().cache[key];
		if (!c) return false;
		return Date.now() - c.fetchedAt < CACHE_TTL_MS;
	},

	setCached: (key, data) =>
		set((s) => ({
			cache: { ...s.cache, [key]: data },
		})),

	persistCacheToStorage: (key, data) => {
		try {
			const payload = {
				...data,
				_persistedAt: Date.now(),
			};
			localStorage.setItem(cacheStorageKey(key), JSON.stringify(payload));
		} catch {
			/* ignore quota */
		}
	},

	loadPersistedCache: (key) => {
		try {
			const raw = localStorage.getItem(cacheStorageKey(key));
			if (!raw) return null;
			const o = JSON.parse(raw) as CachedPeriod & { _persistedAt?: number };
			const t = o._persistedAt ?? 0;
			if (Date.now() - t > PERSIST_CACHE_TTL_MS) return null;
			return {
				entries: o.entries,
				fetchedAt: o.fetchedAt,
			};
		} catch {
			return null;
		}
	},

	reset: () =>
		set({
			projects: null,
			projectsFetchedAt: null,
			loading: false,
			loadError: null,
			rateLimitResetAt: null,
			cache: {},
		}),
}));

export function periodCacheKey(
	viewMode: string,
	startStr: string,
	endStr: string
): string {
	return `${viewMode}:${startStr}:${endStr}`;
}
