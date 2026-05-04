export function normalizeSiteUrl(input: string): string {
	let s = input.trim();
	if (!s) return '';
	s = s.replace(/^https?:\/\//i, '');
	s = s.replace(/\/$/, '');
	if (!s.includes('.')) {
		s = `${s}.teamwork.com`;
	}
	return `https://${s}`;
}
