/**
 * tests/main.error.test.ts
 *
 * Created by Min-Kyu Lee on 03-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

const mocks = vi.hoisted(() => {
	const consoleError = vi.fn();
	vi.stubGlobal("console", { ...console, error: consoleError });
	return { consoleError, appOn: vi.fn() };
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
				catch: vi.fn(),
			})),
			on: mocks.appOn,
			quit: vi.fn(),
		},
		BrowserWindow: Object.assign(
			vi.fn(function () {
				throw new Error("BrowserWindow constructor failed");
			}),
			{ getAllWindows: vi.fn().mockReturnValue([]) },
		),
		ipcMain: { handle: vi.fn() },
		dialog: {
			showOpenDialog: vi.fn(),
			showSaveDialog: vi.fn(),
		},
		Menu: {
			buildFromTemplate: vi.fn().mockReturnValue({}),
			setApplicationMenu: vi.fn(),
		},
	},
}));

vi.mock("node:fs/promises", () => ({
	readFile: vi.fn().mockRejectedValue(new Error("ENOENT")),
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

describe("main process error handling", () => {
	it("logs error when createWindow fails during startup", () => {
		expect(mocks.consoleError).toHaveBeenCalledWith(
			expect.stringContaining("Failed to create window"),
			expect.any(Error),
		);
	});
});
