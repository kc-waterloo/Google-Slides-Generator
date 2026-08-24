/**
 * process-long-quote-slide-item.ts
 *
 * Created by Min-Kyu Lee on 23-02-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { Nullable, LongQuoteItem, SlideIndex, SlideId } from "@gsg/shared";
import { copySlide_ } from "../../shared/copy-slide";
import { processCopyItems_ } from "../../shared/copy-item/process-copy-items";
import { splitStringByWhitespace as splitStringByWhitespace_ } from "@gsg/shared";
import { processTitleItem_ } from "../../shared/title-item/process-title-item";
import { logError } from "../../shared/logger/logger";
import { DEFAULT_TITLE_KEY, DEFAULT_SUBTITLE_KEY, DEFAULT_QUOTE_KEY, DEFAULT_ADDENDUM_KEY } from "../../shared/defaults";
import { toThemeColor_ } from "../../shared/theme-color";

const MODULE = "processLongQuoteSlideItem_";

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
	titleKey = DEFAULT_TITLE_KEY,
	subtitleKey = DEFAULT_SUBTITLE_KEY,
	quoteKey = DEFAULT_QUOTE_KEY,
	addendumKey = DEFAULT_ADDENDUM_KEY,
	titleColor = SlidesApp.ThemeColorType.DARK1,
	subtitleColor = SlidesApp.ThemeColorType.DARK1,
	quoteColor = SlidesApp.ThemeColorType.DARK1,
	addendumColor = SlidesApp.ThemeColorType.DARK1,
	titleFontSize,
	subtitleFontSize,
	quoteFontSize,
	addendumFontSize,
	titleStrikethrough,
	subtitleStrikethrough,
	quoteStrikethrough,
	addendumStrikethrough,
	titleUnderline,
	subtitleUnderline,
	quoteUnderline,
	addendumUnderline,
}: {
	presentation: GoogleAppsScript.Slides.Presentation,
	templateTitleSlideId: SlideId,
	templateLongQuoteSlideId: SlideId,
	longQuoteSlidesItem: LongQuoteItem,
	baseInsertionIndex: SlideIndex,
	titleKey?: string,
	subtitleKey?: string,
	quoteKey?: string,
	addendumKey?: string,
	titleColor?: GoogleAppsScript.Slides.ThemeColorType,
	subtitleColor?: GoogleAppsScript.Slides.ThemeColorType,
	quoteColor?: GoogleAppsScript.Slides.ThemeColorType,
	addendumColor?: GoogleAppsScript.Slides.ThemeColorType,
	titleFontSize?: number,
	subtitleFontSize?: number,
	quoteFontSize?: number,
	addendumFontSize?: number,
	titleStrikethrough?: boolean,
	subtitleStrikethrough?: boolean,
	quoteStrikethrough?: boolean,
	addendumStrikethrough?: boolean,
	titleUnderline?: boolean,
	subtitleUnderline?: boolean,
	quoteUnderline?: boolean,
	addendumUnderline?: boolean,
}): Nullable<SlideIndex> => {
	const itemTitleColor: GoogleAppsScript.Slides.ThemeColorType =
		toThemeColor_(longQuoteSlidesItem.titleColor) ?? titleColor;
	const itemSubtitleColor: GoogleAppsScript.Slides.ThemeColorType =
		toThemeColor_(longQuoteSlidesItem.subtitleColor) ?? subtitleColor;
	const itemQuoteColor: GoogleAppsScript.Slides.ThemeColorType =
		toThemeColor_(longQuoteSlidesItem.quoteColor) ?? quoteColor;
	const itemAddendumColor: GoogleAppsScript.Slides.ThemeColorType =
		toThemeColor_(longQuoteSlidesItem.addendumColor) ?? addendumColor;
	const itemTitleFontSize: number | undefined =
		longQuoteSlidesItem.titleFontSize ?? titleFontSize;
	const itemSubtitleFontSize: number | undefined =
		longQuoteSlidesItem.subtitleFontSize ?? subtitleFontSize;
	const itemQuoteFontSize: number | undefined =
		longQuoteSlidesItem.quoteFontSize ?? quoteFontSize;
	const itemAddendumFontSize: number | undefined =
		longQuoteSlidesItem.addendumFontSize ?? addendumFontSize;
	const itemTitleBold: boolean =
		longQuoteSlidesItem.titleBold ?? true;
	const itemSubtitleBold: boolean =
		longQuoteSlidesItem.subtitleBold ?? false;
	const itemQuoteBold: boolean | undefined =
		longQuoteSlidesItem.quoteBold ?? false;
	const itemAddendumBold: boolean | undefined =
		longQuoteSlidesItem.addendumBold ?? false;
	const itemTitleItalic: boolean | undefined =
		longQuoteSlidesItem.titleItalic;
	const itemSubtitleItalic: boolean | undefined =
		longQuoteSlidesItem.subtitleItalic;
	const itemQuoteItalic: boolean | undefined =
		longQuoteSlidesItem.quoteItalic;
	const itemAddendumItalic: boolean | undefined =
		longQuoteSlidesItem.addendumItalic;
	const itemTitleStrikethrough: boolean | undefined =
		longQuoteSlidesItem.titleStrikethrough ?? titleStrikethrough;
	const itemSubtitleStrikethrough: boolean | undefined =
		longQuoteSlidesItem.subtitleStrikethrough ?? subtitleStrikethrough;
	const itemQuoteStrikethrough: boolean | undefined =
		longQuoteSlidesItem.quoteStrikethrough ?? quoteStrikethrough;
	const itemAddendumStrikethrough: boolean | undefined =
		longQuoteSlidesItem.addendumStrikethrough ?? addendumStrikethrough;
	const itemTitleUnderline: boolean | undefined =
		longQuoteSlidesItem.titleUnderline ?? titleUnderline;
	const itemSubtitleUnderline: boolean | undefined =
		longQuoteSlidesItem.subtitleUnderline ?? subtitleUnderline;
	const itemQuoteUnderline: boolean | undefined =
		longQuoteSlidesItem.quoteUnderline ?? quoteUnderline;
	const itemAddendumUnderline: boolean | undefined =
		longQuoteSlidesItem.addendumUnderline ?? addendumUnderline;

	let currentInsertionIndex: SlideIndex = baseInsertionIndex;

	const formattedStrings: string[] = splitStringByWhitespace_(
		longQuoteSlidesItem.quote,
		longQuoteSlidesItem.splitMode,
		longQuoteSlidesItem.splitMaxChars,
	);

	if (!processTitleItem_({
		presentation: presentation,
		templateTitleSlideId: templateTitleSlideId,
		currentInsertionIndex: currentInsertionIndex,
		titleItem: {
			title: longQuoteSlidesItem.title,
			subtitle: longQuoteSlidesItem.subtitle,
		},
		titleKey: titleKey,
		subtitleKey: subtitleKey,
		titleColor: itemTitleColor,
		subtitleColor: itemSubtitleColor,
		titleFontSize: itemTitleFontSize,
		subtitleFontSize: itemSubtitleFontSize,
		titleBold: itemTitleBold,
		subtitleBold: itemSubtitleBold,
		titleItalic: itemTitleItalic,
		subtitleItalic: itemSubtitleItalic,
		titleStrikethrough: itemTitleStrikethrough,
		subtitleStrikethrough: itemSubtitleStrikethrough,
		titleUnderline: itemTitleUnderline,
		subtitleUnderline: itemSubtitleUnderline,
	})) {
		logError(MODULE, `Failed to create title slide for '${longQuoteSlidesItem.title}'`);
		return null;
	}
	currentInsertionIndex++;

	const templateLongQuoteSlide: Nullable<GoogleAppsScript.Slides.Slide> =
		presentation.getSlideById(templateLongQuoteSlideId);

	formattedStrings.forEach((formattedString: string): void => {
		const newSlide: Nullable<GoogleAppsScript.Slides.Slide> = copySlide_({
			presentation: presentation,
			originalSlideId: templateLongQuoteSlideId,
			newSlideIndex: currentInsertionIndex,
			originalSlide: templateLongQuoteSlide ?? undefined,
		});
		if (!newSlide) {
			logError(MODULE, `Failed to copy content slide for '${longQuoteSlidesItem.title}'`);
			return;
		}
		currentInsertionIndex++;

		processCopyItems_({
			templateSlide: templateLongQuoteSlide,
			destinationSlide: newSlide,
			copyItems: [
				{
					pageElementKey: quoteKey,
					actions: {
						newText: formattedString,
						newColor: itemQuoteColor,
						bold: itemQuoteBold,
						italic: itemQuoteItalic,
						strikethrough: itemQuoteStrikethrough,
						underline: itemQuoteUnderline,
						fontSize: itemQuoteFontSize,
					},
				},
				{
					pageElementKey: addendumKey,
					actions: {
						newText: longQuoteSlidesItem.title,
						newColor: itemAddendumColor,
						bold: itemAddendumBold,
						italic: itemAddendumItalic,
						strikethrough: itemAddendumStrikethrough,
						underline: itemAddendumUnderline,
						fontSize: itemAddendumFontSize,
					}
				},
			]
		});
	});

	return currentInsertionIndex;
};
