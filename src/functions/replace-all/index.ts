/**
 * replace-all/index.ts
 * 
 * Created by Min-Kyu Lee on 20-09-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved. 
 */

import { Nullable } from "../../shared/functions/nullable/Nullable";
import { slideNumberToIndex_ } from "../../shared/functions/slide-number/slide-number-to-index";
import { lowerBoundSlideNumberDefault_, matchCaseDefault_, newTextDefault_, oldTextDefault_, upperBoundSlideNumberDefault_ } from "./defaults";

export const replaceAll = (
	oldText: string = oldTextDefault_,
	newText: string = newTextDefault_,
	matchCase: boolean = matchCaseDefault_,
	lowerBoundSlideNumber: number = lowerBoundSlideNumberDefault_,
	upperBoundSlideNumber: number = upperBoundSlideNumberDefault_,
): void => {
	const lowerBoundSlideIndex: Nullable<number> = slideNumberToIndex_(lowerBoundSlideNumber);
	const upperBoundSlideIndex: Nullable<number> = slideNumberToIndex_(upperBoundSlideNumber);

	if (lowerBoundSlideIndex === null || upperBoundSlideIndex === null) {
		console.error("Lower or upper bound not defined");
		return;
	}

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
