export interface Project {
	id: string;
	name: string;
}

export interface TimeEntry {
	id: string;
	projectId: string;
	date: string;
	hours: number;
}



export interface DashboardRow {
	projectId: string;
	projectName: string;
	scheduledHours: number;
	utilisedHours: number;
	variance: number;
	utilisationPercent: number;
}

export interface DailyBreakdown {
	day: string;
	date: string;
	scheduled: number;
	utilised: number;
}

export interface DashboardSummary {
	totalScheduled: number;
	totalUtilised: number;
	totalVariance: number;
	overallUtilisationPercent: number;
	weeklyDistribution: DailyBreakdown[];
	rows: DashboardRow[];
}

export type ViewMode = 'week' | 'month';

export type ProjectHealth = 'healthy' | 'at-risk' | 'critical';

export interface FocusItem {
	projectId: string;
	projectName: string;
	remainingHours: number;
	scheduledHours: number;
	utilisedHours: number;
	utilisationPercent: number;
	health: ProjectHealth;
}

export interface TodaySnapshot {
	totalScheduledToday: number;
	totalUtilisedToday: number;
	progressPercent: number;
	projects: {
		projectId: string;
		projectName: string;
		scheduled: number;
		utilised: number;
	}[];
}

export interface PeriodBounds {
	start: Date;
	end: Date;
	startStr: string;
	endStr: string;
}
