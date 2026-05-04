import { addDays, format, parseISO } from 'date-fns';

import type { Project, TimeEntry, ProjectHealth, FocusItem, TodaySnapshot } from '../types/models';
import type { DashboardRow, DailyBreakdown } from '../types/models';
import { daysInWeekFromStart, parseEntryDate } from './dateUtils';
import { roundHours } from './formatters';

export function aggregateScheduledHoursFromMap(
	scheduledByProject: Map<string, number>
): Map<string, number> {
	return new Map(scheduledByProject);
}

export function aggregateUtilisedHours(
	entries: TimeEntry[],
	periodStart: Date,
	periodEnd: Date
): Map<string, number> {
	const utilisedByProject = new Map<string, number>();
	const startMs = periodStart.getTime();
	const endMs = periodEnd.getTime();

	for (const entry of entries) {
		const entryDate = parseISO(entry.date);
		const t = entryDate.getTime();
		if (t >= startMs && t <= endMs) {
			const pid = entry.projectId;
			utilisedByProject.set(pid, (utilisedByProject.get(pid) || 0) + entry.hours);
		}
	}
	return utilisedByProject;
}

export function buildDashboardRows(
	projects: Project[],
	scheduledMap: Map<string, number>,
	utilisedMap: Map<string, number>
): DashboardRow[] {
	return projects
		.map((project) => {
			const scheduled = scheduledMap.get(project.id) || 0;
			const utilised = utilisedMap.get(project.id) || 0;
			return {
				projectId: project.id,
				projectName: project.name,
				scheduledHours: roundHours(scheduled, 1),
				utilisedHours: roundHours(utilised, 1),
				variance: roundHours(utilised - scheduled, 1),
				utilisationPercent:
					scheduled > 0 ? roundHours((utilised / scheduled) * 100, 1) : 0,
			};
		})
		.filter((row) => row.scheduledHours > 0 || row.utilisedHours > 0)
		.sort((a, b) => b.utilisedHours - a.utilisedHours);
}

export function summarizeRows(rows: DashboardRow[]): {
	totalScheduled: number;
	totalUtilised: number;
	totalVariance: number;
	overallUtilisationPercent: number;
} {
	const totalScheduled = rows.reduce((s, r) => s + r.scheduledHours, 0);
	const totalUtilised = rows.reduce((s, r) => s + r.utilisedHours, 0);
	const totalVariance = roundHours(totalUtilised - totalScheduled, 1);
	const overallUtilisationPercent =
		totalScheduled > 0
			? roundHours((totalUtilised / totalScheduled) * 100, 1)
			: 0;
	return {
		totalScheduled: roundHours(totalScheduled, 1),
		totalUtilised: roundHours(totalUtilised, 1),
		totalVariance,
		overallUtilisationPercent,
	};
}

export function buildWeeklyDistribution(
	entries: TimeEntry[],
	scheduledHours: Record<string, Record<string, number>>,
	weekStart: Date
): DailyBreakdown[] {
	const days = daysInWeekFromStart(weekStart);

	return days.map((day) => {
		const dateStr = format(day, 'yyyy-MM-dd');
		const dayLabel = format(day, 'EEE').toUpperCase();

		const utilised = entries
			.filter((e) => e.date === dateStr)
			.reduce((sum, e) => sum + e.hours, 0);

		const scheduled = Object.values(scheduledHours).reduce(
			(sum, dates) => sum + (dates[dateStr] || 0),
			0
		);

		return {
			day: dayLabel,
			date: dateStr,
			scheduled: roundHours(scheduled, 1),
			utilised: roundHours(utilised, 1),
		};
	});
}

