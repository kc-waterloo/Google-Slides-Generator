/**
 * get-template-slide-id.ts
 *
 * Created by Min-Kyu Lee on 02-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { Nullable, SlideId } from "@gsg/shared";
import { PageElementKey } from "../page-element-key/page-element-key";
import { getPageElementKey_ } from "../page-element-key/get-page-element-key";
import { isPageElementKeyEqual_ } from "../page-element-key/is-page-element-key-equal";
import { logWarn } from "../logger/logger";

const MODULE = "getTemplateSlideId";

export const getTemplateSlideId_ = ({
	presentation,
	pageElementKeys: inputtedPageElementKeys,
} :{
	presentation: GoogleAppsScript.Slides.Presentation,
	pageElementKeys: PageElementKey[],
}): Nullable<SlideId> => {
	let output: Nullable<SlideId> = null;

	presentation.getSlides()
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

	if (output === null) {
		logWarn(MODULE, `No slide found matching keys [${inputtedPageElementKeys.join(", ")}]`);
	}

	return output;
};
