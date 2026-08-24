/**
 * tests/functions/create-highlight-variation-slides.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { createHighlightVariationSlides } from "../../src/functions/create-highlight-variation-slides";
import { createHighlightVariationSlidesSchema } from "@gsg/shared";
import { validateParams } from "@gsg/shared";
import { buildMockPresentation, resetMocks } from "../helpers";
import { createMockSlide, createMockPageElement, getMockShapeState } from "../__mocks__/google-apps-script";
import * as logger from "../../src/shared/logger/logger";

beforeEach(() => {
	resetMocks();
});

describe("createHighlightVariationSlides", () => {
	it("creates variations when a valid slide is found", () => {
		const highlightSlide = createMockSlide(
			[
				createMockPageElement("point-1-of-3-text-box"),
				createMockPageElement("point-2-of-3-text-box"),
				createMockPageElement("point-3-of-3-text-box"),
				createMockPageElement("point-1-of-3-number-indicator-text-box"),
				createMockPageElement("point-2-of-3-number-indicator-text-box"),
				createMockPageElement("point-3-of-3-number-indicator-text-box"),
			],
			"highlight-id",
		);

		buildMockPresentation({
			extraSlides: [highlightSlide],
		});

		const presentation = SlidesApp.getActivePresentation();
		const initialCount = presentation.getSlides().length;

		createHighlightVariationSlides({ inputSlideNumber: 3 });

		expect(presentation.getSlides().length).toBe(initialCount + 5);
	});

	it("returns early when no presentation is active", () => {
		expect(() => {
			createHighlightVariationSlides({ inputSlideNumber: 3 });
		}).not.toThrow();
	});

	it("returns early when no highlight slide is found", () => {
		buildMockPresentation();

		expect(() => {
			createHighlightVariationSlides({ inputSlideNumber: 999 });
		}).not.toThrow();
	});

	it("returns early when no matching page elements found (numberOfPages is null)", () => {
		const noMatchSlide = createMockSlide([
			createMockPageElement("some-other-key"),
		], "no-match-id");
		buildMockPresentation({
			extraSlides: [noMatchSlide],
		});

		expect(() => {
			createHighlightVariationSlides({ inputSlideNumber: 3 });
		}).not.toThrow();
	});

	it("uses default parameter when called with no arguments", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});

		buildMockPresentation();

		expect(() => createHighlightVariationSlides()).not.toThrow();
	});

	it("uses individual destructured defaults when called with empty object", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});

		buildMockPresentation();

		expect(() => createHighlightVariationSlides({} as never)).not.toThrow();
	});

	it("handles copySlide_ returning null by continuing loop", () => {
		const highlightSlide = createMockSlide(
			[
				createMockPageElement("point-1-of-2-text-box"),
				createMockPageElement("point-2-of-2-text-box"),
			],
			"highlight-id",
		);

		const { presentation } = buildMockPresentation({
			extraSlides: [highlightSlide],
		});

		const originalInsertSlide = (presentation as unknown as { insertSlide: jest.Mock }).insertSlide;
		let callCount = 0;
		(presentation as unknown as { insertSlide: jest.Mock }).insertSlide = jest.fn(
			(index: number, originalSlide?: GoogleAppsScript.Slides.Slide) => {
				callCount++;
				if (callCount === 2) {
					return null;
				}
				return originalInsertSlide(index, originalSlide);
			},
		);

		const initialCount = presentation.getSlides().length;

		expect(() => {
			createHighlightVariationSlides({ inputSlideNumber: 3 });
		}).not.toThrow();
		expect(presentation.getSlides().length).toBe(initialCount + 3);
	});
});

describe("createHighlightVariationSlides logError path", () => {
	it("calls logError when no matching page elements found", () => {
		const errorSpy = jest.spyOn(logger, "logError").mockImplementation(() => {});

		const noMatchSlide = createMockSlide([
			createMockPageElement("some-other-key"),
		], "no-match-id");
		buildMockPresentation({
			extraSlides: [noMatchSlide],
		});

		createHighlightVariationSlides({ inputSlideNumber: 3 });

		expect(errorSpy).toHaveBeenCalledWith(
			"createHighlightVariationSlides",
			"Number of pages not found on input slide",
		);
		errorSpy.mockRestore();
	});

	it("calls logError when copySlide_ returns null", () => {
		const errorSpy = jest.spyOn(logger, "logError").mockImplementation(() => {});

		const highlightSlide = createMockSlide(
			[
				createMockPageElement("point-1-of-1-text-box"),
				createMockPageElement("point-1-of-1-number-indicator-text-box"),
			],
			"highlight-id",
		);

		const { presentation } = buildMockPresentation({
			extraSlides: [highlightSlide],
		});

		(presentation as unknown as { insertSlide: jest.Mock }).insertSlide = jest.fn(() => null);

		createHighlightVariationSlides({ inputSlideNumber: 3 });

		expect(errorSpy).toHaveBeenCalledWith(
			"createHighlightVariationSlides",
			expect.stringContaining("Failed to copy variation slide"),
		);
		errorSpy.mockRestore();
	});
});

describe("createHighlightVariationSlides style params", () => {
	it("applies highlight style params to highlighted slides", () => {
		const highlightSlide = createMockSlide(
			[
				createMockPageElement("point-1-of-2-text-box", "Point 1"),
				createMockPageElement("point-2-of-2-text-box", "Point 2"),
				createMockPageElement("point-1-of-2-number-indicator-text-box", "1"),
				createMockPageElement("point-2-of-2-number-indicator-text-box", "2"),
			],
			"highlight-style-id",
		);

		const { presentation } = buildMockPresentation({
			extraSlides: [highlightSlide],
		});

		jest.spyOn(console, "log").mockImplementation(() => {});

		createHighlightVariationSlides({
			inputSlideNumber: 3,
			highlightItalic: true,
			highlightStrikethrough: true,
			highlightUnderline: true,
			highlightFontSize: 20,
		});

		const slides = presentation.getSlides();
		expect(slides.length).toBeGreaterThan(2);

		const highlightedVariation = slides[4]!;
		const pointEl = highlightedVariation.getPageElements().find(
			el => el.getDescription() === "point-1-of-2-text-box"
		)!;
		const state = getMockShapeState(pointEl.asShape());

		expect(state.italic).toBe(true);
		expect(state.strikethrough).toBe(true);
		expect(state.underline).toBe(true);
		expect(state.fontSize).toBe(20);
	});
});

describe("createHighlightVariationSlides numberOfPages=1", () => {
	it("handles single-page highlight (numberOfPages = 1)", () => {
		const highlightSlide = createMockSlide(
			[
				createMockPageElement("point-1-of-1-text-box"),
				createMockPageElement("point-1-of-1-number-indicator-text-box"),
			],
			"highlight-id",
		);

		const { presentation } = buildMockPresentation({
			extraSlides: [highlightSlide],
		});
		const initialCount = presentation.getSlides().length;

		createHighlightVariationSlides({ inputSlideNumber: 3 });

		expect(presentation.getSlides().length).toBe(initialCount + 3);
	});
});

it("validateParams rejects wrong type for inputSlideNumber (string instead of number)", () => {
	const errors = validateParams(createHighlightVariationSlidesSchema, {
		inputSlideNumber: "one",
	});

	expect(errors).toEqual([
		{ field: "inputSlideNumber", message: "inputSlideNumber must be a finite number" },
	]);
});

it("validateParams rejects NaN for inputSlideNumber", () => {
	const errors = validateParams(createHighlightVariationSlidesSchema, {
		inputSlideNumber: NaN,
	});

	expect(errors).toEqual([
		{ field: "inputSlideNumber", message: "inputSlideNumber must be a finite number" },
	]);
});

it("validateParams rejects Infinity for inputSlideNumber", () => {
	const errors = validateParams(createHighlightVariationSlidesSchema, {
		inputSlideNumber: Infinity,
	});

	expect(errors).toEqual([
		{ field: "inputSlideNumber", message: "inputSlideNumber must be a finite number" },
	]);
});

it("validateParams rejects NaN for highlightFontSize (optional number field)", () => {
	const errors = validateParams(createHighlightVariationSlidesSchema, {
		highlightFontSize: NaN,
	});

	expect(errors).toEqual([
		{ field: "highlightFontSize", message: "highlightFontSize must be a finite number" },
	]);
});

it("validateParams rejects string for highlightColor (wrong type for optional string)", () => {
	const errors = validateParams(createHighlightVariationSlidesSchema, {
		highlightColor: 123,
	});

	expect(errors).toEqual([
		{ field: "highlightColor", message: "highlightColor must be a string" },
	]);
});

it("validateParams accepts valid input (all optional params omitted)", () => {
	const errors = validateParams(createHighlightVariationSlidesSchema, {});

	expect(errors).toEqual([]);
});
