import { extractArray } from './extract';

export class ApiError extends Error {
	status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
	}
}

export class RateLimitError extends Error {
	resetAtEpoch: number;

	constructor(resetAtEpoch: number, message = 'Rate limited') {
		super(message);
		this.name = 'RateLimitError';
		this.resetAtEpoch = resetAtEpoch;
	}
}

export interface TeamworkClientConfig {
	siteUrl: string;
	apiToken: string;
}

export class RateLimiterState {
	remaining = 150;
	resetAtEpoch = 0;

	update(headers: Headers): void {
		const rem = headers.get('X-Rate-Limit-Remaining');
		const reset = headers.get('X-Rate-Limit-Reset');
		if (rem != null) this.remaining = parseInt(rem, 10) || this.remaining;
		if (reset != null) this.resetAtEpoch = parseInt(reset, 10) || 0;
	}

	async throttleIfNeeded(): Promise<void> {
		if (this.remaining >= 20) return;
		const waitMs = Math.max(0, this.resetAtEpoch * 1000 - Date.now());
		await new Promise((r) => setTimeout(r, Math.min(waitMs, 5000)));
	}
}

function basicAuthHeader(apiToken: string): string {
	const raw = `${apiToken}:x`;
	/* Teamwork: API key as username, any non-empty password */
	return `Basic ${btoa(raw)}`;
}

export class TeamworkClient {
	readonly config: TeamworkClientConfig;
	readonly rateLimiter: RateLimiterState;

	constructor(config: TeamworkClientConfig) {
		this.config = config;
		this.rateLimiter = new RateLimiterState();
	}

	async get<T = unknown>(
		path: string,
		params?: Record<string, string | number | boolean | undefined>
	): Promise<T> {
		await this.rateLimiter.throttleIfNeeded();
		const url = new URL(path.startsWith('/') ? path : `/${path}`, this.config.siteUrl);
		if (params) {
			for (const [k, v] of Object.entries(params)) {
				if (v === undefined) continue;
				url.searchParams.set(k, String(v));
			}
		}
		const res = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				Authorization: basicAuthHeader(this.config.apiToken),
				Accept: 'application/json',
			},
		});
		this.rateLimiter.update(res.headers);
		if (res.status === 429) {
			const reset = parseInt(res.headers.get('X-Rate-Limit-Reset') || '0', 10);
			throw new RateLimitError(reset || Math.floor(Date.now() / 1000) + 60);
		}
		const text = await res.text();
		if (!res.ok) {
			throw new ApiError(res.status, text.slice(0, 500) || res.statusText);
		}
		if (!text) return {} as T;
		try {
			return JSON.parse(text) as T;
		} catch {
			throw new ApiError(res.status, 'Invalid JSON response');
		}
	}
}

export function extractTimelogs(json: unknown): Record<string, unknown>[] {
	return extractArray(json, ['timelogs', 'timeLogs', 'timelog']);
}

export function extractProjects(json: unknown): Record<string, unknown>[] {
	return extractArray(json, ['projects', 'project']);
}
