/**
 * tests/functions/move-slides.test.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { moveSlides } from "../../src/functions/move-slides";
import { moveSlidesSchema } from "@gsg/shared";
import { validateParams } from "@gsg/shared";
import { buildMockPresentation, resetMocks } from "../helpers";
import { createMockSlide } from "../__mocks__/google-apps-script";
import { copySlide_ } from "../../src/shared/copy-slide";

jest.mock("../../src/shared/copy-slide", () => {
	const actual = jest.requireActual("../../src/shared/copy-slide");
	return {
		copySlide_: jest.fn(actual.copySlide_),
	};
});

beforeEach(() => {
	resetMocks();
});

describe("moveSlides", () => {
	it("moves slides forward (target > source)", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");
		const slide3 = createMockSlide([], "slide-3");
		const slide4 = createMockSlide([], "slide-4");
		const slide5 = createMockSlide([], "slide-5");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2, slide3, slide4, slide5] });

		moveSlides({
			fromSlideNumber: 3,
			toSlideNumber: 4,
			targetSlideNumber: 6,
		});

		const slides = presentation.getSlides();
		expect(slides.length).toBe(7);
		expect(slides[0]!.getObjectId()).toBe("title-slide-id");
		expect(slides[1]!.getObjectId()).toBe("content-slide-id");
		expect(slides[2]!.getObjectId()).toBe("slide-3");
		expect(slides[5]!.getObjectId()).toBe("slide-4");
		expect(slides[6]!.getObjectId()).toBe("slide-5");
		expect(slides[3]!.getObjectId()).not.toBe("slide-1");
		expect(slides[3]!.getObjectId()).not.toBe("slide-2");
		expect(slides[4]!.getObjectId()).not.toBe("slide-1");
		expect(slides[4]!.getObjectId()).not.toBe("slide-2");
	});

	it("moves slides backward (target < source)", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");
		const slide3 = createMockSlide([], "slide-3");
		const slide4 = createMockSlide([], "slide-4");
		const slide5 = createMockSlide([], "slide-5");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2, slide3, slide4, slide5] });

		moveSlides({
			fromSlideNumber: 5,
			toSlideNumber: 6,
			targetSlideNumber: 2,
		});

		const slides = presentation.getSlides();
		expect(slides.length).toBe(7);
		expect(slides[0]!.getObjectId()).toBe("title-slide-id");
		expect(slides[1]!.getObjectId()).not.toBe("slide-3");
		expect(slides[1]!.getObjectId()).not.toBe("slide-4");
		expect(slides[2]!.getObjectId()).not.toBe("slide-3");
		expect(slides[2]!.getObjectId()).not.toBe("slide-4");
		expect(slides[3]!.getObjectId()).toBe("content-slide-id");
		expect(slides[4]!.getObjectId()).toBe("slide-1");
		expect(slides[5]!.getObjectId()).toBe("slide-2");
		expect(slides[6]!.getObjectId()).toBe("slide-5");
	});

	it("moves a single slide", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2] });

		moveSlides({
			fromSlideNumber: 3,
			toSlideNumber: 3,
			targetSlideNumber: 1,
		});

		const slides = presentation.getSlides();
		expect(slides.length).toBe(4);
		expect(slides[0]!.getObjectId()).not.toBe("slide-1");
	});

	it("preserves total slide count", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");
		const slide3 = createMockSlide([], "slide-3");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2, slide3] });
		const initialCount = presentation.getSlides().length;

		moveSlides({
			fromSlideNumber: 3,
			toSlideNumber: 4,
			targetSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("handles null presentation without crashing", () => {
		expect(() => {
			moveSlides({
				fromSlideNumber: 1,
				toSlideNumber: 1,
				targetSlideNumber: 2,
			});
		}).not.toThrow();
	});

	it("does nothing when from exceeds to", () => {
		const slide1 = createMockSlide([], "slide-1");
		const { presentation } = buildMockPresentation({ extraSlides: [slide1] });
		const initialCount = presentation.getSlides().length;

		moveSlides({
			fromSlideNumber: 5,
			toSlideNumber: 3,
			targetSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("does not crash when source range exceeds available slides", () => {
		const slide1 = createMockSlide([], "slide-1");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1] });

		moveSlides({
			fromSlideNumber: 1,
			toSlideNumber: 99,
			targetSlideNumber: 100,
		});

		expect(presentation.getSlides().length).toBe(3);
	});

	it("moves slides to the beginning of the presentation", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");
		const slide3 = createMockSlide([], "slide-3");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2, slide3] });

		moveSlides({
			fromSlideNumber: 4,
			toSlideNumber: 5,
			targetSlideNumber: 1,
		});

		const slides = presentation.getSlides();
		expect(slides.length).toBe(5);
		expect(slides[0]!.getObjectId()).not.toBe("title-slide-id");
		expect(slides[2]!.getObjectId()).toBe("title-slide-id");
	});

	it("moves slides beyond the end of the presentation", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2] });

		moveSlides({
			fromSlideNumber: 3,
			toSlideNumber: 3,
			targetSlideNumber: 20,
		});

		expect(presentation.getSlides().length).toBe(4);
	});

	it("moves slides from the very beginning (slide 1)", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2] });

		moveSlides({
			fromSlideNumber: 1,
			toSlideNumber: 2,
			targetSlideNumber: 5,
		});

		expect(presentation.getSlides().length).toBe(4);
	});

	it("moves with linkingMode set to LINKED", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2] });

		moveSlides({
			fromSlideNumber: 3,
			toSlideNumber: 4,
			targetSlideNumber: 1,
			linkingMode: SlidesApp.SlideLinkingMode.LINKED,
		});

		const slides = presentation.getSlides();
		expect(slides.length).toBe(4);
	});

	it("returns early when source range is entirely beyond available slides", () => {
		const slide1 = createMockSlide([], "slide-1");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1] });
		const initialCount = presentation.getSlides().length;

		moveSlides({
			fromSlideNumber: 100,
			toSlideNumber: 101,
			targetSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("move from slide 1 (title slide) to later position preserves total count", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2] });
		const initialCount = presentation.getSlides().length;

		moveSlides({
			fromSlideNumber: 1,
			toSlideNumber: 1,
			targetSlideNumber: 4,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("move from slide 1 and 2 to end preserves count", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2] });
		const initialCount = presentation.getSlides().length;

		moveSlides({
			fromSlideNumber: 1,
			toSlideNumber: 2,
			targetSlideNumber: 5,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("handles copySlide_ returning null gracefully", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2] });

		(copySlide_ as jest.Mock).mockReturnValueOnce(null);

		moveSlides({
			fromSlideNumber: 3,
			toSlideNumber: 3,
			targetSlideNumber: 4,
		});

		expect(presentation.getSlides().length).toBe(3);
	});

	it("uses destructured defaults when called without optional params", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});

		expect(() => {
			moveSlides({ fromSlideNumber: 3, toSlideNumber: 3, targetSlideNumber: 4 } as never);
		}).not.toThrow();
	});

	it("validateParams rejects missing required params with exact errors", () => {
		const errors = validateParams(moveSlidesSchema, {});

		expect(errors).toEqual([
			{ field: "fromSlideNumber", message: "fromSlideNumber is required" },
			{ field: "toSlideNumber", message: "toSlideNumber is required" },
			{ field: "targetSlideNumber", message: "targetSlideNumber is required" },
		]);
	});

	it("validateParams rejects wrong type for fromSlideNumber (string instead of number)", () => {
		const errors = validateParams(moveSlidesSchema, {
			fromSlideNumber: "one",
			toSlideNumber: 3,
			targetSlideNumber: 4,
		});

		expect(errors).toEqual([
			{ field: "fromSlideNumber", message: "fromSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects NaN for fromSlideNumber", () => {
		const errors = validateParams(moveSlidesSchema, {
			fromSlideNumber: NaN,
			toSlideNumber: 3,
			targetSlideNumber: 4,
		});

		expect(errors).toEqual([
			{ field: "fromSlideNumber", message: "fromSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects Infinity for targetSlideNumber", () => {
		const errors = validateParams(moveSlidesSchema, {
			fromSlideNumber: 1,
			toSlideNumber: 3,
			targetSlideNumber: Infinity,
		});

		expect(errors).toEqual([
			{ field: "targetSlideNumber", message: "targetSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects string for targetSlideNumber (wrong type)", () => {
		const errors = validateParams(moveSlidesSchema, {
			fromSlideNumber: 1,
			toSlideNumber: 3,
			targetSlideNumber: "four",
		});

		expect(errors).toEqual([
			{ field: "targetSlideNumber", message: "targetSlideNumber must be a finite number" },
		]);
	});

	it("validateParams accepts valid input", () => {
		const errors = validateParams(moveSlidesSchema, {
			fromSlideNumber: 1,
			toSlideNumber: 3,
			targetSlideNumber: 5,
		});

		expect(errors).toEqual([]);
	});
});
