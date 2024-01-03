/**
 * create-lyrics-slides/index.ts
 * 
 * Created by Min-Kyu Lee on 20-09-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved. 
*/

import { assertNotNull } from "./../../shared/functions/nullable/assert-not-null";
import { Nullable } from "../../shared/functions/nullable/Nullable";
import { generateDiscordPost_ } from "./generate-discord-post";
import { slideNumberToIndex_ } from "../../shared/functions/slide-number/slide-number-to-index";
import { processLyricsSlideItem_ } from "./process-lyrics-slide-item";
import { LyricSlideItem } from "./lyric-slide-item";
import { insertionSlideNumberDefault_, lyricSlideItemsDefault_, templateLyricSlideNumberDefault_, templateTitleSlideNumberDefault_ } from "./defaults";
import { slideNumberToId_ } from "../../shared/functions/slide-number/slide-number-to-id";
import { SlideNumber } from "../../shared/functions/slide-number/SlideNumber";

export const createLyricSlides = (
	insertionSlideNumber: number = insertionSlideNumberDefault_,
	lyricsSlidesItems: LyricSlideItem[] = lyricSlideItemsDefault_,
	templateTitleSlideNumber: Nullable<number> = templateTitleSlideNumberDefault_,
	templateLyricSlideNumber: Nullable<number> = templateLyricSlideNumberDefault_,
): void => {
	console.log(
		generateDiscordPost_({lyricsSlidesItems: lyricsSlidesItems})
	);

	internalCreateLyricSlides_({
		lyricsSlidesItems: lyricsSlidesItems,
		originalTitleSlideNumber: templateTitleSlideNumber,
		originalLyricSlideNumber: templateLyricSlideNumber,
		insertionSlideNumber: insertionSlideNumber,
	});
};

const internalCreateLyricSlides_ = ({
	lyricsSlidesItems,
	originalTitleSlideNumber,
	originalLyricSlideNumber,
	insertionSlideNumber,
}: {
	lyricsSlidesItems: LyricSlideItem[],
	originalTitleSlideNumber: Nullable<number>,
	originalLyricSlideNumber: Nullable<number>,
	insertionSlideNumber: number,
}): void => {
	const presentation = SlidesApp.getActivePresentation();

	const templateTitleSlideId = slideNumberToId_({
		presentation: presentation,
		slideNumber: originalTitleSlideNumber,
		pageElementKeys: ["section-title-text-box", "section-subtitle-text-box"],
	});
	const templateLyricSlideId: Nullable<string> = slideNumberToId_({
		presentation: presentation,
		slideNumber: originalLyricSlideNumber,
		pageElementKeys: ["quote-text-box", "addendum-text-box"],
	});

	let currentInsertionIndex: Nullable<SlideNumber> = slideNumberToIndex_(insertionSlideNumber);

	if (templateLyricSlideId === null || templateTitleSlideId === null) {
		console.error("At least one of the original lyrics slides could not be found.");
		return;
	}

	if (currentInsertionIndex === null) {
		return;
	}

	lyricsSlidesItems.forEach((lyricsSlidesItem: LyricSlideItem): void => {
		currentInsertionIndex = processLyricsSlideItem_({
			presentation: presentation,
			templateTitleSlideId: templateTitleSlideId,
			templateLyricSlideId: templateLyricSlideId,
			lyricsSlidesItem: lyricsSlidesItem,
			baseInsertionIndex: assertNotNull(currentInsertionIndex),
		}) ?? currentInsertionIndex; 
	});
};
