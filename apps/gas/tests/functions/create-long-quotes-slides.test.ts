/**
 * tests/functions/create-long-quotes-slides.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { createLongQuotesSlides } from "../../src/functions/create-long-quotes-slides";
import { createLongQuotesSlidesSchema } from "@gsg/shared";
import { validateParams } from "@gsg/shared";
import { LongQuoteItem } from "@gsg/shared";
import { buildMockPresentation, resetMocks } from "../helpers";

beforeEach(() => {
	resetMocks();
});

const suppressLogs = () => {
	jest.spyOn(console, "log").mockImplementation(() => {});
	jest.spyOn(console, "error").mockImplementation(() => {});
};

describe("createLongQuotesSlides", () => {
	it("generates slides with default params when no args provided", () => {
		buildMockPresentation();

		expect(() => createLongQuotesSlides()).not.toThrow();
	});

	it("generates slides for provided items", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const items: LongQuoteItem[] = [
			{
				title: "Test",
				subtitle: "Author",
				quote: "Short quote.",
			},
		];

		createLongQuotesSlides({
			longQuoteItems: items,
			insertionSlideNumber: 1,
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
		});

		expect(presentation.getSlides().length).toBeGreaterThan(initialCount);
	});

	it("returns early when no presentation is active", () => {
		expect(() => {
			createLongQuotesSlides({
				longQuoteItems: [{ title: "T", subtitle: "A", quote: "Q" }],
				insertionSlideNumber: 1,
				templateTitleSlideNumber: null,
				templateContentSlideNumber: null,
			});
		}).not.toThrow();
	});

	it("does nothing when template slides are not found", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const items: LongQuoteItem[] = [
			{
				title: "Test",
				subtitle: "Author",
				quote: "Text.",
			},
		];

		createLongQuotesSlides({
			longQuoteItems: items,
			insertionSlideNumber: 1,
			templateTitleSlideNumber: 99,
			templateContentSlideNumber: 99,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("uses destructured defaults when called with only required params", () => {
		suppressLogs();

		buildMockPresentation();

		expect(() => createLongQuotesSlides({} as never)).not.toThrow();
	});

	it("handles processLongQuoteSlideItem_ returning null by retaining current index", () => {
		suppressLogs();

		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		(presentation as unknown as { insertSlide: jest.Mock }).insertSlide = jest.fn(() => null);

		createLongQuotesSlides({
			longQuoteItems: [
				{
					title: "Fail Title",
					subtitle: "Fail Author",
					quote: "Some quote that will fail.",
				},
			],
			insertionSlideNumber: 1,
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("does nothing when longQuoteItems is empty", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		createLongQuotesSlides({
			longQuoteItems: [],
			insertionSlideNumber: 1,
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("uses auto-detected title template when templateTitleSlideNumber is null", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const items: LongQuoteItem[] = [
			{ title: "Auto Title", subtitle: "Auto", quote: "Auto quote." },
		];

		createLongQuotesSlides({
			longQuoteItems: items,
			insertionSlideNumber: 1,
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
		});

		expect(presentation.getSlides().length).toBeGreaterThan(initialCount);
	});

	it("accepts all optional color params", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const items: LongQuoteItem[] = [
			{ title: "Color Test", subtitle: "Author", quote: "Colored quote." },
		];

		createLongQuotesSlides({
			longQuoteItems: items,
			insertionSlideNumber: 1,
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			titleColor: SlidesApp.ThemeColorType.ACCENT1,
			subtitleColor: SlidesApp.ThemeColorType.ACCENT2,
			quoteColor: SlidesApp.ThemeColorType.ACCENT3,
			addendumColor: SlidesApp.ThemeColorType.ACCENT4,
		});

		expect(presentation.getSlides().length).toBeGreaterThan(initialCount);
	});

	it("accepts all optional fontSize params", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const items: LongQuoteItem[] = [
			{ title: "Font Size Test", subtitle: "Author", quote: "Resized text." },
		];

		createLongQuotesSlides({
			longQuoteItems: items,
			insertionSlideNumber: 1,
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			titleFontSize: 24,
			subtitleFontSize: 18,
			quoteFontSize: 14,
			addendumFontSize: 12,
		});

		expect(presentation.getSlides().length).toBeGreaterThan(initialCount);
	});

	it("validateParams rejects wrong type for longQuoteItems (string instead of object[])", () => {
		const errors = validateParams(createLongQuotesSlidesSchema, {
			longQuoteItems: "not-an-array",
		});

		expect(errors).toEqual([
			{ field: "longQuoteItems", message: "longQuoteItems must be an array" },
		]);
	});

	it("validateParams rejects NaN for insertionSlideNumber", () => {
		const errors = validateParams(createLongQuotesSlidesSchema, {
			longQuoteItems: [{ title: "T", subtitle: "S", quote: "Q" }],
			insertionSlideNumber: NaN,
		});

		expect(errors).toEqual([
			{ field: "insertionSlideNumber", message: "insertionSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects Infinity for insertionSlideNumber", () => {
		const errors = validateParams(createLongQuotesSlidesSchema, {
			longQuoteItems: [{ title: "T", subtitle: "S", quote: "Q" }],
			insertionSlideNumber: Infinity,
		});

		expect(errors).toEqual([
			{ field: "insertionSlideNumber", message: "insertionSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects string for insertionSlideNumber (wrong type)", () => {
		const errors = validateParams(createLongQuotesSlidesSchema, {
			longQuoteItems: [{ title: "T", subtitle: "S", quote: "Q" }],
			insertionSlideNumber: "nine",
		});

		expect(errors).toEqual([
			{ field: "insertionSlideNumber", message: "insertionSlideNumber must be a finite number" },
		]);
	});

	it("validateParams rejects NaN for quoteFontSize (nested in arrayItemSchema)", () => {
		const errors = validateParams(createLongQuotesSlidesSchema, {
			longQuoteItems: [{ title: "T", subtitle: "S", quote: "Q", quoteFontSize: NaN }],
		});

		expect(errors).toEqual([
			{ field: "longQuoteItems[0].quoteFontSize", message: "quoteFontSize must be a finite number" },
		]);
	});

	it("validateParams accepts valid input (all optional params omitted)", () => {
		const errors = validateParams(createLongQuotesSlidesSchema, {});

		expect(errors).toEqual([]);
	});
});
