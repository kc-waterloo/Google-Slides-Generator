/**
 * create-bullet-slide/index.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { Nullable, SlideNumber, SlideId } from "@gsg/shared";
import { slideNumberToIndex_ } from "../../shared/slide-number/slide-number-to-index";
import { slideNumberToId_ } from "../../shared/slide-number/slide-number-to-id";
import { copySlide_ } from "../../shared/copy-slide";
import { processCopyItems_ } from "../../shared/copy-item/process-copy-items";
import { logInfo, logError } from "../../shared/logger/logger";
import {
	createBulletSlideDefaultTemplateSlideNumber_,
	createBulletSlideDefaultInsertionSlideNumber_,
	createBulletSlideDefaultTitleTextBoxKey_,
	createBulletSlideDefaultBulletPrefix_,
} from "./defaults";
import { getActivePresentation_ } from "../../shared/presentation";

const MODULE = "createBulletSlide";

/**
 * Creates a single bullet-point slide from a title and array of bullet strings.
 * Uses a template slide with "bullet-title-text-box" for the title and "bullet-point-N-text" for each bullet.
 *
 * @param {Object} parameters - parameters for the function
 * @param {string} parameters.title - Slide title text
 * @param {string[]} parameters.bullets - Bullet point strings
 * @param {Nullable<SlideNumber>} [parameters.templateSlideNumber] - Template slide (null = auto-detect)
 * @param {SlideNumber} [parameters.insertionSlideNumber] - Where to insert the slide
 * @param {string} [parameters.overrideTitleTextBoxKey] - Override default "bullet-title-text-box"
 * @param {string} [parameters.overrideBulletPrefix] - Override default "bullet-point-"
 * @param {GoogleAppsScript.Slides.ThemeColorType} [parameters.titleColor] - Title text color (default DARK1)
 * @param {GoogleAppsScript.Slides.ThemeColorType} [parameters.bulletColor] - Bullet text color (default DARK1)
 * @param {boolean} [parameters.titleItalic] - Italic title text
 * @param {boolean} [parameters.bulletItalic] - Italic bullet text
 * @param {boolean} [parameters.titleStrikethrough] - Strikethrough title text
 * @param {boolean} [parameters.bulletStrikethrough] - Strikethrough bullet text
 * @param {boolean} [parameters.titleUnderline] - Underline title text
 * @param {boolean} [parameters.bulletUnderline] - Underline bullet text
 * @param {number} [parameters.titleFontSize] - Title font size
 * @param {number} [parameters.bulletFontSize] - Bullet font size
 * @returns {void}
 */
export const createBulletSlide = ({
	title,
	bullets,
	templateSlideNumber = createBulletSlideDefaultTemplateSlideNumber_,
	insertionSlideNumber = createBulletSlideDefaultInsertionSlideNumber_,
	overrideTitleTextBoxKey,
	overrideBulletPrefix,
	titleColor = SlidesApp.ThemeColorType.DARK1,
	bulletColor = SlidesApp.ThemeColorType.DARK1,
	titleItalic,
	bulletItalic,
	titleStrikethrough,
	bulletStrikethrough,
	titleUnderline,
	bulletUnderline,
	titleFontSize,
	bulletFontSize,
}: {
	title: string,
	bullets: string[],
	templateSlideNumber: Nullable<SlideNumber>,
	insertionSlideNumber: SlideNumber,
	overrideTitleTextBoxKey?: string,
	overrideBulletPrefix?: string,
	titleColor?: GoogleAppsScript.Slides.ThemeColorType,
	bulletColor?: GoogleAppsScript.Slides.ThemeColorType,
	titleItalic?: boolean,
	bulletItalic?: boolean,
	titleStrikethrough?: boolean,
	bulletStrikethrough?: boolean,
	titleUnderline?: boolean,
	bulletUnderline?: boolean,
	titleFontSize?: number,
	bulletFontSize?: number,
}): void => {
	const presentation = getActivePresentation_(MODULE);
	if (!presentation) {
		return;
	}

	if (bullets.length === 0) {
		logError(MODULE, "Bullets array is empty");
		return;
	}

	const titleKey: string = overrideTitleTextBoxKey ?? createBulletSlideDefaultTitleTextBoxKey_;
	const bulletPrefix: string = overrideBulletPrefix ?? createBulletSlideDefaultBulletPrefix_;

	const templateSlideId: Nullable<SlideId> = slideNumberToId_({
		presentation,
		slideNumber: templateSlideNumber,
		pageElementKeys: [
			titleKey,
			...bullets.map((_, i) => `${bulletPrefix}${i + 1}-text`),
		],
	});

	if (!templateSlideId) {
		logError(MODULE, "Template slide not found");
		return;
	}

	const insertionIndex = slideNumberToIndex_(insertionSlideNumber);

	const templateSlide = presentation.getSlideById(templateSlideId);

	const newSlide: Nullable<GoogleAppsScript.Slides.Slide> = copySlide_({
		presentation,
		originalSlideId: templateSlideId,
		newSlideIndex: insertionIndex,
	});

	if (!newSlide) {
		logError(MODULE, "Failed to copy template slide");
		return;
	}

	const copyItems = [
		{
			pageElementKey: titleKey,
			actions: {
				newText: title,
				newColor: titleColor,
				bold: true,
				italic: titleItalic,
				strikethrough: titleStrikethrough,
				underline: titleUnderline,
				fontSize: titleFontSize,
			},
		},
		...bullets.map((bulletText, i) => ({
			pageElementKey: `${bulletPrefix}${i + 1}-text`,
			actions: {
				newText: bulletText,
				newColor: bulletColor,
				bold: false,
				italic: bulletItalic,
				strikethrough: bulletStrikethrough,
				underline: bulletUnderline,
				fontSize: bulletFontSize,
			},
		})),
	];

	processCopyItems_({
		templateSlide: templateSlide,
		destinationSlide: newSlide,
		copyItems,
	});

	logInfo(MODULE, `Created bullet slide '${title}' with ${bullets.length} bullets at slide ${insertionSlideNumber}`);
};
