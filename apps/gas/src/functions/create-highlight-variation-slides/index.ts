/**
 * create-highlight-variation-slides/index.ts
 *
 * Created by Min-Kyu Lee on 13-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { slideIndexToId_ } from "../../shared/slide-index/slide-index-to-id";
import { SlideNumber, Nullable } from "@gsg/shared";
import { processCopyItems_ } from "../../shared/copy-item/process-copy-items";
import { copySlide_ } from "../../shared/copy-slide";
import { slideNumberToIndex_ } from "../../shared/slide-number/slide-number-to-index";
import { createCopyItems_ } from "./create-copy-items";
import { getNumberOfPages_ } from "./get-number-of-pages";
import { createHighlightVariationSlidesDefaultSlideNumber_ } from "./defaults";
import { CopyItem } from "../../shared/copy-item/copy-item";
import { logInfo, logError } from "../../shared/logger/logger";
import { getActivePresentation_ } from "../../shared/presentation";
import { toThemeColor_ } from "../../shared/theme-color";

const MODULE = "createHighlightVariationSlides";


/**
 * Creates highlight variation slides from an input slide.
 * Detects the number of highlight pages using point-N-of-M-text-box keys,
 * then generates copies with each point highlighted in sequence.
 *
 * @param {Object} parameters - parameters for the function
 * @param {SlideNumber} [parameters.inputSlideNumber] - Slide number of the input slide
 * @param {string} [parameters.highlightColor] - Theme color for highlighted points, e.g. DARK1 (default)
 * @param {string} [parameters.dimmedColor] - Theme color for dimmed points, e.g. LIGHT1 (default)
 * @param {boolean} [parameters.highlightBold] - Bold highlighted points (default: true)
 * @param {boolean} [parameters.dimmedBold] - Bold dimmed points (default: false)
 * @param {string} [parameters.highlightBorderColor] - Border color for highlighted points
 * @param {string} [parameters.dimmedBorderColor] - Border color for dimmed points
 * @param {boolean} [parameters.highlightItalic] - Italic highlighted points
 * @param {boolean} [parameters.dimmedItalic] - Italic dimmed points
 * @param {boolean} [parameters.highlightStrikethrough] - Strikethrough highlighted points
 * @param {boolean} [parameters.dimmedStrikethrough] - Strikethrough dimmed points
 * @param {boolean} [parameters.highlightUnderline] - Underline highlighted points
 * @param {boolean} [parameters.dimmedUnderline] - Underline dimmed points
 * @param {number} [parameters.highlightFontSize] - Font size for highlighted points
 * @param {number} [parameters.dimmedFontSize] - Font size for dimmed points
 * @returns {void}
 */
export const createHighlightVariationSlides = ({
	inputSlideNumber = createHighlightVariationSlidesDefaultSlideNumber_,
	highlightColor,
	dimmedColor,
	highlightBold,
	dimmedBold,
	highlightBorderColor,
	dimmedBorderColor,
	highlightItalic,
	dimmedItalic,
	highlightStrikethrough,
	dimmedStrikethrough,
	highlightUnderline,
	dimmedUnderline,
	highlightFontSize,
	dimmedFontSize,
}: {
	inputSlideNumber: SlideNumber,
	highlightColor?: string,
	dimmedColor?: string,
	highlightBold?: boolean,
	dimmedBold?: boolean,
	highlightBorderColor?: string,
	dimmedBorderColor?: string,
	highlightItalic?: boolean,
	dimmedItalic?: boolean,
	highlightStrikethrough?: boolean,
	dimmedStrikethrough?: boolean,
	highlightUnderline?: boolean,
	dimmedUnderline?: boolean,
	highlightFontSize?: number,
	dimmedFontSize?: number,
} = {
	inputSlideNumber: createHighlightVariationSlidesDefaultSlideNumber_,
}): void => {
	const presentation = getActivePresentation_(MODULE);
	if (!presentation) {
		return;
	}

	const inputSlideIndex: number = slideNumberToIndex_(inputSlideNumber);
	const inputSlideId: Nullable<string> = slideIndexToId_({
		presentation: presentation,
		slideIndex: inputSlideIndex,
	});
	if (!inputSlideId) {
		logError(MODULE, "Input slide not found");
		return;
	}
	const inputSlide: GoogleAppsScript.Slides.Slide = presentation.getSlideById(inputSlideId);

	const numberOfPages: Nullable<number> = getNumberOfPages_({inputSlide: inputSlide});
	if (numberOfPages === null) {
		logError(MODULE, "Number of pages not found on input slide");
		return;
	}

	logInfo(MODULE, `Creating ${numberOfPages + 2} variations from slide ${inputSlideNumber}`);

	for (let i: number = 0; i < numberOfPages + 2; i++) {
		const newSlide: Nullable<GoogleAppsScript.Slides.Slide> = copySlide_({
			presentation: presentation,
			originalSlideId: inputSlideId,
			newSlideIndex: inputSlideIndex + i + 1,
			originalSlide: inputSlide,
		});
		if (newSlide === null) {
			logError(MODULE, `Failed to copy variation slide ${i + 1}`);
			continue;
		}

		const copyItems: CopyItem[] = createCopyItems_({
			currentPageIndex: i,
			numberOfPages: numberOfPages,
			isLastSlide: i === numberOfPages + 1,
			highlightColor: toThemeColor_(highlightColor),
			dimmedColor: toThemeColor_(dimmedColor),
			highlightBold: highlightBold,
			dimmedBold: dimmedBold,
			highlightBorderColor: toThemeColor_(highlightBorderColor),
			dimmedBorderColor: toThemeColor_(dimmedBorderColor),
			highlightItalic: highlightItalic,
			dimmedItalic: dimmedItalic,
			highlightStrikethrough: highlightStrikethrough,
			dimmedStrikethrough: dimmedStrikethrough,
			highlightUnderline: highlightUnderline,
			dimmedUnderline: dimmedUnderline,
			highlightFontSize: highlightFontSize,
			dimmedFontSize: dimmedFontSize,
		});

		processCopyItems_({
			templateSlide: inputSlide,
			destinationSlide: newSlide,
			copyItems: copyItems,
		});
	}
};
