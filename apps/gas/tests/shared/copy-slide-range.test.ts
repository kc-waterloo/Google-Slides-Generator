/**
 * tests/shared/copy-slide-range.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { copySlideRange_ } from "../../src/shared/copy-slide-range";
import { buildMockPresentation, resetMocks } from "../helpers";
import { createMockSlide, createMockPresentation } from "../__mocks__/google-apps-script";
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

describe("copySlideRange_", () => {
	it("copies slides within range and returns map", () => {
		const { presentation } = buildMockPresentation();

		const result = copySlideRange_({
			presentation,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 2,
			insertionSlideNumber: 3,
		});

		expect(result.size).toBe(2);
	});

	it("returns map with original slide IDs as keys", () => {
		const { presentation, titleSlide, contentSlide } = buildMockPresentation();

		const result = copySlideRange_({
			presentation,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
			insertionSlideNumber: 3,
		});

		expect(result.has(titleSlide.getObjectId())).toBe(true);
		expect(result.has(contentSlide.getObjectId())).toBe(false);
	});

	it("returns empty map when lower bound exceeds upper bound", () => {
		const { presentation } = buildMockPresentation();

		const result = copySlideRange_({
			presentation,
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 1,
			insertionSlideNumber: 3,
		});

		expect(result.size).toBe(0);
	});

	it("copies a single slide when lower equals upper", () => {
		const { presentation } = buildMockPresentation();

		const result = copySlideRange_({
			presentation,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
			insertionSlideNumber: 3,
		});

		expect(result.size).toBe(1);
	});

	it("handles range that exceeds presentation bounds", () => {
		const { presentation } = buildMockPresentation();

		const result = copySlideRange_({
			presentation,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 999,
			insertionSlideNumber: 3,
		});

		expect(result.size).toBe(2);
	});

	it("inserts at the correct index", () => {
		const { presentation } = buildMockPresentation();

		copySlideRange_({
			presentation,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
			insertionSlideNumber: 3,
		});

		expect(presentation.insertSlide).toHaveBeenCalledWith(2, expect.any(Object));
	});

	it("handles NaN lowerBoundSlideNumber", () => {
		const { presentation } = buildMockPresentation({
			extraSlides: [createMockSlide(), createMockSlide(), createMockSlide()],
		});

		const result = copySlideRange_({
			presentation,
			lowerBoundSlideNumber: NaN,
			upperBoundSlideNumber: 2,
			insertionSlideNumber: 3,
		});

		expect(result.size).toBe(0);
	});

	it("handles Infinity upperBoundSlideNumber", () => {
		const { presentation } = buildMockPresentation({
			extraSlides: [createMockSlide(), createMockSlide(), createMockSlide()],
		});

		expect(() => {
			copySlideRange_({
				presentation,
				lowerBoundSlideNumber: 1,
				upperBoundSlideNumber: Infinity,
				insertionSlideNumber: 3,
			});
		}).not.toThrow();
	});

	it("returns empty map for lower > upper", () => {
		const { presentation } = buildMockPresentation();

		const result = copySlideRange_({
			presentation,
			lowerBoundSlideNumber: 5,
			upperBoundSlideNumber: 3,
			insertionSlideNumber: 3,
		});

		expect(result.size).toBe(0);
	});

	it("handles empty presentation", () => {
		const presentation = createMockPresentation([]);

		const result = copySlideRange_({
			presentation,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 5,
			insertionSlideNumber: 3,
		});

		expect(result.size).toBe(0);
	});

	it("handles NaN insertionSlideNumber", () => {
		const { presentation } = buildMockPresentation({
			extraSlides: [createMockSlide(), createMockSlide(), createMockSlide()],
		});

		const result = copySlideRange_({
			presentation,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 2,
			insertionSlideNumber: NaN,
		});

		expect(result.size).toBe(2);
	});

	it("handles copySlide_ returning null for some slides", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});

		const { presentation } = buildMockPresentation({
			extraSlides: [createMockSlide([], "extra-slide-1")],
		});

		(copySlide_ as jest.Mock).mockImplementation((params: {
			presentation: GoogleAppsScript.Slides.Presentation,
			originalSlideId: string,
			newSlideIndex: number,
		}) => {
			if (params.originalSlideId === "title-slide-id") {
				return null;
			}
			return jest.requireActual("../../src/shared/copy-slide").copySlide_(params);
		});

		const result = copySlideRange_({
			presentation,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 3,
			insertionSlideNumber: 5,
		});

		expect(result.has("title-slide-id")).toBe(false);
		expect(result.size).toBe(2);
	});
});
