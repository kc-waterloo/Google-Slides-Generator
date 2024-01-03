/**
 * slide-number-to-id.ts
 *
 * Created by Min-Kyu Lee on 02-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { Nullable } from "../nullable/Nullable";
import { getTemplateSlideId_ } from "../get-template-slide-id";
import { slideIndexToId_ } from "../slide-index/slide-index-to-id";
import { SlideNumber } from "./SlideNumber";
import { slideNumberToIndex_ } from "./slide-number-to-index";

export const slideNumberToId_ = ({
	presentation,
	slideNumber,
	pageElementKeys,
} : {
    presentation: GoogleAppsScript.Slides.Presentation,
    slideNumber: Nullable<SlideNumber>,
    pageElementKeys: string[],
}): Nullable<string> => {
	if (slideNumber === null) {
		return getTemplateSlideId_({
			presentation: presentation,
			pageElementKeys: pageElementKeys,
		});
	}
	return slideIndexToId_({
		slideIndex: slideNumberToIndex_(slideNumber),
		presentation: presentation,
	});
};
