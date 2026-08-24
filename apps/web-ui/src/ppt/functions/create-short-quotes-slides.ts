/**
 * create-short-quotes-slides.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { generateSlidesFromTemplate } from "../pipeline";
import type { SlideOperation } from "../pipeline";
import { loadTemplate } from "../template-loader";
import { toPptColor } from "../color-map";
import type { TextStyles } from "../text-replacer";
import type { ShortQuoteItem } from "@gsg/shared";

export interface CreateShortQuotesSlidesParams {
	shortQuoteItems: ShortQuoteItem[];
	overrideQuoteTextBoxKey?: string;
	overrideAddendumTextBoxKey?: string;
	quoteColor?: string;
	addendumColor?: string;
	quoteFontSize?: number;
	addendumFontSize?: number;
	quoteStrikethrough?: boolean;
	addendumStrikethrough?: boolean;
	quoteUnderline?: boolean;
	addendumUnderline?: boolean;
}

export async function createShortQuotesSlides(
	templateBuffer: ArrayBuffer,
	params: CreateShortQuotesSlidesParams,
): Promise<ArrayBuffer> {
	if (!params) {
		console.warn("create-short-quotes-slides: params is null or undefined");
		return templateBuffer;
	}

	if (!params.shortQuoteItems || params.shortQuoteItems.length === 0) {
		console.warn("createShortQuotesSlides: shortQuoteItems is empty or undefined");
		return templateBuffer;
	}

	const template = await loadTemplate(templateBuffer);

	const quoteKey: string = params.overrideQuoteTextBoxKey ?? "quote-text-box";
	const addendumKey: string = params.overrideAddendumTextBoxKey ?? "addendum-text-box";

	const requiredKeys: string[] = [quoteKey, addendumKey];

	let sourceKey: string | undefined;
	for (const key of requiredKeys) {
		const slide = template.slides.find((s) => s.keys.includes(key));
		if (slide && requiredKeys.every((k) => slide.keys.includes(k))) {
			sourceKey = key;
			break;
		}
	}
	if (!sourceKey) {
		console.warn("createShortQuotesSlides: no template slide found with keys", requiredKeys);
		return templateBuffer;
	}

	const operations: SlideOperation[] = params.shortQuoteItems.map((item) => {
		const textReplacements: Record<string, string> = {
			[quoteKey]: item.quote,
			[addendumKey]: item.addendum,
		};

		const styleOverrides: Record<string, TextStyles> = {};

		const resolvedQuoteColor: string | undefined = toPptColor(
			item.quoteColor ?? params.quoteColor ?? "DARK1",
		);
		const resolvedQuoteBold = item.quoteBold;
		const resolvedQuoteItalic = item.quoteItalic;
		const resolvedQuoteStrikethrough =
			item.quoteStrikethrough ?? params.quoteStrikethrough;
		const resolvedQuoteUnderline =
			item.quoteUnderline ?? params.quoteUnderline;
		const resolvedQuoteFontSize =
			item.quoteFontSize ?? params.quoteFontSize;

		const quoteStyle: TextStyles = {};
		if (resolvedQuoteColor) quoteStyle.color = resolvedQuoteColor;
		if (resolvedQuoteBold !== undefined) quoteStyle.bold = resolvedQuoteBold;
		if (resolvedQuoteItalic !== undefined) quoteStyle.italic = resolvedQuoteItalic;
		if (resolvedQuoteStrikethrough !== undefined) quoteStyle.strikethrough = resolvedQuoteStrikethrough;
		if (resolvedQuoteUnderline !== undefined) quoteStyle.underline = resolvedQuoteUnderline;
		if (resolvedQuoteFontSize !== undefined) quoteStyle.fontSize = resolvedQuoteFontSize;
		if (Object.keys(quoteStyle).length > 0) styleOverrides[quoteKey] = quoteStyle;

		const resolvedAddendumColor: string | undefined = toPptColor(
			item.addendumColor ?? params.addendumColor ?? "DARK1",
		);
		const resolvedAddendumBold = item.addendumBold;
		const resolvedAddendumItalic = item.addendumItalic;
		const resolvedAddendumStrikethrough =
			item.addendumStrikethrough ?? params.addendumStrikethrough;
		const resolvedAddendumUnderline =
			item.addendumUnderline ?? params.addendumUnderline;
		const resolvedAddendumFontSize =
			item.addendumFontSize ?? params.addendumFontSize;

		const addendumStyle: TextStyles = {};
		if (resolvedAddendumColor) addendumStyle.color = resolvedAddendumColor;
		if (resolvedAddendumBold !== undefined) addendumStyle.bold = resolvedAddendumBold;
		if (resolvedAddendumItalic !== undefined) addendumStyle.italic = resolvedAddendumItalic;
		if (resolvedAddendumStrikethrough !== undefined) addendumStyle.strikethrough = resolvedAddendumStrikethrough;
		if (resolvedAddendumUnderline !== undefined) addendumStyle.underline = resolvedAddendumUnderline;
		if (resolvedAddendumFontSize !== undefined) addendumStyle.fontSize = resolvedAddendumFontSize;
		if (Object.keys(addendumStyle).length > 0) styleOverrides[addendumKey] = addendumStyle;

		return {
			templateSourceKey: sourceKey,
			textReplacements,
			...(Object.keys(styleOverrides).length > 0 ? { styleOverrides } : {}),
		};
	});

	return generateSlidesFromTemplate(templateBuffer, operations);
}
