/**
 * tests/functions/batch-set-text-style.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { batchSetTextStyle } from "../../src/functions/batch-set-text-style";
import { batchSetTextStyleSchema } from "@gsg/shared";
import { validateParams } from "@gsg/shared";
import { buildMockPresentation, resetMocks } from "../helpers";
import { createMockSlide, createMockPageElement } from "../__mocks__/google-apps-script";

beforeEach(() => {
	resetMocks();
});

describe("batchSetTextStyle", () => {
	it("applies font size to matching page elements", () => {
		const elements = [
			createMockPageElement("title-text"),
		];
		const slide = createMockSlide(elements, "slide-1");

		buildMockPresentation({ extraSlides: [slide] });

		batchSetTextStyle({
			textStyles: [
				{ pageElementKey: "title-text", fontSize: 24 },
			],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		const shape = elements[0]!.asShape();
		expect(shape.getText().getTextStyle().setFontSize).toHaveBeenCalledWith(24);
	});

	it("applies italic to matching page elements", () => {
		const elements = [
			createMockPageElement("quote-text"),
		];
		const slide = createMockSlide(elements, "slide-1");

		buildMockPresentation({ extraSlides: [slide] });

		batchSetTextStyle({
			textStyles: [
				{ pageElementKey: "quote-text", italic: true },
			],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		const shape = elements[0]!.asShape();
		expect(shape.getText().getTextStyle().setItalic).toHaveBeenCalledWith(true);
	});

	it("applies color to matching page elements", () => {
		const elements = [
			createMockPageElement("header-text"),
		];
		const slide = createMockSlide(elements, "slide-1");

		buildMockPresentation({ extraSlides: [slide] });

		batchSetTextStyle({
			textStyles: [
				{ pageElementKey: "header-text", color: "DARK1" },
			],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		const shape = elements[0]!.asShape();
		expect(shape.getText().getTextStyle().setForegroundColor).toHaveBeenCalled();
	});

	it("only affects slides within the specified range", () => {
		const elements1 = [createMockPageElement("target")];
		const elements2 = [createMockPageElement("target")];
		const slide1 = createMockSlide(elements1, "slide-1");
		const slide2 = createMockSlide(elements2, "slide-2");

		buildMockPresentation({ extraSlides: [slide1, slide2] });

		batchSetTextStyle({
			textStyles: [
				{ pageElementKey: "target", fontSize: 18 },
			],
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 3,
		});

		const shape1 = elements1[0]!.asShape();
		const shape2 = elements2[0]!.asShape();

		expect(shape1.getText().getTextStyle().setFontSize).toHaveBeenCalledWith(18);
		expect(shape2.getText().getTextStyle().setFontSize).not.toHaveBeenCalled();
	});

	it("skips page elements with non-matching keys", () => {
		const elements = [
			createMockPageElement("other-key"),
		];
		const slide = createMockSlide(elements, "slide-1");

		buildMockPresentation({ extraSlides: [slide] });

		batchSetTextStyle({
			textStyles: [
				{ pageElementKey: "title-text", fontSize: 24 },
			],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		const shape = elements[0]!.asShape();
		expect(shape.getText().getTextStyle().setFontSize).not.toHaveBeenCalled();
	});

	it("handles null presentation without crashing", () => {
		expect(() => {
			batchSetTextStyle({
				textStyles: [{ pageElementKey: "key", fontSize: 12 }],
				lowerBoundSlideNumber: 1,
				upperBoundSlideNumber: 5,
			});
		}).not.toThrow();
	});

	it("applies strikethrough to matching page elements", () => {
		const elements = [
			createMockPageElement("title-text"),
		];
		const slide = createMockSlide(elements, "slide-1");

		buildMockPresentation({ extraSlides: [slide] });

		batchSetTextStyle({
			textStyles: [
				{ pageElementKey: "title-text", strikethrough: true },
			],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		const shape = elements[0]!.asShape();
		expect(shape.getText().getTextStyle().setStrikethrough).toHaveBeenCalledWith(true);
	});

	it("applies underline to matching page elements", () => {
		const elements = [
			createMockPageElement("title-text"),
		];
		const slide = createMockSlide(elements, "slide-1");

		buildMockPresentation({ extraSlides: [slide] });

		batchSetTextStyle({
			textStyles: [
				{ pageElementKey: "title-text", underline: true },
			],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		const shape = elements[0]!.asShape();
		expect(shape.getText().getTextStyle().setUnderline).toHaveBeenCalledWith(true);
	});

	it("applies bold to matching page elements", () => {
		const elements = [
			createMockPageElement("title-text"),
		];
		const slide = createMockSlide(elements, "slide-1");

		buildMockPresentation({ extraSlides: [slide] });

		batchSetTextStyle({
			textStyles: [
				{ pageElementKey: "title-text", bold: true },
			],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		const shape = elements[0]!.asShape();
		expect(shape.getText().getTextStyle().setBold).toHaveBeenCalledWith(true);
	});

	it("applies border color to matching page elements", () => {
		const elements = [
			createMockPageElement("bordered-box"),
		];
		const slide = createMockSlide(elements, "slide-1");

		buildMockPresentation({ extraSlides: [slide] });

		batchSetTextStyle({
			textStyles: [
				{ pageElementKey: "bordered-box", borderColor: "ACCENT1" },
			],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		const shape = elements[0]!.asShape();
		expect(shape.getBorder().getLineFill().setSolidFill).toHaveBeenCalled();
	});

	it("does nothing with empty textStyles array", () => {
		const slide = createMockSlide([], "slide-1");
		buildMockPresentation({ extraSlides: [slide] });

		expect(() => {
			batchSetTextStyle({
				textStyles: [],
				lowerBoundSlideNumber: 1,
				upperBoundSlideNumber: 5,
			});
		}).not.toThrow();
	});

	it("handles page element where asShape returns null", () => {
		const el = createMockPageElement("non-shape-key");
		(el.asShape as jest.Mock).mockReturnValue(null);
		const slide = createMockSlide([el], "slide-1");

		buildMockPresentation({ extraSlides: [slide] });

		expect(() => {
			batchSetTextStyle({
				textStyles: [
					{ pageElementKey: "non-shape-key", fontSize: 18 },
				],
				lowerBoundSlideNumber: 1,
				upperBoundSlideNumber: 5,
			});
		}).not.toThrow();
	});

	it("handles no arguments (default parameter object)", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		buildMockPresentation();

		expect(() => batchSetTextStyle()).not.toThrow();
	});

	it("does nothing when lowerBound exceeds upperBound", () => {
		const elements = [
			createMockPageElement("title-text"),
		];
		const slide = createMockSlide(elements, "slide-1");

		buildMockPresentation({ extraSlides: [slide] });

		batchSetTextStyle({
			textStyles: [
				{ pageElementKey: "title-text", fontSize: 24 },
			],
			lowerBoundSlideNumber: 5,
			upperBoundSlideNumber: 3,
		});

		const shape = elements[0]!.asShape();
		expect(shape.getText().getTextStyle().setFontSize).not.toHaveBeenCalled();
	});

	it("uses destructured defaults when called without optional params", () => {
		const elements = [
			createMockPageElement("title-text"),
		];
		const slide = createMockSlide(elements, "slide-1");

		buildMockPresentation({ extraSlides: [slide] });

		expect(() => {
			batchSetTextStyle({
				textStyles: [{ pageElementKey: "title-text", fontSize: 24 }],
			} as never);
		}).not.toThrow();
	});

	it("handles override with all undefined optional values", () => {
		const elements = [
			createMockPageElement("title-text"),
		];
		const slide = createMockSlide(elements, "slide-1");

		buildMockPresentation({ extraSlides: [slide] });

		expect(() => {
			batchSetTextStyle({
				textStyles: [
					{ pageElementKey: "title-text" },
				],
				lowerBoundSlideNumber: 1,
				upperBoundSlideNumber: 5,
			});
		}).not.toThrow();
	});

	it("validateParams rejects missing required params with exact errors", () => {
		const errors = validateParams(batchSetTextStyleSchema, {});

		expect(errors).toEqual([
			{ field: "textStyles", message: "textStyles is required" },
		]);
	});

	it("validateParams rejects wrong type for textStyles (string instead of object[])", () => {
		const errors = validateParams(batchSetTextStyleSchema, {
			textStyles: "not-an-array",
		});

		expect(errors).toEqual([
			{ field: "textStyles", message: "textStyles must be an array" },
		]);
	});

	it("validateParams rejects NaN for lowerBoundSlideNumber", () => {
		const errors = validateParams(batchSetTextStyleSchema, {
			textStyles: [{ pageElementKey: "key", fontSize: 12 }],
			lowerBoundSlideNumber: NaN,
		});

		expect(errors).toEqual([
			{ field: "lowerBoundSlideNumber", message: "lowerBoundSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects Infinity for lowerBoundSlideNumber", () => {
		const errors = validateParams(batchSetTextStyleSchema, {
			textStyles: [{ pageElementKey: "key", fontSize: 12 }],
			lowerBoundSlideNumber: Infinity,
		});

		expect(errors).toEqual([
			{ field: "lowerBoundSlideNumber", message: "lowerBoundSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects string for upperBoundSlideNumber (wrong type)", () => {
		const errors = validateParams(batchSetTextStyleSchema, {
			textStyles: [{ pageElementKey: "key", fontSize: 12 }],
			upperBoundSlideNumber: "9999",
		});

		expect(errors).toEqual([
			{ field: "upperBoundSlideNumber", message: "upperBoundSlideNumber must be a finite number" },
		]);
	});

	it("validateParams accepts valid input", () => {
		const errors = validateParams(batchSetTextStyleSchema, {
			textStyles: [{ pageElementKey: "key", fontSize: 12 }],
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
		});

		expect(errors).toEqual([]);
	});
});
