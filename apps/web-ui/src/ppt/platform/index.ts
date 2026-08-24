/**
 * platform/index.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import type { PptPlatformAdapter } from "./adapter";
import { browserAdapter } from "./browser";
import { electronAdapter } from "./electron";

export type { PptPlatformAdapter, TemplateFile } from "./adapter";

export const getPlatformAdapter = (): PptPlatformAdapter => {
	if (typeof window !== "undefined" && window.electronAPI) {
		return electronAdapter;
	}
	return browserAdapter;
};
