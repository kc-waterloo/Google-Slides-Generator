/**
 * create-long-quotes-slides/index.ts
 *
 * Created by Min-Kyu Lee on 23-02-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { Nullable, LongQuoteItem, SlideNumber, SlideId } from "@gsg/shared";
import { generateDiscordPost_ } from "./generate-discord-post";
import { slideNumberToIndex_ } from "../../shared/slide-number/slide-number-to-index";
import { processLongQuoteSlideItem_ } from "./process-long-quote-slide-item";
import { createLongQuotesSlidesDefaultInsertionSlideNumber_, createLongQuotesSlidesDefaultLongQuoteSlideItems_, createLongQuotesSlidesDefaultTemplateContentSlideNumber_, createLongQuotesSlidesDefaultTemplateTitleSlideNumber_ } from "./defaults";
import { slideNumberToId_ } from "../../shared/slide-number/slide-number-to-id";
import { logInfo, logError } from "../../shared/logger/logger";
import { getActivePresentation_ } from "../../shared/presentation";

const MODULE = "createLongQuotesSlides";


/**
 * Generates title and content slides from an array of LongQuoteItems.
 * Each item produces a title slide (with title/subtitle) followed by
 * one or more content slides (with quote/addendum), split by paragraph.
 *
 * @param {Object} parameters - parameters for the function
 * @param {LongQuoteItem[]} [parameters.longQuoteItems] - Array of items to generate slides for
 * @param {Nullable<SlideNumber>} [parameters.templateTitleSlideNumber] - Template for title slides (null = auto-detect)
 * @param {Nullable<SlideNumber>} [parameters.templateContentSlideNumber] - Template for content slides (null = auto-detect)
 * @param {SlideNumber} [parameters.insertionSlideNumber] - Where to insert generated slides
 * @param {string} [parameters.overrideTitleTextBoxKey] - Override default "section-title-text-box"
 * @param {string} [parameters.overrideSubtitleTextBoxKey] - Override default "section-subtitle-text-box"
 * @param {string} [parameters.overrideQuoteTextBoxKey] - Override default "quote-text-box"
 * @param {string} [parameters.overrideAddendumTextBoxKey] - Override default "addendum-text-box"
 * @param {GoogleAppsScript.Slides.ThemeColorType} [parameters.titleColor] - Title text color
 * @param {GoogleAppsScript.Slides.ThemeColorType} [parameters.subtitleColor] - Subtitle text color
 * @param {GoogleAppsScript.Slides.ThemeColorType} [parameters.quoteColor] - Quote text color
 * @param {GoogleAppsScript.Slides.ThemeColorType} [parameters.addendumColor] - Addendum text color
 * @param {number} [parameters.titleFontSize] - Title font size
 * @param {number} [parameters.subtitleFontSize] - Subtitle font size
 * @param {number} [parameters.quoteFontSize] - Quote font size
 * @param {number} [parameters.addendumFontSize] - Addendum font size
 * @returns {void}
 */
export const createLongQuotesSlides = ({
	longQuoteItems = createLongQuotesSlidesDefaultLongQuoteSlideItems_,
	templateTitleSlideNumber = createLongQuotesSlidesDefaultTemplateTitleSlideNumber_,
	templateContentSlideNumber = createLongQuotesSlidesDefaultTemplateContentSlideNumber_,
	insertionSlideNumber = createLongQuotesSlidesDefaultInsertionSlideNumber_,
	overrideTitleTextBoxKey,
	overrideSubtitleTextBoxKey,
	overrideQuoteTextBoxKey,
	overrideAddendumTextBoxKey,
	titleColor,
	subtitleColor,
	quoteColor,
	addendumColor,
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
	longQuoteItems: LongQuoteItem[],
	templateTitleSlideNumber: Nullable<SlideNumber>,
	templateContentSlideNumber: Nullable<SlideNumber>,
	insertionSlideNumber: SlideNumber,
	overrideTitleTextBoxKey?: string,
	overrideSubtitleTextBoxKey?: string,
	overrideQuoteTextBoxKey?: string,
	overrideAddendumTextBoxKey?: string,
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
} = {
	longQuoteItems: createLongQuotesSlidesDefaultLongQuoteSlideItems_,
	templateTitleSlideNumber: createLongQuotesSlidesDefaultTemplateTitleSlideNumber_,
	templateContentSlideNumber: createLongQuotesSlidesDefaultTemplateContentSlideNumber_,
	insertionSlideNumber: createLongQuotesSlidesDefaultInsertionSlideNumber_,	
}): void => {
	logInfo(MODULE, `Processing ${longQuoteItems.length} items`);

	internalCreateLongQuoteSlides_({
		longQuoteItems: longQuoteItems,
		templateTitleSlideNumber: templateTitleSlideNumber,
		templateContentSlideNumber: templateContentSlideNumber,
		insertionSlideNumber: insertionSlideNumber,
		overrideTitleTextBoxKey: overrideTitleTextBoxKey,
		overrideSubtitleTextBoxKey: overrideSubtitleTextBoxKey,
		overrideQuoteTextBoxKey: overrideQuoteTextBoxKey,
		overrideAddendumTextBoxKey: overrideAddendumTextBoxKey,
		titleColor: titleColor,
		subtitleColor: subtitleColor,
		quoteColor: quoteColor,
		addendumColor: addendumColor,
		titleFontSize: titleFontSize,
		subtitleFontSize: subtitleFontSize,
		quoteFontSize: quoteFontSize,
		addendumFontSize: addendumFontSize,
		titleStrikethrough: titleStrikethrough,
		subtitleStrikethrough: subtitleStrikethrough,
		quoteStrikethrough: quoteStrikethrough,
		addendumStrikethrough: addendumStrikethrough,
		titleUnderline: titleUnderline,
		subtitleUnderline: subtitleUnderline,
		quoteUnderline: quoteUnderline,
		addendumUnderline: addendumUnderline,
	});

	logInfo(MODULE, generateDiscordPost_({longQuoteItems: longQuoteItems}));
};

