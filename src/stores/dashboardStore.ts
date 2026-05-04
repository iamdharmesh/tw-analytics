import { create } from 'zustand';

import { getPeriodBounds, shiftPeriodAnchor } from '../utils/dateUtils';
import type { PeriodBounds, ViewMode } from '../types/models';

interface DashboardState {
	viewMode: ViewMode;
	anchorDate: Date;
	setViewMode: (mode: ViewMode) => void;
	setAnchorDate: (d: Date) => void;
	shiftPeriod: (delta: number) => void;
	getPeriod: () => PeriodBounds;
	reset: () => void;
}

const defaultAnchor = () => new Date();

export const useDashboardStore = create<DashboardState>((set, get) => ({
	viewMode: 'week',
	anchorDate: defaultAnchor(),
	setViewMode: (mode) => set({ viewMode: mode }),
	setAnchorDate: (d) => set({ anchorDate: d }),
	shiftPeriod: (delta) => {
		const { anchorDate, viewMode } = get();
		set({ anchorDate: shiftPeriodAnchor(anchorDate, viewMode, delta) });
	},
	getPeriod: () => {
		const { anchorDate, viewMode } = get();
		return getPeriodBounds(anchorDate, viewMode);
	},
	reset: () =>
		set({
			viewMode: 'week',
			anchorDate: defaultAnchor(),
		}),
}));
