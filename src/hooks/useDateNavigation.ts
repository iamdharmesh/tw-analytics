import { useDashboardStore } from '../stores/dashboardStore';

export function useDateNavigation() {
	const shiftPeriod = useDashboardStore((s) => s.shiftPeriod);
	const setAnchorDate = useDashboardStore((s) => s.setAnchorDate);
	const viewMode = useDashboardStore((s) => s.viewMode);
	return { shiftPeriod, setAnchorDate, viewMode };
}
