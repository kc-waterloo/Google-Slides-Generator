/**
 * adapter.ts
 *
 * Created by Min-Kyu Lee on 03-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 *
 * Platform-agnostic I/O abstraction for template loading and
 * presentation saving. Two implementations exist:
 *   browser.ts — uses <input type="file"> and Blob download
 *   electron.ts — uses Electron dialog.showOpenDialog / showSaveDialog
 */

/**
 * adapter.ts
 *
 * Created by Min-Kyu Lee on 27-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

export interface TemplateFile {
	name: string;
	buffer: ArrayBuffer;
}

export interface PptPlatformAdapter {
	openTemplate(): Promise<TemplateFile | null>;
	savePresentation(buffer: ArrayBuffer, defaultName: string): Promise<boolean>;
}
