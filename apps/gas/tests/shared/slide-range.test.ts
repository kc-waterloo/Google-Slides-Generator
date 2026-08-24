/**
 * tests/shared/slide-range.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { forEachSlideInRange_ } from "../../src/shared/slide-range";
import { buildMockPresentation, resetMocks } from "../helpers";
import { createMockPresentation, createMockSlide } from "../__mocks__/google-apps-script";

beforeEach(() => {
	resetMocks();
});

describe("forEachSlideInRange_", () => {
	it("calls callback for slides within the range", () => {
		const { presentation } = buildMockPresentation();
		const callback = jest.fn();

		forEachSlideInRange_({
			presentation,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 2,
			callback,
		});

		expect(callback).toHaveBeenCalledTimes(2);
	});

	it("passes slide and index to callback", () => {
		const { presentation } = buildMockPresentation();
		const callback = jest.fn();

		forEachSlideInRange_({
			presentation,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
			callback,
		});

		expect(callback).toHaveBeenCalledWith(
			expect.any(Object),
			0,
		);
	});

	it("skips slides outside the range", () => {
		const { presentation } = buildMockPresentation();
		const callback = jest.fn();

		forEachSlideInRange_({
			presentation,
			lowerBoundSlideNumber: 2,
			upperBoundSlideNumber: 2,
			callback,
		});

		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith(expect.any(Object), 1);
	});

	it("handles a single slide range", () => {
		const { presentation } = buildMockPresentation();
		const callback = jest.fn();

		forEachSlideInRange_({
			presentation,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
			callback,
		});

		expect(callback).toHaveBeenCalledTimes(1);
	});

	it("handles range that exceeds presentation bounds", () => {
		const { presentation } = buildMockPresentation();
		const callback = jest.fn();

		forEachSlideInRange_({
			presentation,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 999,
			callback,
		});

		expect(callback).toHaveBeenCalledTimes(2);
	});

	it("does not call callback for an empty presentation", () => {
		const presentation = createMockPresentation([]);
		const callback = jest.fn();

		forEachSlideInRange_({
			presentation,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 1,
			callback,
		});

		expect(callback).not.toHaveBeenCalled();
	});

	it("does not call callback for inverted range (lower > upper)", () => {
		const { presentation } = buildMockPresentation();
		const callback = jest.fn();

		forEachSlideInRange_({
			presentation,
			lowerBoundSlideNumber: 5,
			upperBoundSlideNumber: 3,
			callback,
		});

		expect(callback).not.toHaveBeenCalled();
	});

	it("handles NaN bounds without crashing", () => {
		const { presentation } = buildMockPresentation();
		const callback = jest.fn();

		forEachSlideInRange_({
			presentation,
			lowerBoundSlideNumber: NaN,
			upperBoundSlideNumber: NaN,
			callback,
		});

		expect(callback).toHaveBeenCalledTimes(2);
	});

	it("handles Infinity upper bound", () => {
		const { presentation } = buildMockPresentation({
			extraSlides: [createMockSlide()],
		});
		const callback = jest.fn();

		forEachSlideInRange_({
			presentation,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: Infinity,
			callback,
		});

		expect(callback).toHaveBeenCalledTimes(3);
	});

	it("handles NaN lower bound", () => {
		const { presentation } = buildMockPresentation();
		const callback = jest.fn();

		forEachSlideInRange_({
			presentation,
			lowerBoundSlideNumber: NaN,
			upperBoundSlideNumber: 2,
			callback,
		});

		expect(callback).toHaveBeenCalledTimes(2);
	});

	it("handles presentation.getSlides returning empty array", () => {
		const presentation = createMockPresentation([]);
		const callback = jest.fn();

		forEachSlideInRange_({
			presentation,
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: 2,
			callback,
		});

		expect(callback).not.toHaveBeenCalled();
	});

	it("handles callback throwing gracefully", () => {
		const { presentation } = buildMockPresentation();
		const callback = jest.fn(() => {
			throw new Error("callback error");
		});

		expect(() => {
			forEachSlideInRange_({
				presentation,
				lowerBoundSlideNumber: 1,
				upperBoundSlideNumber: 2,
				callback,
			});
		}).toThrow("callback error");
	});
});
