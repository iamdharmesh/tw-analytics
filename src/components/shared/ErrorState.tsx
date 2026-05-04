interface ErrorStateProps {
	title?: string;
	message: string;
	onRetry?: () => void;
}

export function ErrorState({
	title = 'Something went wrong',
	message,
	onRetry,
}: ErrorStateProps) {
	return (
		<div
			className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-6 text-center"
			role="alert"
		>
			<p className="font-semibold text-red-900">{title}</p>
			<p className="mt-2 text-sm text-red-800">{message}</p>
			{onRetry ? (
				<button
					type="button"
					onClick={onRetry}
					className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
				>
					Retry
				</button>
			) : null}
		</div>
	);
}
