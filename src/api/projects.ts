import type { Project } from '../types/models';
import type { TeamworkClient } from './client';
import { extractProjects } from './client';

const PAGE_SIZE = 500;

export async function fetchAllProjects(client: TeamworkClient): Promise<Project[]> {
	const all: Project[] = [];
	let page = 1;
	while (true) {
		const json = await client.get<unknown>('/projects/api/v3/projects.json', {
			pageSize: PAGE_SIZE,
			page,
			orderBy: 'name',
			orderMode: 'asc',
			'fields[projects]': 'id,name',
		});
		const rows = extractProjects(json);
		for (const r of rows) {
			if (r.id == null) continue;
			all.push({
				id: String(r.id),
				name: String(r.name ?? 'Untitled'),
			});
		}
		if (rows.length < PAGE_SIZE) break;
		page += 1;
	}
	return all;
}
