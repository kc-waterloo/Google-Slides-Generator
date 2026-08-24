/**
 * template-layouts.test.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { functionTemplateLayouts, getPreviewTexts } from "./template-layouts";

describe("functionTemplateLayouts", () => {
	it("has entry for createLongQuotesSlides with 2 slide types", () => {
		const layout = functionTemplateLayouts["createLongQuotesSlides"]!;
		expect(layout).toBeDefined();
		expect(layout.functionNames).toContain("createLongQuotesSlides");
		expect(layout.functionNames).toContain("createLongQuotesSlidesFromDoc");
		expect(layout.slides).toHaveLength(2);
	});

	it("each slide type has id, label, description, and elements", () => {
		for (const layout of Object.values(functionTemplateLayouts)) {
			for (const slide of layout.slides) {
				expect(slide.id).toBeTruthy();
				expect(slide.label).toBeTruthy();
				expect(slide.description).toBeTruthy();
				expect(slide.elements.length).toBeGreaterThan(0);
			}
		}
	});

	it("each element has key, x, y, width, height", () => {
		for (const layout of Object.values(functionTemplateLayouts)) {
			for (const slide of layout.slides) {
				for (const el of slide.elements) {
					expect(el.key).toBeTruthy();
					expect(typeof el.x).toBe("number");
					expect(typeof el.y).toBe("number");
					expect(typeof el.width).toBe("number");
					expect(typeof el.height).toBe("number");
					expect(el.x).toBeGreaterThanOrEqual(0);
					expect(el.y).toBeGreaterThanOrEqual(0);
					expect(el.width).toBeGreaterThan(0);
					expect(el.height).toBeGreaterThan(0);
				}
			}
		}
	});

	it("every function name in functionNames exists in the registry keys", () => {
		for (const [key, layout] of Object.entries(functionTemplateLayouts)) {
			expect(layout.functionNames).toContain(key);
		}
	});
});

describe("getPreviewTexts", () => {
	it("returns text from param paths for long quotes title slide", () => {
		const params = {
			longQuoteItems: [
				{ title: "My Title", subtitle: "My Subtitle", quote: "My Quote" },
			],
		};
		const texts = getPreviewTexts(params, "title", "createLongQuotesSlides");
		expect(texts["section-title-text-box"]?.text).toBe("My Title");
		expect(texts["section-subtitle-text-box"]?.text).toBe("My Subtitle");
	});

	it("returns quote text for content slide", () => {
		const params = {
			longQuoteItems: [
				{ title: "Item", quote: "Long quote text here" },
			],
		};
		const texts = getPreviewTexts(params, "content", "createLongQuotesSlides");
		expect(texts["quote-text-box"]?.text).toBe("Long quote text here");
		expect(texts["addendum-text-box"]?.text).toBe("Item");
	});

	it("returns placeholder text when params are empty", () => {
		const texts = getPreviewTexts({}, "title", "createLongQuotesSlides");
		expect(texts["section-title-text-box"]?.text).toBe("Section Title");
	});

	it("returns color from color param path", () => {
		const params = { titleColor: "DARK1" };
		const texts = getPreviewTexts(params, "title", "createLongQuotesSlides");
		expect(texts["section-title-text-box"]?.color).toBe("DARK1");
	});

	it("returns empty object for unknown slide type", () => {
		const texts = getPreviewTexts({}, "nonexistent", "createLongQuotesSlides");
		expect(texts).toEqual({});
	});

	it("returns empty object for unknown function", () => {
		const texts = getPreviewTexts({}, "title", "doesNotExist");
		expect(texts).toEqual({});
	});

	it("handles short quote items", () => {
		const params = {
			shortQuoteItems: [
				{ quote: "Hello", addendum: "World" },
			],
		};
		const texts = getPreviewTexts(params, "content", "createShortQuotesSlides");
		expect(texts["quote-text-box"]?.text).toBe("Hello");
		expect(texts["addendum-text-box"]?.text).toBe("World");
	});

	it("handles bullet slide params", () => {
		const params = { title: "Bullet Title", bullets: ["A", "B"] };
		const texts = getPreviewTexts(params, "content", "createBulletSlide");
		expect(texts["bullet-title-text-box"]?.text).toBe("Bullet Title");
		expect(texts["bullet-point-1-text"]?.text).toBe("A");
		expect(texts["bullet-point-2-text"]?.text).toBe("B");
	});

	it("handles summary slide params", () => {
		const params = { summaryTitle: "TOC" };
		const texts = getPreviewTexts(params, "content", "createSummarySlide");
		expect(texts["summary-title-text"]?.text).toBe("TOC");
	});

	it("returns undefined color when no color param", () => {
		const texts = getPreviewTexts({}, "title", "createLongQuotesSlides");
		expect(texts["section-title-text-box"]?.color).toBeUndefined();
	});

	it("returns undefined when param path traverses a non-object value", () => {
		const params = { bullets: ["a"] };
		const texts = getPreviewTexts(params, "content", "createBulletSlide");
		expect(texts["bullet-point-1-text"]?.text).toBe("a");
	});

	it("falls back to placeholder when param path value is not found", () => {
		const params = {};
		const texts = getPreviewTexts(params, "content", "createLongQuotesSlides");
		expect(texts["quote-text-box"]?.text).toBe("Quote text appears here...");
	});

	it("falls back to placeholder when param path traverses non-object intermediate", () => {
		const params = { bullets: "not-an-array" };
		const texts = getPreviewTexts(params, "content", "createBulletSlide");
		expect(texts["bullet-point-1-text"]?.text).toBe("First bullet point");
	});

	it("returns fontSize from param when provided", () => {
		const params = { titleFontSize: "24" };
		const texts = getPreviewTexts(params, "title", "createLongQuotesSlides");
		expect(texts["section-title-text-box"]?.fontSize).toBe(24);
	});

	it("returns undefined fontSize when param value is empty string", () => {
		const params = { titleFontSize: "" };
		const texts = getPreviewTexts(params, "title", "createLongQuotesSlides");
		expect(texts["section-title-text-box"]?.fontSize).toBeUndefined();
	});

	it("returns 0 fontSize when param value is zero string (non-empty, truthy)", () => {
		const params = { titleFontSize: "0" };
		const texts = getPreviewTexts(params, "title", "createLongQuotesSlides");
		expect(texts["section-title-text-box"]?.fontSize).toBe(0);
	});

	it("uses placeholder for elements without paramPath", () => {
		const params = {};
		const texts = getPreviewTexts(params, "header", "setHeaders");
		expect(texts["top-bar-border-key"]?.text).toBe("");
		expect(texts["top-bar-topic-1-of-3-text"]?.text).toBe("Section 1");
	});
});
