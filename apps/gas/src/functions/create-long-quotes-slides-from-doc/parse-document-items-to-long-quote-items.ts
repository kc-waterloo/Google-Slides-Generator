/**
 * parse-document-items-to-long-quote-items.ts
 *
 * Created by Min-Kyu Lee on 22-05-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { headingNumber_ } from "../../shared/parse-document/paragraph-heading-to-number";
import { ParseDocumentItem } from "../../shared/parse-document/parse-document-item";
import { LongQuoteItem, LongQuoteSplitMode, RegExpPattern, testPattern } from "@gsg/shared";

type PushItem = (subtitle: string, quote: string) => void;

const isTextAllowed_ = (
	text: string,
	allowList: RegExpPattern[],
	blockList: RegExpPattern[],
): boolean => {
	if (allowList.length !== 0 && !allowList.some((p) => testPattern(p, text))) {
		return false;
	}
	if (blockList.length !== 0 && blockList.some((p) => testPattern(p, text))) {
		return false;
	}
	return true;
};

const processConsecutiveQuotes_ = (
	children: ParseDocumentItem[],
	subtitle: string,
	pushItem: PushItem,
): void => {
	const pendingQuotes: string[] = [];
	const flush = (): void => {
		if (pendingQuotes.length > 0) {
			pushItem(subtitle, pendingQuotes.join("\n\n"));
			pendingQuotes.length = 0;
		}
	};
	children.forEach((child) => {
		if (
			child.paragraphHeading === DocumentApp.ParagraphHeading.NORMAL &&
			child.text
		) {
			pendingQuotes.push(child.text);
		} else {
			flush();
		}
	});
	flush();
};

const processIndividualQuotes_ = (
	children: ParseDocumentItem[],
	subtitle: string,
	pushItem: PushItem,
): void => {
	children.forEach((child) => {
		if (child.paragraphHeading === DocumentApp.ParagraphHeading.NORMAL) {
			pushItem(subtitle, child.text);
		}
	});
};

const processHeading1Subtitles_ = (
	children: ParseDocumentItem[],
	title: string,
	subtitleAllowList: RegExpPattern[],
	subtitleBlockList: RegExpPattern[],
	joinConsecutiveQuotes: boolean,
	pushItem: PushItem,
): void => {
	children.forEach((child) => {
		if (child.paragraphHeading !== DocumentApp.ParagraphHeading.HEADING2) {
			return;
		}
		const subtitle = child.text;
		if (!isTextAllowed_(subtitle, subtitleAllowList, subtitleBlockList)) {
			return;
		}
		if (joinConsecutiveQuotes) {
			processConsecutiveQuotes_(child.children, subtitle, pushItem);
		} else {
			processIndividualQuotes_(child.children, subtitle, pushItem);
		}
	});
};

const processHeading1DirectNormals_ = (
	children: ParseDocumentItem[],
	title: string,
	joinConsecutiveQuotes: boolean,
	pushItem: PushItem,
): void => {
	const pendingQuotes: string[] = [];
	const flush = (subtitle: string): void => {
		if (pendingQuotes.length > 0) {
			pushItem(subtitle, pendingQuotes.join("\n\n"));
			pendingQuotes.length = 0;
		}
	};
	children.forEach((child) => {
		if (child.paragraphHeading === DocumentApp.ParagraphHeading.NORMAL) {
			if (child.text) {
				if (joinConsecutiveQuotes) {
					pendingQuotes.push(child.text);
				} else {
					pushItem("", child.text);
				}
			}
		} else if (joinConsecutiveQuotes && pendingQuotes.length > 0) {
			flush("");
		}
	});
	if (joinConsecutiveQuotes) {
		flush("");
	}
};

export const parseDocumentItemsToLongQuoteItems_ = ({
	parseDocumentItems,
	titleAllowList = [],
	titleBlockList = [],
	subtitleAllowList = [],
	subtitleBlockList = [],
	defaultSplitMode = "paragraph",
	defaultSplitMaxChars,
	joinConsecutiveQuotes = false,
	requireSubtitle = true,
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
	parseDocumentItems: ParseDocumentItem[],
	titleAllowList?: RegExpPattern[],
	titleBlockList?: RegExpPattern[],
	subtitleAllowList?: RegExpPattern[],
	subtitleBlockList?: RegExpPattern[],
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
}): LongQuoteItem[] => {
	const longQuoteItems: LongQuoteItem[] = [];

	const baseItem = (subtitle: string, quote: string): LongQuoteItem => ({
		title: "",
		subtitle: subtitle,
		quote: quote,
		splitMode: defaultSplitMode,
		splitMaxChars: defaultSplitMaxChars,
		titleBold: defaultTitleBold,
		subtitleBold: defaultSubtitleBold,
		quoteBold: defaultQuoteBold,
		addendumBold: defaultAddendumBold,
		titleItalic: defaultTitleItalic,
		subtitleItalic: defaultSubtitleItalic,
		quoteItalic: defaultQuoteItalic,
		addendumItalic: defaultAddendumItalic,
		titleStrikethrough: defaultTitleStrikethrough,
		subtitleStrikethrough: defaultSubtitleStrikethrough,
		quoteStrikethrough: defaultQuoteStrikethrough,
		addendumStrikethrough: defaultAddendumStrikethrough,
		titleUnderline: defaultTitleUnderline,
		subtitleUnderline: defaultSubtitleUnderline,
		quoteUnderline: defaultQuoteUnderline,
		addendumUnderline: defaultAddendumUnderline,
	});

	const parseDocumentQueue: ParseDocumentItem[] = [...parseDocumentItems];
	while (parseDocumentQueue.length > 0) {
		const currentParseDocumentItem: ParseDocumentItem | undefined = parseDocumentQueue.shift();

		if (currentParseDocumentItem === undefined) {
			continue;
		}

		if (
			currentParseDocumentItem.paragraphHeading === DocumentApp.ParagraphHeading.HEADING1
		) {
			const title: string = currentParseDocumentItem.text;

			if (!isTextAllowed_(title, titleAllowList, titleBlockList)) {
				continue;
			}

			const pushItem: PushItem = (subtitle: string, quote: string): void => {
				longQuoteItems.push({
					...baseItem(subtitle, quote),
					title: title,
				});
			};

			processHeading1Subtitles_(
				currentParseDocumentItem.children,
				title,
				subtitleAllowList,
				subtitleBlockList,
				joinConsecutiveQuotes,
				pushItem,
			);

			if (!requireSubtitle) {
				processHeading1DirectNormals_(
					currentParseDocumentItem.children,
					title,
					joinConsecutiveQuotes,
					pushItem,
				);
			}
		}

		if (
			headingNumber_(currentParseDocumentItem.paragraphHeading) <
			headingNumber_(DocumentApp.ParagraphHeading.HEADING1)
		) {
			parseDocumentQueue.push(...Array.from(currentParseDocumentItem.children));
		}
	}

	return longQuoteItems;
};
