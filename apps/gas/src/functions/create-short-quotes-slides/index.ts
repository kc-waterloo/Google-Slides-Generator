/**
 * create-short-quotes-slides/index.ts
 *
 * Created by Min-Kyu Lee on 23-02-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import type { Nullable, SlideNumber, ShortQuoteItem, SlideId } from "@gsg/shared";
import { createShortQuotesSlidesDefaultInsertionSlideNumber_, createShortQuotesSlidesDefaultShortQuoteItems_, createShortQuotesSlidesDefaultTemplateSlideNumber_ } from "./defaults";
import { slideNumberToId_ } from "../../shared/slide-number/slide-number-to-id";
import { slideNumberToIndex_ } from "../../shared/slide-number/slide-number-to-index";
import { processShortQuoteItem_ } from "./process-short-quote-item";
import { getActivePresentation_ } from "../../shared/presentation";
import { logError } from "../../shared/logger/logger";

const MODULE = "createShortQuotesSlides";


/**
 * Generates slides from an array of ShortQuoteItems.
 * Each item produces a single slide with quote and addendum text.
 *
 * @param {Object} parameters - parameters for the function
 * @param {ShortQuoteItem[]} [parameters.shortQuoteItems] - Array of items
 * @param {Nullable<SlideNumber>} [parameters.templateSlideNumber] - Template slide (null = auto-detect)
 * @param {SlideNumber} [parameters.insertionSlideNumber=9] - Where to insert slides
 * @param {string} [parameters.overrideQuoteTextBoxKey] - Override default "quote-text-box"
 * @param {string} [parameters.overrideAddendumTextBoxKey] - Override default "addendum-text-box"
 * @param {GoogleAppsScript.Slides.ThemeColorType} [parameters.quoteColor=DARK1] - Quote text color
 * @param {GoogleAppsScript.Slides.ThemeColorType} [parameters.addendumColor=DARK1] - Addendum text color
 * @param {number} [parameters.quoteFontSize] - Quote font size override
 * @param {number} [parameters.addendumFontSize] - Addendum font size override
 * @returns {void}
 */
export const createShortQuotesSlides = ({
	shortQuoteItems = createShortQuotesSlidesDefaultShortQuoteItems_,
	templateSlideNumber = createShortQuotesSlidesDefaultTemplateSlideNumber_,
	insertionSlideNumber = createShortQuotesSlidesDefaultInsertionSlideNumber_,
	overrideQuoteTextBoxKey,
	overrideAddendumTextBoxKey,
	quoteColor,
	addendumColor,
	quoteFontSize,
	addendumFontSize,
	quoteStrikethrough,
	addendumStrikethrough,
	quoteUnderline,
	addendumUnderline,
}: {
	shortQuoteItems: ShortQuoteItem[],
	templateSlideNumber: Nullable<SlideNumber>,
	insertionSlideNumber: SlideNumber,
	overrideQuoteTextBoxKey?: string,
	overrideAddendumTextBoxKey?: string,
	quoteColor?: GoogleAppsScript.Slides.ThemeColorType,
	addendumColor?: GoogleAppsScript.Slides.ThemeColorType,
	quoteFontSize?: number,
	addendumFontSize?: number,
	quoteStrikethrough?: boolean,
	addendumStrikethrough?: boolean,
	quoteUnderline?: boolean,
	addendumUnderline?: boolean,
} = {
	shortQuoteItems: createShortQuotesSlidesDefaultShortQuoteItems_,
	templateSlideNumber: createShortQuotesSlidesDefaultTemplateSlideNumber_,
	insertionSlideNumber: createShortQuotesSlidesDefaultInsertionSlideNumber_,
}): void => {
	const presentation = getActivePresentation_(MODULE);
	if (!presentation) {
		return;
	}

	const templateSlideId: Nullable<SlideId> = slideNumberToId_({
		presentation,
		slideNumber: templateSlideNumber,
		pageElementKeys: [
			overrideQuoteTextBoxKey ?? "quote-text-box",
			overrideAddendumTextBoxKey ?? "addendum-text-box",
		],
	});

	let currentInsertionIndex: SlideNumber = slideNumberToIndex_(insertionSlideNumber);

	if (templateSlideId === null) {
		logError(MODULE, "Template slide not found");
		return;
	}

	shortQuoteItems.forEach((shortQuoteItem: ShortQuoteItem): void => {
		currentInsertionIndex = processShortQuoteItem_({
			presentation: presentation,
			templateContentSlideId: templateSlideId,
			shortQuoteSlideItem: shortQuoteItem,
			insertionIndex: currentInsertionIndex,
			quoteColor: quoteColor,
			addendumColor: addendumColor,
			quoteFontSize: quoteFontSize,
			addendumFontSize: addendumFontSize,
			quoteStrikethrough: quoteStrikethrough,
			addendumStrikethrough: addendumStrikethrough,
			quoteUnderline: quoteUnderline,
			addendumUnderline: addendumUnderline,
		}) ?? currentInsertionIndex;
	});
};
