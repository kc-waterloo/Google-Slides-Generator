/**
 * gas-deploy.test.ts
 *
 * Created by Min-Kyu Lee on 01-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { deployToGAS, updateScriptContent } from "../gas-deploy";

beforeAll(() => {
	vi.stubGlobal("fetch", vi.fn());
});

afterAll(() => {
	vi.unstubAllGlobals();
});

describe("updateScriptContent", () => {
	it("calls the Apps Script API and returns version info", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ versionNumber: 5, updateTime: "2026-01-01T00:00:00Z" }),
		}));

		const result = await updateScriptContent("script-id", "function test() {}", "token");

		expect(result.versionNumber).toBe(5);
		expect(result.updateTime).toBe("2026-01-01T00:00:00Z");
	});

	it("throws on API error with parsed message", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
			ok: false,
			status: 403,
			text: async () => JSON.stringify({ error: { message: "Forbidden" } }),
		}));

		await expect(updateScriptContent("id", "code", "token")).rejects.toThrow("Apps Script API error (403): Forbidden");
	});

	it("falls back to err.message when error.message is absent", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
			ok: false,
			status: 400,
			text: async () => JSON.stringify({ message: "Bad Request" }),
		}));

		await expect(updateScriptContent("id", "code", "token")).rejects.toThrow("Apps Script API error (400): Bad Request");
	});

	it("falls back to raw body when JSON has no error or message", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
			ok: false,
			status: 402,
			text: async () => JSON.stringify({ foo: "bar" }),
		}));

		await expect(updateScriptContent("id", "code", "token")).rejects.toThrow("Apps Script API error (402): {\"foo\":\"bar\"}");
	});

	it("throws on API error with raw text when JSON parse fails", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
			ok: false,
			status: 500,
			text: async () => "Internal Server Error",
		}));

		await expect(updateScriptContent("id", "code", "token")).rejects.toThrow("Apps Script API error (500): Internal Server Error");
	});

	it("updateScriptContent with empty scriptId throws", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
			ok: false,
			status: 400,
			text: async () => JSON.stringify({ error: { message: "Invalid script ID" } }),
		}));

		await expect(updateScriptContent("", "code", "token")).rejects.toThrow();
	});

	it("updateScriptContent with empty code succeeds (empty content)", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ versionNumber: 1, updateTime: "2026-01-01T00:00:00Z" }),
		}));

		const result = await updateScriptContent("script-id", "", "token");
		expect(result.versionNumber).toBe(1);
	});

	it("updateScriptContent handles 401 Unauthorized", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
			ok: false,
			status: 401,
			statusText: "Unauthorized",
			text: async () => JSON.stringify({ error: { message: "Token expired" } }),
		}));

		await expect(updateScriptContent("id", "code", "token")).rejects.toThrow("Apps Script API error (401): Token expired");
	});

	it("updateScriptContent handles 404 Not Found", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
			ok: false,
			status: 404,
			text: async () => JSON.stringify({ error: { message: "Script not found" } }),
		}));

		await expect(updateScriptContent("id", "code", "token")).rejects.toThrow("Apps Script API error (404): Script not found");
	});

	it("updateScriptContent handles fetch network failure", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network failure")));

		await expect(updateScriptContent("id", "code", "token")).rejects.toThrow("Network failure");
	});

	it("updateScriptContent throws when API returns 200 without versionNumber", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ updateTime: "2026-01-01T00:00:00Z" }),
		}));

		await expect(updateScriptContent("id", "code", "token")).rejects.toThrow("Apps Script API returned success without versionNumber");
	});
});

describe("deployToGAS", () => {
	it("returns success result when update succeeds", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ versionNumber: 10, updateTime: "2026-06-01T00:00:00Z" }),
		}));

		const result = await deployToGAS("script-id", "code", "token");

		expect(result.success).toBe(true);
		expect(result.versionNumber).toBe(10);
	});

	it("returns error result when update throws", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

		const result = await deployToGAS("script-id", "code", "token");

		expect(result.success).toBe(false);
		expect(result.error).toBe("Network error");
	});

	it("returns generic error when thrown value is not an Error", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue("string error"));

		const result = await deployToGAS("script-id", "code", "token");

		expect(result.success).toBe(false);
		expect(result.error).toBe("Unknown error");
	});

	it("deployToGAS preserves message from non-Error thrown objects", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue({ message: "custom message" }));

		const result = await deployToGAS("script-id", "code", "token");

		expect(result.success).toBe(false);
		expect(result.error).toBe("custom message");
	});
});
