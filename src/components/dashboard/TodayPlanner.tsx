import { useMemo } from 'react';
import { format } from 'date-fns';

import type { Project, TimeEntry, TodaySnapshot } from '../../types/models';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';
import { buildTodaySnapshot } from '../../utils/aggregation';
import { formatHours } from '../../utils/formatters';

interface TodayPlannerProps {
	projects: Project[];
	entries: TimeEntry[];
	scheduledHours: Record<string, Record<string, number>>;
}

function ProgressRing({
	percent,
	size = 88,
	strokeWidth = 7,
}: {
	percent: number;
	size?: number;
	strokeWidth?: number;
}) {
	const animatedPercent = useAnimatedValue(Math.min(percent, 100), 900);
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (animatedPercent / 100) * circumference;

	const color =
		percent >= 90
			? '#10b981' // emerald
			: percent >= 50
				? '#6366f1' // indigo
				: '#f59e0b'; // amber

	return (
		<svg width={size} height={size} className="shrink-0 -rotate-90">
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke="#e2e8f0"
				strokeWidth={strokeWidth}
			/>
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke={color}
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeDasharray={circumference}
				strokeDashoffset={offset}
				className="transition-[stroke] duration-500"
			/>
		</svg>
	);
}

export function TodayPlanner({ projects, entries, scheduledHours }: TodayPlannerProps) {
	const todayStr = format(new Date(), 'yyyy-MM-dd');
	const todayLabel = format(new Date(), 'EEEE, MMM d');

	const snapshot: TodaySnapshot = useMemo(
		() => buildTodaySnapshot(projects, entries, scheduledHours, todayStr),
		[projects, entries, scheduledHours, todayStr]
	);

	const animLogged = useAnimatedValue(snapshot.totalUtilisedToday);
	const animScheduled = useAnimatedValue(snapshot.totalScheduledToday);

	const hasActivity = snapshot.totalScheduledToday > 0 || snapshot.totalUtilisedToday > 0;

	if (!hasActivity) return null;

	const pendingProjects = snapshot.projects.filter(
		(p) => p.scheduled > 0 && p.utilised < p.scheduled
	);

	return (
		<div className="rounded-xl border border-slate-200/80 bg-gradient-to-r from-white via-indigo-50/30 to-white p-5 shadow-sm">
			<div className="flex items-center gap-2">
				<span className="text-lg">📅</span>
				<div>
					<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
						Today's Progress
					</p>
					<p className="text-xs text-slate-400">{todayLabel}</p>
				</div>
			</div>

			<div className="mt-4 flex items-center gap-6">
				{/* Progress ring */}
				<div className="relative">
					<ProgressRing percent={snapshot.progressPercent} />
					<div className="absolute inset-0 flex flex-col items-center justify-center">
						<span className="text-lg font-bold text-slate-900">
							{Math.round(snapshot.progressPercent)}%
						</span>
					</div>
				</div>

				{/* Stats */}
				<div className="flex-1 space-y-2">
					<div className="flex items-baseline gap-2">
						<span className="text-2xl font-bold text-slate-900">
							{formatHours(animLogged)}
						</span>
						<span className="text-sm text-slate-500">
							/ {formatHours(animScheduled)}h scheduled
						</span>
					</div>

					{pendingProjects.length > 0 && (
						<div className="space-y-1">
							<p className="text-xs font-medium text-slate-500">
								Still pending:
							</p>
							<div className="flex flex-wrap gap-1.5">
								{pendingProjects.slice(0, 4).map((p) => (
									<span
										key={p.projectId}
										className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800"
									>
										{p.projectName}
										<span className="text-amber-500">
											{formatHours(p.scheduled - p.utilised)}h
										</span>
									</span>
								))}
								{pendingProjects.length > 4 && (
									<span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
										+{pendingProjects.length - 4} more
									</span>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
