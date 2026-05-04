import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ScheduledHoursState {
	// projectId -> date (yyyy-MM-dd) -> hours
	hours: Record<string, Record<string, number>>;
	setHours: (projectId: string, date: string, hours: number) => void;
	getHours: (projectId: string, date: string) => number;
}

export const useScheduledHoursStore = create<ScheduledHoursState>()(
	persist(
		(set, get) => ({
			hours: {},
			setHours: (projectId, date, hours) =>
				set((state) => {
					const projectHours = state.hours[projectId] || {};
					return {
						hours: {
							...state.hours,
							[projectId]: {
								...projectHours,
								[date]: hours,
							},
						},
					};
				}),
			getHours: (projectId, date) => {
				return get().hours[projectId]?.[date] || 0;
			},
		}),
		{
			name: 'tw_scheduled_hours',
		}
	)
);
