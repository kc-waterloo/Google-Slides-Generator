/**
 * create-long-quotes-slides-from-doc/index.ts
 *
 * Created by Min-Kyu Lee on 22-05-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { Nullable, SlideNumber, LongQuoteItem, LongQuoteSplitMode, RegExpPattern } from "@gsg/shared";
import { parseDocument_ } from "../../shared/parse-document/parse-document";
import { ParseDocumentItem } from "../../shared/parse-document/parse-document-item";
import { createLongQuotesSlides } from "../create-long-quotes-slides";
import { parseDocumentItemsToLongQuoteItems_ } from "./parse-document-items-to-long-quote-items";
import { logInfo } from "../../shared/logger/logger";

const MODULE = "createLongQuotesSlidesFromDoc";

/**
 * Parses a Google Doc and generates long-quote slides from its contents.
 * Delegates to createLongQuotesSlides after parsing the document.
 *
 * @param {Object} parameters - parameters for the function
 * @param {string} parameters.inputDocumentUrl - URL of the Google Doc to parse
 * @param {(RegExp|string)[]} parameters.titleAllowList - Regex patterns to include titles
 * @param {(RegExp|string)[]} parameters.titleBlockList - Regex patterns to exclude titles
 * @param {Nullable<SlideNumber>} parameters.templateTitleSlideNumber - Template for title slides (null = auto-detect)
 * @param {Nullable<SlideNumber>} parameters.templateContentSlideNumber - Template for content slides (null = auto-detect)
 * @param {SlideNumber} parameters.insertionSlideNumber - Where to insert generated slides
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
 * @param {LongQuoteSplitMode} [parameters.defaultSplitMode] - Default split mode for quotes ("paragraph", "sentence", "char-count", "none")
 * @param {number} [parameters.defaultSplitMaxChars] - Max chars per split when defaultSplitMode is "char-count"
 * @param {boolean} [parameters.joinConsecutiveQuotes] - Merge consecutive Normal paragraphs into one quote
 * @param {boolean} [parameters.requireSubtitle] - Require H2 subtitles under H1 titles
 * @param {(RegExp|string)[]} [parameters.subtitleAllowList] - Only include subtitles matching these patterns
 * @param {(RegExp|string)[]} [parameters.subtitleBlockList] - Exclude subtitles matching these patterns
 * @param {boolean} [parameters.defaultTitleBold] - Default bold for all title text
 * @param {boolean} [parameters.defaultSubtitleBold] - Default bold for all subtitle text
 * @param {boolean} [parameters.defaultQuoteBold] - Default bold for all quote text
 * @param {boolean} [parameters.defaultAddendumBold] - Default bold for all addendum text
 * @param {boolean} [parameters.defaultTitleItalic] - Default italic for all title text
 * @param {boolean} [parameters.defaultSubtitleItalic] - Default italic for all subtitle text
 * @param {boolean} [parameters.defaultQuoteItalic] - Default italic for all quote text
 * @param {boolean} [parameters.defaultAddendumItalic] - Default italic for all addendum text
 * @param {boolean} [parameters.defaultTitleStrikethrough] - Default strikethrough for all title text
 * @param {boolean} [parameters.defaultSubtitleStrikethrough] - Default strikethrough for all subtitle text
 * @param {boolean} [parameters.defaultQuoteStrikethrough] - Default strikethrough for all quote text
 * @param {boolean} [parameters.defaultAddendumStrikethrough] - Default strikethrough for all addendum text
 * @param {boolean} [parameters.defaultTitleUnderline] - Default underline for all title text
 * @param {boolean} [parameters.defaultSubtitleUnderline] - Default underline for all subtitle text
 * @param {boolean} [parameters.defaultQuoteUnderline] - Default underline for all quote text
 * @param {boolean} [parameters.defaultAddendumUnderline] - Default underline for all addendum text
 * @returns {void}
 */
