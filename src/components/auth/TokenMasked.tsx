import { maskToken } from '../../utils/formatters';

interface TokenMaskedProps {
	token: string;
}

export function TokenMasked({ token }: TokenMaskedProps) {
	return (
		<span className="font-mono text-xs text-slate-500" title="Token masked">
			{maskToken(token)}
		</span>
	);
}
