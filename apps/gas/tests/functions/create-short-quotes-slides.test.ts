/**
 * tests/functions/create-short-quotes-slides.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { createShortQuotesSlides } from "../../src/functions/create-short-quotes-slides";
import { createShortQuotesSlidesSchema } from "@gsg/shared";
import { validateParams } from "@gsg/shared";
import { ShortQuoteItem } from "@gsg/shared";
import { buildMockPresentation, resetMocks } from "../helpers";

beforeEach(() => {
	resetMocks();
});

describe("createShortQuotesSlides", () => {
	it("generates slides with provided items", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const items: ShortQuoteItem[] = [
			{ quote: "Test quote", addendum: "Test source" },
		];

		createShortQuotesSlides({
			shortQuoteItems: items,
			insertionSlideNumber: 1,
			templateSlideNumber: null,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 1);
	});

	it("does nothing when template slides not found", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		createShortQuotesSlides({
			shortQuoteItems: [{ quote: "Q", addendum: "A" }],
			insertionSlideNumber: 1,
			templateSlideNumber: 99,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("uses destructured defaults when called with only required params", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});

		buildMockPresentation();

		expect(() => createShortQuotesSlides({} as never)).not.toThrow();
	});

	it("uses default parameter object when called with no arguments", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});

		buildMockPresentation();

		expect(() => createShortQuotesSlides()).not.toThrow();
	});

	it("returns early when no presentation is active", () => {
		expect(() => {
			createShortQuotesSlides({
				shortQuoteItems: [{ quote: "Q", addendum: "A" }],
				insertionSlideNumber: 1,
				templateSlideNumber: null,
			});
		}).not.toThrow();
	});

	it("handles processShortQuoteItem_ returning null by retaining current index", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});

		const { presentation } = buildMockPresentation();

		(presentation as unknown as { insertSlide: jest.Mock }).insertSlide = jest.fn(() => null);

		const initialCount = presentation.getSlides().length;

		createShortQuotesSlides({
			shortQuoteItems: [{ quote: "Q", addendum: "A" }],
			insertionSlideNumber: 1,
			templateSlideNumber: null,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("does nothing when shortQuoteItems is empty", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		createShortQuotesSlides({
			shortQuoteItems: [],
			insertionSlideNumber: 1,
			templateSlideNumber: null,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("uses auto-detected template when templateSlideNumber is null", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		createShortQuotesSlides({
			shortQuoteItems: [{ quote: "Auto Q", addendum: "Auto A" }],
			insertionSlideNumber: 1,
			templateSlideNumber: null,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 1);
	});

	it("accepts custom color params", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		createShortQuotesSlides({
			shortQuoteItems: [{ quote: "Colored Q", addendum: "Colored A" }],
			insertionSlideNumber: 1,
			templateSlideNumber: null,
			quoteColor: SlidesApp.ThemeColorType.ACCENT1,
			addendumColor: SlidesApp.ThemeColorType.ACCENT2,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 1);
	});

	it("validateParams rejects wrong type for shortQuoteItems (string instead of object[])", () => {
		const errors = validateParams(createShortQuotesSlidesSchema, {
			shortQuoteItems: "not-an-array",
		});

		expect(errors).toEqual([
			{ field: "shortQuoteItems", message: "shortQuoteItems must be an array" },
		]);
	});

	it("validateParams rejects NaN for templateSlideNumber", () => {
		const errors = validateParams(createShortQuotesSlidesSchema, {
			shortQuoteItems: [{ quote: "Q", addendum: "A" }],
			templateSlideNumber: NaN,
		});

		expect(errors).toEqual([
			{ field: "templateSlideNumber", message: "templateSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects Infinity for templateSlideNumber", () => {
		const errors = validateParams(createShortQuotesSlidesSchema, {
			shortQuoteItems: [{ quote: "Q", addendum: "A" }],
			templateSlideNumber: Infinity,
		});

		expect(errors).toEqual([
			{ field: "templateSlideNumber", message: "templateSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects string for templateSlideNumber (wrong type)", () => {
		const errors = validateParams(createShortQuotesSlidesSchema, {
			shortQuoteItems: [{ quote: "Q", addendum: "A" }],
			templateSlideNumber: "three",
		});

		expect(errors).toEqual([
			{ field: "templateSlideNumber", message: "templateSlideNumber must be a finite number" },
		]);
	});

	it("validateParams accepts valid input (all optional params omitted)", () => {
		const errors = validateParams(createShortQuotesSlidesSchema, {});

		expect(errors).toEqual([]);
	});
});
