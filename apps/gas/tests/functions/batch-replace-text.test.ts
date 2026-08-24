/**
 * tests/functions/batch-replace-text.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { batchReplaceText } from "../../src/functions/batch-replace-text";
import { batchReplaceTextSchema } from "@gsg/shared";
import { validateParams } from "@gsg/shared";
import { buildMockPresentation, resetMocks } from "../helpers";
import { createMockSlide } from "../__mocks__/google-apps-script";
import { mockSlidesApp } from "../__mocks__/google-apps-script";

beforeEach(() => {
	resetMocks();
});

describe("batchReplaceText", () => {
	it("replaces text on slides within the given range", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");
		const slide3 = createMockSlide([], "slide-3");

		buildMockPresentation({ extraSlides: [slide1, slide2, slide3] });

		batchReplaceText({
			replacements: [
				{ oldText: "foo", newText: "bar" },
				{ oldText: "x", newText: "y" },
			],
			matchCase: false,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		[slide1, slide2, slide3].forEach((slide) => {
			const mock = slide as unknown as { replaceAllText: jest.Mock };
			expect(mock.replaceAllText).toHaveBeenCalledWith("foo", "bar", false);
			expect(mock.replaceAllText).toHaveBeenCalledWith("x", "y", false);
		});
	});

	it("only targets slides within the specified range", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");
		const slide3 = createMockSlide([], "slide-3");
		const slide4 = createMockSlide([], "slide-4");

		buildMockPresentation({ extraSlides: [slide1, slide2, slide3, slide4] });

		batchReplaceText({
			replacements: [{ oldText: "foo", newText: "bar" }],
			matchCase: true,
			lowerBoundSlideNumber: 5,
			upperBoundSlideNumber: 5,
		});

		expect((slide1 as unknown as { replaceAllText: jest.Mock }).replaceAllText).not.toHaveBeenCalled();
		expect((slide2 as unknown as { replaceAllText: jest.Mock }).replaceAllText).not.toHaveBeenCalled();
		expect((slide3 as unknown as { replaceAllText: jest.Mock }).replaceAllText).toHaveBeenCalled();
		expect((slide4 as unknown as { replaceAllText: jest.Mock }).replaceAllText).not.toHaveBeenCalled();
	});

	it("handles null presentation without crashing", () => {
		mockSlidesApp.setActivePresentation(null);

		expect(() => {
			batchReplaceText({
				replacements: [{ oldText: "a", newText: "b" }],
				matchCase: false,
				lowerBoundSlideNumber: 1,
				upperBoundSlideNumber: 3,
			});
		}).not.toThrow();
	});

	it("does nothing with empty replacements array", () => {
		const slide = createMockSlide([], "slide-1");
		buildMockPresentation({ extraSlides: [slide] });

		batchReplaceText({
			replacements: [],
			matchCase: false,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		expect((slide as unknown as { replaceAllText: jest.Mock }).replaceAllText).not.toHaveBeenCalled();
	});

	it("does nothing when lowerBound exceeds upperBound", () => {
		const slide = createMockSlide([], "slide-1");
		buildMockPresentation({ extraSlides: [slide] });

		batchReplaceText({
			replacements: [{ oldText: "a", newText: "b" }],
			matchCase: false,
			lowerBoundSlideNumber: 5,
			upperBoundSlideNumber: 3,
		});

		expect((slide as unknown as { replaceAllText: jest.Mock }).replaceAllText).not.toHaveBeenCalled();
	});

	it("performs case-sensitive replacement when matchCase is true", () => {
		const slide1 = createMockSlide([], "slide-1");
		buildMockPresentation({ extraSlides: [slide1] });

		batchReplaceText({
			replacements: [{ oldText: "Hello", newText: "World" }],
			matchCase: true,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		expect((slide1 as unknown as { replaceAllText: jest.Mock }).replaceAllText).toHaveBeenCalledWith("Hello", "World", true);
	});

	it("handles empty oldText string gracefully", () => {
		const slide = createMockSlide([], "slide-1");
		buildMockPresentation({ extraSlides: [slide] });

		expect(() => {
			batchReplaceText({
				replacements: [{ oldText: "", newText: "replacement" }],
				matchCase: false,
				lowerBoundSlideNumber: 1,
				upperBoundSlideNumber: 5,
			});
		}).not.toThrow();
	});

	it("handles empty newText string gracefully", () => {
		const slide = createMockSlide([], "slide-1");
		buildMockPresentation({ extraSlides: [slide] });

		expect(() => {
			batchReplaceText({
				replacements: [{ oldText: "foo", newText: "" }],
				matchCase: false,
				lowerBoundSlideNumber: 1,
				upperBoundSlideNumber: 5,
			});
		}).not.toThrow();
	});

	it("uses default param object when called with no arguments", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});

		expect(() => {
			batchReplaceText();
		}).not.toThrow();
	});

	it("uses destructured defaults when called without optional params", () => {
		const slide = createMockSlide([], "slide-1");
		buildMockPresentation({ extraSlides: [slide] });

		expect(() => {
			batchReplaceText({ replacements: [{ oldText: "a", newText: "b" }] } as never);
		}).not.toThrow();
	});

	it("validateParams rejects missing required params with exact errors", () => {
		const errors = validateParams(batchReplaceTextSchema, {});

		expect(errors).toEqual([
			{ field: "replacements", message: "replacements is required" },
		]);
	});

	it("validateParams rejects wrong type for replacements (string instead of object[])", () => {
		const errors = validateParams(batchReplaceTextSchema, {
			replacements: "not-an-array",
		});

		expect(errors).toEqual([
			{ field: "replacements", message: "replacements must be an array" },
		]);
	});

	it("validateParams rejects NaN for lowerBoundSlideNumber", () => {
		const errors = validateParams(batchReplaceTextSchema, {
			replacements: [{ oldText: "a", newText: "b" }],
			lowerBoundSlideNumber: NaN,
		});

		expect(errors).toEqual([
			{ field: "lowerBoundSlideNumber", message: "lowerBoundSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects Infinity for lowerBoundSlideNumber", () => {
		const errors = validateParams(batchReplaceTextSchema, {
			replacements: [{ oldText: "a", newText: "b" }],
			lowerBoundSlideNumber: Infinity,
		});

		expect(errors).toEqual([
			{ field: "lowerBoundSlideNumber", message: "lowerBoundSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects string for upperBoundSlideNumber (wrong type)", () => {
		const errors = validateParams(batchReplaceTextSchema, {
			replacements: [{ oldText: "a", newText: "b" }],
			upperBoundSlideNumber: "five",
		});

		expect(errors).toEqual([
			{ field: "upperBoundSlideNumber", message: "upperBoundSlideNumber must be a finite number" },
		]);
	});

	it("validateParams accepts valid input", () => {
		const errors = validateParams(batchReplaceTextSchema, {
			replacements: [{ oldText: "a", newText: "b" }],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
			matchCase: true,
		});

		expect(errors).toEqual([]);
	});
});
