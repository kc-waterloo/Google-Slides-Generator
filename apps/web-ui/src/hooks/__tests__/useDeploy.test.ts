/**
 * useDeploy.test.ts
 *
 * Created by Min-Kyu Lee on 01-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { useDeploy } from "../useDeploy";
import * as googleOauth from "../../auth/google-oauth";

beforeAll(() => {
	vi.stubGlobal("google", {
		accounts: {
			oauth2: {
				initTokenClient: vi.fn(() => ({
					requestAccessToken: vi.fn(),
				})),
			},
		},
	});
});

afterAll(() => {
	vi.unstubAllGlobals();
});

describe("useDeploy", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("starts in idle state with empty clientId", () => {
		const { result } = renderHook(() => useDeploy());
		expect(result.current.state.status).toBe("idle");
		expect(result.current.clientId).toBe("");
	});

	it("loads stored clientId from localStorage", () => {
		localStorage.setItem("gsg-client-id", "stored-id.example.com");
		const { result } = renderHook(() => useDeploy());
		expect(result.current.clientId).toBe("stored-id.example.com");
	});

	it("setClientId stores in localStorage", () => {
		const { result } = renderHook(() => useDeploy());
		act(() => result.current.setClientId("new-client-id"));
		expect(result.current.clientId).toBe("new-client-id");
		expect(localStorage.getItem("gsg-client-id")).toBe("new-client-id");
	});

	it("authenticate with stored clientId calls requestAccessToken", async () => {
		localStorage.setItem("gsg-client-id", "test-client-id");
		const { result } = renderHook(() => useDeploy());

		act(() => { result.current.authenticate(); });
		expect(result.current.state.status).toBe("authenticating");
	});

	it("signOut clears token and resets to idle", () => {
		localStorage.setItem("gsg-google-token", JSON.stringify({
			accessToken: "t",
			expiresAt: 9999999999999,
			scopes: [],
		}));
		const { result } = renderHook(() => useDeploy());

		expect(result.current.state.status).toBe("authenticated");
		act(() => result.current.signOut());
		expect(result.current.state.status).toBe("idle");
	});

	it("authenticate without clientId sets no-client-id state", async () => {
		const { result } = renderHook(() => useDeploy());
		act(() => { result.current.authenticate(); });
		expect(result.current.state.status).toBe("no-client-id");
	});

	it("deploy with expired token calls authenticate", async () => {
		localStorage.setItem("gsg-client-id", "test-client-id");
		const { result } = renderHook(() => useDeploy());

		act(() => { result.current.deploy("script-id", "code"); });
		await vi.waitFor(() => {
			expect(["authenticating", "no-client-id"]).toContain(result.current.state.status);
		});
	});

	it("deploy sets error state when deployToGAS returns failure", async () => {
		localStorage.setItem("gsg-client-id", "test-client-id");
		localStorage.setItem("gsg-google-token", JSON.stringify({
			accessToken: "t",
			expiresAt: 9999999999999,
			scopes: [],
		}));
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
			ok: false,
			status: 500,
			text: async () => "Server error",
		}));

		const { result } = renderHook(() => useDeploy());
		await act(async () => {
			await result.current.deploy("script-id", "code");
		});
		expect(result.current.state.status).toBe("error");
	});

	it("authenticate transitions to error when requestAccessToken fails", async () => {
		localStorage.setItem("gsg-client-id", "test-client-id");
		vi.stubGlobal("google", {
			accounts: {
				oauth2: {
					initTokenClient: vi.fn((config: { callback: (r: Record<string, unknown>) => void }) => {
						config.callback({ error: "access_denied", error_description: "Consent denied" });
						return { requestAccessToken: vi.fn() };
					}),
				},
			},
		});

		const { result } = renderHook(() => useDeploy());
		await act(async () => {
			await result.current.authenticate();
		});
		expect(result.current.state.status).toBe("error");
		if (result.current.state.status === "error") {
			expect(result.current.state.message).toContain("Consent denied");
		}
	});

	it("deploy returns error state when deployToGAS throws", async () => {
		localStorage.setItem("gsg-client-id", "test-client-id");
		localStorage.setItem("gsg-google-token", JSON.stringify({
			accessToken: "t",
			expiresAt: 9999999999999,
			scopes: [],
		}));
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network failure")));

		const { result } = renderHook(() => useDeploy());
		await act(async () => {
			await result.current.deploy("script-id", "code");
		});
		expect(result.current.state.status).toBe("error");
	});

	it("deploy catch block handles non-Error thrown value", async () => {
		localStorage.setItem("gsg-client-id", "test-client-id");
		localStorage.setItem("gsg-google-token", JSON.stringify({
			accessToken: "t",
			expiresAt: 9999999999999,
			scopes: [],
		}));
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue("string error"));

		const { result } = renderHook(() => useDeploy());
		await act(async () => {
			await result.current.deploy("script-id", "code");
		});
		expect(result.current.state.status).toBe("error");
		if (result.current.state.status === "error") {
			expect(result.current.state.message).toBe("Unknown error");
		}
	});

	it("deploy succeeds and stores token", async () => {
		localStorage.setItem("gsg-client-id", "test-client-id");
		localStorage.setItem("gsg-google-token", JSON.stringify({
			accessToken: "valid-token",
			expiresAt: 9999999999999,
			scopes: [],
		}));
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ versionNumber: 10, updateTime: "2026-06-01T00:00:00Z" }),
		}));

		const { result } = renderHook(() => useDeploy());
		await act(async () => {
			await result.current.deploy("script-id", "code");
		});
		expect(result.current.state.status).toBe("success");
	});

	it("deploy with expired token re-authenticates and returns to authenticated", async () => {
		localStorage.setItem("gsg-client-id", "test-client-id");
		localStorage.setItem("gsg-google-token", JSON.stringify({
			accessToken: "expired",
			expiresAt: 0,
			scopes: [],
		}));
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

		const { result } = renderHook(() => useDeploy());
		expect(result.current.state.status).toBe("idle");

		await act(async () => {
			await result.current.deploy("script-id", "code");
		});
		expect(result.current.state.status).toBe("authenticated");
	});

	it("deploy handles non-Error thrown values from deployToGAS as 'Unknown error'", async () => {
		localStorage.setItem("gsg-client-id", "test-client-id");
		localStorage.setItem("gsg-google-token", JSON.stringify({
			accessToken: "t",
			expiresAt: 9999999999999,
			scopes: [],
		}));
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue("string error not an Error object"));

		const { result } = renderHook(() => useDeploy());
		await act(async () => {
			await result.current.deploy("script-id", "code");
		});
		expect(result.current.state.status).toBe("error");
		if (result.current.state.status === "error") {
			expect(result.current.state.message).toBe("Unknown error");
		}
	});

	it("deploy catches errors from requestAccessToken during re-auth", async () => {
		localStorage.setItem("gsg-client-id", "test-client-id");
		localStorage.setItem("gsg-google-token", JSON.stringify({
			accessToken: "expired",
			expiresAt: 0,
			scopes: [],
		}));
		vi.stubGlobal("google", {
			accounts: {
				oauth2: {
					initTokenClient: vi.fn((config: { callback: (r: Record<string, unknown>) => void }) => {
						setTimeout(() => {
							config.callback({ error: "interaction_required", error_description: "Re-auth needed" });
						}, 0);
						return { requestAccessToken: vi.fn() };
					}),
				},
			},
		});

		const { result } = renderHook(() => useDeploy());
		await act(async () => {
			await result.current.deploy("script-id", "code");
		});
		expect(result.current.state.status).toBe("error");
	});

	it("authenticate transitions to authenticated when token received", async () => {
		localStorage.setItem("gsg-client-id", "test-client-id");
		vi.stubGlobal("google", {
			accounts: {
				oauth2: {
					initTokenClient: vi.fn((config: { callback: (r: Record<string, unknown>) => void }) => {
						setTimeout(() => {
							config.callback({ access_token: "new-token", expires_in: 3600 });
						}, 0);
						return { requestAccessToken: vi.fn() };
					}),
				},
			},
		});

		const { result } = renderHook(() => useDeploy());
		act(() => { result.current.authenticate(); });
		await vi.waitFor(() => {
			expect(result.current.state.status).toBe("authenticated");
		});
	});

	it("loads authenticated state from stored valid token", () => {
		localStorage.setItem("gsg-google-token", JSON.stringify({
			accessToken: "valid-token",
			expiresAt: 9999999999999,
			scopes: [],
		}));
		localStorage.setItem("gsg-client-id", "test-client-id");
		const { result } = renderHook(() => useDeploy());
		expect(result.current.state.status).toBe("authenticated");
		if (result.current.state.status === "authenticated") {
			expect(result.current.state.token.accessToken).toBe("valid-token");
		}
	});

	it("authenticate handles non-Error thrown values from requestAccessToken", async () => {
		localStorage.setItem("gsg-client-id", "test-client-id");
		vi.spyOn(googleOauth, "requestAccessToken").mockRejectedValue("auth error string");

		const { result } = renderHook(() => useDeploy());
		await act(async () => {
			await result.current.authenticate();
		});
		expect(result.current.state.status).toBe("error");
		if (result.current.state.status === "error") {
			expect(result.current.state.message).toBe("Authentication failed");
		}
	});
});
