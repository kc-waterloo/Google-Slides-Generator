/**
 * process-lyrics-slide-item.ts
 * 
 * Created by Min-Kyu Lee on 20-09-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved. 
*/

import { Nullable } from "../../shared/functions/nullable/Nullable";
import { copySlide_ } from "../../shared/functions/copy-slide";
import { processCopyItems_ } from "../../shared/functions/copy-item/process-copy-items";
import { LyricSlideItem } from "./lyric-slide-item";
import { splitStringByWhitespace_ } from "./split-string-by-whitespace";
import { processTitleItem_ } from "../../shared/functions/title-item/process-title-item";
import { SlideIndex } from "../../shared/functions/slide-index/SlideIndex";

/**
 * 
 * @returns {Nullable<number>} the new insertion index if there were no errors 
 */
export const processLyricsSlideItem_ = ({
	presentation,
	templateTitleSlideId,
	templateLyricSlideId,
	lyricsSlidesItem,
	baseInsertionIndex,
}: {
	presentation: GoogleAppsScript.Slides.Presentation,
	templateTitleSlideId: string,
	templateLyricSlideId: string,
	lyricsSlidesItem: LyricSlideItem,
	baseInsertionIndex: SlideIndex,
}): Nullable<number> => {
	let currentInsertionIndex: SlideIndex = baseInsertionIndex;

	const formattedStrings: string[] = splitStringByWhitespace_(lyricsSlidesItem.lyrics);

	if (!processTitleItem_({
		presentation: presentation,
		templateTitleSlideId: templateTitleSlideId,
		currentInsertionIndex: currentInsertionIndex,
		titleItem: {
			title: lyricsSlidesItem.songTitle,
			subtitle: lyricsSlidesItem.artist,
		},
	})) {
		console.error("Error: Failed to create a title slide.");
		return null;
	}
	currentInsertionIndex++;

	formattedStrings.forEach((formattedString: string): void => {
		const newSlide: GoogleAppsScript.Slides.Slide | undefined = copySlide_({
			presentation: presentation,
			originalSlideId: templateLyricSlideId,
			newSlideIndex: currentInsertionIndex,
		});
		if (!newSlide) {
			return;
		}
		currentInsertionIndex++;

		processCopyItems_({
			templateSlide: presentation.getSlideById(templateLyricSlideId),
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
						newText: lyricsSlidesItem.songTitle,
						newColor: SlidesApp.ThemeColorType.DARK1,
						bold: false,
					}
				},
			]
		});
	});

	return currentInsertionIndex;
};
