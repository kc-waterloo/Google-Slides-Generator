/**
 * process-title-item.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { Nullable, SlideId, SlideIndex } from "@gsg/shared";
import { processCopyItems_ } from "../copy-item/process-copy-items";
import { copySlide_ } from "../copy-slide";
import { TitleItem } from "./title-item";
import { DEFAULT_TITLE_KEY, DEFAULT_SUBTITLE_KEY } from "../defaults";
import { logError } from "../logger/logger";

const MODULE = "processTitleItem_";

/**
 * Returns true if the function succeeds 
 */
export const processTitleItem_ = ({
	presentation,
	templateTitleSlideId,
	currentInsertionIndex,
	titleItem,
	titleKey = DEFAULT_TITLE_KEY,
	subtitleKey = DEFAULT_SUBTITLE_KEY,
	titleColor = SlidesApp.ThemeColorType.DARK1,
	subtitleColor = SlidesApp.ThemeColorType.DARK1,
	titleFontSize,
	subtitleFontSize,
	titleBold = true,
	subtitleBold = false,
	titleItalic,
	subtitleItalic,
	titleStrikethrough,
	subtitleStrikethrough,
	titleUnderline,
	subtitleUnderline,
}: {
	presentation: GoogleAppsScript.Slides.Presentation,
	templateTitleSlideId: SlideId,
	currentInsertionIndex: SlideIndex,
	titleItem: TitleItem,
	titleKey?: string,
	subtitleKey?: string,
	titleColor?: GoogleAppsScript.Slides.ThemeColorType,
	subtitleColor?: GoogleAppsScript.Slides.ThemeColorType,
	titleFontSize?: number,
	subtitleFontSize?: number,
	titleBold?: boolean,
	subtitleBold?: boolean,
	titleItalic?: boolean,
	subtitleItalic?: boolean,
	titleStrikethrough?: boolean,
	subtitleStrikethrough?: boolean,
	titleUnderline?: boolean,
	subtitleUnderline?: boolean,
}): boolean => {
	const templateTitleSlide: Nullable<GoogleAppsScript.Slides.Slide> =
		presentation.getSlideById(templateTitleSlideId);

	const newTitleSlide: Nullable<GoogleAppsScript.Slides.Slide> = copySlide_({
		presentation: presentation,
		originalSlideId: templateTitleSlideId,
		newSlideIndex: currentInsertionIndex,
		originalSlide: templateTitleSlide ?? undefined,
	});

	if (newTitleSlide === null) {
		logError(MODULE, `Failed to copy title slide (id: ${templateTitleSlideId})`);
		return false;
	}

	processCopyItems_({
		templateSlide: templateTitleSlide!,
		destinationSlide: newTitleSlide,
		copyItems: [
			{
				pageElementKey: titleKey,
				actions: {
					newText: titleItem.title,
					newColor: titleColor,
					bold: titleBold,
					italic: titleItalic,
					strikethrough: titleStrikethrough,
					underline: titleUnderline,
					fontSize: titleFontSize,
				},
			},
			{
				pageElementKey: subtitleKey,
				actions: {
					newText: titleItem.subtitle,
					newColor: subtitleColor,
					bold: subtitleBold,
					italic: subtitleItalic,
					strikethrough: subtitleStrikethrough,
					underline: subtitleUnderline,
					fontSize: subtitleFontSize,
				}
			},
		],
	});

	return true;
};
