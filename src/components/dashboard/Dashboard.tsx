import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';

import { useDashboardData } from '../../hooks/useDashboardData';
import { usePrefetchAdjacent } from '../../hooks/usePrefetchAdjacent';
import { useAuthStore } from '../../stores/authStore';
import { useDataStore } from '../../stores/dataStore';
import { useDashboardStore } from '../../stores/dashboardStore';
import { getPeriodBounds } from '../../utils/dateUtils';
import { EmptyState } from '../shared/EmptyState';
import { ErrorState } from '../shared/ErrorState';
import { Loader } from '../shared/Loader';
import { PeriodNavigator } from '../shared/PeriodNavigator';
import { formatPeriodRange } from '../../utils/dateUtils';
import { RateLimitBanner } from '../shared/RateLimitBanner';
import { CapacityBanner } from './CapacityBanner';
import { KPICards } from './KPICards';
import { ProjectTable } from './ProjectTable';
import { TimeDistribution } from './TimeDistribution';
import { TodayPlanner } from './TodayPlanner';
import { WeeklyChart } from './WeeklyChart';

export function Dashboard() {
	const phase = useAuthStore((s) => s.phase);
	const viewMode = useDashboardStore((s) => s.viewMode);
	const setViewMode = useDashboardStore((s) => s.setViewMode);
	const anchorDate = useDashboardStore((s) => s.anchorDate);
	const shiftPeriod = useDashboardStore((s) => s.shiftPeriod);

	const loading = useDataStore((s) => s.loading);
	const loadError = useDataStore((s) => s.loadError);
	const rateLimitResetAt = useDataStore((s) => s.rateLimitResetAt);
	const projects = useDataStore((s) => s.projects);

	const { summary, entries, scheduledHours, refresh } = useDashboardData();
	usePrefetchAdjacent();

	const period = useMemo(
		() => getPeriodBounds(anchorDate, viewMode),
		[anchorDate, viewMode]
	);

	const periodLabel = formatPeriodRange(period.start, period.end, viewMode);
	
	const todayStr = new Date().toISOString().slice(0, 10);
	const isCurrentWeek =
		viewMode === 'week' &&
		todayStr >= period.startStr &&
		todayStr <= period.endStr;

	if (phase !== 'authed') {
		return <Navigate to="/" replace />;
	}

	const showLoader = loading && !summary;
	const noProjects = projects && projects.length === 0 && !loading;

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold text-slate-900">Personal performance</h1>
				<PeriodNavigator
					viewMode={viewMode}
					onViewModeChange={setViewMode}
					periodLabel={periodLabel}
					onPrev={() => shiftPeriod(-1)}
					onNext={() => shiftPeriod(1)}
				/>
			</div>

			{rateLimitResetAt ? (
				<RateLimitBanner resetAtEpoch={rateLimitResetAt} />
			) : null}

			{loadError ? (
				<ErrorState message={loadError} onRetry={refresh} />
			) : null}

			{showLoader ? <Loader label="Loading dashboard…" /> : null}

			{noProjects ? (
				<EmptyState
					title="No projects found"
					description="You do not have access to any projects, or the projects list failed to load."
				/>
			) : null}

			{summary && !noProjects ? (
				<>
					{/* Capacity alert banner */}
					<CapacityBanner
						totalUtilised={summary.totalUtilised}
						totalScheduled={summary.totalScheduled}
						viewMode={viewMode}
						periodStart={period.start}
						periodEnd={period.end}
					/>

					{/* Today's planner (most useful in week view) */}
					{isCurrentWeek && projects ? (
						<TodayPlanner
							projects={projects}
							entries={entries}
							scheduledHours={scheduledHours}
						/>
					) : null}

					<KPICards
						scheduled={summary.totalScheduled}
						utilised={summary.totalUtilised}
						utilisationPercent={summary.overallUtilisationPercent}
						weeklyDistribution={summary.weeklyDistribution}
					/>

					<WeeklyChart data={summary.weeklyDistribution} viewMode={viewMode} rows={summary.rows} />

					{/* Time distribution + project table */}
					<div className="grid gap-6 lg:grid-cols-3">
						<div className="lg:col-span-1">
							<TimeDistribution rows={summary.rows} />
						</div>
						<div className="lg:col-span-2">
							{summary.rows.length === 0 ? (
								<EmptyState
									title="No time entries for this period"
									description="Log time in Teamwork or pick a different week or month."
								/>
							) : (
								<ProjectTable rows={summary.rows} />
							)}
						</div>
					</div>
				</>
			) : null}
		</div>
	);
}
