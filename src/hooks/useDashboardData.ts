import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { RateLimitError, TeamworkClient } from '../api/client';
import { loadPeriodDataset } from '../api/periodData';
import { fetchAllProjects } from '../api/projects';
import { useAuthStore } from '../stores/authStore';
import {
	CACHE_TTL_MS,
	periodCacheKey,
	useDataStore,
} from '../stores/dataStore';
import { useDashboardStore } from '../stores/dashboardStore';
import { useScheduledHoursStore } from '../stores/scheduledHoursStore';
import type { DashboardSummary, Project, ViewMode } from '../types/models';
import {
	aggregateUtilisedHours,
	buildDashboardRows,
	buildMonthlyDistribution,
	buildWeeklyDistribution,
	summarizeRows,
} from '../utils/aggregation';
import { getPeriodBounds } from '../utils/dateUtils';
import { startOfWeek, format } from 'date-fns';
import type { TimeEntry } from '../types/models';

function buildSummary(
	projects: Project[],
	entries: TimeEntry[],
	scheduledHours: Record<string, Record<string, number>>,
	viewMode: ViewMode,
	periodStart: Date,
	periodEnd: Date
): DashboardSummary {
	const scheduledMap = new Map<string, number>();
	for (const [projectId, dates] of Object.entries(scheduledHours)) {
		let total = 0;
		for (const [dateStr, hours] of Object.entries(dates)) {
			// Only sum hours within the period
			if (dateStr >= format(periodStart, 'yyyy-MM-dd') && dateStr <= format(periodEnd, 'yyyy-MM-dd')) {
				total += hours;
			}
		}
		if (total > 0) {
			scheduledMap.set(projectId, total);
		}
	}
	const utilisedMap = aggregateUtilisedHours(entries, periodStart, periodEnd);
	const rows = buildDashboardRows(projects, scheduledMap, utilisedMap);
	const {
		totalScheduled,
		totalUtilised,
		totalVariance,
		overallUtilisationPercent,
	} = summarizeRows(rows);

	const weekStart =
		viewMode === 'week'
			? periodStart
			: startOfWeek(periodStart, { weekStartsOn: 1 });

	const weeklyDistribution =
		viewMode === 'week'
			? buildWeeklyDistribution(entries, scheduledHours, weekStart)
			: buildMonthlyDistribution(
					entries,
					scheduledHours,
					periodStart,
					periodEnd
				);

	return {
		totalScheduled,
		totalUtilised,
		totalVariance,
		overallUtilisationPercent,
		weeklyDistribution,
		rows,
	};
}

