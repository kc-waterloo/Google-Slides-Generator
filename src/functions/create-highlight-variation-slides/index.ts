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
import { defaultSlideNumber_ } from "./defaults";


/**
 * 
 * @param {Object} parameters - parameters for the function
 * @param {SlideNumber}	parameters.inputSlideNumber
 */
export const createHighlightVariationSlides = ({
	inputSlideNumber = defaultSlideNumber_,
}: {
	inputSlideNumber: SlideNumber,
} = {
	inputSlideNumber: defaultSlideNumber_,
}): void => {
	const presentation = SlidesApp.getActivePresentation();

	const inputSlideIndex = slideNumberToIndex_(inputSlideNumber);
	const inputSlideId = assertNotNull_(
		slideIndexToId_({
			presentation: presentation,
			slideIndex: inputSlideIndex,
		})
	);
	const inputSlide = presentation.getSlideById(inputSlideId);

	const numberOfPages = getNumberOfPages_({inputSlide: inputSlide});
	if (numberOfPages === null) {
		console.error("Number of pages not found");
		return;
	}

	for (let i = 0; i < numberOfPages + 2; i++) {
		const newSlide = copySlide_({
			presentation: presentation,
			originalSlideId: inputSlideId,
			newSlideIndex: inputSlideIndex + i + 1,
		});
		if (newSlide === undefined) {
			continue;
		}

		const copyItems = createCopyItems_({
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
