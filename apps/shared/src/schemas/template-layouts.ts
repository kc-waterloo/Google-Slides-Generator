/**
 * template-layouts.ts
 *
 * Created by Min-Kyu Lee on 03-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 *
 * Template layout metadata for the live slide preview feature.
 * Each function that creates slides has one or more slide types
 * (e.g., title slide, content slide) with positioned elements.
 */

/**
 * template-layouts.ts
 *
 * Created by Min-Kyu Lee on 05-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { isRecord } from "../types/guards";

export interface TemplateKeyLayout {
	/** The page element key on the slide template */
	key: string;
	/** Human-readable label */
	label: string;
	/** x position as percentage (0-100) */
	x: number;
	/** y position as percentage (0-100) */
	y: number;
	/** width as percentage (0-100) */
	width: number;
	/** height as percentage (0-100) */
	height: number;
	/** Text alignment inside the text box */
	textAlign: "left" | "center";
	/** Dot-separated path into params to extract live text (e.g., "longQuoteItems.0.title") */
	paramPath?: string;
	/** Placeholder text when param is empty */
	placeholder?: string;
	/** Param path for color override (e.g., "titleColor") */
	colorParamPath?: string;
	/** Param path for font size override (e.g., "titleFontSize") */
	fontSizeParamPath?: string;
}

export interface SlideLayout {
	/** Unique ID for this slide type */
	id: string;
	/** Human-readable label */
	label: string;
	/** Description of how many slides of this type are created */
	description: string;
	/** The positioned elements on this slide */
	elements: TemplateKeyLayout[];
}

export interface FunctionTemplateLayout {
	/** Function names that share this layout */
	functionNames: string[];
	/** Slide types this function creates */
	slides: SlideLayout[];
}

