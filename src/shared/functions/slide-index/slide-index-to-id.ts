/**
 * slide-index-to-id.ts
 *
 * Created by Min-Kyu Lee on 02-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { Nullable } from "../nullable/Nullable";
import { SlideIndex } from "./SlideIndex";

export const slideIndexToId_ = ({
	presentation,
	slideIndex,
}: {
	presentation: GoogleAppsScript.Slides.Presentation,
	slideIndex: Nullable<SlideIndex>,
}): Nullable<string> => {
	const slides: GoogleAppsScript.Slides.Slide[] = presentation.getSlides();
	if (slideIndex === null || !(0 <= slideIndex && slideIndex < slides.length)) {
		return null;
	}

	return slides[slideIndex].getObjectId();
};
