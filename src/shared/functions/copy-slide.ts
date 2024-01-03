/**
 * internal/copy-slide.ts
 * 
 * Created by Min-Kyu Lee on 20-09-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved. 
 */

export const copySlide_ = ({
	presentation,
	originalSlideId,
	newSlideIndex,
}: {
	presentation: GoogleAppsScript.Slides.Presentation,
	originalSlideId: string,
	newSlideIndex: number,
}): GoogleAppsScript.Slides.Slide | undefined => {
	const originalSlide: GoogleAppsScript.Slides.Slide = presentation.getSlideById(originalSlideId);
	if (!originalSlide) {
		console.log("originalSlide was not defined");
		return;
	}

	return presentation.insertSlide(newSlideIndex, originalSlide);
};
