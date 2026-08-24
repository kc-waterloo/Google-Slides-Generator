/**
 * tests/main.prod.test.ts
 *
 * Created by Min-Kyu Lee on 01-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

const mocks = vi.hoisted(() => {
	const ipcHandle = vi.fn();
	const appOn = vi.fn();
	const winLoadFile = vi.fn().mockResolvedValue(undefined);
	const menuBuild = vi.fn().mockReturnValue({});
	const menuSet = vi.fn();

	return {
		ipcHandle,
		appOn,
		winLoadFile,
		menuBuild,
		menuSet,
	};
});

vi.mock("electron", () => ({
	default: {
		app: {
			getPath: vi.fn(() => "/tmp/test-user-data"),
			isPackaged: true,
			whenReady: vi.fn(() => ({
				then: vi.fn((cb: () => void) => {
					cb();
					return Promise.resolve();
				}),
			})),
			on: mocks.appOn,
			quit: vi.fn(),
		},
		BrowserWindow: vi.fn(function () {
			return {
				loadURL: vi.fn(),
				loadFile: mocks.winLoadFile,
				webContents: { send: vi.fn() },
			};
		}),
		ipcMain: { handle: mocks.ipcHandle },
		dialog: { showOpenDialog: vi.fn(), showSaveDialog: vi.fn() },
		Menu: {
			buildFromTemplate: mocks.menuBuild,
			setApplicationMenu: mocks.menuSet,
		},
	},
}));

vi.mock("node:fs/promises", () => ({
	readFile: vi.fn(),
	writeFile: vi.fn(),
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

describe("main process (production)", () => {
	it("loads renderer from extraResources path in production", () => {
		expect(mocks.winLoadFile).toHaveBeenCalledWith(
			expect.stringContaining("renderer/index.html"),
		);
	});
});
