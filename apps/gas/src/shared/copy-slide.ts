/**
 * copy-slide.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { Nullable, SlideId, SlideIndex } from "@gsg/shared";
import { logError } from "./logger/logger";

export const copySlide_ = ({
	presentation,
	originalSlideId,
	newSlideIndex,
	linkingMode,
	originalSlide: preloadedSlide,
}: {
	presentation: GoogleAppsScript.Slides.Presentation,
	originalSlideId: SlideId,
	newSlideIndex: SlideIndex,
	linkingMode?: GoogleAppsScript.Slides.SlideLinkingMode,
	originalSlide?: GoogleAppsScript.Slides.Slide,
}): Nullable<GoogleAppsScript.Slides.Slide> => {
	const originalSlide: Nullable<GoogleAppsScript.Slides.Slide> =
		preloadedSlide ?? presentation.getSlideById(originalSlideId);
	if (!originalSlide) {
		logError("copySlide", `Slide not found: ${originalSlideId}`);
		return null;
	}

	if (linkingMode !== undefined) {
		return presentation.insertSlide(newSlideIndex, originalSlide, linkingMode);
	}
	return presentation.insertSlide(newSlideIndex, originalSlide);
};
