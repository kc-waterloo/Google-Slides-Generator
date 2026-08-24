/**
 * presentation.ts
 *
 * Created by Min-Kyu Lee on 26-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { logWarn } from "./logger/logger";

export const getActivePresentation_ = (
	module: string,
): GoogleAppsScript.Slides.Presentation | null => {
	const presentation = SlidesApp.getActivePresentation();
	if (!presentation) {
		logWarn(module, "No active presentation");
		return null;
	}
	return presentation;
};
