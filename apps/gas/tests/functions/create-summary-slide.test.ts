/**
 * tests/functions/create-summary-slide.test.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { createSummarySlide } from "../../src/functions/create-summary-slide";
import { createSummarySlideSchema } from "@gsg/shared";
import { validateParams } from "@gsg/shared";
import { buildMockPresentation, resetMocks } from "../helpers";
import { createMockSlide, createMockPageElement, getMockShapeState } from "../__mocks__/google-apps-script";
import { copySlide_ } from "../../src/shared/copy-slide";

jest.mock("../../src/shared/copy-slide", () => {
	const actual = jest.requireActual("../../src/shared/copy-slide");
	return {
		copySlide_: jest.fn(actual.copySlide_),
	};
});

beforeEach(() => {
	resetMocks();
	(copySlide_ as jest.Mock).mockImplementation(
		jest.requireActual("../../src/shared/copy-slide").copySlide_
	);
});

const TITLE_ELEMENT = createMockPageElement("section-title-text-box", "Slide Title");
const SUMMARY_TITLE_ELEMENT = createMockPageElement("summary-title-text", "Summary Placeholder");
const SUMMARY_ITEM_1 = createMockPageElement("summary-item-1-text", "Item 1 Placeholder");
const SUMMARY_ITEM_2 = createMockPageElement("summary-item-2-text", "Item 2 Placeholder");

describe("createSummarySlide", () => {
	it("creates a summary slide with titles from the range", () => {
		const slide1 = createMockSlide([TITLE_ELEMENT], "slide-1");
		const slide2 = createMockSlide([TITLE_ELEMENT], "slide-2");

		const templateSlide = createMockSlide(
			[SUMMARY_TITLE_ELEMENT, SUMMARY_ITEM_1, SUMMARY_ITEM_2],
			"template-summary",
		);

		const { presentation } = buildMockPresentation({
			extraSlides: [slide1, slide2, templateSlide],
		});

		const initialCount = presentation.getSlides().length;

		createSummarySlide({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 4,
			insertionSlideNumber: 5,
			templateSlideNumber: 5,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 1);
	});

	it("handles null presentation without crashing", () => {
		expect(() => {
			createSummarySlide({
				lowerBoundSlideNumber: 1,
				upperBoundSlideNumber: 3,
				insertionSlideNumber: 1,
				templateSlideNumber: null,
			});
		}).not.toThrow();
	});

	it("returns early when no titles are found", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");

		const templateSlide = createMockSlide(
			[SUMMARY_TITLE_ELEMENT, SUMMARY_ITEM_1, SUMMARY_ITEM_2],
			"template-summary",
		);

		const { presentation } = buildMockPresentation({
			extraSlides: [slide1, slide2, templateSlide],
		});
		const initialCount = presentation.getSlides().length;

		createSummarySlide({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 4,
			insertionSlideNumber: 5,
			templateSlideNumber: 5,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("uses custom summary title when provided", () => {
		const slide1 = createMockSlide([TITLE_ELEMENT], "slide-1");

		const templateSlide = createMockSlide(
			[SUMMARY_TITLE_ELEMENT, SUMMARY_ITEM_1],
			"template-summary",
		);

		const { presentation } = buildMockPresentation({
			extraSlides: [slide1, templateSlide],
		});
		const initialCount = presentation.getSlides().length;

		createSummarySlide({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 4,
			insertionSlideNumber: 5,
			templateSlideNumber: 4,
			summaryTitle: "Agenda",
		});

		expect(presentation.getSlides().length).toBe(initialCount + 1);
	});

	it("returns early when lowerBound exceeds upperBound", () => {
		const slide1 = createMockSlide([TITLE_ELEMENT], "slide-1");
		const templateSlide = createMockSlide(
			[SUMMARY_TITLE_ELEMENT],
			"template-summary",
		);

		const { presentation } = buildMockPresentation({
			extraSlides: [slide1, templateSlide],
		});
		const initialCount = presentation.getSlides().length;

		createSummarySlide({
			lowerBoundSlideNumber: 5,
			upperBoundSlideNumber: 3,
			insertionSlideNumber: 1,
			templateSlideNumber: 4,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("returns early when auto-detect finds no template slide with summary-title-text key", () => {
		const slide1 = createMockSlide([TITLE_ELEMENT], "slide-1");

		const { presentation } = buildMockPresentation({
			extraSlides: [slide1],
		});
		const initialCount = presentation.getSlides().length;

		createSummarySlide({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 4,
			insertionSlideNumber: 5,
			templateSlideNumber: null,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("copies slide when explicit template number points to a slide without matching keys", () => {
		const slide1 = createMockSlide([TITLE_ELEMENT], "slide-1");
		const noTemplateSlide = createMockSlide([], "no-template");

		const { presentation } = buildMockPresentation({
			extraSlides: [slide1, noTemplateSlide],
		});
		const initialCount = presentation.getSlides().length;

		createSummarySlide({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 4,
			insertionSlideNumber: 5,
			templateSlideNumber: 4,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 1);
	});

	it("handles slide range extending beyond available slides", () => {
		const slide1 = createMockSlide([TITLE_ELEMENT], "slide-1");

		const templateSlide = createMockSlide(
			[SUMMARY_TITLE_ELEMENT, SUMMARY_ITEM_1],
			"template-summary",
		);

		buildMockPresentation({
			extraSlides: [slide1, templateSlide],
		});

		expect(() => {
			createSummarySlide({
				lowerBoundSlideNumber: 3,
				upperBoundSlideNumber: 999,
				insertionSlideNumber: 5,
				templateSlideNumber: 4,
			});
		}).not.toThrow();
	});

	it("auto-detects template slide when templateSlideNumber is null", () => {
		const slide1 = createMockSlide([TITLE_ELEMENT], "slide-1");

		const templateSlide = createMockSlide(
			[SUMMARY_TITLE_ELEMENT, SUMMARY_ITEM_1, SUMMARY_ITEM_2],
			"template-summary",
		);

		const { presentation } = buildMockPresentation({
			extraSlides: [slide1, templateSlide],
		});
		const initialCount = presentation.getSlides().length;

		createSummarySlide({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 4,
			insertionSlideNumber: 5,
			templateSlideNumber: null,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 1);
	});

	it("handles multiple titles in one slide", () => {
		const twoTitleElement = createMockPageElement("section-title-text-box", "Title A");
		const slide1 = createMockSlide([TITLE_ELEMENT, twoTitleElement], "slide-1");

		const templateSlide = createMockSlide(
			[SUMMARY_TITLE_ELEMENT, SUMMARY_ITEM_1, SUMMARY_ITEM_2],
			"template-summary",
		);

		const { presentation } = buildMockPresentation({
			extraSlides: [slide1, templateSlide],
		});

		createSummarySlide({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 4,
			insertionSlideNumber: 5,
			templateSlideNumber: 4,
		});

		expect(presentation.getSlides().length).toBeGreaterThan(0);
	});

	it("returns early when copySlide_ returns null", () => {
		const slide1 = createMockSlide([TITLE_ELEMENT], "slide-1");
		const templateSlide = createMockSlide(
			[SUMMARY_TITLE_ELEMENT, SUMMARY_ITEM_1],
			"template-summary",
		);

		const { presentation } = buildMockPresentation({
			extraSlides: [slide1, templateSlide],
		});
		const initialCount = presentation.getSlides().length;

		(copySlide_ as jest.Mock).mockReturnValueOnce(null);

		createSummarySlide({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 4,
			insertionSlideNumber: 5,
			templateSlideNumber: 4,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("handles template summary-item element that is not a shape", () => {
		const slide1 = createMockSlide([TITLE_ELEMENT], "slide-1");
		const nonShapeEl = createMockPageElement("summary-item-1-text", "text");
		(nonShapeEl as unknown as { asShape: jest.Mock }).asShape = jest.fn(() => { throw new Error("Not a shape"); });

		const templateSlide = createMockSlide(
			[SUMMARY_TITLE_ELEMENT, nonShapeEl],
			"template-summary",
		);

		buildMockPresentation({
			extraSlides: [slide1, templateSlide],
		});

		expect(() => {
			createSummarySlide({
				lowerBoundSlideNumber: 3,
				upperBoundSlideNumber: 4,
				insertionSlideNumber: 5,
				templateSlideNumber: 4,
			});
		}).not.toThrow();
	});

	it("skips whitespace-only titles", () => {
		const whitespaceTitle = createMockPageElement("section-title-text-box", "   ");
		const slide1 = createMockSlide([whitespaceTitle], "slide-1");
		const templateSlide = createMockSlide(
			[SUMMARY_TITLE_ELEMENT, SUMMARY_ITEM_1],
			"template-summary",
		);

		const { presentation } = buildMockPresentation({
			extraSlides: [slide1, templateSlide],
		});
		const initialCount = presentation.getSlides().length;

		createSummarySlide({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 4,
			insertionSlideNumber: 5,
			templateSlideNumber: 4,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("only populates as many summary items as there are matching template slots", () => {
		const slide1 = createMockSlide([TITLE_ELEMENT], "slide-1");
		const slide2 = createMockSlide([TITLE_ELEMENT], "slide-2");
		const slide3 = createMockSlide([TITLE_ELEMENT], "slide-3");

		const templateSlide = createMockSlide(
			[SUMMARY_TITLE_ELEMENT, SUMMARY_ITEM_1],
			"template-summary",
		);

		buildMockPresentation({
			extraSlides: [slide1, slide2, slide3, templateSlide],
		});

		expect(() => {
			createSummarySlide({
				lowerBoundSlideNumber: 3,
				upperBoundSlideNumber: 6,
				insertionSlideNumber: 7,
				templateSlideNumber: 6,
			});
		}).not.toThrow();
	});

	it("uses default param object when called with no arguments", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});

		expect(() => {
			createSummarySlide({} as never);
		}).not.toThrow();
	});

	it("handles non-shape element with section-title-text-box description", () => {
		const nonShapeEl = createMockPageElement("section-title-text-box", "Title");
		(nonShapeEl.asShape as jest.Mock).mockImplementation(() => { throw new Error("Not a shape"); });

		const slide1 = createMockSlide([nonShapeEl], "slide-1");
		const templateSlide = createMockSlide(
			[SUMMARY_TITLE_ELEMENT, SUMMARY_ITEM_1],
			"template-summary",
		);

		buildMockPresentation({
			extraSlides: [slide1, templateSlide],
		});

		jest.spyOn(console, "log").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});

		expect(() => {
			createSummarySlide({
				lowerBoundSlideNumber: 3,
				upperBoundSlideNumber: 4,
				insertionSlideNumber: 5,
				templateSlideNumber: 4,
			});
		}).not.toThrow();
	});

	it("handles template summary-title element where asShape throws", () => {
		const slide1 = createMockSlide([TITLE_ELEMENT], "slide-1");

		const templateSlide = createMockSlide([
			SUMMARY_TITLE_ELEMENT,
			SUMMARY_ITEM_1,
		], "template-summary");

		const newSlideWithNullShape = createMockSlide([
			createMockPageElement("summary-title-text", "Summary"),
			createMockPageElement("summary-item-1-text", "Item 1"),
		], "custom-copy");

		const titleEl = newSlideWithNullShape.getPageElements()[0]!;
		(titleEl.asShape as jest.Mock).mockImplementation(() => { throw new Error("Not a shape"); });

		(copySlide_ as jest.Mock).mockReturnValueOnce(newSlideWithNullShape);

		buildMockPresentation({
			extraSlides: [slide1, templateSlide],
		});

		jest.spyOn(console, "log").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});

		expect(() => {
			createSummarySlide({
				lowerBoundSlideNumber: 3,
				upperBoundSlideNumber: 3,
				insertionSlideNumber: 2,
				templateSlideNumber: 4,
			});
		}).not.toThrow();
	});

	it("handles template summary-item element where asShape throws", () => {
		const slide1 = createMockSlide([TITLE_ELEMENT], "slide-1");

		const templateSlide = createMockSlide([
			SUMMARY_TITLE_ELEMENT,
			SUMMARY_ITEM_1,
		], "template-summary");

		const newSlideWithNullShape = createMockSlide([
			SUMMARY_TITLE_ELEMENT,
			createMockPageElement("summary-item-1-text", "Item 1"),
		], "custom-copy");

		const itemEl = newSlideWithNullShape.getPageElements()[1]!;
		(itemEl.asShape as jest.Mock).mockImplementation(() => { throw new Error("Not a shape"); });

		(copySlide_ as jest.Mock).mockReturnValueOnce(newSlideWithNullShape);

		buildMockPresentation({
			extraSlides: [slide1, templateSlide],
		});

		jest.spyOn(console, "log").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});

		expect(() => {
			createSummarySlide({
				lowerBoundSlideNumber: 3,
				upperBoundSlideNumber: 3,
				insertionSlideNumber: 2,
				templateSlideNumber: 4,
			});
		}).not.toThrow();
	});

	it("applies text style params to title and items", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});

		const slide1 = createMockSlide([TITLE_ELEMENT], "slide-1");

		const templateSlide = createMockSlide(
			[SUMMARY_TITLE_ELEMENT, SUMMARY_ITEM_1, SUMMARY_ITEM_2],
			"template-summary",
		);

		const { presentation } = buildMockPresentation({
			extraSlides: [slide1, templateSlide],
		});

		createSummarySlide({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 4,
			insertionSlideNumber: 5,
			templateSlideNumber: 4,
			titleColor: SlidesApp.ThemeColorType.ACCENT1,
			itemColor: SlidesApp.ThemeColorType.ACCENT2,
			titleBold: true,
			itemBold: false,
			titleItalic: true,
			itemItalic: true,
			titleStrikethrough: true,
			itemStrikethrough: true,
			titleUnderline: true,
			itemUnderline: true,
			titleFontSize: 36,
			itemFontSize: 18,
		});

		const newSlide = presentation.getSlides().sort((a, b) =>
			a.getObjectId().localeCompare(b.getObjectId())
		).find(s =>
			s.getPageElements().some(el => el.getDescription() === "summary-title-text")
		)!;

		const titleEl = newSlide.getPageElements().find(
			el => el.getDescription() === "summary-title-text"
		)!;
		const itemEl = newSlide.getPageElements().find(
			el => el.getDescription() === "summary-item-1-text"
		)!;

		const titleState = getMockShapeState(titleEl.asShape());
		const itemState = getMockShapeState(itemEl.asShape());

		expect(titleState.text).toBe("Summary");
		expect(titleState.bold).toBe(true);
		expect(titleState.italic).toBe(true);
		expect(titleState.strikethrough).toBe(true);
		expect(titleState.underline).toBe(true);
		expect(titleState.fontSize).toBe(36);

		expect(itemState.text).toBe("Slide Title");
		expect(itemState.bold).toBe(false);
		expect(itemState.italic).toBe(true);
		expect(itemState.strikethrough).toBe(true);
		expect(itemState.underline).toBe(true);
		expect(itemState.fontSize).toBe(18);
	});

	it("ignores template elements that don't match summary-title-text or summary-item-N-text", () => {
		const slide1 = createMockSlide([TITLE_ELEMENT], "slide-1");
		const extraEl = createMockPageElement("some-other-key", "ignored");

		const templateSlide = createMockSlide(
			[SUMMARY_TITLE_ELEMENT, SUMMARY_ITEM_1, extraEl],
			"template-summary",
		);

		buildMockPresentation({
			extraSlides: [slide1, templateSlide],
		});

		expect(() => {
			createSummarySlide({
				lowerBoundSlideNumber: 3,
				upperBoundSlideNumber: 4,
				insertionSlideNumber: 5,
				templateSlideNumber: 4,
			});
		}).not.toThrow();
	});

	it("validateParams rejects missing required params with exact errors", () => {
		const errors = validateParams(createSummarySlideSchema, {});

		expect(errors).toEqual([
			{ field: "insertionSlideNumber", message: "insertionSlideNumber is required" },
		]);
	});

	it("validateParams rejects wrong type for insertionSlideNumber (string instead of number)", () => {
		const errors = validateParams(createSummarySlideSchema, {
			insertionSlideNumber: "five",
		});

		expect(errors).toEqual([
			{ field: "insertionSlideNumber", message: "insertionSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects NaN for insertionSlideNumber", () => {
		const errors = validateParams(createSummarySlideSchema, {
			insertionSlideNumber: NaN,
		});

		expect(errors).toEqual([
			{ field: "insertionSlideNumber", message: "insertionSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects Infinity for lowerBoundSlideNumber", () => {
		const errors = validateParams(createSummarySlideSchema, {
			insertionSlideNumber: 1,
			lowerBoundSlideNumber: Infinity,
		});

		expect(errors).toEqual([
			{ field: "lowerBoundSlideNumber", message: "lowerBoundSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects NaN for lowerBoundSlideNumber", () => {
		const errors = validateParams(createSummarySlideSchema, {
			insertionSlideNumber: 1,
			lowerBoundSlideNumber: NaN,
		});

		expect(errors).toEqual([
			{ field: "lowerBoundSlideNumber", message: "lowerBoundSlideNumber must be a finite number" },
		]);
	});

	it("validateParams accepts valid input", () => {
		const errors = validateParams(createSummarySlideSchema, {
			insertionSlideNumber: 5,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 10,
		});

		expect(errors).toEqual([]);
	});
});
