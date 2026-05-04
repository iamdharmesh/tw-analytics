import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

import type { DailyBreakdown } from '../../types/models';
import { formatHours } from '../../utils/formatters';

import type { DashboardRow } from '../../types/models';
import { FocusRecommendations } from './FocusRecommendations';

interface WeeklyChartProps {
	data: DailyBreakdown[];
	viewMode: 'week' | 'month';
	rows: DashboardRow[];
}

export function WeeklyChart({ data, viewMode, rows }: WeeklyChartProps) {
	const title =
		viewMode === 'week' ? 'Weekly distribution' : 'Daily distribution (month)';

	return (
		<div className="grid gap-4 lg:grid-cols-3">
			<div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-2">
				<h3 className="text-sm font-semibold text-slate-800">{title}</h3>
				<div className="mt-4 h-72 w-full min-w-0">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
							<XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#64748b" />
							<YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
							<Tooltip
								formatter={(value) =>
									formatHours(Number(value ?? 0))
								}
							/>
							<Legend />
							<Bar
								dataKey="scheduled"
								name="Sched."
								fill="#c4b5fd"
								radius={[4, 4, 0, 0]}
							/>
							<Bar
								dataKey="utilised"
								name="Util."
								fill="#1e3a8a"
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
			<FocusRecommendations rows={rows} />
		</div>
	);
}

export function EfficiencyInsightCard({ data }: { data: DailyBreakdown[] }) {
	const totalS = data.reduce((s, d) => s + d.scheduled, 0);
	const totalU = data.reduce((s, d) => s + d.utilised, 0);
	const delta = totalU - totalS;
	const onTrack = totalS > 0 ? totalU >= totalS * 0.9 : totalU === 0;

	return (
		<div className="flex flex-col justify-between rounded-xl bg-indigo-950 p-6 text-white shadow-lg">
			<div>
				<p className="text-sm font-medium text-indigo-200">
					Personal efficiency
				</p>
				<p className="mt-2 text-lg font-semibold leading-snug">
					{onTrack ? 'On-track performance' : 'Below scheduled pace'}
				</p>
				<p className="mt-3 text-sm leading-relaxed text-indigo-100/90">
					{totalS > 0
						? `You logged ${formatHours(totalU)} against ${formatHours(totalS)} scheduled in this view (${delta >= 0 ? '+' : ''}${formatHours(delta)} variance).`
						: 'No scheduled hours from workload planner for this period. Add estimates or check Scale plan / CORS.'}
				</p>
			</div>
			<button
				type="button"
				className="mt-6 w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/30 hover:bg-white/15"
				onClick={() => {
					const el = document.getElementById('project-performance');
					el?.scrollIntoView({ behavior: 'smooth' });
				}}
			>
				Review details
			</button>
		</div>
	);
}
