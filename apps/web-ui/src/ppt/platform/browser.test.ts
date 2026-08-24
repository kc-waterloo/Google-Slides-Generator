/**
 * browser.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { browserAdapter } from "./browser";
import { getPlatformAdapter } from "./index";

describe("browserAdapter", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
		vi.restoreAllMocks();
	});

	it("getPlatformAdapter returns browserAdapter when no electronAPI", () => {
		const adapter = getPlatformAdapter();
		expect(adapter).toBe(browserAdapter);
	});

	it("savePresentation creates a download link and clicks it", async () => {
		vi.useFakeTimers();

		const createObjectURL = vi
			.spyOn(URL, "createObjectURL")
			.mockReturnValue("blob:mock" as never);
		const revokeObjectURL = vi
			.spyOn(URL, "revokeObjectURL")
			.mockImplementation(() => {});

		let clicked = false;
		const origCreateElement = document.createElement.bind(document);
		vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
			const el = origCreateElement(tag);
			if (tag === "a") {
				el.click = () => { clicked = true; };
			}
			return el;
		});

		const result = await browserAdapter.savePresentation(new ArrayBuffer(8), "test.pptx");

		expect(createObjectURL).toHaveBeenCalled();
		expect(clicked).toBe(true);
		expect(revokeObjectURL).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1000);
		expect(revokeObjectURL).toHaveBeenCalled();
		expect(result).toBe(true);

		vi.useRealTimers();
	});

	it("savePresentation appends .pptx extension when missing", async () => {
		vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock" as never);
		vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

		let download = "";
		const origCreateElement = document.createElement.bind(document);
		vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
			const el = origCreateElement(tag);
			if (tag === "a") {
				Object.defineProperty(el, "download", {
					set(v: string) { download = v; },
					get: () => download,
				});
				el.click = () => {};
			}
			return el;
		});

		await browserAdapter.savePresentation(new ArrayBuffer(8), "no-ext");
		expect(download).toBe("no-ext.pptx");
	});

	it("openTemplate creates a file input and triggers click", () => {
		let clicked = false;
		const origCreateElement = document.createElement.bind(document);
		vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
			const el = origCreateElement(tag);
			if (tag === "input") {
				el.click = () => { clicked = true; };
			}
			return el;
		});

		browserAdapter.openTemplate();
		expect(clicked).toBe(true);
	});

	it("openTemplate resolves with file data when file is selected", async () => {
		const mockBuffer = new ArrayBuffer(8);
		const mockFile = new File([mockBuffer], "test.pptx", { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });

		let inputEl: HTMLInputElement | null = null;
		const origCreateElement = document.createElement.bind(document);
		vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
			const el = origCreateElement(tag);
			if (tag === "input") {
				inputEl = el as HTMLInputElement;
				el.click = () => {};
			}
			return el;
		});

		const promise = browserAdapter.openTemplate();

		Object.defineProperty(inputEl!, "files", {
			value: [mockFile],
			writable: true,
		});
		inputEl!.dispatchEvent(new Event("change"));

		const result = await promise;
		expect(result).not.toBeNull();
		expect(result!.name).toBe("test.pptx");
	});

	it("openTemplate resolves with null when no file is selected", async () => {
		let inputEl: HTMLInputElement | null = null;
		const origCreateElement = document.createElement.bind(document);
		vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
			const el = origCreateElement(tag);
			if (tag === "input") {
				inputEl = el as HTMLInputElement;
				el.click = () => {};
			}
			return el;
		});

		const promise = browserAdapter.openTemplate();

		Object.defineProperty(inputEl!, "files", {
			value: [],
			writable: true,
		});
		inputEl!.dispatchEvent(new Event("change"));

		const result = await promise;
		expect(result).toBeNull();
	});

	it("openTemplate resolves with null on dialog cancel (window focus without change)", async () => {
		vi.useFakeTimers();

		let clicked = false;
		const origCreateElement = document.createElement.bind(document);
		vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
			const el = origCreateElement(tag);
			if (tag === "input") {
				el.click = () => { clicked = true; };
			}
			return el;
		});

		const promise = browserAdapter.openTemplate();
		expect(clicked).toBe(true);

		window.dispatchEvent(new Event("focus"));
		vi.advanceTimersByTime(301);

		const result = await promise;
		expect(result).toBeNull();

		vi.useRealTimers();
	});

	it("openTemplate resolves with null when files is null", async () => {
		let inputEl: HTMLInputElement | null = null;
		const origCreateElement = document.createElement.bind(document);
		vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
			const el = origCreateElement(tag);
			if (tag === "input") {
				inputEl = el as HTMLInputElement;
				el.click = () => {};
			}
			return el;
		});

		const promise = browserAdapter.openTemplate();

		Object.defineProperty(inputEl!, "files", {
			value: null,
			writable: true,
		});
		inputEl!.dispatchEvent(new Event("change"));

		const result = await promise;
		expect(result).toBeNull();
	});
});

describe("getPlatformAdapter", () => {
	beforeEach(() => {
		delete (window as unknown as Record<string, unknown>).electronAPI;
	});

	it("returns browserAdapter when window.electronAPI is undefined", () => {
		expect(getPlatformAdapter()).toBe(browserAdapter);
	});

	it("returns electronAdapter when window.electronAPI exists", async () => {
		const { electronAdapter } = await import("./electron");
		(window as unknown as Record<string, unknown>).electronAPI = {} as never;
		expect(getPlatformAdapter()).toBe(electronAdapter);
	});
});
