/**
 * google-oauth.ts
 *
 * Created by Min-Kyu Lee on 01-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

export interface TokenInfo {
	accessToken: string;
	expiresAt: number;
	scopes: string[];
}

const SCOPES = [
	"https://www.googleapis.com/auth/script.projects",
	"https://www.googleapis.com/auth/drive.file",
	"https://www.googleapis.com/auth/script.deployments",
];

const TOKEN_STORAGE_KEY = "gsg-google-token";

export function loadStoredToken(): TokenInfo | null {
	try {
		const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
		if (!raw) return null;
		const parsed: TokenInfo = JSON.parse(raw);
		if (!parsed.accessToken || !parsed.expiresAt || Date.now() >= parsed.expiresAt) {
			localStorage.removeItem(TOKEN_STORAGE_KEY);
			return null;
		}
		return parsed;
	} catch {
		localStorage.removeItem(TOKEN_STORAGE_KEY);
		return null;
	}
}

export function storeToken(token: TokenInfo): void {
	localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token));
}

export function clearToken(): void {
	localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function isTokenValid(token: TokenInfo | null): token is TokenInfo {
	return token !== null && Date.now() < token.expiresAt;
}

declare const google: {
	accounts: {
		oauth2: {
			initTokenClient: (config: {
				client_id: string;
				scope: string;
				prompt: string;
				callback: (response: {
					access_token?: string;
					expires_in?: number;
					error?: string;
					error_description?: string;
				}) => void;
			}) => { requestAccessToken: () => void };
		};
	};
};

export async function requestAccessToken(
	clientId: string,
	scopes: string[] = SCOPES,
): Promise<TokenInfo> {
	return new Promise((resolve, reject) => {
		if (!clientId) {
			reject(new Error("Client ID is required"));
			return;
		}
		if (typeof google === "undefined" || !google.accounts?.oauth2) {
			reject(new Error("Google Identity Services library not loaded"));
			return;
		}

		const tokenClient = google.accounts.oauth2.initTokenClient({
			client_id: clientId,
			scope: scopes.join(" "),
			prompt: "consent",
			callback: (response) => {
				if (response.error) {
					reject(new Error(response.error_description ?? response.error ?? "Authentication failed"));
					return;
				}
				if (!response.access_token) {
					reject(new Error("No access token in response"));
					return;
				}
				const token: TokenInfo = {
					accessToken: response.access_token,
					expiresAt: Date.now() + (response.expires_in ?? 3600) * 1000,
					scopes,
				};
				storeToken(token);
				resolve(token);
			},
		});

		tokenClient.requestAccessToken();
	});
}
