/**
 * tests/shared/process-title-item.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { processTitleItem_ } from "../../src/shared/title-item/process-title-item";
import { buildMockPresentation, resetMocks } from "../helpers";
import { getMockShapeState } from "../__mocks__/google-apps-script";

beforeEach(() => {
	resetMocks();
});

describe("processTitleItem_", () => {
	it("copies the title slide and applies copy items", () => {
		const { presentation } = buildMockPresentation();

		const result = processTitleItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			currentInsertionIndex: 2,
			titleItem: {
				title: "My Title",
				subtitle: "My Subtitle",
			},
		});

		expect(result).toBe(true);
	});

	it("applies titleBold and subtitleBold", () => {
		const { presentation } = buildMockPresentation();

		const result = processTitleItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			currentInsertionIndex: 2,
			titleItem: {
				title: "Bold Title",
				subtitle: "Not Bold Subtitle",
			},
			titleBold: true,
			subtitleBold: false,
		});

		expect(result).toBe(true);

		const newSlide = presentation.getSlides()[2]!;
		const elements = newSlide.getPageElements();
		const titleState = getMockShapeState(
			elements.find(e => e.getDescription() === "section-title-text-box")!.asShape(),
		);
		const subtitleState = getMockShapeState(
			elements.find(e => e.getDescription() === "section-subtitle-text-box")!.asShape(),
		);

		expect(titleState.text).toBe("Bold Title");
		expect(titleState.bold).toBe(true);
		expect(subtitleState.text).toBe("Not Bold Subtitle");
		expect(subtitleState.bold).toBe(false);
	});

	it("applies titleItalic and subtitleItalic", () => {
		const { presentation } = buildMockPresentation();

		const result = processTitleItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			currentInsertionIndex: 2,
			titleItem: {
				title: "Italic Title",
				subtitle: "Italic Subtitle",
			},
			titleItalic: true,
			subtitleItalic: true,
		});

		expect(result).toBe(true);

		const newSlide = presentation.getSlides()[2]!;
		const elements = newSlide.getPageElements();
		const titleState = getMockShapeState(
			elements.find(e => e.getDescription() === "section-title-text-box")!.asShape(),
		);
		const subtitleState = getMockShapeState(
			elements.find(e => e.getDescription() === "section-subtitle-text-box")!.asShape(),
		);

		expect(titleState.italic).toBe(true);
		expect(subtitleState.italic).toBe(true);
	});

	it("uses default bold values (title=true, subtitle=false) when not specified", () => {
		const { presentation } = buildMockPresentation();

		const result = processTitleItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			currentInsertionIndex: 2,
			titleItem: {
				title: "Default",
				subtitle: "Default Sub",
			},
		});

		expect(result).toBe(true);

		const newSlide = presentation.getSlides()[2]!;
		const elements = newSlide.getPageElements();
		const titleState = getMockShapeState(
			elements.find(e => e.getDescription() === "section-title-text-box")!.asShape(),
		);
		const subtitleState = getMockShapeState(
			elements.find(e => e.getDescription() === "section-subtitle-text-box")!.asShape(),
		);

		expect(titleState.bold).toBe(true);
		expect(subtitleState.bold).toBe(false);
	});

	it("applies titleBold=false to make title not bold", () => {
		const { presentation } = buildMockPresentation();

		const result = processTitleItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			currentInsertionIndex: 2,
			titleItem: {
				title: "Non Bold Title",
				subtitle: "Bold Subtitle",
			},
			titleBold: false,
			subtitleBold: true,
		});

		expect(result).toBe(true);

		const newSlide = presentation.getSlides()[2]!;
		const elements = newSlide.getPageElements();
		const titleState = getMockShapeState(
			elements.find(e => e.getDescription() === "section-title-text-box")!.asShape(),
		);
		const subtitleState = getMockShapeState(
			elements.find(e => e.getDescription() === "section-subtitle-text-box")!.asShape(),
		);

		expect(titleState.bold).toBe(false);
		expect(subtitleState.bold).toBe(true);
	});

	it("returns false when the template title slide cannot be copied", () => {
		const { presentation } = buildMockPresentation();
		presentation.insertSlide = jest.fn(() => null) as never;

		const result = processTitleItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			currentInsertionIndex: 2,
			titleItem: {
				title: "My Title",
				subtitle: "My Subtitle",
			},
		});

		expect(result).toBe(false);
	});

	it("handles empty subtitle gracefully", () => {
		const { presentation } = buildMockPresentation();

		const result = processTitleItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			currentInsertionIndex: 2,
			titleItem: {
				title: "No Subtitle",
				subtitle: "",
			},
		});

		expect(result).toBe(true);
		expect(presentation.getSlides().length).toBe(3);
	});

	it("uses custom override keys", () => {
		const { presentation } = buildMockPresentation();

		const result = processTitleItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			currentInsertionIndex: 2,
			titleItem: {
				title: "Custom Keys",
				subtitle: "Custom Sub",
			},
			titleKey: "custom-title",
			subtitleKey: "custom-subtitle",
		});

		expect(result).toBe(true);
	});

	it("applies custom title and subtitle colors", () => {
		const { presentation } = buildMockPresentation();

		const result = processTitleItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			currentInsertionIndex: 2,
			titleItem: {
				title: "Colored",
				subtitle: "Colored Sub",
			},
			titleColor: SlidesApp.ThemeColorType.ACCENT1,
			subtitleColor: SlidesApp.ThemeColorType.ACCENT2,
		});

		expect(result).toBe(true);
	});

	it("applies title and subtitle font sizes", () => {
		const { presentation } = buildMockPresentation();

		const result = processTitleItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			currentInsertionIndex: 2,
			titleItem: {
				title: "Big Text",
				subtitle: "Small Text",
			},
			titleFontSize: 36,
			subtitleFontSize: 18,
		});

		expect(result).toBe(true);
	});

	it("calls getSlideById at most once for the template slide", () => {
		const { presentation } = buildMockPresentation();
		const getSlideByIdSpy = jest.spyOn(presentation, "getSlideById");

		processTitleItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			currentInsertionIndex: 2,
			titleItem: {
				title: "Title",
				subtitle: "Sub",
			},
		});

		const callsForTemplate = getSlideByIdSpy.mock.calls.filter(
			([id]) => id === "title-slide-id",
		);
		expect(callsForTemplate.length).toBe(1);
	});
});
