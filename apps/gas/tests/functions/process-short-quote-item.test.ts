/**
 * tests/functions/process-short-quote-item.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { processShortQuoteItem_ } from "../../src/functions/create-short-quotes-slides/process-short-quote-item";
import { buildMockPresentation, resetMocks } from "../helpers";
import { getMockShapeState } from "../__mocks__/google-apps-script";

beforeEach(() => {
	resetMocks();
});

describe("processShortQuoteItem_", () => {
	it("copies the content slide and applies copy items", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const result = processShortQuoteItem_({
			presentation,
			templateContentSlideId: "content-slide-id",
			shortQuoteSlideItem: {
				quote: "Short quote text",
				addendum: "Source",
			},
			insertionIndex: 2,
		});

		expect(result).toBe(3);
		expect(presentation.getSlides().length).toBe(initialCount + 1);
	});

	it("returns null when copy fails", () => {
		const { presentation } = buildMockPresentation();
		presentation.insertSlide = jest.fn(() => null) as never;

		const result = processShortQuoteItem_({
			presentation,
			templateContentSlideId: "content-slide-id",
			shortQuoteSlideItem: {
				quote: "Text",
				addendum: "Src",
			},
			insertionIndex: 2,
		});

		expect(result).toBeNull();
	});

	it("handles empty quote and addendum text", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const result = processShortQuoteItem_({
			presentation,
			templateContentSlideId: "content-slide-id",
			shortQuoteSlideItem: {
				quote: "",
				addendum: "",
			},
			insertionIndex: 2,
		});

		expect(result).toBe(3);
		expect(presentation.getSlides().length).toBe(initialCount + 1);
	});

	it("only sets quoteColor, addendumColor uses default", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const result = processShortQuoteItem_({
			presentation,
			templateContentSlideId: "content-slide-id",
			shortQuoteSlideItem: {
				quote: "Colored quote",
				addendum: "Default addendum",
			},
			insertionIndex: 2,
			quoteColor: SlidesApp.ThemeColorType.ACCENT1,
		});

		expect(result).toBe(3);
		expect(presentation.getSlides().length).toBe(initialCount + 1);
	});

	it("only sets addendumColor, quoteColor uses default", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const result = processShortQuoteItem_({
			presentation,
			templateContentSlideId: "content-slide-id",
			shortQuoteSlideItem: {
				quote: "Default quote",
				addendum: "Colored addendum",
			},
			insertionIndex: 2,
			addendumColor: SlidesApp.ThemeColorType.ACCENT2,
		});

		expect(result).toBe(3);
		expect(presentation.getSlides().length).toBe(initialCount + 1);
	});

	it("uses default colors when neither color is set", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const result = processShortQuoteItem_({
			presentation,
			templateContentSlideId: "content-slide-id",
			shortQuoteSlideItem: {
				quote: "Default quote",
				addendum: "Default addendum",
			},
			insertionIndex: 2,
		});

		expect(result).toBe(3);
		expect(presentation.getSlides().length).toBe(initialCount + 1);
	});

	it("calls setText on destination quote shape", () => {
		const { presentation } = buildMockPresentation();

		processShortQuoteItem_({
			presentation,
			templateContentSlideId: "content-slide-id",
			shortQuoteSlideItem: {
				quote: "Short quote text",
				addendum: "Source",
			},
			insertionIndex: 2,
		});

		const slides = presentation.getSlides();
		const newSlide = slides[2]!;
		const el = newSlide.getPageElements().find(
			(el) => el.getDescription() === "quote-text-box",
		);
		expect(el).toBeDefined();
		const shape = el!.asShape();
		expect(shape.getText().setText).toHaveBeenCalledWith("Short quote text");
	});

	it("forwards custom colors to content slide", () => {
		const { presentation } = buildMockPresentation();

		const result = processShortQuoteItem_({
			presentation,
			templateContentSlideId: "content-slide-id",
			shortQuoteSlideItem: {
				quote: "Colored quote",
				addendum: "Colored source",
			},
			insertionIndex: 2,
			quoteColor: SlidesApp.ThemeColorType.ACCENT1,
			addendumColor: SlidesApp.ThemeColorType.ACCENT2,
		});

		expect(result).toBe(3);
	});

	it("uses per-item quoteColor over global quoteColor", () => {
		const { presentation } = buildMockPresentation();

		const result = processShortQuoteItem_({
			presentation,
			templateContentSlideId: "content-slide-id",
			shortQuoteSlideItem: {
				quote: "Styled quote",
				addendum: "Src",
				quoteColor: "ACCENT3",
			},
			insertionIndex: 2,
		});

		expect(result).toBe(3);

		const newSlide = presentation.getSlides()[2]!;
		const quoteState = getMockShapeState(
			newSlide.getPageElements().find(e => e.getDescription() === "quote-text-box")!.asShape(),
		);
		expect(quoteState.foregroundColor).toBe("ACCENT3");
	});

	it("uses per-item quoteBold to make quote bold", () => {
		const { presentation } = buildMockPresentation();

		const result = processShortQuoteItem_({
			presentation,
			templateContentSlideId: "content-slide-id",
			shortQuoteSlideItem: {
				quote: "Bold quote",
				addendum: "Src",
				quoteBold: true,
			},
			insertionIndex: 2,
		});

		expect(result).toBe(3);

		const newSlide = presentation.getSlides()[2]!;
		const quoteState = getMockShapeState(
			newSlide.getPageElements().find(e => e.getDescription() === "quote-text-box")!.asShape(),
		);
		expect(quoteState.bold).toBe(true);
		expect(quoteState.text).toBe("Bold quote");
	});

	it("uses per-item addendumItalic to make addendum italic", () => {
		const { presentation } = buildMockPresentation();

		const result = processShortQuoteItem_({
			presentation,
			templateContentSlideId: "content-slide-id",
			shortQuoteSlideItem: {
				quote: "Q",
				addendum: "Italic src",
				addendumItalic: true,
			},
			insertionIndex: 2,
		});

		expect(result).toBe(3);

		const newSlide = presentation.getSlides()[2]!;
		const addendumState = getMockShapeState(
			newSlide.getPageElements().find(e => e.getDescription() === "addendum-text-box")!.asShape(),
		);
		expect(addendumState.italic).toBe(true);
	});

	it("per-item quoteFontSize overrides global quoteFontSize", () => {
		const { presentation } = buildMockPresentation();

		const result = processShortQuoteItem_({
			presentation,
			templateContentSlideId: "content-slide-id",
			shortQuoteSlideItem: {
				quote: "Big text",
				addendum: "Src",
				quoteFontSize: 28,
			},
			insertionIndex: 2,
			quoteFontSize: 14,
		});

		expect(result).toBe(3);

		const newSlide = presentation.getSlides()[2]!;
		const quoteState = getMockShapeState(
			newSlide.getPageElements().find(e => e.getDescription() === "quote-text-box")!.asShape(),
		);
		expect(quoteState.fontSize).toBe(28);
	});
});