export const createLongQuotesSlidesFromDoc = ({
	inputDocumentUrl,
	titleAllowList,
	titleBlockList,
	subtitleAllowList,
	subtitleBlockList,
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
	defaultSplitMode,
	defaultSplitMaxChars,
	joinConsecutiveQuotes,
	requireSubtitle,
	defaultTitleBold,
	defaultSubtitleBold,
	defaultQuoteBold,
	defaultAddendumBold,
	defaultTitleItalic,
	defaultSubtitleItalic,
	defaultQuoteItalic,
	defaultAddendumItalic,
	defaultTitleStrikethrough,
	defaultSubtitleStrikethrough,
	defaultQuoteStrikethrough,
	defaultAddendumStrikethrough,
	defaultTitleUnderline,
	defaultSubtitleUnderline,
	defaultQuoteUnderline,
	defaultAddendumUnderline,
}: {
	inputDocumentUrl: string,
	titleAllowList: RegExpPattern[],
	titleBlockList: RegExpPattern[],
	subtitleAllowList?: RegExpPattern[],
	subtitleBlockList?: RegExpPattern[],
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
	defaultSplitMode?: LongQuoteSplitMode,
	defaultSplitMaxChars?: number,
	joinConsecutiveQuotes?: boolean,
	requireSubtitle?: boolean,
	defaultTitleBold?: boolean,
	defaultSubtitleBold?: boolean,
	defaultQuoteBold?: boolean,
	defaultAddendumBold?: boolean,
	defaultTitleItalic?: boolean,
	defaultSubtitleItalic?: boolean,
	defaultQuoteItalic?: boolean,
	defaultAddendumItalic?: boolean,
	defaultTitleStrikethrough?: boolean,
	defaultSubtitleStrikethrough?: boolean,
	defaultQuoteStrikethrough?: boolean,
	defaultAddendumStrikethrough?: boolean,
	defaultTitleUnderline?: boolean,
	defaultSubtitleUnderline?: boolean,
	defaultQuoteUnderline?: boolean,
	defaultAddendumUnderline?: boolean,
}): void => {
	const parsedDocumentItems: ParseDocumentItem[] = parseDocument_(inputDocumentUrl);

	logInfo(
		MODULE,
		`Parsed ${parsedDocumentItems.length} top-level sections from document`,
	);

	const longQuoteItems: LongQuoteItem[] = parseDocumentItemsToLongQuoteItems_({
		parseDocumentItems: parsedDocumentItems,
		titleAllowList: titleAllowList,
		titleBlockList: titleBlockList,
		subtitleAllowList: subtitleAllowList,
		subtitleBlockList: subtitleBlockList,
		defaultSplitMode: defaultSplitMode,
		defaultSplitMaxChars: defaultSplitMaxChars,
		joinConsecutiveQuotes: joinConsecutiveQuotes,
		requireSubtitle: requireSubtitle,
		defaultTitleBold: defaultTitleBold,
		defaultSubtitleBold: defaultSubtitleBold,
		defaultQuoteBold: defaultQuoteBold,
		defaultAddendumBold: defaultAddendumBold,
		defaultTitleItalic: defaultTitleItalic,
		defaultSubtitleItalic: defaultSubtitleItalic,
		defaultQuoteItalic: defaultQuoteItalic,
		defaultAddendumItalic: defaultAddendumItalic,
		defaultTitleStrikethrough: defaultTitleStrikethrough,
		defaultSubtitleStrikethrough: defaultSubtitleStrikethrough,
		defaultQuoteStrikethrough: defaultQuoteStrikethrough,
		defaultAddendumStrikethrough: defaultAddendumStrikethrough,
		defaultTitleUnderline: defaultTitleUnderline,
		defaultSubtitleUnderline: defaultSubtitleUnderline,
		defaultQuoteUnderline: defaultQuoteUnderline,
		defaultAddendumUnderline: defaultAddendumUnderline,
	});

	logInfo(
		MODULE,
		`Generated ${longQuoteItems.length} long quote items from document`,
	);

	createLongQuotesSlides({
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
		titleStrikethrough: defaultTitleStrikethrough,
		subtitleStrikethrough: defaultSubtitleStrikethrough,
		quoteStrikethrough: defaultQuoteStrikethrough,
		addendumStrikethrough: defaultAddendumStrikethrough,
		titleUnderline: defaultTitleUnderline,
		subtitleUnderline: defaultSubtitleUnderline,
		quoteUnderline: defaultQuoteUnderline,
		addendumUnderline: defaultAddendumUnderline,
	});
};
