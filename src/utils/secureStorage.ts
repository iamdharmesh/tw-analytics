const DEVICE_KEY = 'tw_device_id';
const SALT = new TextEncoder().encode('tw-analytics-v1');

function getOrCreateDeviceId(): string {
	let id = localStorage.getItem(DEVICE_KEY);
	if (!id) {
		id = crypto.randomUUID();
		localStorage.setItem(DEVICE_KEY, id);
	}
	return id;
}

async function deriveKey(): Promise<CryptoKey> {
	const material = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(getOrCreateDeviceId()),
		'PBKDF2',
		false,
		['deriveKey']
	);
	return crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: SALT,
			iterations: 100000,
			hash: 'SHA-256',
		},
		material,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
}

export async function encryptSecret(plain: string): Promise<string> {
	const key = await deriveKey();
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const enc = new TextEncoder().encode(plain);
	const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc);
	const combined = new Uint8Array(iv.length + cipher.byteLength);
	combined.set(iv);
	combined.set(new Uint8Array(cipher), iv.length);
	return btoa(String.fromCharCode(...combined));
}

export async function decryptSecret(encoded: string): Promise<string> {
	const key = await deriveKey();
	const combined = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
	const iv = combined.slice(0, 12);
	const data = combined.slice(12);
	const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
	return new TextDecoder().decode(plain);
}
