import type { TeamworkClient } from './client';
import { extractTimelogs } from './client';

const DEFAULT_PAGE_SIZE = 500;

export async function paginatedFetch<T>(
	client: TeamworkClient,
	path: string,
	baseParams: Record<string, string | number | boolean | undefined>,
	extractPage: (json: unknown) => T[],
	pageSize = DEFAULT_PAGE_SIZE
): Promise<T[]> {
	const all: T[] = [];
	let page = 1;
	while (true) {
		const json = await client.get<unknown>(path, {
			...baseParams,
			pageSize,
			page,
		});
		const items = extractPage(json);
		all.push(...items);
		if (items.length < pageSize) break;
		page += 1;
	}
	return all;
}

export async function fetchAllTimelogPages(
	client: TeamworkClient,
	path: string,
	params: Record<string, string | number | boolean | undefined>
): Promise<Record<string, unknown>[]> {
	return paginatedFetch(client, path, params, extractTimelogs, DEFAULT_PAGE_SIZE);
}
