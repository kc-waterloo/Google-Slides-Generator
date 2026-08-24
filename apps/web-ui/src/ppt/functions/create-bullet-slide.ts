/**
 * create-bullet-slide.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { generateSlidesFromTemplate } from "../pipeline";
import type { SlideOperation } from "../pipeline";
import { loadTemplate } from "../template-loader";
import { toPptColor } from "../color-map";
import type { TextStyles } from "../text-replacer";

export interface CreateBulletSlideParams {
	title: string;
	bullets: string[];
	overrideTitleTextBoxKey?: string;
	overrideBulletPrefix?: string;
	titleFontSize?: number;
	bulletFontSize?: number;
	titleColor?: string;
	bulletColor?: string;
	titleItalic?: boolean;
	bulletItalic?: boolean;
	titleStrikethrough?: boolean;
	bulletStrikethrough?: boolean;
	titleUnderline?: boolean;
	bulletUnderline?: boolean;
}

export async function createBulletSlide(
	templateBuffer: ArrayBuffer,
	params: CreateBulletSlideParams,
): Promise<ArrayBuffer> {
	if (!params) {
		console.warn("create-bullet-slide: params is null or undefined");
		return templateBuffer;
	}

	if (!params.bullets || params.bullets.length === 0) {
		console.warn("createBulletSlide: bullets array is empty or undefined");
		return templateBuffer;
	}

	const template = await loadTemplate(templateBuffer);

	const titleKey: string = params.overrideTitleTextBoxKey ?? "bullet-title-text-box";
	const bulletPrefix: string = params.overrideBulletPrefix ?? "bullet-point-";
	const bulletSuffix: string = "-text";

	const requiredKeys: string[] = [
		titleKey,
		...params.bullets.map((_, i) => `${bulletPrefix}${i + 1}${bulletSuffix}`),
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
		console.warn("createBulletSlide: no template slide found with all required keys", requiredKeys);
		return templateBuffer;
	}

	const textReplacements: Record<string, string> = {
		[titleKey]: params.title,
	};
	for (let i = 0; i < params.bullets.length; i++) {
		textReplacements[`${bulletPrefix}${i + 1}${bulletSuffix}`] = params.bullets[i] ?? "";
	}

	const styleOverrides: Record<string, TextStyles> = {};

	const titleStyle: TextStyles = {
		bold: true,
	};
	if (params.titleFontSize !== undefined) titleStyle.fontSize = params.titleFontSize;
	const resolvedTitleColor: string | undefined = toPptColor(params.titleColor ?? "DARK1");
	if (resolvedTitleColor) titleStyle.color = resolvedTitleColor;
	if (params.titleItalic !== undefined) titleStyle.italic = params.titleItalic;
	if (params.titleStrikethrough !== undefined) titleStyle.strikethrough = params.titleStrikethrough;
	if (params.titleUnderline !== undefined) titleStyle.underline = params.titleUnderline;
	if (Object.keys(titleStyle).length > 0) styleOverrides[titleKey] = titleStyle;

	const bulletStyle: TextStyles = {
		bold: false,
	};
	if (params.bulletFontSize !== undefined) bulletStyle.fontSize = params.bulletFontSize;
	const resolvedBulletColor: string | undefined = toPptColor(params.bulletColor ?? "DARK1");
	if (resolvedBulletColor) bulletStyle.color = resolvedBulletColor;
	if (params.bulletItalic !== undefined) bulletStyle.italic = params.bulletItalic;
	if (params.bulletStrikethrough !== undefined) bulletStyle.strikethrough = params.bulletStrikethrough;
	if (params.bulletUnderline !== undefined) bulletStyle.underline = params.bulletUnderline;
	if (Object.keys(bulletStyle).length > 0) {
		for (let i = 0; i < params.bullets.length; i++) {
			styleOverrides[`${bulletPrefix}${i + 1}${bulletSuffix}`] = bulletStyle;
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
