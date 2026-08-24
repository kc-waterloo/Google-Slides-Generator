/**
 * useKeyboardShortcuts.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKeyboardShortcuts } from "../useKeyboardShortcuts";

const createOptions = (overrides: Record<string, unknown> = {}) => ({
	showImportDialog: false,
	showResetConfirm: false,
	sidebarOpen: false,
	setSidebarOpen: vi.fn(),
	setShowResetConfirm: vi.fn(),
	resetAll: vi.fn(),
	undo: vi.fn(),
	redo: vi.fn(),
	generatedCode: null,
	showToast: vi.fn(),
	...overrides,
});

const fireKey = (key: string, mods: { ctrl?: boolean; meta?: boolean; shift?: boolean } = {}) => {
	window.dispatchEvent(new KeyboardEvent("keydown", {
		key,
		ctrlKey: mods.ctrl ?? false,
		metaKey: mods.meta ?? false,
		shiftKey: mods.shift ?? false,
		bubbles: true,
		cancelable: true,
	}));
};

describe("useKeyboardShortcuts", () => {
	beforeEach(() => {
		Object.defineProperty(navigator, "clipboard", {
			value: { writeText: vi.fn().mockResolvedValue(undefined) },
			writable: true,
			configurable: true,
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("calls setShowResetConfirm on Escape when no dialog is open", () => {
		const options = createOptions();
		renderHook(() => useKeyboardShortcuts(options));

		fireKey("Escape");
		expect(options.setShowResetConfirm).toHaveBeenCalledWith(true);
	});

	it("does not call setShowResetConfirm on Escape when import dialog is open", () => {
		const options = createOptions({ showImportDialog: true });
		renderHook(() => useKeyboardShortcuts(options));

		fireKey("Escape");
		expect(options.setShowResetConfirm).not.toHaveBeenCalled();
	});

	it("does not call setShowResetConfirm on Escape when reset confirm is open", () => {
		const options = createOptions({ showResetConfirm: true });
		renderHook(() => useKeyboardShortcuts(options));

		fireKey("Escape");
		expect(options.setShowResetConfirm).not.toHaveBeenCalled();
	});

	it("closes sidebar on Escape when sidebar is open", () => {
		const options = createOptions({ sidebarOpen: true });
		renderHook(() => useKeyboardShortcuts(options));

		fireKey("Escape");
		expect(options.setSidebarOpen).toHaveBeenCalledWith(false);
		expect(options.setShowResetConfirm).not.toHaveBeenCalled();
	});

	it("calls undo on Ctrl+Z", () => {
		const options = createOptions();
		renderHook(() => useKeyboardShortcuts(options));

		fireKey("z", { ctrl: true });
		expect(options.undo).toHaveBeenCalled();
	});

	it("calls redo on Ctrl+Shift+Z", () => {
		const options = createOptions();
		renderHook(() => useKeyboardShortcuts(options));

		fireKey("z", { ctrl: true, shift: true });
		expect(options.redo).toHaveBeenCalled();
	});

	it("calls undo on Meta+Z", () => {
		const options = createOptions();
		renderHook(() => useKeyboardShortcuts(options));

		fireKey("z", { meta: true });
		expect(options.undo).toHaveBeenCalled();
	});

	it("calls undo on Ctrl+Z when Caps Lock is on (uppercase Z)", () => {
		const options = createOptions();
		renderHook(() => useKeyboardShortcuts(options));

		fireKey("Z", { ctrl: true });
		expect(options.undo).toHaveBeenCalled();
	});

	it("calls redo on Meta+Shift+Z", () => {
		const options = createOptions();
		renderHook(() => useKeyboardShortcuts(options));

		fireKey("z", { meta: true, shift: true });
		expect(options.redo).toHaveBeenCalled();
	});

	it("does nothing on Ctrl+Enter when generatedCode is null", () => {
		const options = createOptions({ generatedCode: null });
		renderHook(() => useKeyboardShortcuts(options));

		const evt = new KeyboardEvent("keydown", { key: "Enter", ctrlKey: true, bubbles: true, cancelable: true });
		const preventDefault = vi.spyOn(evt, "preventDefault");

		window.dispatchEvent(evt);
		expect(preventDefault).not.toHaveBeenCalled();
	});

	it("copies to clipboard on Ctrl+Enter when generatedCode exists", async () => {
		Object.defineProperty(navigator, "clipboard", {
			value: { writeText: vi.fn().mockResolvedValue(undefined) },
			writable: true,
			configurable: true,
		});
		const options = createOptions({ generatedCode: "test code" });
		renderHook(() => useKeyboardShortcuts(options));

		fireKey("Enter", { ctrl: true });
		await vi.waitFor(() => {
			expect(options.showToast).toHaveBeenCalledWith("Copied to clipboard");
		});
	});

	it("falls back to execCommand when clipboard API is unavailable", async () => {
		Object.defineProperty(navigator, "clipboard", {
			value: undefined,
			writable: true,
			configurable: true,
		});
		const execCommand = vi.fn();
		document.execCommand = execCommand;
		const createElement = vi.spyOn(document, "createElement");
		const appendChild = vi.spyOn(document.body, "appendChild");
		const removeChild = vi.spyOn(document.body, "removeChild");

		const options = createOptions({ generatedCode: "fallback code" });
		renderHook(() => useKeyboardShortcuts(options));

		fireKey("Enter", { ctrl: true });
		await vi.waitFor(() => {
			expect(options.showToast).toHaveBeenCalledWith("Copied to clipboard");
		});
		expect(execCommand).toHaveBeenCalledWith("copy");
		expect(createElement).toHaveBeenCalledWith("textarea");
		expect(appendChild).toHaveBeenCalled();
		expect(removeChild).toHaveBeenCalled();
	});

	it("shows failed toast when clipboard write fails", async () => {
		Object.defineProperty(navigator, "clipboard", {
			value: { writeText: vi.fn().mockRejectedValue(new Error("fail")) },
			writable: true,
			configurable: true,
		});
		const options = createOptions({ generatedCode: "test code" });
		renderHook(() => useKeyboardShortcuts(options));

		fireKey("Enter", { ctrl: true });
		await vi.waitFor(() => {
			expect(options.showToast).toHaveBeenCalledWith("Failed to copy");
		});
	});

	it("shows failed toast when clipboard writeText throws synchronously", async () => {
		Object.defineProperty(navigator, "clipboard", {
			value: { writeText: vi.fn(() => { throw new Error("sync fail"); }) },
			writable: true,
			configurable: true,
		});
		const options = createOptions({ generatedCode: "test code" });
		renderHook(() => useKeyboardShortcuts(options));

		fireKey("Enter", { ctrl: true });
		await vi.waitFor(() => {
			expect(options.showToast).toHaveBeenCalledWith("Failed to copy");
		});
	});
});
