/**
 * slide-range.ts
 *
 * Created by Min-Kyu Lee on 26-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import type { SlideNumber, SlideIndex } from "@gsg/shared";
import { slideNumberToIndex_ } from "./slide-number/slide-number-to-index";

export const forEachSlideInRange_ = ({
	presentation,
	lowerBoundSlideNumber,
	upperBoundSlideNumber,
	callback,
}: {
	presentation: GoogleAppsScript.Slides.Presentation,
	lowerBoundSlideNumber: SlideNumber,
	upperBoundSlideNumber: SlideNumber,
	callback: (slide: GoogleAppsScript.Slides.Slide, index: number) => void,
}): void => {
	const lowerBoundSlideIndex: SlideIndex = slideNumberToIndex_(lowerBoundSlideNumber);
	const upperBoundSlideIndex: SlideIndex = slideNumberToIndex_(upperBoundSlideNumber);

	presentation.getSlides().forEach((slide: GoogleAppsScript.Slides.Slide, index: number): void => {
		if (index < lowerBoundSlideIndex || index > upperBoundSlideIndex) {
			return;
		}
		callback(slide, index);
	});
};
