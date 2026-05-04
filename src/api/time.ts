import type { TeamworkClient } from './client';
import { fetchAllTimelogPages } from './pagination';

export async function fetchTimeEntriesRaw(
	client: TeamworkClient,
	startDate: string,
	endDate: string,
	userId: string
): Promise<Record<string, unknown>[]> {
	return fetchAllTimelogPages(client, '/projects/api/v3/time.json', {
		startDate,
		endDate,
		userId,
		'fields[timelogs]': 'id,minutes,timeLogged,projectId,taskId,userId',
	});
}
