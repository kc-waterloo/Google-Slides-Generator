/**
 * tests/shared/slide-id.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { getTemplateSlideId_ } from "../../src/shared/slide-id/get-template-slide-id";
import { slideIndexToId_ } from "../../src/shared/slide-index/slide-index-to-id";
import { slideNumberToId_ } from "../../src/shared/slide-number/slide-number-to-id";
import { slideNumberToIndex_ } from "../../src/shared/slide-number/slide-number-to-index";
import { buildMockPresentation, resetMocks } from "../helpers";
import { createMockSlide, createMockPageElement, createMockPresentation } from "../__mocks__/google-apps-script";
import * as logger from "../../src/shared/logger/logger";


beforeEach(() => {
	resetMocks();
});

describe("getTemplateSlideId_", () => {
	it("finds a slide that has all required page element keys", () => {
		const { presentation } = buildMockPresentation();

		const result = getTemplateSlideId_({
			presentation,
			pageElementKeys: ["section-title-text-box", "section-subtitle-text-box"],
		});

		expect(result).toBe("title-slide-id");
	});

	it("returns null when no slide has all required keys", () => {
		const { presentation } = buildMockPresentation();

		const result = getTemplateSlideId_({
			presentation,
			pageElementKeys: ["nonexistent-key"],
		});

		expect(result).toBeNull();
	});

	it("returns the first matching slide", () => {
		const matchingSlide = createMockSlide([
			createMockPageElement("key-a"),
			createMockPageElement("key-b"),
		], "matching-id");

		const { presentation } = buildMockPresentation({ extraSlides: [matchingSlide] });

		const result = getTemplateSlideId_({
			presentation,
			pageElementKeys: ["key-a", "key-b"],
		});

		expect(result).toBe("matching-id");
	});

	it("returns first slide when pageElementKeys is empty (vacuous truth)", () => {
		const { presentation } = buildMockPresentation();

		const result = getTemplateSlideId_({
			presentation,
			pageElementKeys: [],
		});

		expect(result).toBe("title-slide-id");
	});

	it("returns null for a presentation with zero slides", () => {
		const presentation = createMockPresentation([]);
		const warnSpy = jest.spyOn(logger, "logWarn").mockImplementation(() => {});

		const result = getTemplateSlideId_({
			presentation,
			pageElementKeys: ["key-a"],
		});

		expect(result).toBeNull();
		expect(warnSpy).toHaveBeenCalled();
		warnSpy.mockRestore();
	});

	it("calls logWarn when no slide matches", () => {
		const { presentation } = buildMockPresentation();
		const warnSpy = jest.spyOn(logger, "logWarn").mockImplementation(() => {});

		const result = getTemplateSlideId_({
			presentation,
			pageElementKeys: ["missing-a", "missing-b"],
		});

		expect(result).toBeNull();
		expect(warnSpy).toHaveBeenCalledWith(
			"getTemplateSlideId",
			"No slide found matching keys [missing-a, missing-b]",
		);
		warnSpy.mockRestore();
	});
});

describe("slideIndexToId_", () => {
	it("returns slide id for a valid index", () => {
		const { presentation } = buildMockPresentation();

		const result = slideIndexToId_({
			presentation,
			slideIndex: 0,
		});

		expect(result).toBe("title-slide-id");
	});

	it("returns null for an out-of-bounds index", () => {
		const { presentation } = buildMockPresentation();

		const result = slideIndexToId_({
			presentation,
			slideIndex: 999,
		});

		expect(result).toBeNull();
	});

	it("returns null for a null slide index", () => {
		const { presentation } = buildMockPresentation();

		const result = slideIndexToId_({
			presentation,
			slideIndex: null,
		});

		expect(result).toBeNull();
	});

	it("returns null for NaN slide index", () => {
		const { presentation } = buildMockPresentation();

		const result = slideIndexToId_({
			presentation,
			slideIndex: NaN,
		});

		expect(result).toBeNull();
	});

	it("returns null for Infinity slide index", () => {
		const { presentation } = buildMockPresentation();

		const result = slideIndexToId_({
			presentation,
			slideIndex: Infinity,
		});

		expect(result).toBeNull();
	});
});

describe("slideNumberToId_", () => {
	it("returns slide id for a valid slide number", () => {
		const { presentation } = buildMockPresentation();

		const result = slideNumberToId_({
			presentation,
			slideNumber: 2,
			pageElementKeys: null,
		});

		expect(result).toBe("content-slide-id");
	});

	it("finds template by keys when slide number is null", () => {
		const { presentation } = buildMockPresentation();

		const result = slideNumberToId_({
			presentation,
			slideNumber: null,
			pageElementKeys: ["quote-text-box", "addendum-text-box"],
		});

		expect(result).toBe("content-slide-id");
	});

	it("returns null for out-of-bounds slide number", () => {
		const { presentation } = buildMockPresentation();

		const result = slideNumberToId_({
			presentation,
			slideNumber: 999,
			pageElementKeys: null,
		});

		expect(result).toBeNull();
	});

	it("returns null when slideNumber is null and pageElementKeys is null", () => {
		const { presentation } = buildMockPresentation();

		const result = slideNumberToId_({
			presentation,
			slideNumber: null,
			pageElementKeys: null,
		});

		expect(result).toBeNull();
	});

	it("returns null for a negative slide number", () => {
		const { presentation } = buildMockPresentation();

		const result = slideNumberToId_({
			presentation,
			slideNumber: -5,
			pageElementKeys: null,
		});

		expect(result).toBeNull();
	});

	it("uses default pageElementKeys when set to null", () => {
		const { presentation } = buildMockPresentation();

		const result = slideNumberToId_({
			presentation,
			slideNumber: 2,
			pageElementKeys: null,
		});

		expect(result).toBe("content-slide-id");
	});
});

describe("slideNumberToIndex_", () => {
	it("handles negative numbers", () => {
		expect(slideNumberToIndex_(-5)).toBe(-6);
	});

	it("handles zero", () => {
		expect(slideNumberToIndex_(0)).toBe(-1);
	});

	it("returns NaN for NaN input", () => {
		expect(slideNumberToIndex_(NaN)).toBeNaN();
	});

	it("returns Infinity for Infinity input", () => {
		expect(slideNumberToIndex_(Infinity)).toBe(Infinity);
	});

	it("returns -Infinity for -Infinity input", () => {
		expect(slideNumberToIndex_(-Infinity)).toBe(-Infinity);
	});
});

describe("slideNumberToId_ default param", () => {
	it("uses default pageElementKeys=null when property is omitted", () => {
		const { presentation } = buildMockPresentation();

		const result = slideNumberToId_({
			presentation,
			slideNumber: 2,
		} as unknown as {
			presentation: GoogleAppsScript.Slides.Presentation;
			slideNumber: number | null;
			pageElementKeys: string[] | null;
		});

		expect(result).toBe("content-slide-id");
	});
});
