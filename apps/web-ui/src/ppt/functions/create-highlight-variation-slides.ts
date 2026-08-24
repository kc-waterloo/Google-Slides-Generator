/**
 * create-highlight-variation-slides.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { generateSlidesFromTemplate } from "../pipeline";
import type { SlideOperation } from "../pipeline";
import { loadTemplate } from "../template-loader";
import { toPptColor } from "../color-map";
import type { TextStyles } from "../text-replacer";

export interface CreateHighlightVariationSlidesParams {
	inputSlideNumber?: number;
	highlightColor?: string;
	dimmedColor?: string;
	highlightBold?: boolean;
	dimmedBold?: boolean;
	highlightBorderColor?: string;
	dimmedBorderColor?: string;
	highlightItalic?: boolean;
	dimmedItalic?: boolean;
	highlightStrikethrough?: boolean;
	dimmedStrikethrough?: boolean;
	highlightUnderline?: boolean;
	dimmedUnderline?: boolean;
	highlightFontSize?: number;
	dimmedFontSize?: number;
}

const POINT_PATTERN = /^point-(\d+)-of-(\d+)-text-box$/;

function detectHighlightInfo(
	slideKeys: string[],
): { pointCount: number } | null {
	let maxN = -1;
	let found = false;
	for (const key of slideKeys) {
		const match = key.match(POINT_PATTERN);
		if (match) {
			const n = parseInt(match[2]!, 10);
			if (n > 0) {
				maxN = Math.max(maxN, n);
				found = true;
			}
		}
	}
	if (!found) return null;
	return { pointCount: maxN };
}

function buildVariationStyles(
	isHighlighted: boolean,
	global: CreateHighlightVariationSlidesParams,
): TextStyles {
	const styles: TextStyles = {};

	const colorName: string = isHighlighted
		? (global.highlightColor ?? "DARK1")
		: (global.dimmedColor ?? "LIGHT1");
	const resolvedColor: string | undefined = toPptColor(colorName);
	if (resolvedColor) styles.color = resolvedColor;

	styles.bold = isHighlighted
		? (global.highlightBold ?? true)
		: (global.dimmedBold ?? false);

	const italic = isHighlighted ? global.highlightItalic : global.dimmedItalic;
	if (italic !== undefined) styles.italic = italic;

	const strikethrough = isHighlighted
		? global.highlightStrikethrough
		: global.dimmedStrikethrough;
	if (strikethrough !== undefined) styles.strikethrough = strikethrough;

	const underline = isHighlighted
		? global.highlightUnderline
		: global.dimmedUnderline;
	if (underline !== undefined) styles.underline = underline;

	const fontSize = isHighlighted
		? global.highlightFontSize
		: global.dimmedFontSize;
	if (fontSize !== undefined) styles.fontSize = fontSize;

	return styles;
}

export async function createHighlightVariationSlides(
	templateBuffer: ArrayBuffer,
	params: CreateHighlightVariationSlidesParams,
): Promise<ArrayBuffer> {
	if (!params) {
		console.warn("create-highlight-variation-slides: params is null or undefined");
		return templateBuffer;
	}

	const template = await loadTemplate(templateBuffer);

	const explicitSlide =
		params.inputSlideNumber !== undefined &&
		params.inputSlideNumber !== -1;

	let sourceKey: string | undefined;
	let pointCount = 0;

	if (explicitSlide) {
		const slideIndex = params.inputSlideNumber! - 1;
		if (slideIndex >= 0 && slideIndex < template.slides.length) {
			const slide = template.slides[slideIndex]!;
			const info = detectHighlightInfo(slide.keys);
			if (info) {
				sourceKey = slide.keys.find((k) => POINT_PATTERN.test(k));
				pointCount = info.pointCount;
			}
		}
	} else {
		for (const slide of template.slides) {
			const info = detectHighlightInfo(slide.keys);
			if (info) {
				sourceKey = slide.keys.find((k) => POINT_PATTERN.test(k));
				pointCount = info.pointCount;
				break;
			}
		}
	}

	if (!sourceKey || pointCount < 1) {
		console.warn("createHighlightVariationSlides: no highlight slide found with point-N-of-M keys");
		return templateBuffer;
	}

	const allKeys: string[] = [];
	for (let i = 1; i <= pointCount; i++) {
		allKeys.push(`point-${i}-of-${pointCount}-text-box`);
		allKeys.push(`point-${i}-of-${pointCount}-number-indicator-text-box`);
	}

	const operations: SlideOperation[] = [];

	for (let i = 0; i < pointCount + 2; i++) {
		const isLastSlide = i === pointCount + 1;

		const styleOverrides: Record<string, TextStyles> = {};

		for (let j = 1; j <= pointCount; j++) {
			const isHighlighted = isLastSlide || i === j;

			const textBoxKey = `point-${j}-of-${pointCount}-text-box`;
			const indicatorKey = `point-${j}-of-${pointCount}-number-indicator-text-box`;

			const styles = buildVariationStyles(isHighlighted, params);

			if (Object.keys(styles).length > 0) {
				styleOverrides[textBoxKey] = styles;
				styleOverrides[indicatorKey] = styles;
			}
		}

		operations.push({
			templateSourceKey: sourceKey,
			textReplacements: {},
			...(Object.keys(styleOverrides).length > 0 ? { styleOverrides } : {}),
		});
	}

	return generateSlidesFromTemplate(templateBuffer, operations);
}
