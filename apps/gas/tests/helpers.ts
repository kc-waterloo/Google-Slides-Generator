/**
 * tests/helpers.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 *
 * Shared test helpers for building common mock scenarios.
 */

/**
 * helpers.ts
 *
 * Created by Min-Kyu Lee on 05-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import {
	createMockPresentation,
	createMockSlide,
	createMockPageElement,
	mockSlidesApp,
	mockDocumentApp,
	mockSpreadsheetApp,
} from "./__mocks__/google-apps-script";

/**
 * Build a full mock presentation for testing.
 * `titleSlideElements` and `contentSlideElements` define the page elements
 * on the template title and content slides respectively.
 */
export const buildMockPresentation = (
	overrides?: {
		titleSlideElements?: GoogleAppsScript.Slides.PageElement[];
		contentSlideElements?: GoogleAppsScript.Slides.PageElement[];
		extraSlides?: GoogleAppsScript.Slides.Slide[];
	},
): { presentation: GoogleAppsScript.Slides.Presentation; titleSlide: GoogleAppsScript.Slides.Slide; contentSlide: GoogleAppsScript.Slides.Slide } => {
	const titleSlide = createMockSlide(
		overrides?.titleSlideElements ?? [
			createMockPageElement("section-title-text-box", "Title Placeholder"),
			createMockPageElement("section-subtitle-text-box", "Subtitle Placeholder"),
		],
		"title-slide-id",
	);

	const contentSlide = createMockSlide(
		overrides?.contentSlideElements ?? [
			createMockPageElement("quote-text-box", "Quote Placeholder"),
			createMockPageElement("addendum-text-box", "Addendum Placeholder"),
		],
		"content-slide-id",
	);

	const extraSlides = overrides?.extraSlides ?? [];
	const presentation = createMockPresentation([
		titleSlide,
		contentSlide,
		...extraSlides,
	]);
	mockSlidesApp.setActivePresentation(presentation);

	return { presentation, titleSlide, contentSlide };
};

/**
 * Reset the GAS mock state between tests.
 */
export const resetMocks = (): void => {
	mockSlidesApp.setActivePresentation(null);
	mockDocumentApp.clearDocuments();
	mockSpreadsheetApp.setActiveSpreadsheet(null);
	jest.clearAllMocks();
};
