import { useEffect, useState } from 'react';

export function useAnimatedValue(target: number, durationMs = 700): number {
	const [value, setValue] = useState(0);

	useEffect(() => {
		let raf = 0;
		const start = performance.now();
		const from = value;
		const step = (now: number) => {
			const t = Math.min(1, (now - start) / durationMs);
			const eased = 1 - (1 - t) ** 2;
			setValue(from + (target - from) * eased);
			if (t < 1) raf = requestAnimationFrame(step);
		};
		raf = requestAnimationFrame(step);
		return () => cancelAnimationFrame(raf);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- animate when target changes only
	}, [target]);

	return value;
}
