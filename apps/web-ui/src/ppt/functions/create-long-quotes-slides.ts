/**
 * create-long-quotes-slides.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { generateSlidesFromTemplate } from "../pipeline";
import type { SlideOperation } from "../pipeline";
import { loadTemplate } from "../template-loader";
import { toPptColor } from "../color-map";
import type { TextStyles } from "../text-replacer";
import type { LongQuoteItem } from "@gsg/shared";
import { splitStringByWhitespace } from "@gsg/shared";

export interface CreateLongQuotesSlidesParams {
	longQuoteItems: LongQuoteItem[];
	overrideTitleTextBoxKey?: string;
	overrideSubtitleTextBoxKey?: string;
	overrideQuoteTextBoxKey?: string;
	overrideAddendumTextBoxKey?: string;
	titleColor?: string;
	subtitleColor?: string;
	quoteColor?: string;
	addendumColor?: string;
	titleFontSize?: number;
	subtitleFontSize?: number;
	quoteFontSize?: number;
	addendumFontSize?: number;
	titleStrikethrough?: boolean;
	subtitleStrikethrough?: boolean;
	quoteStrikethrough?: boolean;
	addendumStrikethrough?: boolean;
	titleUnderline?: boolean;
	subtitleUnderline?: boolean;
	quoteUnderline?: boolean;
	addendumUnderline?: boolean;
}

interface ResolvedStyles {
	title: TextStyles;
	subtitle: TextStyles;
	quote: TextStyles;
	addendum: TextStyles;
}

function resolveItemStyles(
	item: LongQuoteItem,
	global: CreateLongQuotesSlidesParams,
): ResolvedStyles {
	const titleStyle: TextStyles = {};
	const resolvedTitleColor: string | undefined = toPptColor(
		item.titleColor ?? global.titleColor ?? "DARK1",
	);
	if (resolvedTitleColor) titleStyle.color = resolvedTitleColor;
	if (item.titleBold !== undefined) titleStyle.bold = item.titleBold;
	if (item.titleItalic !== undefined) titleStyle.italic = item.titleItalic;
	if ((item.titleStrikethrough ?? global.titleStrikethrough) !== undefined)
		titleStyle.strikethrough = item.titleStrikethrough ?? global.titleStrikethrough;
	if ((item.titleUnderline ?? global.titleUnderline) !== undefined)
		titleStyle.underline = item.titleUnderline ?? global.titleUnderline;
	if ((item.titleFontSize ?? global.titleFontSize) !== undefined)
		titleStyle.fontSize = item.titleFontSize ?? global.titleFontSize;

	const subtitleStyle: TextStyles = {};
	const resolvedSubtitleColor: string | undefined = toPptColor(
		item.subtitleColor ?? global.subtitleColor ?? "DARK1",
	);
	if (resolvedSubtitleColor) subtitleStyle.color = resolvedSubtitleColor;
	if (item.subtitleBold !== undefined) subtitleStyle.bold = item.subtitleBold;
	if (item.subtitleItalic !== undefined) subtitleStyle.italic = item.subtitleItalic;
	if ((item.subtitleStrikethrough ?? global.subtitleStrikethrough) !== undefined)
		subtitleStyle.strikethrough = item.subtitleStrikethrough ?? global.subtitleStrikethrough;
	if ((item.subtitleUnderline ?? global.subtitleUnderline) !== undefined)
		subtitleStyle.underline = item.subtitleUnderline ?? global.subtitleUnderline;
	if ((item.subtitleFontSize ?? global.subtitleFontSize) !== undefined)
		subtitleStyle.fontSize = item.subtitleFontSize ?? global.subtitleFontSize;

	const quoteStyle: TextStyles = {};
	const resolvedQuoteColor: string | undefined = toPptColor(
		item.quoteColor ?? global.quoteColor ?? "DARK1",
	);
	if (resolvedQuoteColor) quoteStyle.color = resolvedQuoteColor;
	if (item.quoteBold !== undefined) quoteStyle.bold = item.quoteBold;
	if (item.quoteItalic !== undefined) quoteStyle.italic = item.quoteItalic;
	if ((item.quoteStrikethrough ?? global.quoteStrikethrough) !== undefined)
		quoteStyle.strikethrough = item.quoteStrikethrough ?? global.quoteStrikethrough;
	if ((item.quoteUnderline ?? global.quoteUnderline) !== undefined)
		quoteStyle.underline = item.quoteUnderline ?? global.quoteUnderline;
	if ((item.quoteFontSize ?? global.quoteFontSize) !== undefined)
		quoteStyle.fontSize = item.quoteFontSize ?? global.quoteFontSize;

	const addendumStyle: TextStyles = {};
	const resolvedAddendumColor: string | undefined = toPptColor(
		item.addendumColor ?? global.addendumColor ?? "DARK1",
	);
	if (resolvedAddendumColor) addendumStyle.color = resolvedAddendumColor;
	if (item.addendumBold !== undefined) addendumStyle.bold = item.addendumBold;
	if (item.addendumItalic !== undefined) addendumStyle.italic = item.addendumItalic;
	if ((item.addendumStrikethrough ?? global.addendumStrikethrough) !== undefined)
		addendumStyle.strikethrough = item.addendumStrikethrough ?? global.addendumStrikethrough;
	if ((item.addendumUnderline ?? global.addendumUnderline) !== undefined)
		addendumStyle.underline = item.addendumUnderline ?? global.addendumUnderline;
	if ((item.addendumFontSize ?? global.addendumFontSize) !== undefined)
		addendumStyle.fontSize = item.addendumFontSize ?? global.addendumFontSize;

	return { title: titleStyle, subtitle: subtitleStyle, quote: quoteStyle, addendum: addendumStyle };
}

export async function createLongQuotesSlides(
	templateBuffer: ArrayBuffer,
	params: CreateLongQuotesSlidesParams,
): Promise<ArrayBuffer> {
	if (!params) {
		console.warn("create-long-quotes-slides: params is null or undefined");
		return templateBuffer;
	}

	if (!params.longQuoteItems || params.longQuoteItems.length === 0) {
		console.warn("createLongQuotesSlides: longQuoteItems is empty or undefined");
		return templateBuffer;
	}

	const template = await loadTemplate(templateBuffer);

	const titleKey: string = params.overrideTitleTextBoxKey ?? "section-title-text-box";
	const subtitleKey: string = params.overrideSubtitleTextBoxKey ?? "section-subtitle-text-box";
	const quoteKey: string = params.overrideQuoteTextBoxKey ?? "quote-text-box";
	const addendumKey: string = params.overrideAddendumTextBoxKey ?? "addendum-text-box";

	const titleRequiredKeys: string[] = [titleKey, subtitleKey];
	const contentRequiredKeys: string[] = [quoteKey, addendumKey];

	let titleSourceKey: string | undefined;
	for (const key of titleRequiredKeys) {
		const slide = template.slides.find((s) => s.keys.includes(key));
		if (slide && titleRequiredKeys.every((k) => slide.keys.includes(k))) {
			titleSourceKey = key;
			break;
		}
	}

	let contentSourceKey: string | undefined;
	for (const key of contentRequiredKeys) {
		const slide = template.slides.find((s) => s.keys.includes(key));
		if (slide && contentRequiredKeys.every((k) => slide.keys.includes(k))) {
			contentSourceKey = key;
			break;
		}
	}

	if (!titleSourceKey || !contentSourceKey) {
		console.warn(
			"createLongQuotesSlides: no template slides found for title or content keys",
			{ titleRequiredKeys, contentRequiredKeys },
		);
		return templateBuffer;
	}

	const operations: SlideOperation[] = [];

	for (const item of params.longQuoteItems) {
		const styles = resolveItemStyles(item, params);

		const titleStyleOverrides: Record<string, TextStyles> = {};
		if (Object.keys(styles.title).length > 0) titleStyleOverrides[titleKey] = styles.title;
		if (Object.keys(styles.subtitle).length > 0) titleStyleOverrides[subtitleKey] = styles.subtitle;

		operations.push({
			templateSourceKey: titleSourceKey,
			textReplacements: {
				[titleKey]: item.title,
				[subtitleKey]: item.subtitle,
			},
			...(Object.keys(titleStyleOverrides).length > 0 ? { styleOverrides: titleStyleOverrides } : {}),
		});

		const splitChunks: string[] = splitStringByWhitespace(
			item.quote,
			item.splitMode,
			item.splitMaxChars,
		);

		for (const chunk of splitChunks) {
			const contentStyleOverrides: Record<string, TextStyles> = {};
			if (Object.keys(styles.quote).length > 0) contentStyleOverrides[quoteKey] = styles.quote;
			if (Object.keys(styles.addendum).length > 0) contentStyleOverrides[addendumKey] = styles.addendum;

			operations.push({
				templateSourceKey: contentSourceKey,
				textReplacements: {
					[quoteKey]: chunk,
					[addendumKey]: item.title,
				},
				...(Object.keys(contentStyleOverrides).length > 0 ? { styleOverrides: contentStyleOverrides } : {}),
			});
		}
	}

	return generateSlidesFromTemplate(templateBuffer, operations);
}
