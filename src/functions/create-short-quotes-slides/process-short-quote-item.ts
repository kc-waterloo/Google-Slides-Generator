/**
 * process-short-quote-item.ts
 *
 * Created by Min-Kyu Lee on 23-02-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { processCopyItems_ } from "../../shared/copy-item/process-copy-items";
import { copySlide_ } from "../../shared/copy-slide";
import { Nullable } from "../../shared/nullable/nullable";
import { SlideId } from "../../shared/slide-id/slide-id";
import { SlideIndex } from "../../shared/slide-index/slide-index";
import { ShortQuoteItem } from "./short-quote-item";

/**
 * 
 * @returns {Nullable<SlideIndex>} the new insertion index if there were no errors 
 */
export const processShortQuoteItem_ = ({
	presentation,
	templateContentSlideId,
	shortQuoteSlideItem,
	insertionIndex,
}: {
    presentation: GoogleAppsScript.Slides.Presentation,
	templateContentSlideId: SlideId,
	shortQuoteSlideItem: ShortQuoteItem,
	insertionIndex: SlideIndex,
}): Nullable<SlideIndex> => {
	const newSlide: GoogleAppsScript.Slides.Slide | undefined = copySlide_({
		presentation: presentation,
		originalSlideId: templateContentSlideId,
		newSlideIndex: insertionIndex,
	});
	if (!newSlide) {
		return null;
	}

	processCopyItems_({
		templateSlide: presentation.getSlideById(templateContentSlideId),
		destinationSlide: newSlide,
		copyItems: [
			{
				pageElementKey: "quote-text-box",
				actions: {
					newText: shortQuoteSlideItem.quote,
					newColor: SlidesApp.ThemeColorType.DARK1,
					bold: false,
				},
			},
			{
				pageElementKey: "addendum-text-box",
				actions: {
					newText: shortQuoteSlideItem.addendum,
					newColor: SlidesApp.ThemeColorType.DARK1,
					bold: false,
				}
			},
		]
	});
	
	return insertionIndex + 1;
};
