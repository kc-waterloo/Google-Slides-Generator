/**
 * move-slides/index.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import type { SlideNumber, SlideIndex } from "@gsg/shared";
import { slideNumberToIndex_ } from "../../shared/slide-number/slide-number-to-index";
import { updateSlideLinks_ } from "../../shared/link/update-slide-links";
import { logInfo } from "../../shared/logger/logger";
import { copySlideRange_ } from "../../shared/copy-slide-range";
import { getActivePresentation_ } from "../../shared/presentation";

const MODULE = "moveSlides";

/**
 * Moves a range of slides to a new position.
 * Copies the source slides at the target position, then removes the originals.
 *
 * @param {Object} parameters - parameters for the function
 * @param {SlideNumber} parameters.fromSlideNumber - First slide to move (inclusive)
 * @param {SlideNumber} parameters.toSlideNumber - Last slide to move (inclusive)
 * @param {SlideNumber} parameters.targetSlideNumber - Position to insert the moved slides
 * @param {string} [parameters.linkingMode] - Optional SlideLinkingMode ("LINKED" | "NOT_LINKED")
 * @returns {void}
 */
export const moveSlides = ({
	fromSlideNumber,
	toSlideNumber,
	targetSlideNumber,
	linkingMode,
}: {
	fromSlideNumber: SlideNumber,
	toSlideNumber: SlideNumber,
	targetSlideNumber: SlideNumber,
	linkingMode?: GoogleAppsScript.Slides.SlideLinkingMode,
}): void => {
	const presentation = getActivePresentation_(MODULE);
	if (!presentation) {
		return;
	}

	const fromIndex: SlideIndex = slideNumberToIndex_(fromSlideNumber);
	const toIndex: SlideIndex = slideNumberToIndex_(toSlideNumber);

	if (fromIndex > toIndex) {
		return;
	}

	const slides: GoogleAppsScript.Slides.Slide[] = presentation.getSlides();

	const sourceSlideIds: string[] = [];
	for (let i: SlideIndex = fromIndex; i <= toIndex; i++) {
		if (i < slides.length) {
			sourceSlideIds.push(slides[i]!.getObjectId());
		}
	}

	if (sourceSlideIds.length === 0) {
		return;
	}

	const originalToCopyMap = copySlideRange_({
		presentation: presentation,
		lowerBoundSlideNumber: fromSlideNumber,
		upperBoundSlideNumber: toSlideNumber,
		insertionSlideNumber: targetSlideNumber,
		linkingMode: linkingMode,
	});

	updateSlideLinks_({ originalToCopyMap });

	const allSlides: GoogleAppsScript.Slides.Slide[] = presentation.getSlides();
	for (let i: SlideIndex = allSlides.length - 1; i >= 0; i--) {
		if (sourceSlideIds.includes(allSlides[i]!.getObjectId())) {
			allSlides[i]!.remove();
		}
	}

	logInfo(MODULE, `Moved ${sourceSlideIds.length} slides from ${fromSlideNumber}-${toSlideNumber} to slide ${targetSlideNumber}`);
};
