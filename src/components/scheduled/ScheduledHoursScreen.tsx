import { useState, useEffect, useMemo } from 'react';
import {
	format,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	isWeekend,
	addMonths,
	subMonths,
} from 'date-fns';

import { useDataStore } from '../../stores/dataStore';
import { useAuthStore } from '../../stores/authStore';
import { useScheduledHoursStore } from '../../stores/scheduledHoursStore';
import { TeamworkClient } from '../../api/client';
import { fetchAllProjects } from '../../api/projects';
import { Loader } from '../shared/Loader';

export function ScheduledHoursScreen() {
	const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
	const [loading, setLoading] = useState(false);

	const projects = useDataStore((s) => s.projects);
	const setProjects = useDataStore((s) => s.setProjects);

	const siteUrl = useAuthStore((s) => s.siteUrl);
	const apiToken = useAuthStore((s) => s.apiToken);

	const hoursState = useScheduledHoursStore((s) => s.hours);
	const setHours = useScheduledHoursStore((s) => s.setHours);

	useEffect(() => {
		async function loadProjects() {
			if (projects && projects.length > 0) return;
			if (!siteUrl || !apiToken) return;

			setLoading(true);
			try {
				const client = new TeamworkClient({ siteUrl, apiToken });
				const fetched = await fetchAllProjects(client);
				setProjects(fetched, Date.now());
			} catch (e) {
				console.error('Failed to fetch projects', e);
			} finally {
				setLoading(false);
			}
		}

		void loadProjects();
	}, [projects, siteUrl, apiToken, setProjects]);

	const days = useMemo(() => {
		const start = startOfMonth(currentMonth);
		const end = endOfMonth(currentMonth);
		const allDays = eachDayOfInterval({ start, end });
		return allDays.filter((d) => !isWeekend(d));
	}, [currentMonth]);

	function handlePrevMonth() {
		setCurrentMonth((m) => subMonths(m, 1));
	}

	function handleNextMonth() {
		setCurrentMonth((m) => addMonths(m, 1));
	}

	function handleHourChange(projectId: string, dateStr: string, value: string) {
		const num = parseFloat(value);
		if (isNaN(num)) {
			// Instead of setting 0, we can also delete the key, but setting 0 is fine
			// Actually setting it to 0 is perfectly valid, or we could remove it from state to keep it clean.
			// 0 acts exactly as empty in aggregations anyway.
			// Let's use 0 for now. Actually, let's use a function that supports deleting or 0.
			// The state type expects number. 
			// But an empty input means "no scheduled hours". We should store 0.
			setHours(projectId, dateStr, 0);
		} else {
			setHours(projectId, dateStr, num);
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold text-slate-900">Scheduled Hours</h1>
				<p className="text-slate-600">
					Manually enter expected hours for each project by day.
				</p>
			</div>

			<div className="flex items-center gap-4">
				<button
					type="button"
					onClick={handlePrevMonth}
					className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
				>
					Previous
				</button>
				<h2 className="min-w-[120px] text-center text-lg font-semibold text-slate-900">
					{format(currentMonth, 'MMMM yyyy')}
				</h2>
				<button
					type="button"
					onClick={handleNextMonth}
					className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
				>
					Next
				</button>
			</div>

			{loading && (!projects || projects.length === 0) ? (
				<Loader label="Loading projects…" />
			) : (
				<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm max-w-full">
					<table className="w-full border-collapse text-left text-sm text-slate-700">
						<thead>
							<tr className="border-b border-slate-200 bg-slate-50">
								<th className="sticky left-0 z-10 min-w-[250px] border-r border-slate-200 bg-slate-50 px-4 py-3 font-semibold">
									Project
								</th>
								{days.map((day) => (
									<th
										key={day.toISOString()}
										className="min-w-[64px] border-r border-slate-200 px-1 py-3 text-center font-semibold"
									>
										<div className="text-xs uppercase text-slate-500">{format(day, 'EEE')}</div>
										<div className="text-sm">{format(day, 'd')}</div>
									</th>
								))}
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200">
							{projects?.map((project) => (
								<tr key={project.id} className="hover:bg-slate-50/50">
									<td
										className="sticky left-0 z-10 truncate border-r border-slate-200 bg-white px-4 py-3 font-medium shadow-[1px_0_0_0_#e2e8f0]"
										title={project.name}
									>
										{project.name}
									</td>
									{days.map((day) => {
										const dateStr = format(day, 'yyyy-MM-dd');
										const val = hoursState[project.id]?.[dateStr];
										const displayVal = val === 0 || val === undefined ? '' : val;
										return (
											<td
												key={day.toISOString()}
												className="border-r border-slate-200 p-0"
											>
												<input
													type="number"
													step="0.5"
													min="0"
													max="24"
													value={displayVal}
													onChange={(e) =>
														handleHourChange(project.id, dateStr, e.target.value)
													}
													className="h-full w-full min-h-[44px] bg-transparent text-center text-sm outline-none focus:bg-indigo-50 focus:ring-2 focus:ring-inset focus:ring-indigo-500 hover:bg-slate-100"
												/>
											</td>
										);
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
