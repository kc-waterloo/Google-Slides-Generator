/**
 * apply-background-color/index.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import type { SlideNumber } from "@gsg/shared";
import { setBackgroundColor_ } from "../../shared/slide/set-background-color";
import { logInfo, logError } from "../../shared/logger/logger";
import { forEachSlideInRange_ } from "../../shared/slide-range";
import { getActivePresentation_ } from "../../shared/presentation";
import { toThemeColor_ } from "../../shared/theme-color";

const MODULE = "applyBackgroundColor";

/**
 * Sets a solid background color on a range of slides.
 *
 * @param {Object} parameters - parameters for the function
 * @param {string} parameters.color - ThemeColorType key as string (e.g. "DARK1", "LIGHT1")
 * @param {SlideNumber} [parameters.lowerBoundSlideNumber=1] - First slide to modify (inclusive)
 * @param {SlideNumber} [parameters.upperBoundSlideNumber=9999] - Last slide to modify (inclusive)
 * @returns {void}
 */
export const applyBackgroundColor = ({
	color = "DARK1",
	lowerBoundSlideNumber = 1,
	upperBoundSlideNumber = 9999,
}: {
	color: string,
	lowerBoundSlideNumber?: SlideNumber,
	upperBoundSlideNumber?: SlideNumber,
} = {
	color: "DARK1",
	lowerBoundSlideNumber: 1,
	upperBoundSlideNumber: 9999,
}): void => {
	const presentation = getActivePresentation_(MODULE);
	if (!presentation) {
		return;
	}

	const themeColor = toThemeColor_(color);
	if (!themeColor) {
		logError(MODULE, `Invalid color: '${color}'`);
		return;
	}

	let totalApplied = 0;
	forEachSlideInRange_({
		presentation: presentation,
		lowerBoundSlideNumber: lowerBoundSlideNumber,
		upperBoundSlideNumber: upperBoundSlideNumber,
		callback: (slide: GoogleAppsScript.Slides.Slide): void => {
			setBackgroundColor_({
				slide: slide,
				newColor: themeColor,
			});
			totalApplied++;
		},
	});

	logInfo(MODULE, `Applied background color '${color}' to ${totalApplied} slides`);
};
