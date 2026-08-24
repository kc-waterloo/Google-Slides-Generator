/**
 * tests/preload.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { createMockContextBridge, createMockIpcRenderer } from "./test-utils";

const mockContextBridge = createMockContextBridge();
const mockIpcRenderer = createMockIpcRenderer();

vi.mock("electron", () => ({
	default: {
		contextBridge: mockContextBridge,
		ipcRenderer: mockIpcRenderer,
	},
}));

await import("../src/preload/index");

function getElectronAPI(): Record<string, unknown> {
	const call = mockContextBridge.exposeInMainWorld.mock.calls[0] as unknown[];
	return call[1] as Record<string, unknown>;
}

describe("preload", () => {
	it("exposes electronAPI via contextBridge", () => {
		expect(mockContextBridge.exposeInMainWorld).toHaveBeenCalledTimes(1);
		expect(mockContextBridge.exposeInMainWorld).toHaveBeenCalledWith(
			"electronAPI",
			expect.any(Object),
		);
	});

	it("openTemplate delegates to ipcRenderer.invoke", () => {
		const api = getElectronAPI();
		(api.openTemplate as () => void)();

		expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("dialog:open-template");
	});

	it("savePresentation delegates to ipcRenderer.invoke with buffer and name", () => {
		const api = getElectronAPI();
		const buffer = new ArrayBuffer(8);

		(api.savePresentation as (b: ArrayBuffer, n: string) => void)(buffer, "test.pptx");

		expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
			"dialog:save-pptx",
			buffer,
			"test.pptx",
		);
	});

	it("getRecentFiles delegates to ipcRenderer.invoke", () => {
		const api = getElectronAPI();
		(api.getRecentFiles as () => void)();

		expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("file:get-recent");
	});

	it("addRecentFile delegates to ipcRenderer.invoke with file path", () => {
		const api = getElectronAPI();
		(api.addRecentFile as (p: string) => void)("/path/to/file.pptx");

		expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("file:add-recent", "/path/to/file.pptx");
	});

	it("onFileDrop registers ipcRenderer.on listener for file-drop and returns cleanup", () => {
		const api = getElectronAPI();
		const callback = vi.fn();

		const cleanup = (api.onFileDrop as (cb: (fp: string) => void) => void)(callback);

		const dropCall = mockIpcRenderer.on.mock.calls.find(
			(c: string[]) => c[0] === "file-drop",
		);
		expect(dropCall).toBeDefined();

		const listener = dropCall![1] as (event: unknown, filePath: string) => void;
		listener(undefined, "/dropped/file.pptx");

		expect(callback).toHaveBeenCalledWith("/dropped/file.pptx");

		cleanup();
		expect(mockIpcRenderer.removeListener).toHaveBeenCalledWith("file-drop", listener);
	});

	it("onMenuSaveAs registers ipcRenderer.on listener for menu-save-as and returns cleanup", () => {
		const api = getElectronAPI();
		const callback = vi.fn();

		const cleanup = (api.onMenuSaveAs as (cb: () => void) => void)(callback);

		const saveCall = mockIpcRenderer.on.mock.calls.find(
			(c: string[]) => c[0] === "menu-save-as",
		);
		expect(saveCall).toBeDefined();

		const listener = saveCall![1] as () => void;
		listener();

		expect(callback).toHaveBeenCalled();

		cleanup();
		expect(mockIpcRenderer.removeListener).toHaveBeenCalledWith("menu-save-as", listener);
	});

	it("readFileBuffer delegates to ipcRenderer.invoke with file path", () => {
		const api = getElectronAPI();
		(api.readFileBuffer as (p: string) => void)("/path/to/file.pptx");

		expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("file:read-buffer", "/path/to/file.pptx");
	});
});
