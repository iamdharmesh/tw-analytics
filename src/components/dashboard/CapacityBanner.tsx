import { useCallback, useEffect, useState } from 'react';

import type { ViewMode } from '../../types/models';
import { formatHours } from '../../utils/formatters';

const CAPACITY_KEY = 'tw_weekly_capacity';
const DEFAULT_CAPACITY = 40;

function getStoredCapacity(): number {
	try {
		const v = localStorage.getItem(CAPACITY_KEY);
		if (v) return parseFloat(v) || DEFAULT_CAPACITY;
	} catch { /* ignore */ }
	return DEFAULT_CAPACITY;
}

function storeCapacity(h: number): void {
	try {
		localStorage.setItem(CAPACITY_KEY, String(h));
	} catch { /* ignore */ }
}

interface CapacityBannerProps {
	totalUtilised: number;
	totalScheduled: number;
	viewMode: ViewMode;
	periodStart: Date;
	periodEnd: Date;
}

export function CapacityBanner({
	totalUtilised,
	totalScheduled,
	viewMode,
	periodStart,
	periodEnd,
}: CapacityBannerProps) {
	const [capacity, setCapacity] = useState(getStoredCapacity);
	const [editing, setEditing] = useState(false);
	const [inputVal, setInputVal] = useState(String(capacity));

	useEffect(() => {
		setCapacity(getStoredCapacity());
	}, []);

	const saveCapacity = useCallback(() => {
		const v = parseFloat(inputVal);
		if (!isNaN(v) && v > 0) {
			setCapacity(v);
			storeCapacity(v);
		}
		setEditing(false);
	}, [inputVal]);

	// Only show for week view
	if (viewMode !== 'week') return null;

	const over = totalUtilised - capacity;
	const isOvertime = over > 0;

	// Check if under-pacing: more than 50% of period elapsed, but less than 50% of scheduled done
	const now = new Date();
	const periodMs = periodEnd.getTime() - periodStart.getTime();
	const elapsedMs = Math.max(0, now.getTime() - periodStart.getTime());
	const periodElapsedPct = periodMs > 0 ? (elapsedMs / periodMs) * 100 : 0;
	const isUnderpacing =
		!isOvertime &&
		totalScheduled > 0 &&
		periodElapsedPct > 50 &&
		totalUtilised < totalScheduled * 0.5;

	if (!isOvertime && !isUnderpacing) return null;

	const bannerClass = isOvertime
		? 'border-amber-200 bg-amber-50 text-amber-900'
		: 'border-blue-200 bg-blue-50 text-blue-900';

	const icon = isOvertime ? '⚡' : '📉';

	const message = isOvertime
		? `You've logged ${formatHours(totalUtilised)}h this week — ${formatHours(over)}h over your ${formatHours(capacity)}h capacity. Consider rebalancing.`
		: `You've logged ${formatHours(totalUtilised)}h against ${formatHours(totalScheduled)}h scheduled with over half the week gone. You may need to catch up.`;

	return (
		<div
			className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${bannerClass}`}
		>
			<span className="shrink-0 text-base">{icon}</span>
			<div className="flex-1">
				<p className="font-medium">{message}</p>
				<div className="mt-1 flex items-center gap-2">
					{editing ? (
						<>
							<input
								type="number"
								min="1"
								max="168"
								step="1"
								value={inputVal}
								onChange={(e) => setInputVal(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') saveCapacity();
									if (e.key === 'Escape') setEditing(false);
								}}
								onBlur={saveCapacity}
								className="w-16 rounded border border-current/20 bg-white/70 px-2 py-0.5 text-xs outline-none"
								autoFocus
							/>
							<span className="text-xs opacity-70">h/week</span>
						</>
					) : (
						<button
							type="button"
							className="text-xs font-medium underline decoration-dotted underline-offset-2 opacity-70 hover:opacity-100"
							onClick={() => {
								setInputVal(String(capacity));
								setEditing(true);
							}}
						>
							⚙️ Weekly capacity: {formatHours(capacity)}h
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
