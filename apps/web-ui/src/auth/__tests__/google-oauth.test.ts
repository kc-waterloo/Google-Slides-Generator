/**
 * google-oauth.test.ts
 *
 * Created by Min-Kyu Lee on 01-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import {
	loadStoredToken,
	storeToken,
	clearToken,
	isTokenValid,
	requestAccessToken,
} from "../google-oauth";

beforeAll(() => {
	vi.stubGlobal("google", {
		accounts: {
			oauth2: {
				initTokenClient: vi.fn(),
			},
		},
	});
});

afterAll(() => {
	vi.unstubAllGlobals();
});

beforeEach(() => {
	localStorage.clear();
});

describe("storeToken / loadStoredToken", () => {
	it("stores and loads a token", () => {
		const token = { accessToken: "abc", expiresAt: Date.now() + 3600000, scopes: ["a"] };
		storeToken(token);
		const loaded = loadStoredToken();
		expect(loaded?.accessToken).toBe("abc");
	});

	it("returns null for expired token", () => {
		localStorage.setItem("gsg-google-token", JSON.stringify({
			accessToken: "expired", expiresAt: Date.now() - 1000, scopes: [],
		}));
		expect(loadStoredToken()).toBeNull();
	});

	it("returns null when no token stored", () => {
		expect(loadStoredToken()).toBeNull();
	});

	it("returns null on corrupted JSON", () => {
		localStorage.setItem("gsg-google-token", "not-json");
		expect(loadStoredToken()).toBeNull();
	});

	it("storeToken with expiresAt = 0 results in expired token", () => {
		storeToken({ accessToken: "tok", expiresAt: 0, scopes: [] });
		expect(loadStoredToken()).toBeNull();
	});

	it("storeToken with negative expiresAt results in expired token", () => {
		storeToken({ accessToken: "tok", expiresAt: -1000, scopes: [] });
		expect(loadStoredToken()).toBeNull();
	});

	it("loadStoredToken returns null when stored object is missing accessToken", () => {
		localStorage.setItem("gsg-google-token", JSON.stringify({ expiresAt: Date.now() - 1000 }));
		expect(loadStoredToken()).toBeNull();
	});

	it("loadStoredToken returns null when stored object is missing expiresAt", () => {
		localStorage.setItem("gsg-google-token", JSON.stringify({ accessToken: "abc" }));
		expect(loadStoredToken()).toBeNull();
	});
});

describe("clearToken", () => {
	it("removes the stored token", () => {
		storeToken({ accessToken: "abc", expiresAt: Date.now() + 3600000, scopes: [] });
		clearToken();
		expect(loadStoredToken()).toBeNull();
	});

	it("clearToken when no token exists is a no-op", () => {
		expect(() => clearToken()).not.toThrow();
	});
});

describe("isTokenValid", () => {
	const future = Date.now() + 3600000;
	const past = Date.now() - 3600000;

	it("returns true for valid token in the future", () => {
		expect(isTokenValid({ accessToken: "t", expiresAt: future, scopes: [] })).toBe(true);
	});

	it("returns false for expired token", () => {
		expect(isTokenValid({ accessToken: "t", expiresAt: past, scopes: [] })).toBe(false);
	});

	it("returns false for null token", () => {
		expect(isTokenValid(null)).toBe(false);
	});

	it("isTokenValid returns false for expiresAt exactly equal to Date.now()", () => {
		vi.useFakeTimers();
		const now = Date.now();
		expect(isTokenValid({ accessToken: "t", expiresAt: now, scopes: [] })).toBe(false);
		vi.useRealTimers();
	});
});

describe("requestAccessToken", () => {
	it("resolves with token info on successful auth", async () => {
		vi.stubGlobal("google", {
			accounts: {
				oauth2: {
					initTokenClient: vi.fn((config: { callback: (r: Record<string, unknown>) => void }) => {
						config.callback({ access_token: "new-token", expires_in: 3600 });
						return { requestAccessToken: vi.fn() };
					}),
				},
			},
		});

		const token = await requestAccessToken("client-id", ["scope1", "scope2"]);
		expect(token.accessToken).toBe("new-token");
		expect(token.scopes).toEqual(["scope1", "scope2"]);
	});

	it("rejects on auth error", async () => {
		vi.stubGlobal("google", {
			accounts: {
				oauth2: {
					initTokenClient: vi.fn((config: { callback: (r: Record<string, unknown>) => void }) => {
						config.callback({ error: "access_denied", error_description: "User denied" });
						return { requestAccessToken: vi.fn() };
					}),
				},
			},
		});

		await expect(requestAccessToken("client-id")).rejects.toThrow("User denied");
	});

	it("rejects when access_token is missing from response", async () => {
		vi.stubGlobal("google", {
			accounts: {
				oauth2: {
					initTokenClient: vi.fn((config: { callback: (r: Record<string, unknown>) => void }) => {
						config.callback({ foo: "bar" });
						return { requestAccessToken: vi.fn() };
					}),
				},
			},
		});

		await expect(requestAccessToken("client-id")).rejects.toThrow("No access token in response");
	});

	it("rejects when GIS library is not available", async () => {
		vi.stubGlobal("google", undefined);

		await expect(requestAccessToken("client-id")).rejects.toThrow("Google Identity Services library not loaded");
	});

	it("rejects with fallback message when error_description missing", async () => {
		vi.stubGlobal("google", {
			accounts: {
				oauth2: {
					initTokenClient: vi.fn((config: { callback: (r: Record<string, unknown>) => void }) => {
						config.callback({ error: "access_denied" });
						return { requestAccessToken: vi.fn() };
					}),
				},
			},
		});

		await expect(requestAccessToken("client-id")).rejects.toThrow("access_denied");
	});

	it("requestAccessToken with empty clientId rejects", async () => {
		vi.stubGlobal("google", {
			accounts: {
				oauth2: {
					initTokenClient: vi.fn((config: { callback: (r: Record<string, unknown>) => void }) => {
						config.callback({ access_token: "tok", expires_in: 3600, scope: "test" });
						return { requestAccessToken: vi.fn() };
					}),
				},
			},
		});

		await expect(requestAccessToken("", [])).rejects.toThrow();
	});

	it("requestAccessToken with expires_in: 0 from server uses 0", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(5000000);

		vi.stubGlobal("google", {
			accounts: {
				oauth2: {
					initTokenClient: vi.fn((config: { callback: (r: Record<string, unknown>) => void }) => {
						config.callback({ access_token: "tok", expires_in: 0, scope: "test" });
						return { requestAccessToken: vi.fn() };
					}),
				},
			},
		});

		const token = await requestAccessToken("client-id", ["test"]);
		expect(token.accessToken).toBe("tok");
		expect(token.expiresAt).toBe(5000000);

		vi.useRealTimers();
	});
});
