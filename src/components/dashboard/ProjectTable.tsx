import { useMemo, useState } from 'react';

import type { DashboardRow } from '../../types/models';

import { ProjectRow } from './ProjectRow';

type SortKey = 'name' | 'scheduled' | 'utilised' | 'variance' | 'utilisation';

interface ProjectTableProps {
	rows: DashboardRow[];
}

export function ProjectTable({ rows }: ProjectTableProps) {
	const [query, setQuery] = useState('');
	const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
		key: 'utilised',
		dir: 'desc',
	});

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		const list = q
			? rows.filter((r) => r.projectName.toLowerCase().includes(q))
			: [...rows];

		list.sort((a, b) => {
			const mul = sort.dir === 'asc' ? 1 : -1;
			switch (sort.key) {
				case 'name':
					return mul * a.projectName.localeCompare(b.projectName);
				case 'scheduled':
					return mul * (a.scheduledHours - b.scheduledHours);
				case 'utilised':
					return mul * (a.utilisedHours - b.utilisedHours);
				case 'variance':
					return mul * (a.variance - b.variance);
				case 'utilisation':
					return mul * (a.utilisationPercent - b.utilisationPercent);
				default:
					return 0;
			}
		});
		return list;
	}, [rows, query, sort]);

	function toggleSort(key: SortKey) {
		setSort((s) =>
			s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }
		);
	}

	const [showAll, setShowAll] = useState(false);
	const preview = showAll ? filtered : filtered.slice(0, 8);
	const hasMore = !showAll && filtered.length > preview.length;

	function sortIndicator(key: SortKey): string {
		if (sort.key !== key) return '';
		return sort.dir === 'asc' ? ' ↑' : ' ↓';
	}

	return (
		<div
			id="project-performance"
			className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm"
		>
			<div className="flex flex-wrap items-center justify-between gap-4">
				<h3 className="text-lg font-semibold text-slate-900">Project performance</h3>
				<div className="flex items-center gap-2">
					<input
						type="search"
						placeholder="Search projects…"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500/30 focus:ring-2"
						aria-label="Search projects"
					/>
					<span className="text-slate-400 text-xs" title="Filters coming soon">
						Filter
					</span>
				</div>
			</div>

			<div className="mt-4 overflow-x-auto">
				<table className="w-full min-w-[640px] text-left text-sm">
					<thead>
						<tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
							<th className="pb-2 pr-4 font-semibold">
								<button
									type="button"
									className="hover:text-slate-800"
									onClick={() => toggleSort('name')}
								>
									Project{sortIndicator('name')}
								</button>
							</th>
							<th className="pb-2 pr-4 text-right font-semibold">
								<button
									type="button"
									className="hover:text-slate-800"
									onClick={() => toggleSort('scheduled')}
								>
									Scheduled{sortIndicator('scheduled')}
								</button>
							</th>
							<th className="pb-2 pr-4 text-right font-semibold">
								<button
									type="button"
									className="hover:text-slate-800"
									onClick={() => toggleSort('utilised')}
								>
									Utilised{sortIndicator('utilised')}
								</button>
							</th>
							<th className="pb-2 pr-4 text-right font-semibold">
								<button
									type="button"
									className="hover:text-slate-800"
									onClick={() => toggleSort('variance')}
								>
									Variance{sortIndicator('variance')}
								</button>
							</th>
							<th className="pb-2 font-semibold text-right">
								<button
									type="button"
									className="hover:text-slate-800"
									onClick={() => toggleSort('utilisation')}
								>
									Utilisation %{sortIndicator('utilisation')}
								</button>
							</th>
						</tr>
					</thead>
					<tbody>
						{preview.map((row) => (
							<ProjectRow key={row.projectId} row={row} />
						))}
					</tbody>
				</table>
			</div>

			{hasMore ? (
				<button
					type="button"
					className="mt-4 text-sm font-medium text-indigo-700 hover:underline"
					onClick={() => setShowAll(true)}
				>
					View all projects ({filtered.length})
				</button>
			) : null}
		</div>
	);
}
