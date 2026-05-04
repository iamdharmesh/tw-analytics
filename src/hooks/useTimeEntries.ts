import { periodCacheKey, useDataStore } from '../stores/dataStore';
import { useDashboardStore } from '../stores/dashboardStore';
import { getPeriodBounds } from '../utils/dateUtils';

/** Time entries for the currently selected period (from cache after load). */
export function useTimeEntriesForCurrentPeriod() {
	const viewMode = useDashboardStore((s) => s.viewMode);
	const anchorDate = useDashboardStore((s) => s.anchorDate);
	const period = getPeriodBounds(anchorDate, viewMode);
	const key = periodCacheKey(viewMode, period.startStr, period.endStr);
	return useDataStore((s) => s.getCached(key)?.entries ?? null);
}
