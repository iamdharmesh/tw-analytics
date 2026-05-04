export function roundHours(value: number, decimals = 1): number {
	const f = 10 ** decimals;
	return Math.round(value * f) / f;
}

export function formatHours(value: number): string {
	return new Intl.NumberFormat(undefined, {
		maximumFractionDigits: 2,
		minimumFractionDigits: 2,
	}).format(value);
}

export function formatPercent(value: number): string {
	return `${roundHours(value, 1)}%`;
}

export function maskToken(token: string): string {
	if (token.length <= 8) {
		return '••••••••';
	}
	return `twp_••••••••${token.slice(-4)}`;
}
