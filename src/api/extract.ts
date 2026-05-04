/** Pull arrays from Teamwork v3 list responses (plain or JSON:API-ish). */

export function extractArray<T = Record<string, unknown>>(
	json: unknown,
	keys: string[]
): T[] {
	if (!json || typeof json !== 'object') return [];
	const o = json as Record<string, unknown>;
	for (const k of keys) {
		const v = o[k];
		if (Array.isArray(v)) return v as T[];
	}
	const data = o.data;
	if (Array.isArray(data)) {
		return data.map((item) => flattenJsonApiResource(item)) as T[];
	}
	return [];
}

function flattenJsonApiResource(item: unknown): Record<string, unknown> {
	if (!item || typeof item !== 'object') return {};
	const r = item as Record<string, unknown>;
	const id = r.id;
	const attrs = r.attributes;
	const base: Record<string, unknown> = {};
	if (id != null) base.id = id;
	if (attrs && typeof attrs === 'object') {
		Object.assign(base, attrs as object);
	}
	return { ...base, ...r };
}
