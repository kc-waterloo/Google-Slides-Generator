/**
 * electron.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { electronAdapter } from "../electron";

describe("electronAdapter", () => {
	beforeEach(() => {
		(window as unknown as Record<string, unknown>).electronAPI = undefined;
	});

	afterEach(() => {
		(window as unknown as Record<string, unknown>).electronAPI = undefined;
	});

	describe("openTemplate", () => {
		it("throws when electronAPI is not available", async () => {
			await expect(electronAdapter.openTemplate()).rejects.toThrow("electronAPI not available");
		});

		it("returns null when user cancels the dialog", async () => {
			window.electronAPI = {
				openTemplate: vi.fn().mockResolvedValue(null),
			} as never;

			const result = await electronAdapter.openTemplate();
			expect(result).toBeNull();
		});

		it("returns template info when dialog succeeds", async () => {
			window.electronAPI = {
				openTemplate: vi.fn().mockResolvedValue({
					name: "template.pptx",
					buffer: new ArrayBuffer(10),
				}),
			} as never;

			const result = await electronAdapter.openTemplate();
			expect(result).toEqual({
				name: "template.pptx",
				buffer: new ArrayBuffer(10),
			});
		});
	});

	describe("savePresentation", () => {
		it("throws when electronAPI is not available", async () => {
			await expect(electronAdapter.savePresentation(new ArrayBuffer(10), "test.pptx")).rejects.toThrow("electronAPI not available");
		});

		it("returns true when save succeeds", async () => {
			window.electronAPI = {
				savePresentation: vi.fn().mockResolvedValue(true),
			} as never;

			const result = await electronAdapter.savePresentation(new ArrayBuffer(10), "test.pptx");
			expect(result).toBe(true);
		});

		it("returns false when user cancels save", async () => {
			window.electronAPI = {
				savePresentation: vi.fn().mockResolvedValue(false),
			} as never;

			const result = await electronAdapter.savePresentation(new ArrayBuffer(10), "test.pptx");
			expect(result).toBe(false);
		});
	});
});
