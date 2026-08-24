/**
 * electron.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import type { PptPlatformAdapter } from "./adapter";

declare global {
	interface Window {
		electronAPI?: {
			openTemplate: () => Promise<{ name: string; buffer: ArrayBuffer } | null>;
			savePresentation: (buffer: ArrayBuffer, defaultName: string) => Promise<boolean>;
			getRecentFiles: () => Promise<Array<{ name: string; path: string }>>;
			addRecentFile: (path: string) => Promise<void>;
			onFileDrop: (callback: (filePath: string) => void) => () => void;
			onMenuSaveAs: (callback: () => void) => () => void;
			readFileBuffer: (filePath: string) => Promise<ArrayBuffer | null>;
		};
	}
}

export const electronAdapter: PptPlatformAdapter = {
	async openTemplate() {
		if (!window.electronAPI) {
			throw new Error("electronAPI not available");
		}
		const result = await window.electronAPI.openTemplate();
		if (!result) return null;
		return { name: result.name, buffer: result.buffer };
	},

	async savePresentation(
		buffer: ArrayBuffer,
		defaultName: string,
	): Promise<boolean> {
		if (!window.electronAPI) {
			throw new Error("electronAPI not available");
		}
		return window.electronAPI.savePresentation(buffer, defaultName);
	},
};
