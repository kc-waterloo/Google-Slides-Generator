/**
 * slide-number-to-id.ts
 *
 * Created by Min-Kyu Lee on 02-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { runAndIgnoreNull_ } from "./../nullable/run-and-ignore-null";
import { Nullable } from "../nullable/nullable";
import { getTemplateSlideId_ } from "../slide-id/get-template-slide-id";
import { slideIndexToId_ } from "../slide-index/slide-index-to-id";
import { SlideNumber } from "./slide-number";
import { slideNumberToIndex_ } from "./slide-number-to-index";
import { SlideId } from "../slide-id/slide-id";

export const slideNumberToId_ = ({
	presentation,
	slideNumber,
	pageElementKeys = null,
} : {
    presentation: GoogleAppsScript.Slides.Presentation,
    slideNumber: Nullable<SlideNumber>,
    pageElementKeys: Nullable<string[]>,
}): Nullable<SlideId> => {
	if (slideNumber === null && pageElementKeys !== null) {
		return getTemplateSlideId_({
			presentation: presentation,
			pageElementKeys: pageElementKeys,
		});
	}
	return slideIndexToId_({
		slideIndex: runAndIgnoreNull_(
			slideNumberToIndex_,
			slideNumber,
		),
		presentation: presentation,
	});
};
