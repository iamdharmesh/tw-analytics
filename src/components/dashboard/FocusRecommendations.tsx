import { useMemo } from 'react';

import type { DashboardRow } from '../../types/models';
import type { FocusItem } from '../../types/models';
import { buildFocusItems } from '../../utils/aggregation';
import { formatHours } from '../../utils/formatters';

const healthConfig = {
	healthy: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'On track' },
	'at-risk': { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', label: 'At risk' },
	critical: { dot: 'bg-rose-500', bg: 'bg-rose-50', text: 'text-rose-700', label: 'Needs attention' },
} as const;

interface FocusRecommendationsProps {
	rows: DashboardRow[];
}

export function FocusRecommendations({ rows }: FocusRecommendationsProps) {
	const items = useMemo(() => buildFocusItems(rows, 5), [rows]);

	if (items.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
				<div className="text-2xl">🎉</div>
				<p className="mt-2 text-sm font-semibold text-emerald-800">
					All caught up!
				</p>
				<p className="mt-1 text-xs text-emerald-600">
					No projects need focus right now.
				</p>
			</div>
		);
	}

	return (
		<div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
			<div className="flex items-center justify-between">
				<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
					Focus This Week
				</p>
				<span className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700" aria-hidden>
					🎯
				</span>
			</div>
			<ul className="mt-3 space-y-2.5">
				{items.map((item, idx) => (
					<FocusRow key={item.projectId} item={item} rank={idx + 1} />
				))}
			</ul>
		</div>
	);
}

function FocusRow({ item, rank }: { item: FocusItem; rank: number }) {
	const cfg = healthConfig[item.health];
	const barWidth = Math.min(100, Math.max(0, item.utilisationPercent));

	return (
		<li className="group flex items-center gap-2.5">
			<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
				{rank}
			</span>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1.5">
					<span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} />
					<span className="truncate text-sm font-medium text-slate-800">
						{item.projectName}
					</span>
				</div>
				<div className="mt-1 flex items-center gap-2">
					<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
						<div
							className={`h-full rounded-full transition-all ${
								item.health === 'healthy'
									? 'bg-emerald-500'
									: item.health === 'at-risk'
										? 'bg-amber-500'
										: 'bg-rose-500'
							}`}
							style={{ width: `${barWidth}%` }}
						/>
					</div>
					<span className="shrink-0 text-[10px] font-medium text-slate-500">
						{formatHours(item.remainingHours)}h left
					</span>
				</div>
			</div>
		</li>
	);
}
