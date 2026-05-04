import clsx from 'clsx';

export interface ToggleOption<T extends string> {
	value: T;
	label: string;
}

interface ToggleGroupProps<T extends string> {
	options: ToggleOption<T>[];
	value: T;
	onChange: (v: T) => void;
	className?: string;
}

export function ToggleGroup<T extends string>({
	options,
	value,
	onChange,
	className,
}: ToggleGroupProps<T>) {
	return (
		<div
			className={clsx(
				'inline-flex rounded-lg border border-slate-200 bg-slate-100/80 p-0.5',
				className
			)}
			role="tablist"
		>
			{options.map((opt) => (
				<button
					key={opt.value}
					type="button"
					role="tab"
					aria-selected={value === opt.value}
					onClick={() => onChange(opt.value)}
					className={clsx(
						'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
						value === opt.value
							? 'bg-white text-indigo-700 shadow-sm'
							: 'text-slate-600 hover:text-slate-900'
					)}
				>
					{opt.label}
				</button>
			))}
		</div>
	);
}