export const functionTemplateLayouts: Record<string, FunctionTemplateLayout> = {
	createLongQuotesSlides: {
		functionNames: ["createLongQuotesSlides", "createLongQuotesSlidesFromDoc"],
		slides: [
			{
				id: "title",
				label: "Title Slide",
				description: "1 per item",
				elements: [
					{
						key: "section-title-text-box",
						label: "Title",
						x: 6,
						y: 22,
						width: 88,
						height: 18,
						textAlign: "center",
						paramPath: "longQuoteItems.0.title",
						placeholder: "Section Title",
						colorParamPath: "titleColor",
						fontSizeParamPath: "titleFontSize",
					},
					{
						key: "section-subtitle-text-box",
						label: "Subtitle",
						x: 8,
						y: 44,
						width: 84,
						height: 14,
						textAlign: "center",
						paramPath: "longQuoteItems.0.subtitle",
						placeholder: "Section Subtitle",
						colorParamPath: "subtitleColor",
						fontSizeParamPath: "subtitleFontSize",
					},
				],
			},
			{
				id: "content",
				label: "Content Slide",
				description: "N per item (split by paragraph/sentence/char-count)",
				elements: [
					{
						key: "quote-text-box",
						label: "Quote",
						x: 6,
						y: 12,
						width: 88,
						height: 58,
						textAlign: "left",
						paramPath: "longQuoteItems.0.quote",
						placeholder: "Quote text appears here...",
						colorParamPath: "quoteColor",
						fontSizeParamPath: "quoteFontSize",
					},
					{
						key: "addendum-text-box",
						label: "Addendum",
						x: 6,
						y: 75,
						width: 88,
						height: 12,
						textAlign: "left",
						paramPath: "longQuoteItems.0.title",
						placeholder: "Item title",
						colorParamPath: "addendumColor",
						fontSizeParamPath: "addendumFontSize",
					},
				],
			},
		],
	},
	createShortQuotesSlides: {
		functionNames: ["createShortQuotesSlides"],
		slides: [
			{
				id: "content",
				label: "Quote Slide",
				description: "1 per item",
				elements: [
					{
						key: "quote-text-box",
						label: "Quote",
						x: 6,
						y: 15,
						width: 88,
						height: 55,
						textAlign: "left",
						paramPath: "shortQuoteItems.0.quote",
						placeholder: "Short quote text...",
						colorParamPath: "quoteColor",
					},
					{
						key: "addendum-text-box",
						label: "Addendum",
						x: 6,
						y: 75,
						width: 88,
						height: 12,
						textAlign: "left",
						paramPath: "shortQuoteItems.0.addendum",
						placeholder: "Attribution",
						colorParamPath: "addendumColor",
					},
				],
			},
		],
	},
	createBulletSlide: {
		functionNames: ["createBulletSlide"],
		slides: [
			{
				id: "content",
				label: "Bullet Slide",
				description: "1 slide",
				elements: [
					{
						key: "bullet-title-text-box",
						label: "Title",
						x: 6,
						y: 6,
						width: 88,
						height: 14,
						textAlign: "left",
						paramPath: "title",
						placeholder: "Slide Title",
						colorParamPath: "titleColor",
					},
					{
						key: "bullet-point-1-text",
						label: "Bullet 1",
						x: 8,
						y: 24,
						width: 84,
						height: 10,
						textAlign: "left",
						paramPath: "bullets.0",
						placeholder: "First bullet point",
						colorParamPath: "bulletColor",
					},
					{
						key: "bullet-point-2-text",
						label: "Bullet 2",
						x: 8,
						y: 36,
						width: 84,
						height: 10,
						textAlign: "left",
						paramPath: "bullets.1",
						placeholder: "Second bullet point",
						colorParamPath: "bulletColor",
					},
					{
						key: "bullet-point-3-text",
						label: "Bullet 3",
						x: 8,
						y: 48,
						width: 84,
						height: 10,
						textAlign: "left",
						paramPath: "bullets.2",
						placeholder: "Third bullet point",
						colorParamPath: "bulletColor",
					},
				],
			},
		],
	},
	createSummarySlide: {
		functionNames: ["createSummarySlide"],
		slides: [
			{
				id: "content",
				label: "Summary Slide",
				description: "1 slide (auto-detected from slide titles)",
				elements: [
					{
						key: "summary-title-text",
						label: "Summary Title",
						x: 6,
						y: 6,
						width: 88,
						height: 14,
						textAlign: "left",
						paramPath: "summaryTitle",
						placeholder: "Summary",
					},
					{
						key: "summary-item-1-text",
						label: "Item 1",
						x: 8,
						y: 26,
						width: 84,
						height: 8,
						textAlign: "left",
						placeholder: "—detected from slide titles—",
					},
					{
						key: "summary-item-2-text",
						label: "Item 2",
						x: 8,
						y: 36,
						width: 84,
						height: 8,
						textAlign: "left",
						placeholder: "—detected from slide titles—",
					},
					{
						key: "summary-item-3-text",
						label: "Item 3",
						x: 8,
						y: 46,
						width: 84,
						height: 8,
						textAlign: "left",
						placeholder: "—detected from slide titles—",
					},
				],
			},
		],
	},
	createHighlightVariationSlides: {
		functionNames: ["createHighlightVariationSlides"],
		slides: [
			{
				id: "variation-1",
				label: "Highlight Variation",
				description: "N+2 slides (1 per point + all-dark + all-light)",
				elements: [
					{
						key: "point-1-of-3-text-box",
						label: "Point Text Box",
						x: 6,
						y: 12,
						width: 78,
						height: 60,
						textAlign: "left",
						placeholder: "Highlight content for point N of M",
					},
					{
						key: "point-1-of-3-number-indicator-text-box",
						label: "Number Indicator",
						x: 78,
						y: 8,
						width: 16,
						height: 10,
						textAlign: "center",
						placeholder: "N/M",
					},
				],
			},
		],
	},
	setHeaders: {
		functionNames: ["setHeaders"],
		slides: [
			{
				id: "header",
				label: "Header Bar",
				description: "Applied to slides in range",
				elements: [
					{
						key: "top-bar-border-key",
						label: "Border Line",
						x: 0,
						y: 0,
						width: 100,
						height: 6,
						textAlign: "left",
						placeholder: "",
					},
					{
						key: "top-bar-topic-1-of-3-text",
						label: "Section 1",
						x: 3,
						y: 0.5,
						width: 30,
						height: 5,
						textAlign: "center",
						placeholder: "Section 1",
					},
					{
						key: "top-bar-topic-2-of-3-text",
						label: "Section 2",
						x: 35,
						y: 0.5,
						width: 30,
						height: 5,
						textAlign: "center",
						placeholder: "Section 2",
					},
					{
						key: "top-bar-topic-3-of-3-text",
						label: "Section 3",
						x: 67,
						y: 0.5,
						width: 30,
						height: 5,
						textAlign: "center",
						placeholder: "Section 3",
					},
				],
			},
		],
	},
};

function getParamValue(params: Record<string, unknown>, path: string): string | undefined {
	const parts = path.split(".");
	let current: unknown = params;
	for (const part of parts) {
		if (current === null || current === undefined) return undefined;
		if (typeof current === "object" && Array.isArray(current)) {
			const idx = parseInt(part, 10);
			if (isNaN(idx) || idx < 0 || idx >= current.length) return undefined;
			current = current[idx];
		} else if (isRecord(current)) {
			current = current[part];
		} else {
			return undefined;
		}
	}
	if (typeof current === "string") return current;
	return undefined;
}

export function getPreviewTexts(
	params: Record<string, unknown>,
	slideTypeId: string,
	functionName: string,
): Record<string, { text: string; color?: string; fontSize?: number }> {
	const layout = functionTemplateLayouts[functionName];
	if (!layout) return {};

	const slideLayout = layout.slides.find((s) => s.id === slideTypeId);
	if (!slideLayout) return {};

	const result: Record<string, { text: string; color?: string; fontSize?: number }> = {};

	for (const element of slideLayout.elements) {
		const text = element.paramPath
			? (getParamValue(params, element.paramPath) ?? element.placeholder ?? element.key)
			: (element.placeholder ?? element.key);

		const color = element.colorParamPath
			? getParamValue(params, element.colorParamPath)
			: undefined;

		const fontSize = element.fontSizeParamPath
			? (() => {
				const v = getParamValue(params, element.fontSizeParamPath!);
				return v ? parseInt(v, 10) : undefined;
			  })()
			: undefined;

		result[element.key] = { text, color, fontSize };
	}

	return result;
}