const internalCreateLongQuoteSlides_ = ({
	longQuoteItems: longQuoteItems,
	templateTitleSlideNumber,
	templateContentSlideNumber,
	insertionSlideNumber,
	overrideTitleTextBoxKey,
	overrideSubtitleTextBoxKey,
	overrideQuoteTextBoxKey,
	overrideAddendumTextBoxKey,
	titleColor,
	subtitleColor,
	quoteColor,
	addendumColor,
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
	longQuoteItems: LongQuoteItem[],
	templateTitleSlideNumber: Nullable<SlideNumber>,
	templateContentSlideNumber: Nullable<SlideNumber>,
	insertionSlideNumber: SlideNumber,
	overrideTitleTextBoxKey?: string,
	overrideSubtitleTextBoxKey?: string,
	overrideQuoteTextBoxKey?: string,
	overrideAddendumTextBoxKey?: string,
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
}): void => {
	const presentation = getActivePresentation_(MODULE);
	if (!presentation) {
		return;
	}

	const templateTitleSlideId: Nullable<SlideId> = slideNumberToId_({
		presentation: presentation,
		slideNumber: templateTitleSlideNumber,
		pageElementKeys: [
			overrideTitleTextBoxKey ?? "section-title-text-box",
			overrideSubtitleTextBoxKey ?? "section-subtitle-text-box",
		],
	});
	const templateContentSlideId: Nullable<SlideId> = slideNumberToId_({
		presentation: presentation,
		slideNumber: templateContentSlideNumber,
		pageElementKeys: [
			overrideQuoteTextBoxKey ?? "quote-text-box",
			overrideAddendumTextBoxKey ?? "addendum-text-box",
		],
	});

	let currentInsertionIndex: SlideNumber = slideNumberToIndex_(insertionSlideNumber);

	if (templateContentSlideId === null || templateTitleSlideId === null) {
		logError(MODULE, "Template slides not found (title or content)");
		return;
	}

	longQuoteItems.forEach((lyricsSlidesItem: LongQuoteItem): void => {
		logInfo(MODULE, `Generating '${lyricsSlidesItem.title}'`);
		
		currentInsertionIndex = processLongQuoteSlideItem_({
			presentation: presentation,
			templateTitleSlideId: templateTitleSlideId,
			templateLongQuoteSlideId: templateContentSlideId,
			longQuoteSlidesItem: lyricsSlidesItem,
			baseInsertionIndex: currentInsertionIndex,
			titleKey: overrideTitleTextBoxKey,
			subtitleKey: overrideSubtitleTextBoxKey,
			quoteKey: overrideQuoteTextBoxKey,
			addendumKey: overrideAddendumTextBoxKey,
			titleColor: titleColor,
			subtitleColor: subtitleColor,
			quoteColor: quoteColor,
			addendumColor: addendumColor,
			titleFontSize: titleFontSize,
			subtitleFontSize: subtitleFontSize,
			quoteFontSize: quoteFontSize,
			addendumFontSize: addendumFontSize,
			titleStrikethrough: titleStrikethrough,
			subtitleStrikethrough: subtitleStrikethrough,
			quoteStrikethrough: quoteStrikethrough,
			addendumStrikethrough: addendumStrikethrough,
			titleUnderline: titleUnderline,
			subtitleUnderline: subtitleUnderline,
			quoteUnderline: quoteUnderline,
			addendumUnderline: addendumUnderline,
		}) ?? currentInsertionIndex; 
	});
};
