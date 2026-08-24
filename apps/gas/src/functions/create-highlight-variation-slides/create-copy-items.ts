/**
 * create-copy-items.ts
 *
 * Created by Min-Kyu Lee on 13-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { CopyItem } from "../../shared/copy-item/copy-item";

export const createCopyItems_ = ({
	currentPageIndex,
	numberOfPages,
	isLastSlide,
	highlightColor = SlidesApp.ThemeColorType.DARK1,
	dimmedColor = SlidesApp.ThemeColorType.LIGHT1,
	highlightBold = true,
	dimmedBold = false,
	highlightBorderColor,
	dimmedBorderColor,
	highlightItalic,
	dimmedItalic,
	highlightStrikethrough,
	dimmedStrikethrough,
	highlightUnderline,
	dimmedUnderline,
	highlightFontSize,
	dimmedFontSize,
}: {
	currentPageIndex: number;
	numberOfPages: number;
	isLastSlide: boolean;
	highlightColor?: GoogleAppsScript.Slides.ThemeColorType;
	dimmedColor?: GoogleAppsScript.Slides.ThemeColorType;
	highlightBold?: boolean;
	dimmedBold?: boolean;
	highlightBorderColor?: GoogleAppsScript.Slides.ThemeColorType;
	dimmedBorderColor?: GoogleAppsScript.Slides.ThemeColorType;
	highlightItalic?: boolean;
	dimmedItalic?: boolean;
	highlightStrikethrough?: boolean;
	dimmedStrikethrough?: boolean;
	highlightUnderline?: boolean;
	dimmedUnderline?: boolean;
	highlightFontSize?: number;
	dimmedFontSize?: number;
}): CopyItem[] => {
	const output: CopyItem[] = [];

	const buildActions = (isHighlighted: boolean) => {
		const color = isHighlighted ? highlightColor : dimmedColor;
		return {
			bold: isHighlighted ? highlightBold : dimmedBold,
			italic: isHighlighted ? highlightItalic : dimmedItalic,
			strikethrough: isHighlighted ? highlightStrikethrough : dimmedStrikethrough,
			underline: isHighlighted ? highlightUnderline : dimmedUnderline,
			fontSize: isHighlighted ? highlightFontSize : dimmedFontSize,
			newColor: color,
			newBorderColor: isHighlighted
				? (highlightBorderColor ?? color)
				: (dimmedBorderColor ?? color),
		};
	};

	for (let i = 1; i <= numberOfPages; i++) {
		const isHighlighted = currentPageIndex === i || isLastSlide;

		output.push({
			pageElementKey: `point-${i}-of-${numberOfPages}-text-box`,
			actions: buildActions(isHighlighted),
		});
		output.push({
			pageElementKey: `point-${i}-of-${numberOfPages}-number-indicator-text-box`,
			actions: buildActions(isHighlighted),
		});
	}

	return output;
};
