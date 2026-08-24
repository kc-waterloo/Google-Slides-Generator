/**
 * replace-all/index.ts
 * 
 * Created by Min-Kyu Lee on 20-09-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved. 
 */

import { SlideNumber } from "@gsg/shared";
import { replaceAllDefaultLowerBoundSlideNumber_, replaceAllDefaultMatchCase_, replaceAllDefaultNewText_, replaceAllDefaultOldText_, replaceAllDefaultUpperBoundSlideNumber_ } from "./defaults";
import { logInfo } from "../../shared/logger/logger";
import { forEachSlideInRange_ } from "../../shared/slide-range";
import { getActivePresentation_ } from "../../shared/presentation";

const MODULE = "replaceAll";


/**
 * Replaces all occurrences of a text string across slides in a range.
 * Uses Google Slides' replaceAllText method.
 *
 * @param {Object} parameters - parameters for the function
 * @param {string} [parameters.oldText] - Text to search for
 * @param {string} [parameters.newText] - Replacement text
 * @param {boolean} [parameters.matchCase] - Whether to match case
 * @param {SlideNumber} [parameters.lowerBoundSlideNumber=1] - First slide to process (inclusive)
 * @param {SlideNumber} [parameters.upperBoundSlideNumber=9999] - Last slide to process (inclusive)
 * @returns {void}
 */
export const replaceAll = ({
	oldText = replaceAllDefaultOldText_,
	newText = replaceAllDefaultNewText_,
	matchCase = replaceAllDefaultMatchCase_,
	lowerBoundSlideNumber = replaceAllDefaultLowerBoundSlideNumber_,
	upperBoundSlideNumber = replaceAllDefaultUpperBoundSlideNumber_,
}: {
	oldText: string
	newText: string
	matchCase: boolean
	lowerBoundSlideNumber: SlideNumber
	upperBoundSlideNumber: SlideNumber
} = {
	oldText: replaceAllDefaultOldText_,
	newText: replaceAllDefaultNewText_,
	matchCase: replaceAllDefaultMatchCase_,
	lowerBoundSlideNumber: replaceAllDefaultLowerBoundSlideNumber_,
	upperBoundSlideNumber: replaceAllDefaultUpperBoundSlideNumber_,	
}): void => {
	const presentation = getActivePresentation_(MODULE);
	if (!presentation) {
		return;
	}

	let matchCount = 0;
	forEachSlideInRange_({
		presentation: presentation,
		lowerBoundSlideNumber: lowerBoundSlideNumber,
		upperBoundSlideNumber: upperBoundSlideNumber,
		callback: (slide: GoogleAppsScript.Slides.Slide): void => {
			slide.replaceAllText(oldText, newText, matchCase);
			matchCount++;
		},
	});

	logInfo(MODULE, `Replaced '${oldText}' -> '${newText}' across ${matchCount} slides (${matchCase ? "case-sensitive" : "case-insensitive"})`);
};
