/**
 * duplicate-slide-range/index.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import type { SlideNumber } from "@gsg/shared";
import { updateSlideLinks_ } from "../../shared/link/update-slide-links";
import { logInfo } from "../../shared/logger/logger";
import { copySlideRange_ } from "../../shared/copy-slide-range";
import { getActivePresentation_ } from "../../shared/presentation";

const MODULE = "duplicateSlideRange";

/**
 * Duplicates slides in the given range and inserts copies at the target position.
 * Copies are inserted before the insertionSlideNumber, shifting subsequent slides.
 *
 * @param {Object} parameters - parameters for the function
 * @param {SlideNumber} [parameters.lowerBoundSlideNumber=1] - First slide to duplicate (inclusive)
 * @param {SlideNumber} [parameters.upperBoundSlideNumber=9999] - Last slide to duplicate (inclusive)
 * @param {SlideNumber} parameters.insertionSlideNumber - Position to insert the copies
 * @param {string} [parameters.linkingMode] - Optional SlideLinkingMode ("LINKED" | "NOT_LINKED")
 * @returns {void}
 */
export const duplicateSlideRange = ({
	lowerBoundSlideNumber = 1,
	upperBoundSlideNumber = 9999,
	insertionSlideNumber,
	linkingMode,
}: {
	lowerBoundSlideNumber: SlideNumber,
	upperBoundSlideNumber: SlideNumber,
	insertionSlideNumber: SlideNumber,
	linkingMode?: GoogleAppsScript.Slides.SlideLinkingMode,
}): void => {
	const presentation = getActivePresentation_(MODULE);
	if (!presentation) {
		return;
	}

	const originalToCopyMap = copySlideRange_({
		presentation: presentation,
		lowerBoundSlideNumber: lowerBoundSlideNumber,
		upperBoundSlideNumber: upperBoundSlideNumber,
		insertionSlideNumber: insertionSlideNumber,
		linkingMode: linkingMode,
	});

	updateSlideLinks_({ originalToCopyMap });

	logInfo(MODULE, `Duplicated ${originalToCopyMap.size} slides from range ${lowerBoundSlideNumber}-${upperBoundSlideNumber} to slide ${insertionSlideNumber}`);
};
