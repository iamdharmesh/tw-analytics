import {
	addDays,
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	parseISO,
	startOfMonth,
	startOfWeek,
} from 'date-fns';

import type { PeriodBounds, ViewMode } from '../types/models';

export function toDateString(d: Date): string {
	return format(d, 'yyyy-MM-dd');
}

export function getWeekBounds(date: Date): PeriodBounds {
	const start = startOfWeek(date, { weekStartsOn: 1 });
	const end = endOfWeek(date, { weekStartsOn: 1 });
	return {
		start,
		end,
		startStr: toDateString(start),
		endStr: toDateString(end),
	};
}

export function getMonthBounds(date: Date): PeriodBounds {
	const start = startOfMonth(date);
	const end = endOfMonth(date);
	return {
		start,
		end,
		startStr: toDateString(start),
		endStr: toDateString(end),
	};
}

export function getPeriodBounds(anchor: Date, viewMode: ViewMode): PeriodBounds {
	return viewMode === 'week' ? getWeekBounds(anchor) : getMonthBounds(anchor);
}

export function shiftPeriodAnchor(anchor: Date, viewMode: ViewMode, delta: number): Date {
	if (viewMode === 'week') {
		return addDays(anchor, delta * 7);
	}
	return addMonths(anchor, delta);
}

export function parseEntryDate(value: string): string {
	try {
		const d = parseISO(value);
		return format(d, 'yyyy-MM-dd');
	} catch {
		return value.slice(0, 10);
	}
}

export function daysInWeekFromStart(weekStart: Date): Date[] {
	return eachDayOfInterval({
		start: weekStart,
		end: addDays(weekStart, 6),
	});
}

export function formatPeriodRange(
	start: Date,
	end: Date,
	viewMode: ViewMode
): string {
	if (viewMode === 'week') {
		return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
	}
	return format(start, 'MMMM yyyy');
}