/** Month view: bucket utilised by day; spread scheduled evenly across task span (calendar days). */
export function buildMonthlyDistribution(
	entries: TimeEntry[],
	scheduledHours: Record<string, Record<string, number>>,
	monthStart: Date,
	monthEnd: Date
): DailyBreakdown[] {
	const days: DailyBreakdown[] = [];
	for (let d = new Date(monthStart); d <= monthEnd; d = addDays(d, 1)) {
		const dateStr = format(d, 'yyyy-MM-dd');
		const dayLabel = format(d, 'd');
		const utilised = entries
			.filter((e) => e.date === dateStr)
			.reduce((sum, e) => sum + e.hours, 0);
		
		const scheduled = Object.values(scheduledHours).reduce(
			(sum, dates) => sum + (dates[dateStr] || 0),
			0
		);
		
		days.push({
			day: dayLabel,
			date: dateStr,
			scheduled: roundHours(scheduled, 1),
			utilised: roundHours(utilised, 1),
		});
	}
	return days;
}

export function timelogsToEntries(raw: unknown[], userId: string): TimeEntry[] {
	const out: TimeEntry[] = [];
	for (const item of raw) {
		if (!item || typeof item !== 'object') continue;
		const t = item as Record<string, unknown>;
		const id = t.id;
		const minutes = Number(t.minutes ?? 0);
		const projectId = t.projectId ?? t.project_id;
		const timeLogged = (t.timeLogged ?? t.dateLogged ?? t.time_logged) as
			| string
			| undefined;
		if (id == null || projectId == null || !timeLogged) continue;
		const uid = t.userId ?? t.user_id;
		if (uid != null && String(uid) !== String(userId)) continue;
		out.push({
			id: String(id),
			projectId: String(projectId),
			date: parseEntryDate(timeLogged),
			hours: roundHours(minutes / 60, 2),
		});
	}
	return out;
}

export function getProjectHealth(utilisationPercent: number, scheduledHours: number): ProjectHealth {
	if (scheduledHours === 0) return 'healthy';
	if (utilisationPercent >= 80 && utilisationPercent <= 110) return 'healthy';
	if (utilisationPercent >= 60 && utilisationPercent <= 130) return 'at-risk';
	return 'critical';
}

export function buildFocusItems(rows: DashboardRow[], limit = 5): FocusItem[] {
	return rows
		.filter((r) => r.scheduledHours > 0)
		.map((r) => ({
			projectId: r.projectId,
			projectName: r.projectName,
			remainingHours: roundHours(Math.max(0, r.scheduledHours - r.utilisedHours), 1),
			scheduledHours: r.scheduledHours,
			utilisedHours: r.utilisedHours,
			utilisationPercent: r.utilisationPercent,
			health: getProjectHealth(r.utilisationPercent, r.scheduledHours),
		}))
		.sort((a, b) => b.remainingHours - a.remainingHours)
		.slice(0, limit);
}

export function buildTodaySnapshot(
	projects: Project[],
	entries: TimeEntry[],
	scheduledHours: Record<string, Record<string, number>>,
	todayStr: string
): TodaySnapshot {
	const todayEntries = entries.filter((e) => e.date === todayStr);

	const utilisedByProject = new Map<string, number>();
	for (const e of todayEntries) {
		utilisedByProject.set(e.projectId, (utilisedByProject.get(e.projectId) || 0) + e.hours);
	}

	let totalScheduledToday = 0;
	let totalUtilisedToday = 0;

	const projectSnapshots: TodaySnapshot['projects'] = [];

	for (const project of projects) {
		const scheduled = scheduledHours[project.id]?.[todayStr] || 0;
		const utilised = utilisedByProject.get(project.id) || 0;
		if (scheduled === 0 && utilised === 0) continue;

		totalScheduledToday += scheduled;
		totalUtilisedToday += utilised;

		projectSnapshots.push({
			projectId: project.id,
			projectName: project.name,
			scheduled: roundHours(scheduled, 1),
			utilised: roundHours(utilised, 1),
		});
	}

	projectSnapshots.sort((a, b) => (b.scheduled - b.utilised) - (a.scheduled - a.utilised));

	const progressPercent =
		totalScheduledToday > 0
			? roundHours((totalUtilisedToday / totalScheduledToday) * 100, 1)
			: totalUtilisedToday > 0
				? 100
				: 0;

	return {
		totalScheduledToday: roundHours(totalScheduledToday, 1),
		totalUtilisedToday: roundHours(totalUtilisedToday, 1),
		progressPercent,
		projects: projectSnapshots,
	};
}
