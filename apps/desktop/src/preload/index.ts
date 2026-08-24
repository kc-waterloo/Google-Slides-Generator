/**
 * preload/index.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import pkg from "electron";
const { contextBridge, ipcRenderer } = pkg;

contextBridge.exposeInMainWorld("electronAPI", {
	openTemplate: () => ipcRenderer.invoke("dialog:open-template"),
	savePresentation: (buffer: ArrayBuffer, defaultName: string) =>
		ipcRenderer.invoke("dialog:save-pptx", buffer, defaultName),
	getRecentFiles: () => ipcRenderer.invoke("file:get-recent"),
	addRecentFile: (filePath: string) => ipcRenderer.invoke("file:add-recent", filePath),
	onFileDrop: (callback: (filePath: string) => void) => {
		const handler = (_event: Electron.IpcRendererEvent, filePath: string) => callback(filePath);
		ipcRenderer.on("file-drop", handler);
		return () => { ipcRenderer.removeListener("file-drop", handler); };
	},
	onMenuSaveAs: (callback: () => void) => {
		const handler = () => callback();
		ipcRenderer.on("menu-save-as", handler);
		return () => { ipcRenderer.removeListener("menu-save-as", handler); };
	},
	readFileBuffer: (filePath: string) => ipcRenderer.invoke("file:read-buffer", filePath),
});
