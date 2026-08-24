/**
 * tests/functions/apply-background-color.test.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { applyBackgroundColor } from "../../src/functions/apply-background-color";
import { applyBackgroundColorSchema } from "@gsg/shared";
import { validateParams } from "@gsg/shared";
import { buildMockPresentation, resetMocks } from "../helpers";
import { createMockSlide } from "../__mocks__/google-apps-script";

beforeEach(() => {
	resetMocks();
});

describe("applyBackgroundColor", () => {
	it("sets background color on slides in range", () => {
		const slide = createMockSlide([], "slide-1");

		const { presentation } = buildMockPresentation({ extraSlides: [slide] });

		applyBackgroundColor({
			color: "DARK1",
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		const slides = presentation.getSlides();
		slides.forEach((s: GoogleAppsScript.Slides.Slide): void => {
			expect(s.getBackground().setSolidFill).toHaveBeenCalled();
		});
	});

	it("respects lower bound", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2] });
		const slides = presentation.getSlides();

		jest.clearAllMocks();

		applyBackgroundColor({
			color: "ACCENT1",
			lowerBoundSlideNumber: 4,
			upperBoundSlideNumber: 4,
		});

		expect(slides[0]!.getBackground().setSolidFill).not.toHaveBeenCalled();
		expect(slides[1]!.getBackground().setSolidFill).not.toHaveBeenCalled();
		expect(slides[2]!.getBackground().setSolidFill).not.toHaveBeenCalled();
		expect(slides[3]!.getBackground().setSolidFill).toHaveBeenCalledWith("ACCENT1" as unknown as GoogleAppsScript.Slides.ThemeColorType);
	});

	it("handles null presentation without crashing", () => {
		expect(() => {
			applyBackgroundColor({
				color: "DARK1",
			});
		}).not.toThrow();
	});

	it("uses provided color string", () => {
		const slide = createMockSlide([], "slide-1");

		const { presentation } = buildMockPresentation({ extraSlides: [slide] });

		applyBackgroundColor({
			color: "ACCENT3",
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		const slides = presentation.getSlides();
		slides.forEach((s: GoogleAppsScript.Slides.Slide): void => {
			expect(s.getBackground().setSolidFill).toHaveBeenCalledWith("ACCENT3" as unknown as GoogleAppsScript.Slides.ThemeColorType);
		});
	});

	it("does nothing when lowerBound exceeds upperBound", () => {
		const slide = createMockSlide([], "slide-1");
		buildMockPresentation({ extraSlides: [slide] });

		const getBackgroundSpy = jest.fn();
		slide.getBackground = getBackgroundSpy as unknown as () => GoogleAppsScript.Slides.PageBackground;

		applyBackgroundColor({
			color: "DARK1",
			lowerBoundSlideNumber: 5,
			upperBoundSlideNumber: 3,
		});

		expect(getBackgroundSpy).not.toHaveBeenCalled();
	});

	it("handles negative slide numbers without crashing", () => {
		const slide = createMockSlide([], "slide-1");
		buildMockPresentation({ extraSlides: [slide] });

		expect(() => {
			applyBackgroundColor({
				color: "DARK1",
				lowerBoundSlideNumber: -1,
				upperBoundSlideNumber: 0,
			});
		}).not.toThrow();
	});

	it("works on a single slide when lowerBound equals upperBound", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2] });
		const slides = presentation.getSlides();

		jest.clearAllMocks();

		applyBackgroundColor({
			color: "ACCENT2",
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 3,
		});

		expect(slides[2]!.getBackground().setSolidFill).toHaveBeenCalled();
		expect(slides[3]!.getBackground().setSolidFill).not.toHaveBeenCalled();
	});

	it("uses default color when color param is omitted", () => {
		const slide = createMockSlide([], "slide-1");
		const { presentation } = buildMockPresentation({ extraSlides: [slide] });

		applyBackgroundColor({
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		} as unknown as {
			color: string;
			lowerBoundSlideNumber?: number;
			upperBoundSlideNumber?: number;
		});

		const slides = presentation.getSlides();
		slides.forEach((s: GoogleAppsScript.Slides.Slide): void => {
			expect(s.getBackground().setSolidFill).toHaveBeenCalled();
		});
	});

	it("handles no arguments (default parameter object)", () => {
		expect(() => applyBackgroundColor()).not.toThrow();
	});

	it("does not crash with invalid color string", () => {
		const slide = createMockSlide([], "slide-1");
		buildMockPresentation({ extraSlides: [slide] });

		expect(() => {
			applyBackgroundColor({
				color: "INVALID_COLOR_NAME",
				lowerBoundSlideNumber: 1,
				upperBoundSlideNumber: 3,
			});
		}).not.toThrow();
	});

	it("validateParams rejects missing required params with exact errors", () => {
		const errors = validateParams(applyBackgroundColorSchema, {});

		expect(errors).toEqual([
			{ field: "color", message: "color is required" },
		]);
	});

	it("validateParams rejects wrong type for color (number instead of string)", () => {
		const errors = validateParams(applyBackgroundColorSchema, {
			color: 123,
		});

		expect(errors).toEqual([
			{ field: "color", message: "color must be a string" },
		]);
	});

	it("validateParams rejects NaN for lowerBoundSlideNumber", () => {
		const errors = validateParams(applyBackgroundColorSchema, {
			color: "DARK1",
			lowerBoundSlideNumber: NaN,
		});

		expect(errors).toEqual([
			{ field: "lowerBoundSlideNumber", message: "lowerBoundSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects Infinity for upperBoundSlideNumber", () => {
		const errors = validateParams(applyBackgroundColorSchema, {
			color: "DARK1",
			upperBoundSlideNumber: Infinity,
		});

		expect(errors).toEqual([
			{ field: "upperBoundSlideNumber", message: "upperBoundSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects string for upperBoundSlideNumber (wrong type)", () => {
		const errors = validateParams(applyBackgroundColorSchema, {
			color: "DARK1",
			upperBoundSlideNumber: "ten",
		});

		expect(errors).toEqual([
			{ field: "upperBoundSlideNumber", message: "upperBoundSlideNumber must be a finite number" },
		]);
	});

	it("validateParams accepts valid input", () => {
		const errors = validateParams(applyBackgroundColorSchema, {
			color: "DARK1",
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		expect(errors).toEqual([]);
	});
});
