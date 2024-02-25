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
}: {
	currentPageIndex: number;
	numberOfPages: number;
	isLastSlide: boolean;
}): CopyItem[] => {
	const output: CopyItem[] = [];
	for (let i = 1; i <= numberOfPages; i++) {
		const isHighlighted = currentPageIndex === i || isLastSlide; 
		const newColor = isHighlighted ? SlidesApp.ThemeColorType.DARK1 : SlidesApp.ThemeColorType.LIGHT1;

		output.push({
			pageElementKey: `point-${i}-of-${numberOfPages}-text-box`,
			actions: {
				bold: isHighlighted,
				newColor: newColor,
				newBorderColor: newColor,
			},
		});
		output.push({
			pageElementKey: `point-${i}-of-${numberOfPages}-number-indicator-text-box`,
			actions: {
				bold: isHighlighted,
				newColor: newColor,
				newBorderColor: newColor,
			}
		});
	}

	return output;
};
