import { useEffect } from 'react';

import { loadPersistedAuth } from '../stores/authPersistence';
import { useAuthStore } from '../stores/authStore';
import { Loader } from './shared/Loader';

interface AuthBootstrapProps {
	children: React.ReactNode;
}

export function AuthBootstrap({ children }: AuthBootstrapProps) {
	const phase = useAuthStore((s) => s.phase);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			const persisted = await loadPersistedAuth();
			if (cancelled) return;
			if (persisted) {
				useAuthStore.getState().setAuthed(persisted);
			} else {
				useAuthStore.getState().setGuest();
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	if (phase === 'unknown') {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader label="Starting…" />
			</div>
		);
	}

	return children;
}
