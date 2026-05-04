import { useAnimatedValue } from '../../hooks/useAnimatedValue';
import type { DailyBreakdown } from '../../types/models';
import { formatHours, formatPercent } from '../../utils/formatters';
import { EfficiencyInsightCard } from './WeeklyChart';

interface KPICardsProps {
	scheduled: number;
	utilised: number;
	utilisationPercent: number;
	weeklyDistribution: DailyBreakdown[];
}

export function KPICards({ scheduled, utilised, utilisationPercent, weeklyDistribution }: KPICardsProps) {
	const animScheduled = useAnimatedValue(scheduled);
	const animUtilised = useAnimatedValue(utilised);
	const animPct = useAnimatedValue(utilisationPercent);

	const variancePct =
		scheduled > 0 ? ((utilised - scheduled) / scheduled) * 100 : 0;
	const varianceLabel =
		scheduled > 0 ? `${Math.round(variancePct)}% vs personal goal` : '—';

	return (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
				<div className="flex items-start justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
							Scheduled hours
						</p>
						<p className="mt-2 text-3xl font-bold text-slate-900">
							{formatHours(animScheduled)}
						</p>
						<span className="mt-2 inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
							BASE
						</span>
					</div>
					<span
						className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700"
						aria-hidden
					>
						Sch
					</span>
				</div>
			</div>

			<div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
				<div className="flex items-start justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
							Utilised hours
						</p>
						<p className="mt-2 text-3xl font-bold text-slate-900">
							{formatHours(animUtilised)}
						</p>
						<span className="mt-2 inline-block rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
							{varianceLabel}
						</span>
					</div>
					<span
						className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700"
						aria-hidden
					>
						Log
					</span>
				</div>
			</div>

			<EfficiencyInsightCard data={weeklyDistribution} />

			<div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
				<div className="flex items-start justify-between">
					<div className="min-w-0 flex-1">
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
							Utilisation %
						</p>
						<p className="mt-2 text-3xl font-bold text-slate-900">
							{formatPercent(animPct)}
						</p>
						<div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
							<div
								className="h-full rounded-full bg-indigo-600 transition-all"
								style={{
									width: `${Math.min(100, Math.max(0, animPct))}%`,
								}}
							/>
						</div>
					</div>
					<span
						className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700"
						aria-hidden
					>
						%
					</span>
				</div>
			</div>
		</div>
	);
}
