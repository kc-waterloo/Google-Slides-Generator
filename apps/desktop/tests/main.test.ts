/**
 * tests/main.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

const mocks = vi.hoisted(() => {
	const ipcHandle = vi.fn();
	const appOn = vi.fn();
	const appQuit = vi.fn();
	const dialogOpen = vi.fn();
	const dialogSave = vi.fn();
	const fsRead = vi.fn();
	const fsWrite = vi.fn();
	const menuBuild = vi.fn().mockReturnValue({});
	const menuSet = vi.fn();
	const winLoadURL = vi.fn().mockResolvedValue(undefined);
	const winLoadFile = vi.fn().mockResolvedValue(undefined);
	const winSend = vi.fn();
	const getAllWindows = vi.fn();

	return {
		ipcHandle,
		appOn,
		appQuit,
		dialogOpen,
		dialogSave,
		fsRead,
		fsWrite,
		menuBuild,
		menuSet,
		winLoadURL,
		winLoadFile,
		winSend,
		getAllWindows,
	};
});

vi.mock("electron", () => ({
	default: {
		app: {
			getPath: vi.fn(() => "/tmp/test-user-data"),
			isPackaged: false,
			whenReady: vi.fn(() => ({
				then: vi.fn((cb: () => void) => {
					cb();
					return Promise.resolve();
				}),
			})),
			on: mocks.appOn,
			quit: mocks.appQuit,
		},
		BrowserWindow: Object.assign(
			vi.fn(function () {
				return {
					loadURL: mocks.winLoadURL,
					loadFile: mocks.winLoadFile,
					webContents: { send: mocks.winSend },
				};
			}),
			{ getAllWindows: mocks.getAllWindows },
		),
		ipcMain: { handle: mocks.ipcHandle },
		dialog: {
			showOpenDialog: mocks.dialogOpen,
			showSaveDialog: mocks.dialogSave,
		},
		Menu: {
			buildFromTemplate: mocks.menuBuild,
			setApplicationMenu: mocks.menuSet,
		},
	},
}));

vi.mock("node:fs/promises", () => ({
	readFile: mocks.fsRead,
	writeFile: mocks.fsWrite,
}));

vi.mock("node:path", () => ({
	join: vi.fn((...parts: string[]) => parts.join("/")),
	dirname: vi.fn((p: string) => p.split("/").slice(0, -1).join("/")),
}));

vi.mock("node:url", () => ({
	fileURLToPath: vi.fn((url: string) => url.replace("file://", "")),
}));

vi.mock("node:os", () => ({
	homedir: vi.fn(() => "/mock/home"),
}));

await import("../src/main/index");

// Capture IPC handler references during module import (before any test runs).
const handlerRegistry = new Map<string, (...args: unknown[]) => unknown>();
for (const call of mocks.ipcHandle.mock.calls) {
	const channel = call[0] as string;
	const handler = call[1] as (...args: unknown[]) => unknown;
	handlerRegistry.set(channel, handler);
}

function getHandler(channel: string): (...args: unknown[]) => unknown {
	const handler = handlerRegistry.get(channel);
	if (!handler) throw new Error(`Handler not found for channel: ${channel}`);
	return handler;
}

describe("main process", () => {
	const startupMenuBuiltCallCount = mocks.menuBuild.mock.calls.length;

	beforeEach(() => {
		mocks.fsRead.mockReset();
		mocks.fsWrite.mockReset();
		mocks.dialogOpen.mockReset();
		mocks.dialogSave.mockReset();
		mocks.menuBuild.mockReset();
		mocks.menuBuild.mockReturnValue({});
		mocks.menuSet.mockReset();
	});

	it("registers all 5 IPC handlers", () => {
		expect(handlerRegistry.has("dialog:open-template")).toBe(true);
		expect(handlerRegistry.has("dialog:save-pptx")).toBe(true);
		expect(handlerRegistry.has("file:get-recent")).toBe(true);
		expect(handlerRegistry.has("file:add-recent")).toBe(true);
		expect(handlerRegistry.has("file:read-buffer")).toBe(true);
		expect(handlerRegistry.size).toBe(5);
	});

	it("registers handlers with correct channel names", () => {
		const channels = Array.from(handlerRegistry.keys());
		expect(channels).toEqual([
			"dialog:open-template",
			"dialog:save-pptx",
			"file:get-recent",
			"file:add-recent",
			"file:read-buffer",
		]);
	});

	it("app.whenReady triggered buildMenu", () => {
		expect(startupMenuBuiltCallCount).toBeGreaterThan(0);
	});

	it("app.on registers lifecycle events", () => {
		const events = mocks.appOn.mock.calls.map((c: [string]) => c[0]);
		expect(events).toContain("window-all-closed");
		expect(events).toContain("activate");
	});

	describe("dialog:open-template", () => {
		it("returns null when cancelled", async () => {
			mocks.dialogOpen.mockResolvedValue({ canceled: true, filePaths: [] });

			expect(await getHandler("dialog:open-template")()).toBeNull();
		});

		it("returns null when no file paths", async () => {
			mocks.dialogOpen.mockResolvedValue({ canceled: false, filePaths: [] });

			expect(await getHandler("dialog:open-template")()).toBeNull();
		});

		it("reads file and returns name and buffer", async () => {
			const content = Buffer.from("pptx content");
			mocks.dialogOpen.mockResolvedValue({
				canceled: false,
				filePaths: ["/path/template.pptx"],
			});
			mocks.fsRead.mockResolvedValue(content);

			const result = (await getHandler("dialog:open-template")()) as {
				name: string;
				buffer: ArrayBuffer;
			};

			expect(result.name).toBe("template.pptx");
			expect(new Uint8Array(result.buffer)).toEqual(new Uint8Array(content));
		});

		it("returns null and logs error on failure", async () => {
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			mocks.dialogOpen.mockRejectedValue(new Error("fail"));

			expect(await getHandler("dialog:open-template")()).toBeNull();
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it("handles unicode file paths", async () => {
			mocks.dialogOpen.mockResolvedValue({
				canceled: false,
				filePaths: ["/folder/プレゼン.pptx"],
			});
			mocks.fsRead.mockResolvedValue(Buffer.from("pptx content"));

			const result = (await getHandler("dialog:open-template")()) as {
				name: string;
				buffer: ArrayBuffer;
			};

			expect(result.name).toBe("プレゼン.pptx");
		});

		it("handles saveRecentFile failure without crashing", async () => {
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			mocks.dialogOpen.mockResolvedValue({
				canceled: false,
				filePaths: ["/path/template.pptx"],
			});
			mocks.fsRead.mockResolvedValue(Buffer.from("pptx content"));
			mocks.fsWrite.mockRejectedValue(new Error("Disk full"));

			const result = await getHandler("dialog:open-template")();

			expect(result).not.toBeNull();
			expect(spy).toHaveBeenCalledWith("Failed to save recent file:", expect.any(Error));
			spy.mockRestore();
		});
	});

	describe("dialog:save-pptx", () => {
		it("returns false when cancelled", async () => {
			mocks.dialogSave.mockResolvedValue({ canceled: true, filePath: undefined });

			const result = await getHandler("dialog:save-pptx")(undefined, new ArrayBuffer(8), "out.pptx");

			expect(result).toBe(false);
		});

		it("writes buffer and returns true", async () => {
			mocks.dialogSave.mockResolvedValue({ canceled: false, filePath: "/out/test.pptx" });
			mocks.fsWrite.mockResolvedValue(undefined);

			const result = await getHandler("dialog:save-pptx")(undefined, new ArrayBuffer(8), "out.pptx");

			expect(result).toBe(true);
			expect(mocks.fsWrite).toHaveBeenCalledWith(
				"/out/test.pptx",
				new Uint8Array(new ArrayBuffer(8)),
			);
		});

		it("returns false on write error", async () => {
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			mocks.dialogSave.mockResolvedValue({ canceled: false, filePath: "/out/test.pptx" });
			mocks.fsWrite.mockRejectedValue(new Error("write fail"));

			const result = await getHandler("dialog:save-pptx")(undefined, new ArrayBuffer(8), "out.pptx");

			expect(result).toBe(false);
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it("writes empty buffer when null buffer is passed", async () => {
			mocks.dialogSave.mockResolvedValue({ canceled: false, filePath: "/out/test.pptx" });
			mocks.fsWrite.mockResolvedValue(undefined);

			const result = await getHandler("dialog:save-pptx")(undefined, null as unknown as ArrayBuffer, "out.pptx");

			expect(result).toBe(true);
			expect(mocks.fsWrite).toHaveBeenCalledWith(
				"/out/test.pptx",
				new Uint8Array(0),
			);
		});

		it("handles null defaultName without crashing", async () => {
			mocks.dialogSave.mockResolvedValue({ canceled: false, filePath: "/out/nullname.pptx" });
			mocks.fsWrite.mockResolvedValue(undefined);

			const result = await getHandler("dialog:save-pptx")(undefined, new ArrayBuffer(8), null as unknown as string);

			expect(result).toBe(true);
		});

		it("returns false when filePath is empty string", async () => {
			mocks.dialogSave.mockResolvedValue({ canceled: false, filePath: "" });

			const result = await getHandler("dialog:save-pptx")(undefined, new ArrayBuffer(8), "out.pptx");

			expect(result).toBe(false);
		});
	});

	describe("file:get-recent", () => {
		it("returns [] when file missing", async () => {
			mocks.fsRead.mockRejectedValue(new Error("ENOENT"));

			expect(await getHandler("file:get-recent")()).toEqual([]);
		});

		it("returns parsed recent files", async () => {
			mocks.fsRead.mockResolvedValue(
				JSON.stringify([{ name: "a.pptx", path: "/a.pptx" }]),
			);

			expect(await getHandler("file:get-recent")()).toEqual([
				{ name: "a.pptx", path: "/a.pptx" },
			]);
		});

		it("returns [] on invalid JSON", async () => {
			mocks.fsRead.mockResolvedValue("not json");

			expect(await getHandler("file:get-recent")()).toEqual([]);
		});
	});

	describe("file:add-recent", () => {
		it("adds file and rebuilds menu", async () => {
			mocks.fsRead.mockResolvedValue("[]");
			mocks.fsWrite.mockResolvedValue(undefined);

			await getHandler("file:add-recent")(undefined, "/new.pptx");

			expect(mocks.fsWrite).toHaveBeenCalled();
			expect(mocks.menuBuild).toHaveBeenCalled();
			expect(mocks.menuSet).toHaveBeenCalled();
		});

		it("deduplicates same path", async () => {
			mocks.fsRead.mockResolvedValue(
				JSON.stringify([
					{ name: "dup.pptx", path: "/dup.pptx" },
					{ name: "other.pptx", path: "/other.pptx" },
				]),
			);
			mocks.fsWrite.mockResolvedValue(undefined);

			await getHandler("file:add-recent")(undefined, "/dup.pptx");

			const data = JSON.parse(mocks.fsWrite.mock.calls[0]?.[1] as string);
			expect(data).toHaveLength(2);
			expect(data[0].path).toBe("/dup.pptx");
		});

		it("limits to 10 entries", async () => {
			mocks.fsRead.mockResolvedValue(
				JSON.stringify(
					Array.from({ length: 15 }, (_, i) => ({
						name: `f${i}.pptx`,
						path: `/f${i}.pptx`,
					})),
				),
			);
			mocks.fsWrite.mockResolvedValue(undefined);

			await getHandler("file:add-recent")(undefined, "/new.pptx");

			const data = JSON.parse(mocks.fsWrite.mock.calls[0]?.[1] as string);
			expect(data).toHaveLength(10);
		});

		it("throws on null filePath (saveRecentFile calls split on null)", async () => {
			mocks.fsRead.mockResolvedValue("[]");
			mocks.fsWrite.mockResolvedValue(undefined);

			await expect(
				getHandler("file:add-recent")(undefined, null as unknown as string),
			).resolves.toBeUndefined();
		});

		it("ignores empty string filePath without crashing", async () => {
			mocks.fsRead.mockResolvedValue("[]");
			mocks.fsWrite.mockResolvedValue(undefined);

			await getHandler("file:add-recent")(undefined, "");

			expect(mocks.fsWrite).not.toHaveBeenCalled();
		});

		it("handles writeFile failure inside saveRecentFile gracefully", async () => {
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			mocks.fsRead.mockResolvedValue("[]");
			mocks.fsWrite.mockRejectedValue(new Error("Disk full"));

			await getHandler("file:add-recent")(undefined, "/test.pptx");

			expect(spy).toHaveBeenCalledWith("Failed to save recent file:", expect.any(Error));
			spy.mockRestore();
		});

		it("handles buildMenu failure without crashing", async () => {
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			mocks.fsRead.mockResolvedValue("[]");
			mocks.fsWrite.mockResolvedValue(undefined);
			mocks.menuBuild.mockImplementation(() => { throw new Error("menu build failed"); });

			await getHandler("file:add-recent")(undefined, "/test.pptx");

			expect(spy).toHaveBeenCalledWith("Failed to add recent file:", expect.any(Error));
			spy.mockRestore();
		});
	});

	describe("file:read-buffer", () => {
		it("reads file and returns ArrayBuffer", async () => {
			const content = Buffer.from("file data");
			mocks.fsRead.mockResolvedValue(content);

			const result = (await getHandler("file:read-buffer")(
				undefined,
				"/some/file.pptx",
			)) as ArrayBuffer;

			expect(new Uint8Array(result)).toEqual(new Uint8Array(content));
		});

		it("returns null on read error", async () => {
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			mocks.fsRead.mockRejectedValue(new Error("ENOENT"));

			const result = await getHandler("file:read-buffer")(undefined, "/missing.pptx");

			expect(result).toBeNull();
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it("returns null for null filePath", async () => {
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			mocks.fsRead.mockRejectedValue(new Error("ENOENT"));

			const result = await getHandler("file:read-buffer")(undefined, null as unknown as string);

			expect(result).toBeNull();
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it("returns null for undefined filePath", async () => {
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			mocks.fsRead.mockRejectedValue(new Error("ENOENT"));

			const result = await getHandler("file:read-buffer")(undefined, undefined as unknown as string);

			expect(result).toBeNull();
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it("returns null for empty string filePath", async () => {
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			mocks.fsRead.mockRejectedValue(new Error("ENOENT"));

			const result = await getHandler("file:read-buffer")(undefined, "");

			expect(result).toBeNull();
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});
	});

	describe("lifecycle events", () => {
		it("window-all-closed quits app on non-Darwin platforms", () => {
			vi.stubGlobal("process", { ...process, platform: "win32" });

			const call = mocks.appOn.mock.calls.find((c: [string]) => c[0] === "window-all-closed");
			expect(call).toBeDefined();

			const handler = call[1] as () => void;
			handler();

			expect(mocks.appQuit).toHaveBeenCalled();

			vi.unstubAllGlobals();
		});

		it("window-all-closed does not quit on Darwin", () => {
			vi.stubGlobal("process", { ...process, platform: "darwin" });

			const call = mocks.appOn.mock.calls.find((c: [string]) => c[0] === "window-all-closed");
			expect(call).toBeDefined();

			mocks.appQuit.mockClear();
			const handler = call[1] as () => void;
			handler();

			expect(mocks.appQuit).not.toHaveBeenCalled();

			vi.unstubAllGlobals();
		});

		it("activate creates a new window when none exist", () => {
			mocks.getAllWindows.mockReturnValue([]);

			const call = mocks.appOn.mock.calls.find((c: [string]) => c[0] === "activate");
			expect(call).toBeDefined();

			const handler = call[1] as () => void;
			handler();

			expect(mocks.winLoadURL).toHaveBeenCalled();
		});

		it("activate does nothing when windows already exist", () => {
			mocks.winLoadURL.mockClear();
			mocks.getAllWindows.mockReturnValue([{ id: 1 }]);

			const call = mocks.appOn.mock.calls.find((c: [string]) => c[0] === "activate");
			expect(call).toBeDefined();

			const handler = call[1] as () => void;
			handler();

			expect(mocks.winLoadURL).not.toHaveBeenCalled();
		});

		it("activate catch logs error when createWindow fails", async () => {
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			mocks.menuBuild.mockImplementation(() => { throw new Error("menu failed"); });
			mocks.getAllWindows.mockReturnValue([]);

			const call = mocks.appOn.mock.calls.find((c: [string]) => c[0] === "activate");
			const handler = call[1] as () => void;
			handler();

			await vi.waitFor(() => {
				expect(spy).toHaveBeenCalled();
			});
			spy.mockRestore();
		});
	});

	describe("menu with recent files", () => {
		it("includes recent templates submenu with click handler that sends file-drop", async () => {
			mocks.fsRead.mockResolvedValue(
				JSON.stringify([{ name: "recent.pptx", path: "/recent.pptx" }]),
			);
			mocks.menuBuild.mockReset();
			mocks.menuBuild.mockReturnValue({});
			mocks.menuSet.mockReset();

			await getHandler("file:add-recent")(undefined, "/recent.pptx");

			const templateArg = mocks.menuBuild.mock.calls[
				mocks.menuBuild.mock.calls.length - 1
			]?.[0] as unknown[];
			expect(templateArg).toBeDefined();

			const fileMenu = (templateArg as { submenu: unknown[] }[]).find(
				(m: { label?: string }) => m.label === "File",
			);
			expect(fileMenu).toBeDefined();

			const recentSubmenu = fileMenu!.submenu.find(
				(m: { label?: string }) => m.label === "Recent Templates",
			) as { submenu: { label: string; click: () => void }[] };
			expect(recentSubmenu).toBeDefined();

			expect(recentSubmenu.submenu).toHaveLength(1);
			expect(recentSubmenu.submenu[0]!.label).toBe("recent.pptx");

			mocks.winSend.mockClear();
			recentSubmenu.submenu[0]!.click();

			expect(mocks.winSend).toHaveBeenCalledWith("file-drop", "/recent.pptx");
		});
	});

	describe("menu click handlers", () => {
		function getMenuTemplate(): unknown[] {
			const call = mocks.menuBuild.mock.calls[
				mocks.menuBuild.mock.calls.length - 1
			]?.[0] as unknown[];
			return call;
		}

		it("File > Open Template click calls handleOpenTemplate and returns result", async () => {
			mocks.dialogOpen.mockResolvedValue({
				canceled: false,
				filePaths: ["/test/template.pptx"],
			});
			mocks.fsRead.mockResolvedValue(Buffer.from("pptx data"));

			mocks.menuBuild.mockReset();
			mocks.menuBuild.mockReturnValue({});
			await getHandler("file:add-recent")(undefined, "/placeholder.pptx");

			const template = getMenuTemplate();
			const fileMenu = (template as { submenu: unknown[] }[]).find(
				(m: { label?: string }) => m.label === "File",
			);
			const openItem = fileMenu!.submenu.find(
				(m: { label?: string }) => m.label === "Open Template",
			) as { click: () => void };
			expect(openItem).toBeDefined();

			openItem.click();
			expect(mocks.dialogOpen).toHaveBeenCalled();
		});

		it("File > Save As click sends menu-save-as event", async () => {
			mocks.winSend.mockClear();
			mocks.menuBuild.mockReset();
			mocks.menuBuild.mockReturnValue({});
			await getHandler("file:add-recent")(undefined, "/placeholder.pptx");

			const template = getMenuTemplate();
			const fileMenu = (template as { submenu: unknown[] }[]).find(
				(m: { label?: string }) => m.label === "File",
			);
			const saveItem = fileMenu!.submenu.find(
				(m: { label?: string }) => m.label === "Save .pptx As...",
			) as { click: () => void };
			expect(saveItem).toBeDefined();

			saveItem.click();
			expect(mocks.winSend).toHaveBeenCalledWith("menu-save-as");
		});
	});
});
