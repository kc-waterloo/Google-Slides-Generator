/**
 * copy-slide-range.ts
 *
 * Created by Min-Kyu Lee on 26-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import type { SlideNumber, SlideIndex } from "@gsg/shared";
import { copySlide_ } from "./copy-slide";
import { slideNumberToIndex_ } from "./slide-number/slide-number-to-index";
import { logInfo, logError } from "./logger/logger";

const MODULE = "copySlideRange_";

export const copySlideRange_ = ({
	presentation,
	lowerBoundSlideNumber,
	upperBoundSlideNumber,
	insertionSlideNumber,
	linkingMode,
}: {
	presentation: GoogleAppsScript.Slides.Presentation,
	lowerBoundSlideNumber: SlideNumber,
	upperBoundSlideNumber: SlideNumber,
	insertionSlideNumber: SlideNumber,
	linkingMode?: GoogleAppsScript.Slides.SlideLinkingMode,
}): Map<string, GoogleAppsScript.Slides.Slide> => {
	const lowerBoundSlideIndex: SlideIndex = slideNumberToIndex_(lowerBoundSlideNumber);
	const upperBoundSlideIndex: SlideIndex = slideNumberToIndex_(upperBoundSlideNumber);

	if (lowerBoundSlideIndex > upperBoundSlideIndex) {
		return new Map();
	}

	const slides: GoogleAppsScript.Slides.Slide[] = presentation.getSlides();

	const slideIdsToCopy: string[] = [];
	for (let i: SlideIndex = lowerBoundSlideIndex; i <= upperBoundSlideIndex && i < slides.length; i++) {
		slideIdsToCopy.push(slides[i]!.getObjectId());
	}

	const originalToCopyMap: Map<string, GoogleAppsScript.Slides.Slide> = new Map();
	let insertAt: SlideIndex = slideNumberToIndex_(insertionSlideNumber);

	slideIdsToCopy.forEach((slideId: string): void => {
		const newSlide = copySlide_({
			presentation: presentation,
			originalSlideId: slideId,
			newSlideIndex: insertAt,
			linkingMode: linkingMode,
		});
		if (newSlide) {
			originalToCopyMap.set(slideId, newSlide);
		} else {
			logError(MODULE, `Failed to copy slide ${slideId} at index ${insertAt}`);
		}
		insertAt++;
	});

	logInfo(MODULE, `Copied ${originalToCopyMap.size}/${slideIdsToCopy.length} slides to position ${slideNumberToIndex_(insertionSlideNumber)}`);
	return originalToCopyMap;
};
