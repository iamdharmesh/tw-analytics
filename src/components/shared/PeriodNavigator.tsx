import type { ViewMode } from '../../types/models';
import { ToggleGroup } from './ToggleGroup';

interface PeriodNavigatorProps {
	viewMode: ViewMode;
	onViewModeChange: (m: ViewMode) => void;
	periodLabel: string;
	onPrev: () => void;
	onNext: () => void;
}

export function PeriodNavigator({
	viewMode,
	onViewModeChange,
	periodLabel,
	onPrev,
	onNext,
}: PeriodNavigatorProps) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-4">
			<ToggleGroup<ViewMode>
				options={[
					{ value: 'week', label: 'Week' },
					{ value: 'month', label: 'Month' },
				]}
				value={viewMode}
				onChange={onViewModeChange}
			/>
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={onPrev}
					className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
					aria-label="Previous period"
				>
					‹
				</button>
				<span className="min-w-[12rem] text-center text-sm font-semibold text-slate-800">
					{periodLabel}
				</span>
				<button
					type="button"
					onClick={onNext}
					className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
					aria-label="Next period"
				>
					›
				</button>
			</div>
		</div>
	);
}
