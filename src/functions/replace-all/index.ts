/**
 * replace-all/index.ts
 * 
 * Created by Min-Kyu Lee on 20-09-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved. 
 */

import { SlideIndex } from "../../shared/slide-index/slide-index";
import { SlideNumber } from "../../shared/slide-number/slide-number";
import { slideNumberToIndex_ } from "../../shared/slide-number/slide-number-to-index";
import { replaceAllDefaultLowerBoundSlideNumber_, replaceAllDefaultMatchCase_, replaceAllDefaultNewText_, replaceAllDefaultOldText_, replaceAllDefaultUpperBoundSlideNumber_ } from "./defaults";


/**
 * 
 * @param {Object} parameters - parameters for the function
 * @param {string} parameters.oldText
 * @param {string} parameters.newText
 * @param {boolean} parameters.matchCase
 * @param {SlideNumber} parameters.lowerBoundSlideNumber
 * @param {SlideNumber} parameters.upperBoundSlideNumber
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
	const lowerBoundSlideIndex: SlideIndex = slideNumberToIndex_(lowerBoundSlideNumber);
	const upperBoundSlideIndex: SlideIndex = slideNumberToIndex_(upperBoundSlideNumber);

	const presentation = SlidesApp.getActivePresentation();

	if (presentation != null) {
		const slides: GoogleAppsScript.Slides.Slide[] = presentation.getSlides();

		slides.forEach((slide: GoogleAppsScript.Slides.Slide, index: number): void => {
			if (lowerBoundSlideIndex <= index && index <= upperBoundSlideIndex) {
				slide.replaceAllText(oldText, newText, matchCase);
			}
		});
	}
};
