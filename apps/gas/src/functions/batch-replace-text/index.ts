/**
 * batch-replace-text/index.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import type { ReplacePair, SlideNumber } from "@gsg/shared";
import { logInfo } from "../../shared/logger/logger";
import { forEachSlideInRange_ } from "../../shared/slide-range";
import { getActivePresentation_ } from "../../shared/presentation";

const MODULE = "batchReplaceText";

/**
 * Performs multiple text replacement pairs across slides in a range.
 * Each ReplacePair specifies oldText/newText to find and replace.
 *
 * @param {Object} parameters - parameters for the function
 * @param {ReplacePair[]} parameters.replacements - Array of replacement pairs
 * @param {boolean} [parameters.matchCase=false] - Whether to match case
 * @param {SlideNumber} [parameters.lowerBoundSlideNumber=1] - First slide to process (inclusive)
 * @param {SlideNumber} [parameters.upperBoundSlideNumber=9999] - Last slide to process (inclusive)
 * @returns {void}
 */
export const batchReplaceText = ({
	replacements,
	matchCase = false,
	lowerBoundSlideNumber = 1,
	upperBoundSlideNumber = 9999,
}: {
	replacements: ReplacePair[],
	matchCase: boolean,
	lowerBoundSlideNumber: SlideNumber,
	upperBoundSlideNumber: SlideNumber,
} = {
	replacements: [],
	matchCase: false,
	lowerBoundSlideNumber: 1,
	upperBoundSlideNumber: 9999,
}): void => {
	const presentation = getActivePresentation_(MODULE);
	if (!presentation) {
		return;
	}

	let totalReplacements = 0;
	forEachSlideInRange_({
		presentation: presentation,
		lowerBoundSlideNumber: lowerBoundSlideNumber,
		upperBoundSlideNumber: upperBoundSlideNumber,
		callback: (slide: GoogleAppsScript.Slides.Slide): void => {
			replacements.forEach((pair: ReplacePair): void => {
				slide.replaceAllText(pair.oldText, pair.newText, matchCase);
				totalReplacements++;
			});
		},
	});

	logInfo(MODULE, `Applied ${totalReplacements} replacements across slides ${lowerBoundSlideNumber}-${upperBoundSlideNumber} (${matchCase ? "case-sensitive" : "case-insensitive"})`);
};
