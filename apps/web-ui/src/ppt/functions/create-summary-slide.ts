/**
 * create-summary-slide.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { generateSlidesFromTemplate } from "../pipeline";
import type { SlideOperation } from "../pipeline";
import { loadTemplate } from "../template-loader";
import { toPptColor } from "../color-map";
import type { TextStyles } from "../text-replacer";

export interface CreateSummarySlideParams {
	title: string;
	items: string[];
	titleFontSize?: number;
	itemFontSize?: number;
	titleColor?: string;
	itemColor?: string;
	titleBold?: boolean;
	itemBold?: boolean;
	titleItalic?: boolean;
	itemItalic?: boolean;
	titleStrikethrough?: boolean;
	itemStrikethrough?: boolean;
	titleUnderline?: boolean;
	itemUnderline?: boolean;
}

const TITLE_KEY = "summary-title-text";
const ITEM_PREFIX = "summary-item-";
const ITEM_SUFFIX = "-text";

export async function createSummarySlide(
	templateBuffer: ArrayBuffer,
	params: CreateSummarySlideParams,
): Promise<ArrayBuffer> {
	if (!params) {
		console.warn("create-summary-slide: params is null or undefined");
		return templateBuffer;
	}

	if (!params.items || params.items.length === 0) {
		console.warn("createSummarySlide: items array is empty or undefined");
		return templateBuffer;
	}

	const template = await loadTemplate(templateBuffer);

	const requiredKeys: string[] = [
		TITLE_KEY,
		...params.items.map((_, i) => `${ITEM_PREFIX}${i + 1}${ITEM_SUFFIX}`),
	];

	let sourceKey: string | undefined;
	for (const key of requiredKeys) {
		const slide = template.slides.find((s) => s.keys.includes(key));
		if (slide && requiredKeys.every((k) => slide.keys.includes(k))) {
			sourceKey = key;
			break;
		}
	}
	if (!sourceKey) {
		console.warn("createSummarySlide: no template slide found with all required keys", requiredKeys);
		return templateBuffer;
	}

	const textReplacements: Record<string, string> = {
		[TITLE_KEY]: params.title,
	};
	for (let i = 0; i < params.items.length; i++) {
		textReplacements[`${ITEM_PREFIX}${i + 1}${ITEM_SUFFIX}`] = params.items[i] ?? "";
	}

	const styleOverrides: Record<string, TextStyles> = {};

	const titleStyle: TextStyles = {};
	if (params.titleFontSize !== undefined) titleStyle.fontSize = params.titleFontSize;
	const resolvedTitleColor: string | undefined = toPptColor(params.titleColor ?? "DARK1");
	if (resolvedTitleColor) titleStyle.color = resolvedTitleColor;
	if (params.titleBold !== undefined) titleStyle.bold = params.titleBold;
	if (params.titleItalic !== undefined) titleStyle.italic = params.titleItalic;
	if (params.titleStrikethrough !== undefined) titleStyle.strikethrough = params.titleStrikethrough;
	if (params.titleUnderline !== undefined) titleStyle.underline = params.titleUnderline;
	if (Object.keys(titleStyle).length > 0) styleOverrides[TITLE_KEY] = titleStyle;

	const itemStyle: TextStyles = {};
	if (params.itemFontSize !== undefined) itemStyle.fontSize = params.itemFontSize;
	const resolvedItemColor: string | undefined = toPptColor(params.itemColor ?? "DARK1");
	if (resolvedItemColor) itemStyle.color = resolvedItemColor;
	if (params.itemBold !== undefined) itemStyle.bold = params.itemBold;
	if (params.itemItalic !== undefined) itemStyle.italic = params.itemItalic;
	if (params.itemStrikethrough !== undefined) itemStyle.strikethrough = params.itemStrikethrough;
	if (params.itemUnderline !== undefined) itemStyle.underline = params.itemUnderline;
	if (Object.keys(itemStyle).length > 0) {
		for (let i = 0; i < params.items.length; i++) {
			styleOverrides[`${ITEM_PREFIX}${i + 1}${ITEM_SUFFIX}`] = itemStyle;
		}
	}

	const operations: SlideOperation[] = [
		{
			templateSourceKey: sourceKey,
			textReplacements,
			...(Object.keys(styleOverrides).length > 0 ? { styleOverrides } : {}),
		},
	];

	return generateSlidesFromTemplate(templateBuffer, operations);
}
