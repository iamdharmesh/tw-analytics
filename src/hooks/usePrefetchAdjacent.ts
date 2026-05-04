import { useEffect } from 'react';

import { loadPeriodDataset } from '../api/periodData';
import { TeamworkClient } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { periodCacheKey, useDataStore } from '../stores/dataStore';
import { useDashboardStore } from '../stores/dashboardStore';
import { getPeriodBounds, shiftPeriodAnchor } from '../utils/dateUtils';

/**
 * Warm cache for previous/next period on idle to reduce navigation latency.
 */
export function usePrefetchAdjacent(): void {
	const siteUrl = useAuthStore((s) => s.siteUrl);
	const apiToken = useAuthStore((s) => s.apiToken);
	const userId = useAuthStore((s) => s.userId);
	const anchorDate = useDashboardStore((s) => s.anchorDate);
	const viewMode = useDashboardStore((s) => s.viewMode);

	useEffect(() => {
		if (!siteUrl || !apiToken || !userId) return;
		if (typeof requestIdleCallback === 'undefined') return;

		const client = new TeamworkClient({ siteUrl, apiToken });
		const handle = requestIdleCallback(() => {
			for (const delta of [-1, 1]) {
				const nextAnchor = shiftPeriodAnchor(anchorDate, viewMode, delta);
				const p = getPeriodBounds(nextAnchor, viewMode);
				const key = periodCacheKey(viewMode, p.startStr, p.endStr);
				const ds = useDataStore.getState();
				if (ds.isCacheFresh(key) || ds.getCached(key)) continue;
				void loadPeriodDataset(client, userId, p.startStr, p.endStr)
					.then((data) => {
						const cached = {
							entries: data.entries,
							fetchedAt: Date.now(),
						};
						ds.setCached(key, cached);
						ds.persistCacheToStorage(key, cached);
					})
					.catch(() => {
						/* ignore prefetch errors */
					});
			}
		});
		return () => cancelIdleCallback(handle);
	}, [siteUrl, apiToken, userId, anchorDate, viewMode]);
}
