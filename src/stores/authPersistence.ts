import { decryptSecret, encryptSecret } from '../utils/secureStorage';
import { normalizeSiteUrl } from '../utils/siteUrl';

export const STORAGE = {
	SITE_URL: 'tw_site_url',
	TOKEN_ENC: 'tw_api_token_enc',
	USER_ID: 'tw_user_id',
	USER_NAME: 'tw_user_name',
} as const;

export interface PersistedAuth {
	siteUrl: string;
	apiToken: string;
	userId: string;
	displayName: string;
}

export async function savePersistedAuth(data: PersistedAuth): Promise<void> {
	const enc = await encryptSecret(data.apiToken);
	localStorage.setItem(STORAGE.SITE_URL, normalizeSiteUrl(data.siteUrl));
	localStorage.setItem(STORAGE.TOKEN_ENC, enc);
	localStorage.setItem(STORAGE.USER_ID, data.userId);
	localStorage.setItem(STORAGE.USER_NAME, data.displayName);
}

export async function loadPersistedAuth(): Promise<PersistedAuth | null> {
	const siteUrl = localStorage.getItem(STORAGE.SITE_URL);
	const enc = localStorage.getItem(STORAGE.TOKEN_ENC);
	const userId = localStorage.getItem(STORAGE.USER_ID);
	const displayName = localStorage.getItem(STORAGE.USER_NAME);
	if (!siteUrl || !enc || !userId) return null;
	try {
		const apiToken = await decryptSecret(enc);
		return {
			siteUrl,
			apiToken,
			userId,
			displayName: displayName || 'User',
		};
	} catch {
		return null;
	}
}

export function clearPersistedAuth(): void {
	Object.values(STORAGE).forEach((k) => localStorage.removeItem(k));
	const prefix = 'tw_cache_';
	for (let i = localStorage.length - 1; i >= 0; i--) {
		const key = localStorage.key(i);
		if (key?.startsWith(prefix)) localStorage.removeItem(key);
	}
}
