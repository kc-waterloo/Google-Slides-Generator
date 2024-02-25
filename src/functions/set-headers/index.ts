/**
 * set-headers/index.ts
 * 
 * Created by Min-Kyu Lee on 20-09-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved. 
*/

import { Nullable } from "../../shared/nullable/nullable";
import { slideNumberToIndex_ } from "../../shared/slide-number/slide-number-to-index";
import { processCopyItems_ } from "../../shared/copy-item/process-copy-items";
import { CopyItem } from "../../shared/copy-item/copy-item";
import { SetHeaderItem } from "./set-header-item";
import { headerLengthDefault_, setHeaderItemsDefault_, templateSlideNumberDefault_ } from "./defaults";
import { slideNumberToId_ } from "../../shared/slide-number/slide-number-to-id";
import { SlideNumber } from "../../shared/slide-number/slide-number";
import { SlideIndex } from "../../shared/slide-index/slide-index";


/**
 * 
 * @param {Object} parameters - parameters for the function
 * @param {Nullable<SlideNumber>} parameters.templateSlideNumber
 * @param {SetHeaderItem[]} parameters.setHeaderItems
 * @param {number} parameters.headerLength
 */
export const setHeaders = ({
	templateSlideNumber = templateSlideNumberDefault_,
	setHeaderItems = setHeaderItemsDefault_,
	headerLength = headerLengthDefault_,
}: {
	templateSlideNumber: Nullable<SlideNumber>,
	setHeaderItems: SetHeaderItem[],
	headerLength: number,
} = {
	templateSlideNumber: templateSlideNumberDefault_,
	setHeaderItems: setHeaderItemsDefault_,	
	headerLength: headerLengthDefault_,
}): void => {
	const presentation: GoogleAppsScript.Slides.Presentation = SlidesApp.getActivePresentation();
	if (presentation === undefined || presentation === null) {
		return;
	}

	const headerSectionsStrings: string[] = setHeaderItems
		.map((setHeaderItem: SetHeaderItem): (string | undefined) => {
			return setHeaderItem.sectionName;
		})
		.filter(
			headerString => headerString !== undefined
		) as string[];

	const templateSlideId: Nullable<string> = slideNumberToId_({
		presentation: presentation,
		slideNumber: templateSlideNumber,
		pageElementKeys: [
			"top-bar-border-key",
		].concat(
			Array.from({length: headerLength}, (_, i: number): number => i + 1).map((i: number): string => {
				return `top-bar-topic-${i}-of-${headerLength}-text`;
			})
		),
	});

	if (!templateSlideId) {
		return;
	}

	let headerSectionsStringIndex: number = 0;
	let headerSectionsStringBaseIndex: number = 0;

	setHeaderItems.forEach((
		setHeaderItem: SetHeaderItem,
	): void => {
		const headerRelativeIndex: number = headerSectionsStringIndex - headerSectionsStringBaseIndex;

		const baseCopyItems: CopyItem[] = [
			{
				pageElementKey: "top-bar-border-key",
				actions: {},
			},
		];

		const copyItems: CopyItem[] = baseCopyItems.concat(
			Array.from({length: headerLength}, (_, i) => i).map((i: number) => {
				return {
					pageElementKey: `top-bar-topic-${i + 1}-of-${headerLength}-text`,
					actions: {
						newText: headerSectionsStrings[headerSectionsStringBaseIndex + i],
						newColor: SlidesApp.ThemeColorType.LIGHT1,
						bold: false,
					},
				} as CopyItem;
			})
		);

		if (setHeaderItem.sectionName !== undefined) {
			const boldedIndex = headerRelativeIndex + baseCopyItems.length;

			copyItems[boldedIndex].actions.bold = true;
			copyItems[boldedIndex].actions.newColor = SlidesApp.ThemeColorType.DARK1;	
		}

		const slides: GoogleAppsScript.Slides.Slide[] = presentation.getSlides();
		const templateSlide = presentation.getSlideById(templateSlideId);

		const sectionStartSlideIndex: SlideIndex = slideNumberToIndex_(setHeaderItem.sectionStartSlideNumber);
		const sectionEndSlideIndex: SlideIndex = slideNumberToIndex_(setHeaderItem.sectionEndSlideNumber);

		for (let i: number = sectionStartSlideIndex; i <= sectionEndSlideIndex; i++) {
			processCopyItems_({
				templateSlide: templateSlide,
				destinationSlide: slides[i],
				copyItems: copyItems,
			});
		}

		if (setHeaderItem.sectionName !== undefined) {
			headerSectionsStringIndex += 1;
			if (
				// Ensure that the base does not increment when the bolded part is not yet centred
				headerRelativeIndex > Math.ceil(headerLength / 2) - 2 &&
				// Ensure incrementing will not cause out-of-bounds index for headerSectionsStrings
				headerSectionsStringBaseIndex + headerLength < headerSectionsStrings.length
			) {
				headerSectionsStringBaseIndex += 1;
			}
		}
	});
};
