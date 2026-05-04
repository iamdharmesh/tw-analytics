import { NavLink, useNavigate } from 'react-router-dom';

import { TokenMasked } from '../auth/TokenMasked';
import { clearPersistedAuth } from '../../stores/authPersistence';
import { useAuthStore } from '../../stores/authStore';
import { useDataStore } from '../../stores/dataStore';
import { useDashboardStore } from '../../stores/dashboardStore';

const tabClass = ({ isActive }: { isActive: boolean }) =>
	[
		'rounded-md px-3 py-1.5 text-sm font-medium',
		isActive ? 'bg-white text-indigo-800 shadow-sm' : 'text-slate-600 hover:text-slate-900',
	].join(' ');

export function Header() {
	const navigate = useNavigate();
	const displayName = useAuthStore((s) => s.displayName);
	const apiToken = useAuthStore((s) => s.apiToken);
	const siteUrl = useAuthStore((s) => s.siteUrl);

	function changeToken() {
		clearPersistedAuth();
		useAuthStore.getState().reset();
		useAuthStore.getState().setGuest();
		useDataStore.getState().reset();
		useDashboardStore.getState().reset();
		navigate('/', { replace: true });
	}

	return (
		<header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-6 py-4 backdrop-blur">
			<nav className="flex flex-wrap items-center gap-6">
				<div className="flex rounded-lg border border-slate-200 bg-slate-100/80 p-0.5">
					<NavLink to="/dashboard" end className={tabClass}>
						Dashboard
					</NavLink>
					<span
						className="cursor-not-allowed rounded-md px-3 py-1.5 text-sm text-slate-400"
						title="Coming soon"
					>
						Reports
					</span>
					<span
						className="cursor-not-allowed rounded-md px-3 py-1.5 text-sm text-slate-400"
						title="Coming soon"
					>
						Settings
					</span>
				</div>
			</nav>
			<div className="flex flex-wrap items-center gap-4">
				<div className="hidden text-right text-xs text-slate-500 sm:block">
					<p className="font-medium text-slate-700">{displayName}</p>
					<p className="truncate max-w-[14rem]" title={siteUrl ?? ''}>
						{siteUrl?.replace(/^https?:\/\//, '')}
					</p>
					{apiToken ? <TokenMasked token={apiToken} /> : null}
				</div>
				<button
					type="button"
					onClick={changeToken}
					className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-900 hover:bg-indigo-100"
				>
					Change token
				</button>
			</div>
		</header>
	);
}
