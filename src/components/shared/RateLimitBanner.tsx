import { useEffect, useState } from 'react';

interface RateLimitBannerProps {
	resetAtEpoch: number;
}

export function RateLimitBanner({ resetAtEpoch }: RateLimitBannerProps) {
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		const t = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(t);
	}, []);

	const remaining = Math.max(0, resetAtEpoch * 1000 - now);
	const secs = Math.ceil(remaining / 1000);

	return (
		<div
			className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
			role="status"
		>
			Rate limited by Teamwork API. Retry in approximately {secs}s.
		</div>
	);
}
