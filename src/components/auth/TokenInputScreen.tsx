import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiError, TeamworkClient } from '../../api/client';
import { fetchMe } from '../../api/me';
import { clearPersistedAuth, savePersistedAuth } from '../../stores/authPersistence';
import { useAuthStore } from '../../stores/authStore';
import { normalizeSiteUrl } from '../../utils/siteUrl';

const HELP_URL =
	'https://apidocs.teamwork.com/guides/teamwork/getting-started-with-the-teamwork-com-api';

export function TokenInputScreen() {
	const navigate = useNavigate();
	const setValidating = useAuthStore((s) => s.setValidating);
	const setAuthed = useAuthStore((s) => s.setAuthed);
	const setAuthError = useAuthStore((s) => s.setAuthError);
	const phase = useAuthStore((s) => s.phase);
	const authError = useAuthStore((s) => s.authError);

	const [siteInput, setSiteInput] = useState('');
	const [tokenInput, setTokenInput] = useState('');
	const [showToken, setShowToken] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const siteUrl = normalizeSiteUrl(siteInput);
		const apiToken = tokenInput.trim();
		if (!siteUrl || !apiToken) {
			setAuthError('Enter your site URL and API token.');
			return;
		}
		setValidating();
		try {
			const client = new TeamworkClient({ siteUrl, apiToken });
			const me = await fetchMe(client);
			await savePersistedAuth({
				siteUrl,
				apiToken,
				userId: me.id,
				displayName: me.displayName,
			});
			setAuthed({
				siteUrl,
				apiToken,
				userId: me.id,
				displayName: me.displayName,
			});
			navigate('/dashboard', { replace: true });
		} catch (err) {
			if (err instanceof ApiError && err.status === 401) {
				setAuthError('Invalid API token.');
			} else if (err instanceof TypeError) {
				setAuthError(
					'Cannot reach Teamwork. Ensure CORS is enabled in Site Settings and the URL is correct.'
				);
			} else if (err instanceof Error) {
				setAuthError(err.message);
			} else {
				setAuthError('Connection failed.');
			}
		}
	}

	function handleClearStored() {
		clearPersistedAuth();
		useAuthStore.getState().reset();
		useAuthStore.getState().setGuest();
	}

	const busy = phase === 'validating';

	return (
		<div className="flex min-h-screen items-center justify-center p-6">
			<div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-indigo-100/50">
				<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white">
					<svg
						className="h-7 w-7"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M13 10V3L4 14h7v7l9-11h-7z"
						/>
					</svg>
				</div>
				<h1 className="mt-6 text-center text-2xl font-bold text-slate-900">
					Connect to Teamwork
				</h1>
				<p className="mt-2 text-center text-sm text-slate-500">
					Enter your API configuration to synchronize your projects.
				</p>

				<form onSubmit={handleSubmit} className="mt-8 space-y-5">
					<div>
						<label
							htmlFor="site-url"
							className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
						>
							Site URL
						</label>
						<input
							id="site-url"
							type="text"
							autoComplete="url"
							placeholder="yoursite.teamwork.com"
							value={siteInput}
							onChange={(ev) => setSiteInput(ev.target.value)}
							className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none ring-indigo-500/30 focus:ring-2"
							disabled={busy}
						/>
					</div>
					<div>
						<label
							htmlFor="api-token"
							className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
						>
							API token
						</label>
						<div className="relative mt-1">
							<input
								id="api-token"
								type={showToken ? 'text' : 'password'}
								autoComplete="off"
								placeholder="twp_xxxxxxxxxxxxxxx"
								value={tokenInput}
								onChange={(ev) => setTokenInput(ev.target.value)}
								className="w-full rounded-lg border border-slate-200 py-2.5 pl-3 pr-10 text-sm outline-none ring-indigo-500/30 focus:ring-2"
								disabled={busy}
							/>
							<button
								type="button"
								className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
								onClick={() => setShowToken((s) => !s)}
								aria-label={showToken ? 'Hide token' : 'Show token'}
							>
								🔑
							</button>
						</div>
					</div>

					{authError ? (
						<p className="text-sm text-red-600" role="alert">
							{authError}
						</p>
					) : null}

					<button
						type="submit"
						disabled={busy}
						className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-900 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-800 disabled:opacity-60"
					>
						{busy ? 'Connecting…' : 'Connect →'}
					</button>
				</form>

				<div className="mt-6 rounded-lg border border-indigo-100 bg-indigo-50/80 p-4 text-xs text-slate-700">
					<p className="font-semibold text-amber-800">Security</p>
					<p className="mt-1 leading-relaxed">
						Your token is stored locally in your browser and is never sent to our
						servers. Use <strong>Clear stored data</strong> when finished on a shared
						device.
					</p>
				</div>

				<div className="mt-6 flex flex-col gap-2 text-center text-sm">
					<a
						href={HELP_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="text-indigo-700 hover:underline"
					>
						How do I find my Teamwork API Token? ↗
					</a>
					<button
						type="button"
						onClick={handleClearStored}
						className="text-slate-500 hover:text-slate-800"
					>
						Clear stored data
					</button>
				</div>
			</div>
		</div>
	);
}
