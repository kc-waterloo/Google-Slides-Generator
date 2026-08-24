/**
 * create-summary-slide/index.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import type { Nullable, SlideNumber, SlideIndex } from "@gsg/shared";
import { slideNumberToIndex_ } from "../../shared/slide-number/slide-number-to-index";
import { slideNumberToId_ } from "../../shared/slide-number/slide-number-to-id";
import { copySlide_ } from "../../shared/copy-slide";
import { logError, logInfo } from "../../shared/logger/logger";
import { getPageElementKey_ } from "../../shared/page-element-key/get-page-element-key";
import { setText_ } from "../../shared/shape/set-text";
import { applyTextStyle_ } from "../../shared/shape/apply-text-style";
import { getActivePresentation_ } from "../../shared/presentation";

const MODULE = "createSummarySlide";

const DEFAULT_SUMMARY_TITLE = "Summary";

/**
 * Creates a summary/table-of-contents slide from section titles in a slide range.
 * Scans for elements with description "section-title-text-box" to extract titles,
 * then populates a template containing "summary-title-text" and "summary-item-N-text" keys.
 *
 * @param {Object} parameters - parameters for the function
 * @param {SlideNumber} [parameters.lowerBoundSlideNumber=1] - First slide to scan (inclusive)
 * @param {SlideNumber} [parameters.upperBoundSlideNumber=9999] - Last slide to scan (inclusive)
 * @param {SlideNumber} parameters.insertionSlideNumber - Where to insert the summary slide
 * @param {Nullable<SlideNumber>} [parameters.templateSlideNumber=null] - Template slide (null = auto-detect by "summary-title-text" key)
 * @param {string} [parameters.summaryTitle="Summary"] - Title text for the summary slide
 * @param {GoogleAppsScript.Slides.ThemeColorType} [parameters.titleColor=DARK1] - Title text color
 * @param {GoogleAppsScript.Slides.ThemeColorType} [parameters.itemColor=DARK1] - Item text color
 * @param {boolean} [parameters.titleBold] - Bold title text
 * @param {boolean} [parameters.itemBold] - Bold item text
 * @param {boolean} [parameters.titleItalic] - Italic title text
 * @param {boolean} [parameters.itemItalic] - Italic item text
 * @param {boolean} [parameters.titleStrikethrough] - Strikethrough title text
 * @param {boolean} [parameters.itemStrikethrough] - Strikethrough item text
 * @param {boolean} [parameters.titleUnderline] - Underline title text
 * @param {boolean} [parameters.itemUnderline] - Underline item text
 * @param {number} [parameters.titleFontSize] - Title font size
 * @param {number} [parameters.itemFontSize] - Item font size
 * @returns {void}
 */
