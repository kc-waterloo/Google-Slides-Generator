/**
 * main/index.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import pkg from "electron";
const { app, BrowserWindow, ipcMain, dialog, Menu } = pkg;
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDev = !app.isPackaged;
const RECENT_FILE = join(app.getPath("userData"), "recent-files.json");

let mainWindow: InstanceType<typeof BrowserWindow> | null = null;

const loadRecentFiles = async (): Promise<Array<{ name: string; path: string }>> => {
	try {
		const data = await readFile(RECENT_FILE, "utf-8");
		return JSON.parse(data);
	} catch {
		return [];
	}
};

const saveRecentFile = async (filePath: string): Promise<void> => {
	try {
		const recent = await loadRecentFiles();
		const filtered = recent.filter((f) => f.path !== filePath);
		filtered.unshift({ name: filePath.split("/").pop()!, path: filePath });
		await writeFile(RECENT_FILE, JSON.stringify(filtered.slice(0, 10)), "utf-8");
	} catch (error) {
		console.error("Failed to save recent file:", error);
	}
};

const buildMenu = async (): Promise<void> => {
	const recent = await loadRecentFiles();

	const recentSubmenu = recent.map((f) => ({
		label: f.name,
		click: () => mainWindow?.webContents.send("file-drop", f.path),
	}));

	const template: Electron.MenuItemConstructorOptions[] = [
		{
			label: "File",
			submenu: [
				{
					label: "Open Template",
					accelerator: "CmdOrCtrl+O",
					click: () => { void handleOpenTemplate(); },
				},
				{ type: "separator" },
				{
					label: "Save .pptx As...",
					accelerator: "CmdOrCtrl+Shift+S",
					click: () => mainWindow?.webContents.send("menu-save-as"),
				},
				{ type: "separator" },
				{
					label: "Recent Templates",
					submenu: recentSubmenu,
				},
				{ type: "separator" },
				{ role: "quit" },
			],
		},
		{
			label: "Edit",
			submenu: [
				{ role: "undo" },
				{ role: "redo" },
				{ type: "separator" },
				{ role: "cut" },
				{ role: "copy" },
				{ role: "paste" },
				{ role: "selectAll" },
			],
		},
		{
			label: "View",
			submenu: [
				{ role: "reload" },
				{ role: "toggleDevTools" },
				{ type: "separator" },
				{ role: "zoomIn" },
				{ role: "zoomOut" },
				{ role: "resetZoom" },
			],
		},
	];

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
};

const handleOpenTemplate = async (): Promise<{ name: string; buffer: ArrayBuffer } | null> => {
	try {
		const result = await dialog.showOpenDialog(mainWindow!, {
			filters: [{ name: "PowerPoint Templates", extensions: ["pptx"] }],
			properties: ["openFile"],
		});

		if (result.canceled || result.filePaths.length === 0) return null;

		const filePath = result.filePaths[0]!;
		const buffer = await readFile(filePath);
		const name = filePath.split("/").pop()!;

		await saveRecentFile(filePath);
		await buildMenu();

		return { name, buffer: new Uint8Array(buffer).buffer };
	} catch (error) {
		console.error("Failed to open template:", error);
		return null;
	}
};

const createWindow = async (): Promise<void> => {
	mainWindow = new BrowserWindow({
		width: 1280,
		height: 800,
		webPreferences: {
			preload: join(__dirname, "../preload/index.js"),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
			webSecurity: true,
		},
	});

	if (isDev) {
		mainWindow.loadURL("http://localhost:5173");
	} else {
		const rendererPath = join(process.resourcesPath, "renderer", "index.html");
		mainWindow.loadFile(rendererPath);
	}

	await buildMenu();
};

ipcMain.handle("dialog:open-template", async () => handleOpenTemplate());

ipcMain.handle(
	"dialog:save-pptx",
	async (_event, buffer: ArrayBuffer, defaultName: string): Promise<boolean> => {
		try {
			const result = await dialog.showSaveDialog(mainWindow!, {
				defaultPath: join(homedir(), "Downloads", defaultName),
				filters: [{ name: "PowerPoint Presentation", extensions: ["pptx"] }],
			});

			if (result.canceled || !result.filePath) return false;

			await writeFile(result.filePath, new Uint8Array(buffer));
			return true;
		} catch (error) {
			console.error("Failed to save presentation:", error);
			return false;
		}
	},
);

ipcMain.handle("file:get-recent", async () => loadRecentFiles());

ipcMain.handle("file:add-recent", async (_event, filePath: string): Promise<void> => {
	try {
		if (!filePath) return;
		await saveRecentFile(filePath);
		await buildMenu();
	} catch (error) {
		console.error("Failed to add recent file:", error);
	}
});

ipcMain.handle("file:read-buffer", async (_event, filePath: string): Promise<ArrayBuffer | null> => {
	try {
		const buffer = await readFile(filePath);
		return new Uint8Array(buffer).buffer;
	} catch (error) {
		console.error("Failed to read file:", error);
		return null;
	}
});

app.whenReady().then(() => {
	createWindow().catch((error) => {
		console.error("Failed to create window:", error);
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow().catch((error) => {
			console.error("Failed to create window on activate:", error);
		});
	}
});
