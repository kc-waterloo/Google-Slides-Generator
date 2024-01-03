/**
 * get-template-slide-id.ts
 *
 * Created by Min-Kyu Lee on 02-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { Nullable } from "./nullable/Nullable";
import { PageElementKey } from "./page-element-key/PageElementKey";
import { getPageElementKey_ } from "./page-element-key/get-page-element-key";
import { isPageElementKeyEqual_ } from "./page-element-key/is-page-element-key-equal";

export const getTemplateSlideId_ = ({
	presentation,
	pageElementKeys: inputtedPageElementKeys,
} :{
	presentation: GoogleAppsScript.Slides.Presentation,
	pageElementKeys: PageElementKey[],
}): Nullable<string> => {
	let output: Nullable<string> = null;

	presentation.getSlides()
		// Used as a forEach with `return true` as `break;` and `return false` to continue the loop
		.some((slide: GoogleAppsScript.Slides.Slide): boolean => {
			const slidePageElementKeys: PageElementKey[] = slide
				.getPageElements()
				.map((pageElement: GoogleAppsScript.Slides.PageElement): PageElementKey => {
					return getPageElementKey_(pageElement);
				});

			if (inputtedPageElementKeys.every(
				(inputtedPageElementKey: PageElementKey): boolean => {
					return slidePageElementKeys.some((slidePageElementKey: string): boolean => {
						return isPageElementKeyEqual_(slidePageElementKey, inputtedPageElementKey);
					});
				}
			)) {
				output = slide.getObjectId();
				return true;
			}

			return false;
		});

	return output;
};
