/**
 * create-short-quotes-slides/index.ts
 *
 * Created by Min-Kyu Lee on 23-02-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { Nullable} from "./../../shared/nullable/nullable.d";
import { SlideNumber } from "../../shared/slide-number/slide-number";
import { ShortQuoteItem } from "./short-quote-item";
import { createShortQuotesSlidesDefaultInsertionSlideNumber_, createShortQuotesSlidesDefaultShortQuoteItems_, createShortQuotesSlidesDefaultTemplateSlideNumber_ } from "./defaults";
import { slideNumberToId_ } from "../../shared/slide-number/slide-number-to-id";
import { SlideId } from "../../shared/slide-id/slide-id";
import { slideNumberToIndex_ } from "../../shared/slide-number/slide-number-to-index";
import { processShortQuoteItem_ } from "./process-short-quote-item";


/**
 * 
 * @param {Object} parameters - parameters for the function
 * @param {ShortQuoteItem[]} parameters.shortQuoteItems
 * @param {Nullable<SlideNumber>} parameters.templateSlideNumber
 * @param {SlideNumber} parameters.insertionSlideNumber
 */
export const createShortQuotesSlides = ({
	shortQuoteItems = createShortQuotesSlidesDefaultShortQuoteItems_,
	templateSlideNumber: templateSlideNumber = createShortQuotesSlidesDefaultTemplateSlideNumber_,
	insertionSlideNumber = createShortQuotesSlidesDefaultInsertionSlideNumber_,
}: {
    shortQuoteItems: ShortQuoteItem[],
    templateSlideNumber: Nullable<SlideNumber>,
    insertionSlideNumber: SlideNumber,
} = {
	shortQuoteItems: createShortQuotesSlidesDefaultShortQuoteItems_,
	templateSlideNumber: createShortQuotesSlidesDefaultTemplateSlideNumber_,
	insertionSlideNumber: createShortQuotesSlidesDefaultInsertionSlideNumber_,
}): void => {
	const presentation: GoogleAppsScript.Slides.Presentation = SlidesApp.getActivePresentation();

	const templateSlideId: Nullable<SlideId> = slideNumberToId_({
		presentation,
		slideNumber: templateSlideNumber,
		pageElementKeys: ["quote-text-box", "addendum-text-box"],
	});

	let currentInsertionIndex: SlideNumber = slideNumberToIndex_(insertionSlideNumber);

	if (templateSlideId === null) {
		console.error("CREATE_SHORT_QUOTES_SLIDES: At least one of the original lyrics slides could not be found.");
		return;
	}

	shortQuoteItems.forEach((shortQuoteItem: ShortQuoteItem): void => {
		currentInsertionIndex = processShortQuoteItem_({
			presentation: presentation,
			templateContentSlideId: templateSlideId,
			shortQuoteSlideItem: shortQuoteItem,
			insertionIndex: currentInsertionIndex
		}) ?? currentInsertionIndex;
	});
};
