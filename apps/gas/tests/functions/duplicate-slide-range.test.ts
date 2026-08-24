/**
 * tests/functions/duplicate-slide-range.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { duplicateSlideRange } from "../../src/functions/duplicate-slide-range";
import { duplicateSlideRangeSchema } from "@gsg/shared";
import { validateParams } from "@gsg/shared";
import { buildMockPresentation, resetMocks } from "../helpers";
import { createMockSlide, createMockPageElement } from "../__mocks__/google-apps-script";
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

describe("duplicateSlideRange", () => {
	it("duplicates a range of slides and inserts copies", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");
		const slide3 = createMockSlide([], "slide-3");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2, slide3] });
		const initialCount = presentation.getSlides().length;

		duplicateSlideRange({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 4,
			insertionSlideNumber: 5,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 2);
	});

	it("inserts duplicates at the specified slide number", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");
		const slide3 = createMockSlide([], "slide-3");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2, slide3] });

		duplicateSlideRange({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 3,
			insertionSlideNumber: 5,
		});

		expect(presentation.getSlides().length).toBe(6);
		const insertedSlide = presentation.getSlides()[4]!;
		expect(insertedSlide.getObjectId()).not.toBe("slide-1");
	});

	it("handles null presentation without crashing", () => {
		expect(() => {
			duplicateSlideRange({
				lowerBoundSlideNumber: 1,
				upperBoundSlideNumber: 1,
				insertionSlideNumber: 1,
			});
		}).not.toThrow();
	});

	it("does nothing when lower bound exceeds upper bound", () => {
		const slide1 = createMockSlide([], "slide-1");
		const { presentation } = buildMockPresentation({ extraSlides: [slide1] });
		const initialCount = presentation.getSlides().length;

		duplicateSlideRange({
			lowerBoundSlideNumber: 5,
			upperBoundSlideNumber: 3,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("does not duplicate slides outside the specified range", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2] });
		const initialCount = presentation.getSlides().length;

		duplicateSlideRange({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 3,
			insertionSlideNumber: 5,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 1);
	});

	it("creates linked copies when linkingMode is LINKED", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2] });

		duplicateSlideRange({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 4,
			insertionSlideNumber: 5,
			linkingMode: SlidesApp.SlideLinkingMode.LINKED,
		});

		const slides = presentation.getSlides();
		const inserted1 = slides[4]!;
		const inserted2 = slides[5]!;
		expect(inserted1.getSlideLinkingMode()).toBe("LINKED");
		expect(inserted2.getSlideLinkingMode()).toBe("LINKED");
	});

	it("updates shape links pointing to duplicated slides", () => {
		const linkTarget = createMockSlide([], "link-target");
		const elementWithLink = createMockPageElement("linked-element");
		const shape = elementWithLink.asShape();
		if (shape) {
			shape.setLinkSlide(linkTarget);
		}
		const linkedSlide = createMockSlide([elementWithLink], "linked-slide");

		const { presentation } = buildMockPresentation({ extraSlides: [linkedSlide, linkTarget] });

		duplicateSlideRange({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 4,
			insertionSlideNumber: 5,
		});

		const slides = presentation.getSlides();
		const linkCopySlide = slides[4]!;
		const linkCopyElements = linkCopySlide.getPageElements();
		expect(linkCopyElements.length).toBe(1);
		const linkCopyShape = linkCopyElements[0]!.asShape();
		expect(linkCopyShape).not.toBeNull();
		if (linkCopyShape) {
			const link = linkCopyShape.getLink();
			expect(link).not.toBeNull();
			if (link) {
				const linkedSlideResult = link.getLinkedSlide();
				expect(linkedSlideResult).not.toBeNull();
				if (linkedSlideResult) {
					expect(linkedSlideResult.getObjectId()).not.toBe("link-target");
					expect(linkedSlideResult).not.toBe(linkTarget);
				}
			}
		}
	});

	it("does not update links pointing to slides outside the duplicated range", () => {
		const externalTarget = createMockSlide([], "external-target");
		const elementWithLink = createMockPageElement("linked-element");
		const shape = elementWithLink.asShape();
		if (shape) {
			shape.setLinkSlide(externalTarget);
		}
		const sourceSlide = createMockSlide([elementWithLink], "source-slide");

		const { presentation } = buildMockPresentation({ extraSlides: [sourceSlide, externalTarget] });

		duplicateSlideRange({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 3,
			insertionSlideNumber: 5,
		});

		const slides = presentation.getSlides();
		const copySlide = slides[4]!;
		const copyElements = copySlide.getPageElements();
		expect(copyElements.length).toBe(1);
		const copyShape = copyElements[0]!.asShape();
		expect(copyShape).not.toBeNull();
		if (copyShape) {
			const link = copyShape.getLink();
			expect(link).not.toBeNull();
			if (link) {
				const linkedSlideResult = link.getLinkedSlide();
				expect(linkedSlideResult).toBe(externalTarget);
			}
		}
	});

	it("inserts duplicates at the beginning of the presentation", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");
		const slide3 = createMockSlide([], "slide-3");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2, slide3] });
		const initialCount = presentation.getSlides().length;

		duplicateSlideRange({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 4,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 2);
	});

	it("inserts duplicates beyond the end of the presentation", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2] });
		const initialCount = presentation.getSlides().length;

		duplicateSlideRange({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 3,
			insertionSlideNumber: 20,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 1);
	});

	it("duplicates the entire slide range when using defaults", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2] });
		const initialCount = presentation.getSlides().length;

		duplicateSlideRange({
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 4,
			insertionSlideNumber: 5,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 4);
	});

	it("handles range extending beyond available slides", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2] });

		duplicateSlideRange({
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 100,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(8);
	});

	it("inserts before the source range (insertion < lowerBound)", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");
		const slide3 = createMockSlide([], "slide-3");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2, slide3] });
		const initialCount = presentation.getSlides().length;

		duplicateSlideRange({
			lowerBoundSlideNumber: 4,
			upperBoundSlideNumber: 4,
			insertionSlideNumber: 1,
		});

		const slides = presentation.getSlides();
		expect(slides.length).toBe(initialCount + 1);
	});

	it("inserts before source when insertion is between source bounds", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");
		const slide3 = createMockSlide([], "slide-3");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2, slide3] });
		const initialCount = presentation.getSlides().length;

		duplicateSlideRange({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 5,
			insertionSlideNumber: 4,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 3);
	});

	it("uses default param object when called with no arguments", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});

		expect(() => {
			duplicateSlideRange({} as never);
		}).not.toThrow();
	});

	it("uses destructured defaults when called without optional params", () => {
		const slide1 = createMockSlide([], "slide-1");
		const { presentation } = buildMockPresentation({ extraSlides: [slide1] });
		const initialCount = presentation.getSlides().length;

		jest.spyOn(console, "log").mockImplementation(() => {});

		duplicateSlideRange({ insertionSlideNumber: 5 } as never);

		expect(presentation.getSlides().length).toBeGreaterThanOrEqual(initialCount);
	});

	it("handles copySlide_ returning null gracefully", () => {
		const slide1 = createMockSlide([], "slide-1");
		const slide2 = createMockSlide([], "slide-2");

		const { presentation } = buildMockPresentation({ extraSlides: [slide1, slide2] });
		const initialCount = presentation.getSlides().length;

		(copySlide_ as jest.Mock).mockReturnValueOnce(null);

		duplicateSlideRange({
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 3,
			insertionSlideNumber: 5,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("validateParams rejects missing required params with exact errors", () => {
		const errors = validateParams(duplicateSlideRangeSchema, {});

		expect(errors).toEqual([
			{ field: "insertionSlideNumber", message: "insertionSlideNumber is required" },
		]);
	});

	it("validateParams rejects wrong type for insertionSlideNumber (string instead of number)", () => {
		const errors = validateParams(duplicateSlideRangeSchema, {
			insertionSlideNumber: "five",
		});

		expect(errors).toEqual([
			{ field: "insertionSlideNumber", message: "insertionSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects NaN for insertionSlideNumber", () => {
		const errors = validateParams(duplicateSlideRangeSchema, {
			insertionSlideNumber: NaN,
		});

		expect(errors).toEqual([
			{ field: "insertionSlideNumber", message: "insertionSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects Infinity for lowerBoundSlideNumber", () => {
		const errors = validateParams(duplicateSlideRangeSchema, {
			insertionSlideNumber: 1,
			lowerBoundSlideNumber: Infinity,
		});

		expect(errors).toEqual([
			{ field: "lowerBoundSlideNumber", message: "lowerBoundSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects NaN for lowerBoundSlideNumber", () => {
		const errors = validateParams(duplicateSlideRangeSchema, {
			insertionSlideNumber: 1,
			lowerBoundSlideNumber: NaN,
		});

		expect(errors).toEqual([
			{ field: "lowerBoundSlideNumber", message: "lowerBoundSlideNumber must be a finite number" },
		]);
	});

	it("validateParams accepts valid input", () => {
		const errors = validateParams(duplicateSlideRangeSchema, {
			insertionSlideNumber: 5,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 10,
		});

		expect(errors).toEqual([]);
	});
});
