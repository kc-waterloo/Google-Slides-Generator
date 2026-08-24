/**
 * process-short-quote-item.ts
 *
 * Created by Min-Kyu Lee on 23-02-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { Nullable, SlideId, SlideIndex, ShortQuoteItem } from "@gsg/shared";
import { processCopyItems_ } from "../../shared/copy-item/process-copy-items";
import { copySlide_ } from "../../shared/copy-slide";
import { DEFAULT_QUOTE_KEY, DEFAULT_ADDENDUM_KEY } from "../../shared/defaults";
import { toThemeColor_ } from "../../shared/theme-color";
import { logError } from "../../shared/logger/logger";

const MODULE = "processShortQuoteItem_";

/**
 * 
 * @returns {Nullable<SlideIndex>} the new insertion index if there were no errors 
 */
export const processShortQuoteItem_ = ({
	presentation,
	templateContentSlideId,
	shortQuoteSlideItem,
	insertionIndex,
	quoteColor = SlidesApp.ThemeColorType.DARK1,
	addendumColor = SlidesApp.ThemeColorType.DARK1,
	quoteFontSize,
	addendumFontSize,
	quoteStrikethrough,
	addendumStrikethrough,
	quoteUnderline,
	addendumUnderline,
}: {
    presentation: GoogleAppsScript.Slides.Presentation,
	templateContentSlideId: SlideId,
	shortQuoteSlideItem: ShortQuoteItem,
	insertionIndex: SlideIndex,
	quoteColor?: GoogleAppsScript.Slides.ThemeColorType,
	addendumColor?: GoogleAppsScript.Slides.ThemeColorType,
	quoteFontSize?: number,
	addendumFontSize?: number,
	quoteStrikethrough?: boolean,
	addendumStrikethrough?: boolean,
	quoteUnderline?: boolean,
	addendumUnderline?: boolean,
}): Nullable<SlideIndex> => {
	const itemQuoteColor: GoogleAppsScript.Slides.ThemeColorType =
		toThemeColor_(shortQuoteSlideItem.quoteColor) ?? quoteColor;
	const itemAddendumColor: GoogleAppsScript.Slides.ThemeColorType =
		toThemeColor_(shortQuoteSlideItem.addendumColor) ?? addendumColor;
	const itemQuoteBold: boolean | undefined =
		shortQuoteSlideItem.quoteBold ?? false;
	const itemAddendumBold: boolean | undefined =
		shortQuoteSlideItem.addendumBold ?? false;
	const itemQuoteItalic: boolean | undefined =
		shortQuoteSlideItem.quoteItalic;
	const itemAddendumItalic: boolean | undefined =
		shortQuoteSlideItem.addendumItalic;
	const itemQuoteStrikethrough: boolean | undefined =
		shortQuoteSlideItem.quoteStrikethrough ?? quoteStrikethrough;
	const itemAddendumStrikethrough: boolean | undefined =
		shortQuoteSlideItem.addendumStrikethrough ?? addendumStrikethrough;
	const itemQuoteUnderline: boolean | undefined =
		shortQuoteSlideItem.quoteUnderline ?? quoteUnderline;
	const itemAddendumUnderline: boolean | undefined =
		shortQuoteSlideItem.addendumUnderline ?? addendumUnderline;
	const itemQuoteFontSize: number | undefined =
		shortQuoteSlideItem.quoteFontSize ?? quoteFontSize;
	const itemAddendumFontSize: number | undefined =
		shortQuoteSlideItem.addendumFontSize ?? addendumFontSize;

	const templateSlide = presentation.getSlideById(templateContentSlideId);

	const newSlide: Nullable<GoogleAppsScript.Slides.Slide> = copySlide_({
		presentation: presentation,
		originalSlideId: templateContentSlideId,
		newSlideIndex: insertionIndex,
		originalSlide: templateSlide ?? undefined,
	});
	if (!newSlide) {
		logError(MODULE, `Failed to copy content slide (id: ${templateContentSlideId})`);
		return null;
	}

	processCopyItems_({
		templateSlide: templateSlide,
		destinationSlide: newSlide,
		copyItems: [
			{
				pageElementKey: DEFAULT_QUOTE_KEY,
				actions: {
					newText: shortQuoteSlideItem.quote,
					newColor: itemQuoteColor,
					bold: itemQuoteBold,
					italic: itemQuoteItalic,
					strikethrough: itemQuoteStrikethrough,
					underline: itemQuoteUnderline,
					fontSize: itemQuoteFontSize,
				},
			},
			{
				pageElementKey: DEFAULT_ADDENDUM_KEY,
				actions: {
					newText: shortQuoteSlideItem.addendum,
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
	
	return insertionIndex + 1;
};
