/**
 * process-long-quote-slide-item.ts
 *
 * Created by Min-Kyu Lee on 23-02-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { Nullable } from "../../shared/nullable/nullable";
import { copySlide_ } from "../../shared/copy-slide";
import { processCopyItems_ } from "../../shared/copy-item/process-copy-items";
import { LongQuoteItem } from "./long-quote-item";
import { splitStringByWhitespace_ } from "./split-string-by-whitespace";
import { processTitleItem_ } from "../../shared/title-item/process-title-item";
import { SlideIndex } from "../../shared/slide-index/slide-index";
import { SlideId } from "../../shared/slide-id/slide-id";

/**
 * 
 * @returns {Nullable<SlideIndex>} the new insertion index if there were no errors 
 */
export const processLongQuoteSlideItem_ = ({
	presentation,
	templateTitleSlideId,
	templateLongQuoteSlideId,
	longQuoteSlidesItem,
	baseInsertionIndex,
}: {
	presentation: GoogleAppsScript.Slides.Presentation,
	templateTitleSlideId: SlideId,
	templateLongQuoteSlideId: SlideId,
	longQuoteSlidesItem: LongQuoteItem,
	baseInsertionIndex: SlideIndex,
}): Nullable<SlideIndex> => {
	let currentInsertionIndex: SlideIndex = baseInsertionIndex;

	const formattedStrings: string[] = splitStringByWhitespace_(longQuoteSlidesItem.quote);

	if (!processTitleItem_({
		presentation: presentation,
		templateTitleSlideId: templateTitleSlideId,
		currentInsertionIndex: currentInsertionIndex,
		titleItem: {
			title: longQuoteSlidesItem.title,
			subtitle: longQuoteSlidesItem.subtitle,
		},
	})) {
		console.error("Error: Failed to create a title slide.");
		return null;
	}
	currentInsertionIndex++;

	formattedStrings.forEach((formattedString: string): void => {
		const newSlide: GoogleAppsScript.Slides.Slide | undefined = copySlide_({
			presentation: presentation,
			originalSlideId: templateLongQuoteSlideId,
			newSlideIndex: currentInsertionIndex,
		});
		if (!newSlide) {
			return;
		}
		currentInsertionIndex++;

		processCopyItems_({
			templateSlide: presentation.getSlideById(templateLongQuoteSlideId),
			destinationSlide: newSlide,
			copyItems: [
				{
					pageElementKey: "quote-text-box",
					actions: {
						newText: formattedString,
						newColor: SlidesApp.ThemeColorType.DARK1,
						bold: false,
					},
				},
				{
					pageElementKey: "addendum-text-box",
					actions: {
						newText: longQuoteSlidesItem.title,
						newColor: SlidesApp.ThemeColorType.DARK1,
						bold: false,
					}
				},
			]
		});
	});

	return currentInsertionIndex;
};
