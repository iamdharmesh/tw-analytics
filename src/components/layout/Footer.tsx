import { useEffect, useState } from 'react';

const VERSION = 'v0.1.0';

export function Footer() {
	const [latencyMs, setLatencyMs] = useState<number | null>(null);

	useEffect(() => {
		const t0 = performance.now();
		const id = requestAnimationFrame(() => {
			setLatencyMs(Math.round(performance.now() - t0));
		});
		return () => cancelAnimationFrame(id);
	}, []);

	return (
		<footer className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/80 bg-white/60 px-6 py-3 text-xs text-slate-500">
			<div className="flex flex-wrap items-center gap-6">
				<span>
					<span className="font-semibold text-slate-600">VERSION</span> {VERSION}
				</span>
				<span>
					<span className="font-semibold text-slate-600">LATENCY</span>{' '}
					{latencyMs != null ? `${latencyMs}ms` : '—'}
				</span>
			</div>
			<p className="text-slate-400">
				Developed with ❤️ entirely using AI.
			</p>
		</footer>
	);
}
