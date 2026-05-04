import type { TeamworkClient } from './client';

export interface MeResult {
	id: string;
	displayName: string;
}

function pickUserObject(json: Record<string, unknown>): Record<string, unknown> | null {
	const candidates = [json.user, json.person, json];
	for (const c of candidates) {
		if (c && typeof c === 'object' && 'id' in (c as object)) {
			return c as Record<string, unknown>;
		}
	}
	return null;
}

export async function fetchMe(client: TeamworkClient): Promise<MeResult> {
	const json = (await client.get<Record<string, unknown>>('/me.json')) ?? {};
	const u = pickUserObject(json);
	if (!u || u.id == null) {
		throw new Error('Unexpected /me.json shape');
	}
	const first = String(u.firstName ?? '');
	const last = String(u.lastName ?? '');
	const displayName = [first, last].filter(Boolean).join(' ') || String(u.email ?? 'User');
	return {
		id: String(u.id),
		displayName,
	};
}
