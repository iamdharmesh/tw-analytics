import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { TokenInputScreen } from './components/auth/TokenInputScreen';
import { AuthBootstrap } from './components/AuthBootstrap';
import { Dashboard } from './components/dashboard/Dashboard';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ScheduledHoursScreen } from './components/scheduled/ScheduledHoursScreen';
import { useAuthStore } from './stores/authStore';

function ProtectedLayout() {
	const phase = useAuthStore((s) => s.phase);
	if (phase !== 'authed') {
		return <Navigate to="/" replace />;
	}
	return <Outlet />;
}

function HomeRoute() {
	const phase = useAuthStore((s) => s.phase);
	if (phase === 'authed') {
		return <Navigate to="/dashboard" replace />;
	}
	return <TokenInputScreen />;
}

export function App() {
	return (
		<HashRouter>
			<AuthBootstrap>
				<Routes>
					<Route path="/" element={<HomeRoute />} />
					<Route element={<ProtectedLayout />}>
						<Route element={<DashboardLayout />}>
							<Route path="/dashboard" element={<Dashboard />} />
							<Route path="/scheduled-hours" element={<ScheduledHoursScreen />} />
						</Route>
					</Route>
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</AuthBootstrap>
		</HashRouter>
	);
}
