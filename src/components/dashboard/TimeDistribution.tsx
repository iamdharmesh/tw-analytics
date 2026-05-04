import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import type { DashboardRow } from '../../types/models';
import { formatHours } from '../../utils/formatters';
import { roundHours } from '../../utils/formatters';

const COLORS = [
	'#4f46e5', // indigo-600
	'#7c3aed', // violet-600
	'#2563eb', // blue-600
	'#0891b2', // cyan-600
	'#059669', // emerald-600
	'#d97706', // amber-600
	'#dc2626', // red-600
	'#9333ea', // purple-600
];

interface TimeDistributionProps {
	rows: DashboardRow[];
}

interface ChartEntry {
	name: string;
	hours: number;
	percent: number;
	color: string;
}

export function TimeDistribution({ rows }: TimeDistributionProps) {
	const { chartData, totalHours } = useMemo(() => {
		const sorted = [...rows]
			.filter((r) => r.utilisedHours > 0)
			.sort((a, b) => b.utilisedHours - a.utilisedHours);

		const total = sorted.reduce((s, r) => s + r.utilisedHours, 0);
		if (total === 0) return { chartData: [] as ChartEntry[], totalHours: 0 };

		const top = sorted.slice(0, 6);
		const rest = sorted.slice(6);
		const restHours = rest.reduce((s, r) => s + r.utilisedHours, 0);

		const data: ChartEntry[] = top.map((r, i) => ({
			name: r.projectName,
			hours: roundHours(r.utilisedHours, 1),
			percent: roundHours((r.utilisedHours / total) * 100, 1),
			color: COLORS[i % COLORS.length],
		}));

		if (restHours > 0) {
			data.push({
				name: `Other (${rest.length})`,
				hours: roundHours(restHours, 1),
				percent: roundHours((restHours / total) * 100, 1),
				color: '#94a3b8', // slate-400
			});
		}

		return { chartData: data, totalHours: roundHours(total, 1) };
	}, [rows]);

	if (chartData.length === 0) return null;

	return (
		<div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
			<h3 className="text-sm font-semibold text-slate-800">Time distribution</h3>
			<div className="mt-4 flex items-center gap-6">
				{/* Donut chart */}
				<div className="relative h-44 w-44 shrink-0">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={chartData}
								dataKey="hours"
								nameKey="name"
								cx="50%"
								cy="50%"
								innerRadius={48}
								outerRadius={72}
								paddingAngle={2}
								strokeWidth={0}
							>
								{chartData.map((entry, i) => (
									<Cell key={i} fill={entry.color} />
								))}
							</Pie>
							<Tooltip
								content={<CustomTooltip />}
							/>
						</PieChart>
					</ResponsiveContainer>
					{/* Center label */}
					<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
						<span className="text-xl font-bold text-slate-900">
							{formatHours(totalHours)}
						</span>
						<span className="text-[10px] font-medium text-slate-400">hours</span>
					</div>
				</div>

				{/* Legend */}
				<div className="flex flex-1 min-w-0 flex-col gap-1.5">
					{chartData.map((entry) => (
						<div key={entry.name} className="flex items-center gap-2 text-sm">
							<span
								className="h-2.5 w-2.5 shrink-0 rounded-sm"
								style={{ backgroundColor: entry.color }}
							/>
							<span className="flex-1 truncate text-slate-700">
								{entry.name}
							</span>
							<span className="shrink-0 font-medium text-slate-900">
								{entry.percent}%
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartEntry }> }) {
	if (!active || !payload?.length) return null;
	const d = payload[0].payload;
	return (
		<div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg">
			<p className="font-semibold text-slate-900">{d.name}</p>
			<p className="text-slate-600">
				{formatHours(d.hours)}h · {d.percent}%
			</p>
		</div>
	);
}