export function useDashboardData(): {
	summary: DashboardSummary | null;
	entries: TimeEntry[];
	scheduledHours: Record<string, Record<string, number>>;
	workloadAvailable: boolean;
	refresh: () => void;
} {
	const siteUrl = useAuthStore((s) => s.siteUrl);
	const apiToken = useAuthStore((s) => s.apiToken);
	const userId = useAuthStore((s) => s.userId);

	const viewMode = useDashboardStore((s) => s.viewMode);
	const anchorDate = useDashboardStore((s) => s.anchorDate);

	const setProjects = useDataStore((s) => s.setProjects);
	const setLoading = useDataStore((s) => s.setLoading);
	const setLoadError = useDataStore((s) => s.setLoadError);
	const setRateLimit = useDataStore((s) => s.setRateLimit);
	const setCached = useDataStore((s) => s.setCached);

	const [summary, setSummary] = useState<DashboardSummary | null>(null);
	const [currentEntries, setCurrentEntries] = useState<TimeEntry[]>([]);
	const workloadAvailable = true; // Manual entry is always available
	const scheduledHours = useScheduledHoursStore((s) => s.hours);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const requestIdRef = useRef(0);

	const period = useMemo(
		() => getPeriodBounds(anchorDate, viewMode),
		[anchorDate, viewMode]
	);

	const cacheKey = useMemo(
		() => periodCacheKey(viewMode, period.startStr, period.endStr),
		[viewMode, period.startStr, period.endStr]
	);

	const client = useMemo(() => {
		if (!siteUrl || !apiToken) return null;
		return new TeamworkClient({ siteUrl, apiToken });
	}, [siteUrl, apiToken]);

	const runFetch = useCallback(
		async (opts: { background?: boolean } = {}) => {
			if (!client || !userId) return;
			const { background } = opts;
			const key = periodCacheKey(viewMode, period.startStr, period.endStr);
			const dataState = useDataStore.getState();

			if (!background && dataState.isCacheFresh(key)) {
				const c = dataState.getCached(key);
				const projs = dataState.projects ?? [];
				if (c && projs.length) {
					setCurrentEntries(c.entries);
					setSummary(
						buildSummary(
							projs,
							c.entries,
							scheduledHours,
							viewMode,
							period.start,
							period.end
						)
					);
					return;
				}
			}

			if (!background) setLoading(true);
			setLoadError(null);
			setRateLimit(null);
			const reqId = ++requestIdRef.current;

			try {
				let projs = useDataStore.getState().projects;
				const now = Date.now();
				if (!projs?.length) {
					projs = await fetchAllProjects(client);
					setProjects(projs, now);
				}

				const dataset = await loadPeriodDataset(
					client,
					userId,
					period.startStr,
					period.endStr
				);

				if (reqId !== requestIdRef.current) return;

				const { entries } = dataset;

				const cached = {
					entries,
					fetchedAt: Date.now(),
				};
				setCached(key, cached);
				useDataStore.getState().persistCacheToStorage(key, cached);

				setCurrentEntries(entries);
				setSummary(
					buildSummary(
						projs,
						entries,
						scheduledHours,
						viewMode,
						period.start,
						period.end
					)
				);
			} catch (e) {
				if (reqId !== requestIdRef.current) return;
				if (e instanceof RateLimitError) {
					setRateLimit(e.resetAtEpoch);
					setLoadError('Rate limited. Please wait before retrying.');
				} else if (e instanceof Error) {
					setLoadError(e.message);
				} else {
					setLoadError('Unknown error');
				}
				const disk = useDataStore.getState().loadPersistedCache(key);
				const projs = useDataStore.getState().projects ?? [];
				if (disk && projs.length) {
					setCurrentEntries(disk.entries);
					setSummary(
						buildSummary(
							projs,
							disk.entries,
							scheduledHours,
							viewMode,
							period.start,
							period.end
						)
					);
				}
			} finally {
				if (reqId === requestIdRef.current && !background) {
					setLoading(false);
				}
			}
		},
		[
			client,
			userId,
			viewMode,
			period.start,
			period.end,
			period.startStr,
			period.endStr,
			setProjects,
			setLoading,
			setLoadError,
			setRateLimit,
			setCached,
			scheduledHours,
		]
	);

	useEffect(() => {
		if (!client || !userId) return;

		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			const key = periodCacheKey(viewMode, period.startStr, period.endStr);
			const ds = useDataStore.getState();
			const mem = ds.getCached(key);
			const disk = ds.loadPersistedCache(key);
			const projs = ds.projects ?? [];

			if (mem && projs.length) {
				const stale = Date.now() - mem.fetchedAt > CACHE_TTL_MS;
				setCurrentEntries(mem.entries);
				setSummary(
					buildSummary(
						projs,
						mem.entries,
						scheduledHours,
						viewMode,
						period.start,
						period.end
					)
				);
				if (stale) void runFetch({ background: true });
				return;
			}

			if (disk && projs.length) {
				setCurrentEntries(disk.entries);
				setSummary(
					buildSummary(
						projs,
						disk.entries,
						scheduledHours,
						viewMode,
						period.start,
						period.end
					)
				);
				void runFetch({ background: true });
				return;
			}

			void runFetch();
		}, 300);

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [client, userId, cacheKey, viewMode, period, runFetch, scheduledHours]);

	const refresh = useCallback(() => {
		void runFetch();
	}, [runFetch]);

	return { summary, entries: currentEntries, scheduledHours, workloadAvailable, refresh };
}
