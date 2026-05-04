import type { TimeEntry } from '../types/models';
import type { TeamworkClient } from './client';
import { fetchTimeEntriesRaw } from './time';
import { timelogsToEntries } from '../utils/aggregation';

export interface PeriodDataset {
	entries: TimeEntry[];
}

export async function loadPeriodDataset(
	client: TeamworkClient,
	userId: string,
	startStr: string,
	endStr: string
): Promise<PeriodDataset> {
	const rawLogs = await fetchTimeEntriesRaw(client, startStr, endStr, userId);
	const entries = timelogsToEntries(rawLogs, userId);
	return { entries };
}
