/**
 * slide-index-to-id.ts
 *
 * Created by Min-Kyu Lee on 02-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { Nullable, SlideId, SlideIndex } from "@gsg/shared";

export const slideIndexToId_ = ({
	presentation,
	slideIndex,
}: {
	presentation: GoogleAppsScript.Slides.Presentation,
	slideIndex: Nullable<SlideIndex>,
}): Nullable<SlideId> => {
	const slides: GoogleAppsScript.Slides.Slide[] = presentation.getSlides();
	
	if (slideIndex === null || !isFinite(slideIndex) || slideIndex < 0 || slideIndex >= slides.length) {
		return null;
	}

	return slides[slideIndex]!.getObjectId();
};
