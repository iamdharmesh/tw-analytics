import { NavLink, useNavigate } from 'react-router-dom';

import { clearPersistedAuth } from '../../stores/authPersistence';
import { useAuthStore } from '../../stores/authStore';
import { useDataStore } from '../../stores/dataStore';
import { useDashboardStore } from '../../stores/dashboardStore';

const HELP =
	'https://apidocs.teamwork.com/guides/teamwork/getting-started-with-the-teamwork-com-api';

function resetAll() {
	clearPersistedAuth();
	useAuthStore.getState().reset();
	useAuthStore.getState().setGuest();
	useDataStore.getState().reset();
	useDashboardStore.getState().reset();
}

export function Sidebar() {
	const navigate = useNavigate();

	function logout() {
		resetAll();
		navigate('/', { replace: true });
	}

	return (
		<aside className="flex w-56 shrink-0 flex-col border-r border-slate-200/80 bg-white/80 py-6 backdrop-blur">
			<div className="px-4">
				<p className="text-lg font-bold text-indigo-950">Teamwork Tracker</p>
				<p className="mt-1 text-xs text-slate-500">Personal Analytics</p>
			</div>
			<nav className="mt-8 flex flex-col gap-1 px-2">
				<NavLink
					to="/dashboard"
					className={({ isActive }) =>
						[
							'rounded-lg px-3 py-2 text-sm font-medium',
							isActive
								? 'bg-indigo-600 text-white'
								: 'text-slate-700 hover:bg-slate-100',
						].join(' ')
					}
				>
					Overview
				</NavLink>
				<span
					className="cursor-not-allowed rounded-lg px-3 py-2 text-sm text-slate-400"
					title="Coming soon"
				>
					Calendar
				</span>
				<NavLink
					to="/scheduled-hours"
					className={({ isActive }) =>
						[
							'rounded-lg px-3 py-2 text-sm font-medium',
							isActive
								? 'bg-indigo-600 text-white'
								: 'text-slate-700 hover:bg-slate-100',
						].join(' ')
					}
				>
					Scheduled Hours
				</NavLink>
			</nav>
			<div className="mt-auto flex flex-col gap-1 border-t border-slate-100 px-2 pt-6">
				<a
					href={HELP}
					target="_blank"
					rel="noopener noreferrer"
					className="rounded-lg px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-50"
				>
					Help
				</a>
				<button
					type="button"
					onClick={logout}
					className="rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100"
				>
					Logout
				</button>
			</div>
		</aside>
	);
}
