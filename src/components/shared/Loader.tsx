import clsx from 'clsx';

interface LoaderProps {
	className?: string;
	label?: string;
}

export function Loader({ className, label = 'Loading…' }: LoaderProps) {
	return (
		<div
			className={clsx('flex flex-col items-center justify-center gap-3 py-12', className)}
			role="status"
			aria-live="polite"
			aria-label={label}
		>
			<div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
			<p className="text-sm text-slate-500">{label}</p>
		</div>
	);
}
