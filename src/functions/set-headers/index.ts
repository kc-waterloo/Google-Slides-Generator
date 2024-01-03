/**
 * set-headers/index.ts
 * 
 * Created by Min-Kyu Lee on 20-09-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved. 
*/

import { Nullable } from "../../shared/functions/nullable/Nullable";
import { slideNumberToIndex_ } from "../../shared/functions/slide-number/slide-number-to-index";
import { processCopyItems_ } from "../../shared/functions/copy-item/process-copy-items";
import { CopyItem } from "../../shared/functions/copy-item/copy-item";
import { SetHeaderItem } from "./set-header-item";
import { setHeaderItemsDefault_, templateSlideNumberDefault_ } from "./defaults";
import { slideNumberToId_ } from "../../shared/functions/slide-number/slide-number-to-id";
import { SlideNumber } from "../../shared/functions/slide-number/SlideNumber";
import { SlideIndex } from "../../shared/functions/slide-index/SlideIndex";

export const setHeaders = (
	templateSlideNumber: Nullable<SlideNumber> = templateSlideNumberDefault_,
	setHeaderItems: SetHeaderItem[] = setHeaderItemsDefault_,
): void => {
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
			"top-bar-topic-1-of-3-text",
			"top-bar-topic-2-of-3-text",
			"top-bar-topic-3-of-3-text",
		],
	});

	if (!templateSlideId) {
		return;
	}

	setHeaderItems.forEach((setHeaderItem: SetHeaderItem, index: number, setHeaderItems: SetHeaderItem[]): void => {
		const baseSectionHeaderIndex = Math.min(
			Math.max(0, index - 2),
			headerSectionsStrings.length - 3
		);

		const copyItems: CopyItem[] = [
			{
				pageElementKey: "top-bar-border-key",
				actions: {},
			},
			{
				pageElementKey: "top-bar-topic-1-of-3-text",
				actions: {
					newText: headerSectionsStrings[baseSectionHeaderIndex],
					newColor: SlidesApp.ThemeColorType.LIGHT1,
					bold: false,
				},
			},
			{
				pageElementKey: "top-bar-topic-2-of-3-text",
				actions: {
					newText: headerSectionsStrings[baseSectionHeaderIndex + 1],
					newColor: SlidesApp.ThemeColorType.LIGHT1,
					bold: false,
				},
			},
			{
				pageElementKey: "top-bar-topic-3-of-3-text",
				actions: {
					newText: headerSectionsStrings[baseSectionHeaderIndex + 2],
					newColor: SlidesApp.ThemeColorType.LIGHT1,
					bold: false,
				},
			},
		];

		// First Element
		// eslint-disable-next-line no-empty
		if (index === 0) { }
		// Second Element
		else if (index === 1) {
			copyItems[1].actions.bold = true;
			copyItems[1].actions.newColor = SlidesApp.ThemeColorType.DARK1;
		}
		// Second Last Element
		else if (index === setHeaderItems.length - 2) {
			copyItems[3].actions.bold = true;
			copyItems[3].actions.newColor = SlidesApp.ThemeColorType.DARK1;
		}
		// Last Element
		// eslint-disable-next-line no-empty
		else if (index === setHeaderItems.length - 1) { }
		// Middle Elements
		else {
			copyItems[2].actions.bold = true;
			copyItems[2].actions.newColor = SlidesApp.ThemeColorType.DARK1;
		}

		const slides: GoogleAppsScript.Slides.Slide[] = presentation.getSlides();
		const templateSlide = presentation.getSlideById(templateSlideId);

		const sectionStartSlideIndex: Nullable<SlideIndex> = slideNumberToIndex_(setHeaderItem.sectionStartSlideNumber);
		const sectionEndSlideIndex: Nullable<SlideIndex> = slideNumberToIndex_(setHeaderItem.sectionEndSlideNumber);

		if (sectionStartSlideIndex === null || sectionEndSlideIndex === null) {
			console.error("startSlideNumber or endSlideNumber is null");
			return;
		}

		for (let i: number = sectionStartSlideIndex; i <= sectionEndSlideIndex; i++) {
			processCopyItems_({
				templateSlide: templateSlide,
				destinationSlide: slides[i],
				copyItems: copyItems,
			});
		}
	});
};
