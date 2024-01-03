/**
 * internal/process-title-items.ts
 * 
 * Created by Min-Kyu Lee on 29-12-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved. 
 */

import { processCopyItems_ } from "../copy-item/process-copy-items";
import { copySlide_ } from "../copy-slide";
import { SlideIndex } from "../slide-index/SlideIndex";
import { TitleItem } from "./title-item";

/**
 * Returns true if the function succeeds 
 */
export const processTitleItem_ = ({
	presentation,
	templateTitleSlideId,
	currentInsertionIndex,
	titleItem,
}: {
	presentation: GoogleAppsScript.Slides.Presentation,
	templateTitleSlideId: string,
	currentInsertionIndex: SlideIndex,
	titleItem: TitleItem,
}): boolean => {
	const newTitleSlide: GoogleAppsScript.Slides.Slide | undefined = copySlide_({
		presentation: presentation,
		originalSlideId: templateTitleSlideId,
		newSlideIndex: currentInsertionIndex,
	});

	if (newTitleSlide === undefined) {
		return false;
	}

	processCopyItems_({
		templateSlide: presentation.getSlideById(templateTitleSlideId),
		destinationSlide: newTitleSlide,
		copyItems: [
			{
				pageElementKey: "section-title-text-box",
				actions: {
					newText: titleItem.title,
					newColor: SlidesApp.ThemeColorType.DARK1,
					bold: true,
				},
			},
			{
				pageElementKey: "section-subtitle-text-box",
				actions: {
					newText: titleItem.subtitle,
					newColor: SlidesApp.ThemeColorType.DARK1,
					bold: false,
				}
			},
		],
	});

	return true;
};
