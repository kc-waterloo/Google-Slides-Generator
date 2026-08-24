/**
 * useSlideEstimator.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSlideEstimator } from "../useSlideEstimator";

describe("useSlideEstimator", () => {
	it("returns null when no function is selected", () => {
		const { result } = renderHook(() => useSlideEstimator(null, {}));
		expect(result.current).toBeNull();
	});

	it("returns 1 for createBulletSlide", () => {
		const schema = { name: "createBulletSlide" } as never;
		const { result } = renderHook(() => useSlideEstimator(schema, {}));
		expect(result.current).toBe(1);
	});

	it("returns null for unknown function", () => {
		const schema = { name: "unknownFunction" } as never;
		const { result } = renderHook(() => useSlideEstimator(schema, {}));
		expect(result.current).toBeNull();
	});

	it("estimates slides for createLongQuotesSlides with items", () => {
		const schema = { name: "createLongQuotesSlides" } as never;
		const params = {
			longQuoteItems: [
				{ quote: "First paragraph.\n\nSecond paragraph.", splitMode: "char-count" },
			],
		};
		const { result } = renderHook(() => useSlideEstimator(schema, params));
		expect(result.current).toBeGreaterThanOrEqual(3);
	});

	it("returns null for createLongQuotesSlides with empty items", () => {
		const schema = { name: "createLongQuotesSlides" } as never;
		const params = { longQuoteItems: [] };
		const { result } = renderHook(() => useSlideEstimator(schema, params));
		expect(result.current).toBeNull();
	});

	it("returns null for createLongQuotesSlides with non-array items", () => {
		const schema = { name: "createLongQuotesSlides" } as never;
		const params = { longQuoteItems: "not array" };
		const { result } = renderHook(() => useSlideEstimator(schema, params));
		expect(result.current).toBeNull();
	});

	it("estimates 2 slides per item with splitMode 'none'", () => {
		const schema = { name: "createLongQuotesSlides" } as never;
		const params = {
			longQuoteItems: [
				{ quote: "Some quote", splitMode: "none" },
				{ quote: "Another quote", splitMode: "none" },
			],
		};
		const { result } = renderHook(() => useSlideEstimator(schema, params));
		expect(result.current).toBe(4);
	});

	it("estimates slides for items without splitMode", () => {
		const schema = { name: "createLongQuotesSlides" } as never;
		const params = {
			longQuoteItems: [
				{ quote: "Single paragraph" },
			],
		};
		const { result } = renderHook(() => useSlideEstimator(schema, params));
		expect(result.current).toBe(2);
	});

	it("handles items with empty quote", () => {
		const schema = { name: "createLongQuotesSlides" } as never;
		const params = {
			longQuoteItems: [
				{ quote: "" },
			],
		};
		const { result } = renderHook(() => useSlideEstimator(schema, params));
		expect(result.current).toBe(1);
	});

	it("handles non-object items in longQuoteItems array", () => {
		const schema = { name: "createLongQuotesSlides" } as never;
		const params = {
			longQuoteItems: [
				{ quote: "Valid item with some text to split." },
				null,
				"invalid string",
				42,
			] as Record<string, unknown>[],
		};
		const { result } = renderHook(() => useSlideEstimator(schema, params));
		// Valid item: 2 (1 title + 1 content for single paragraph)
		// null: 1 (non-object)
		// "invalid string": 1 (non-object)
		// 42: 1 (non-object)
		// Total: 5
		expect(result.current).toBe(5);
	});

	it("handles whitespace-only quote hitting empty paragraphs fallback", () => {
		const schema = { name: "createLongQuotesSlides" } as never;
		const params = {
			longQuoteItems: [
				{ quote: "   " },
			],
		};
		const { result } = renderHook(() => useSlideEstimator(schema, params));
		// whitespace-only quote: !quote is falsy (empty string after trim? No, "   " is truthy)
		// quote is "   " which is truthy, so it continues
		// splitIntoParagraphs("   ") returns [] (whitespace-only)
		// count += 1 + (0 > 0 ? 0 : 1) = 1 + 1 = 2
		expect(result.current).toBe(2);
	});

	it("handles object items without quote property", () => {
		const schema = { name: "createLongQuotesSlides" } as never;
		const params = {
			longQuoteItems: [
				{ title: "No quote here" },
			] as Record<string, unknown>[],
		};
		const { result } = renderHook(() => useSlideEstimator(schema, params));
		expect(result.current).toBe(1);
	});

	it("returns null for createShortQuotesSlides with empty items", () => {
		const schema = { name: "createShortQuotesSlides" } as never;
		const { result } = renderHook(() => useSlideEstimator(schema, { shortQuoteItems: [] }));
		expect(result.current).toBeNull();
	});

	it("returns null for createShortQuotesSlides with non-array items", () => {
		const schema = { name: "createShortQuotesSlides" } as never;
		const { result } = renderHook(() => useSlideEstimator(schema, { shortQuoteItems: 42 }));
		expect(result.current).toBeNull();
	});

	it("estimates 1 slide per item for createShortQuotesSlides", () => {
		const schema = { name: "createShortQuotesSlides" } as never;
		const { result } = renderHook(() => useSlideEstimator(schema, {
			shortQuoteItems: [{}, {}],
		}));
		expect(result.current).toBe(2);
	});

	it("returns 1 for createSummarySlide", () => {
		const schema = { name: "createSummarySlide" } as never;
		const { result } = renderHook(() => useSlideEstimator(schema, {}));
		expect(result.current).toBe(1);
	});

	it("estimates slides for duplicateSlideRange", () => {
		const schema = { name: "duplicateSlideRange" } as never;
		const { result } = renderHook(() => useSlideEstimator(schema, {
			lowerBoundSlideNumber: 2,
			upperBoundSlideNumber: 4,
		}));
		expect(result.current).toBe(3);
	});

	it("estimates 1 slide when from equals to for duplicateSlideRange", () => {
		const schema = { name: "duplicateSlideRange" } as never;
		const { result } = renderHook(() => useSlideEstimator(schema, {
			lowerBoundSlideNumber: 3,
			upperBoundSlideNumber: 3,
		}));
		expect(result.current).toBe(1);
	});

	it("returns 0 when from exceeds to for duplicateSlideRange", () => {
		const schema = { name: "duplicateSlideRange" } as never;
		const { result } = renderHook(() => useSlideEstimator(schema, {
			lowerBoundSlideNumber: 5,
			upperBoundSlideNumber: 2,
		}));
		expect(result.current).toBe(0);
	});

	it("returns null for duplicateSlideRange with non-number params", () => {
		const schema = { name: "duplicateSlideRange" } as never;
		const { result } = renderHook(() => useSlideEstimator(schema, {}));
		expect(result.current).toBeNull();
	});

	it("returns null for duplicateSlideRange with NaN lowerBoundSlideNumber", () => {
		const schema = { name: "duplicateSlideRange" } as never;
		const { result } = renderHook(() => useSlideEstimator(schema, {
			lowerBoundSlideNumber: NaN,
			upperBoundSlideNumber: 3,
		}));
		expect(result.current).toBeNull();
	});

	it("returns null for duplicateSlideRange with Infinity upperBoundSlideNumber", () => {
		const schema = { name: "duplicateSlideRange" } as never;
		const { result } = renderHook(() => useSlideEstimator(schema, {
			lowerBoundSlideNumber: 1,
			upperBoundSlideNumber: Infinity,
		}));
		expect(result.current).toBeNull();
	});

	it("returns null for createHighlightVariationSlides", () => {
		const schema = { name: "createHighlightVariationSlides" } as never;
		const { result } = renderHook(() => useSlideEstimator(schema, {}));
		expect(result.current).toBeNull();
	});

	it("returns null for setHeaders", () => {
		const schema = { name: "setHeaders" } as never;
		const { result } = renderHook(() => useSlideEstimator(schema, {}));
		expect(result.current).toBeNull();
	});

	it("returns null for batchReplaceText", () => {
		const schema = { name: "batchReplaceText" } as never;
		const { result } = renderHook(() => useSlideEstimator(schema, {}));
		expect(result.current).toBeNull();
	});

	it("returns null for batchSetTextStyle", () => {
		const schema = { name: "batchSetTextStyle" } as never;
		const { result } = renderHook(() => useSlideEstimator(schema, {}));
		expect(result.current).toBeNull();
	});

	it("returns null for moveSlides", () => {
		const schema = { name: "moveSlides" } as never;
		const { result } = renderHook(() => useSlideEstimator(schema, {}));
		expect(result.current).toBeNull();
	});

	it("returns null for applyBackgroundColor", () => {
		const schema = { name: "applyBackgroundColor" } as never;
		const { result } = renderHook(() => useSlideEstimator(schema, {}));
		expect(result.current).toBeNull();
	});
});
