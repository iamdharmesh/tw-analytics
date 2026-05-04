import type { DashboardRow } from '../../types/models';
import { formatHours, formatPercent } from '../../utils/formatters';
import { getProjectHealth } from '../../utils/aggregation';

const healthStyles = {
	healthy: {
		dot: 'bg-emerald-500',
		bar: 'bg-emerald-500',
		badge: 'bg-emerald-50 text-emerald-700',
		label: 'Healthy',
	},
	'at-risk': {
		dot: 'bg-amber-500',
		bar: 'bg-amber-500',
		badge: 'bg-amber-50 text-amber-700',
		label: 'At risk',
	},
	critical: {
		dot: 'bg-rose-500',
		bar: 'bg-rose-500',
		badge: 'bg-rose-50 text-rose-700',
		label: 'Critical',
	},
} as const;

interface ProjectRowProps {
	row: DashboardRow;
}

export function ProjectRow({ row }: ProjectRowProps) {
	const variancePositive = row.variance >= 0;
	const utilBar = Math.min(100, Math.max(0, row.utilisationPercent));
	const health = getProjectHealth(row.utilisationPercent, row.scheduledHours);
	const style = healthStyles[health];

	return (
		<tr className="border-b border-slate-100 hover:bg-slate-50/80">
			<td className="py-3 pr-4">
				<div className="flex items-center gap-2">
					<span
						className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`}
						aria-hidden
					/>
					<span className="font-medium text-slate-900">{row.projectName}</span>
					{row.scheduledHours === 0 ? (
						<span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-500">
							No estimates
						</span>
					) : health !== 'healthy' ? (
						<span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${style.badge}`}>
							{style.label}
						</span>
					) : null}
				</div>
			</td>
			<td className="py-3 pr-4 text-right text-sm text-slate-700">
				{formatHours(row.scheduledHours)}
			</td>
			<td className="py-3 pr-4 text-right text-sm text-slate-700">
				{formatHours(row.utilisedHours)}
			</td>
			<td className="py-3 pr-4 text-right">
				<span
					className={[
						'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
						variancePositive
							? 'bg-emerald-50 text-emerald-800'
							: 'bg-rose-50 text-rose-800',
					].join(' ')}
				>
					{variancePositive ? '+' : ''}
					{formatHours(row.variance)}h
				</span>
			</td>
			<td className="py-3">
				<div className="flex items-center justify-end gap-2">
					<div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
						<div
							className={`h-full rounded-full ${style.bar} transition-all`}
							style={{ width: `${utilBar}%` }}
						/>
					</div>
					<span className="w-14 text-right text-sm font-medium text-slate-800">
						{formatPercent(row.utilisationPercent)}
					</span>
				</div>
			</td>
		</tr>
	);
}
