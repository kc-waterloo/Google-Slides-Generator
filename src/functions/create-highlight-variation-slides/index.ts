/**
 * create-highlight-variation-slides/index.ts
 *
 * Created by Min-Kyu Lee on 13-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { assertNotNull_ } from "../../shared/nullable/assert-not-null";
import { slideIndexToId_ } from "../../shared/slide-index/slide-index-to-id";
import { SlideNumber } from "../../shared/slide-number/slide-number";
import { processCopyItems_ } from "../../shared/copy-item/process-copy-items";
import { copySlide_ } from "../../shared/copy-slide";
import { slideNumberToIndex_ } from "../../shared/slide-number/slide-number-to-index";
import { createCopyItems_ } from "./create-copy-items";
import { getNumberOfPages_ } from "./get-number-of-pages";
import { createHighlightVariationSlidesDefaultSlideNumber_ } from "./defaults";
import { Nullable } from "../../shared/nullable/nullable";
import { CopyItem } from "../../shared/copy-item/copy-item";


/**
 * 
 * @param {Object} parameters - parameters for the function
 * @param {SlideNumber}	parameters.inputSlideNumber
 */
export const createHighlightVariationSlides = ({
	inputSlideNumber = createHighlightVariationSlidesDefaultSlideNumber_,
}: {
	inputSlideNumber: SlideNumber,
} = {
	inputSlideNumber: createHighlightVariationSlidesDefaultSlideNumber_,
}): void => {
	const presentation = SlidesApp.getActivePresentation();

	const inputSlideIndex: number = slideNumberToIndex_(inputSlideNumber);
	const inputSlideId: string = assertNotNull_(
		slideIndexToId_({
			presentation: presentation,
			slideIndex: inputSlideIndex,
		})
	);
	const inputSlide: GoogleAppsScript.Slides.Slide = presentation.getSlideById(inputSlideId);

	const numberOfPages: Nullable<number> = getNumberOfPages_({inputSlide: inputSlide});
	if (numberOfPages === null) {
		console.error("CREATE_HIGHLIGHT_VARIATION_SLIDES: Number of pages not found");
		return;
	}

	for (let i: number = 0; i < numberOfPages + 2; i++) {
		const newSlide: Nullable<GoogleAppsScript.Slides.Slide> = copySlide_({
			presentation: presentation,
			originalSlideId: inputSlideId,
			newSlideIndex: inputSlideIndex + i + 1,
		});
		if (newSlide === null) {
			continue;
		}

		const copyItems: CopyItem[] = createCopyItems_({
			currentPageIndex: i,
			numberOfPages: numberOfPages,
			isLastSlide: i === numberOfPages + 1,
		});

		processCopyItems_({
			templateSlide: inputSlide,
			destinationSlide: newSlide,
			copyItems: copyItems,
		});
	}
};
