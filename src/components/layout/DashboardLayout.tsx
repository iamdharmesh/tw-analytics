import { Outlet } from 'react-router-dom';

import { Footer } from './Footer';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function DashboardLayout() {
	return (
		<div className="flex min-h-screen flex-col">
			<div className="flex flex-1">
				<Sidebar />
				<div className="flex min-w-0 flex-1 flex-col">
					<Header />
					<main className="flex-1 overflow-auto px-6 py-6">
						<Outlet />
					</main>
					<Footer />
				</div>
			</div>
		</div>
	);
}