export const createSummarySlide = ({
	lowerBoundSlideNumber = 1,
	upperBoundSlideNumber = 9999,
	insertionSlideNumber,
	templateSlideNumber = null,
	summaryTitle = DEFAULT_SUMMARY_TITLE,
	titleColor = SlidesApp.ThemeColorType.DARK1,
	itemColor = SlidesApp.ThemeColorType.DARK1,
	titleBold,
	itemBold,
	titleItalic,
	itemItalic,
	titleStrikethrough,
	itemStrikethrough,
	titleUnderline,
	itemUnderline,
	titleFontSize,
	itemFontSize,
}: {
	lowerBoundSlideNumber: SlideNumber,
	upperBoundSlideNumber: SlideNumber,
	insertionSlideNumber: SlideNumber,
	templateSlideNumber: Nullable<SlideNumber>,
	summaryTitle?: string,
	titleColor?: GoogleAppsScript.Slides.ThemeColorType,
	itemColor?: GoogleAppsScript.Slides.ThemeColorType,
	titleBold?: boolean,
	itemBold?: boolean,
	titleItalic?: boolean,
	itemItalic?: boolean,
	titleStrikethrough?: boolean,
	itemStrikethrough?: boolean,
	titleUnderline?: boolean,
	itemUnderline?: boolean,
	titleFontSize?: number,
	itemFontSize?: number,
}): void => {
	const presentation = getActivePresentation_(MODULE);
	if (!presentation) {
		return;
	}

	const lowerBoundSlideIndex: SlideIndex = slideNumberToIndex_(lowerBoundSlideNumber);
	const upperBoundSlideIndex: SlideIndex = slideNumberToIndex_(upperBoundSlideNumber);
	const insertionIndex: SlideIndex = slideNumberToIndex_(insertionSlideNumber);

	const slides: GoogleAppsScript.Slides.Slide[] = presentation.getSlides();

	const titles: string[] = [];
	for (let i: SlideIndex = lowerBoundSlideIndex; i <= upperBoundSlideIndex && i < slides.length; i++) {
		const elements: GoogleAppsScript.Slides.PageElement[] = slides[i]!.getPageElements();
		let foundTitle: string | null = null;
		elements.forEach((element: GoogleAppsScript.Slides.PageElement): void => {
			if (element.getDescription() === "section-title-text-box") {
				let shape: GoogleAppsScript.Slides.Shape | null = null;
				try {
					shape = element.asShape();
				}
				// eslint-disable-next-line no-empty
				catch (_) {}
				if (shape) {
					const text: string = shape.getText().asString().trim();
					if (text.length > 0) {
						foundTitle = text;
					}
				}
			}
		});
		if (foundTitle !== null) {
			titles.push(foundTitle);
		}
	}

	if (titles.length === 0) {
		logError(MODULE, "No titles found in the specified slide range");
		return;
	}

	const templateSlideId: Nullable<string> = slideNumberToId_({
		presentation: presentation,
		slideNumber: templateSlideNumber,
		pageElementKeys: ["summary-title-text"],
	});

	if (!templateSlideId) {
		logError(MODULE, "Template slide not found");
		return;
	}

	const newSlide: Nullable<GoogleAppsScript.Slides.Slide> = copySlide_({
		presentation: presentation,
		originalSlideId: templateSlideId,
		newSlideIndex: insertionIndex,
	});

	if (!newSlide) {
		logError(MODULE, "Failed to create summary slide");
		return;
	}

	const applyTitleStyle = (shape: GoogleAppsScript.Slides.Shape): void => {
		applyTextStyle_(shape, (ts) => ts.setForegroundColor(titleColor));
		if (titleBold !== undefined) { applyTextStyle_(shape, (ts) => ts.setBold(titleBold)); }
		if (titleItalic !== undefined) { applyTextStyle_(shape, (ts) => ts.setItalic(titleItalic)); }
		if (titleStrikethrough !== undefined) { applyTextStyle_(shape, (ts) => ts.setStrikethrough(titleStrikethrough)); }
		if (titleUnderline !== undefined) { applyTextStyle_(shape, (ts) => ts.setUnderline(titleUnderline)); }
		if (titleFontSize !== undefined) { applyTextStyle_(shape, (ts) => ts.setFontSize(titleFontSize)); }
	};

	const applyItemStyle = (shape: GoogleAppsScript.Slides.Shape): void => {
		applyTextStyle_(shape, (ts) => ts.setForegroundColor(itemColor));
		if (itemBold !== undefined) { applyTextStyle_(shape, (ts) => ts.setBold(itemBold)); }
		if (itemItalic !== undefined) { applyTextStyle_(shape, (ts) => ts.setItalic(itemItalic)); }
		if (itemStrikethrough !== undefined) { applyTextStyle_(shape, (ts) => ts.setStrikethrough(itemStrikethrough)); }
		if (itemUnderline !== undefined) { applyTextStyle_(shape, (ts) => ts.setUnderline(itemUnderline)); }
		if (itemFontSize !== undefined) { applyTextStyle_(shape, (ts) => ts.setFontSize(itemFontSize)); }
	};

	const newElements: GoogleAppsScript.Slides.PageElement[] = newSlide.getPageElements();
	newElements.forEach((element: GoogleAppsScript.Slides.PageElement): void => {
		const key: string = getPageElementKey_(element);
		if (key === "summary-title-text") {
			let shape: GoogleAppsScript.Slides.Shape | null = null;
			try {
				shape = element.asShape();
			}
			// eslint-disable-next-line no-empty
			catch (_) {}
			if (shape) {
				setText_({ shape: shape, newText: summaryTitle });
				applyTitleStyle(shape);
			}
			return;
		}

		const prefix: string = "summary-item-";
		if (key.startsWith(prefix) && key.endsWith("-text")) {
			const indexStr: string = key.slice(prefix.length, -5); // remove "-text" suffix
			const itemIndex: number = parseInt(indexStr, 10) - 1;
			if (itemIndex >= 0 && itemIndex < titles.length) {
				let shape: GoogleAppsScript.Slides.Shape | null = null;
				try {
					shape = element.asShape();
				}
				// eslint-disable-next-line no-empty
				catch (_) {}
				if (shape) {
					setText_({ shape: shape, newText: titles[itemIndex]! });
					applyItemStyle(shape);
				}
			}
		}
	});

	logInfo(MODULE, `Created summary slide with ${titles.length} entries`);
};
