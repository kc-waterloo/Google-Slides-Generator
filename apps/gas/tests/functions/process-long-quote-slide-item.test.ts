/**
 * tests/functions/process-long-quote-slide-item.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { processLongQuoteSlideItem_ } from "../../src/functions/create-long-quotes-slides/process-long-quote-slide-item";
import { buildMockPresentation, resetMocks } from "../helpers";
import { getMockShapeState } from "../__mocks__/google-apps-script";
import type { MockPresentationInternal } from "../__mocks__/google-apps-script";

beforeEach(() => {
	resetMocks();
	jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("processLongQuoteSlideItem_", () => {
	it("creates a title slide and content slides for a quote", () => {
		const { presentation } = buildMockPresentation();
		const initialSlideCount = presentation.getSlides().length;

		const result = processLongQuoteSlideItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			templateLongQuoteSlideId: "content-slide-id",
			longQuoteSlidesItem: {
				title: "Test Quote",
				subtitle: "Test Author",
				quote: "First paragraph.\n\nSecond paragraph.",
			},
			baseInsertionIndex: 2,
		});

		expect(result).not.toBeNull();
		expect(presentation.getSlides().length).toBe(initialSlideCount + 3);
	});

	it("returns null when title creation fails", () => {
		const { presentation } = buildMockPresentation();
		presentation.insertSlide = jest.fn(() => null) as never;

		const result = processLongQuoteSlideItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			templateLongQuoteSlideId: "content-slide-id",
			longQuoteSlidesItem: {
				title: "Fail",
				subtitle: "Fail",
				quote: "Text",
			},
			baseInsertionIndex: 2,
		});

		expect(result).toBeNull();
	});

	it("handles content slide copy failure gracefully and advances index", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = (presentation as unknown as MockPresentationInternal)._slides.length;

		let callCount = 0;
		const original = (presentation as unknown as { insertSlide: jest.Mock }).insertSlide;
		(presentation as unknown as { insertSlide: jest.Mock }).insertSlide = jest.fn(
			(index: number, slide?: GoogleAppsScript.Slides.Slide) => {
				callCount++;
				if (callCount === 2) {
					return null;
				}
				return original(index, slide);
			},
		);

		const result = processLongQuoteSlideItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			templateLongQuoteSlideId: "content-slide-id",
			longQuoteSlidesItem: {
				title: "Test",
				subtitle: "Author",
				quote: "Paragraph 1.\n\nParagraph 2.",
			},
			baseInsertionIndex: 2,
		});

		expect(result).not.toBeNull();
		expect(result).toBe(4);
		expect((presentation as unknown as MockPresentationInternal)._slides.length).toBe(initialCount + 2);
	});

	it("handles single paragraph quote (no split)", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const result = processLongQuoteSlideItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			templateLongQuoteSlideId: "content-slide-id",
			longQuoteSlidesItem: {
				title: "Single",
				subtitle: "One",
				quote: "Just one paragraph.",
			},
			baseInsertionIndex: 2,
		});

		expect(result).not.toBeNull();
		expect(presentation.getSlides().length).toBe(initialCount + 2);
	});

	it("handles empty quote string", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const result = processLongQuoteSlideItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			templateLongQuoteSlideId: "content-slide-id",
			longQuoteSlidesItem: {
				title: "Empty",
				subtitle: "Empty Sub",
				quote: "",
			},
			baseInsertionIndex: 2,
		});

		expect(result).not.toBeNull();
		expect(presentation.getSlides().length).toBe(initialCount + 1);
	});

	it("splitMode 'sentence' creates a content slide per sentence", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const result = processLongQuoteSlideItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			templateLongQuoteSlideId: "content-slide-id",
			longQuoteSlidesItem: {
				title: "Sentence Split",
				subtitle: "Test",
				quote: "First sentence. Second sentence! Third sentence?",
				splitMode: "sentence",
			},
			baseInsertionIndex: 2,
		});

		expect(result).not.toBeNull();
		expect(presentation.getSlides().length).toBe(initialCount + 4);
	});

	it("splitMode 'char-count' creates correct number of chunks", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const result = processLongQuoteSlideItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			templateLongQuoteSlideId: "content-slide-id",
			longQuoteSlidesItem: {
				title: "Char Count",
				subtitle: "Test",
				quote: "A".repeat(39),
				splitMode: "char-count",
				splitMaxChars: 20,
			},
			baseInsertionIndex: 2,
		});

		expect(result).not.toBeNull();
		expect(presentation.getSlides().length).toBe(initialCount + 3);
	});

	it("splitMode 'none' creates a single content slide", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const result = processLongQuoteSlideItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			templateLongQuoteSlideId: "content-slide-id",
			longQuoteSlidesItem: {
				title: "No Split",
				subtitle: "Test",
				quote: "Single block.",
				splitMode: "none",
			},
			baseInsertionIndex: 2,
		});

		expect(result).not.toBeNull();
		expect(presentation.getSlides().length).toBe(initialCount + 2);
	});

	it("forwards only quoteColor, leaving other colors at defaults", () => {
		const { presentation } = buildMockPresentation();

		const result = processLongQuoteSlideItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			templateLongQuoteSlideId: "content-slide-id",
			longQuoteSlidesItem: {
				title: "Partial Color",
				subtitle: "Test",
				quote: "Quote with partial colors.",
			},
			baseInsertionIndex: 2,
			quoteColor: SlidesApp.ThemeColorType.ACCENT3,
		});

		expect(result).not.toBeNull();
	});

	it("forwards only quoteFontSize, leaving other sizes undefined", () => {
		const { presentation } = buildMockPresentation();

		const result = processLongQuoteSlideItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			templateLongQuoteSlideId: "content-slide-id",
			longQuoteSlidesItem: {
				title: "Partial Font",
				subtitle: "Test",
				quote: "Partial font size.",
			},
			baseInsertionIndex: 2,
			quoteFontSize: 20,
		});

		expect(result).not.toBeNull();
	});

	it("handles templateLongQuoteSlideId not existing", () => {
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const result = processLongQuoteSlideItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			templateLongQuoteSlideId: "nonexistent-id",
			longQuoteSlidesItem: {
				title: "Missing Content",
				subtitle: "Test",
				quote: "Text here.",
			},
			baseInsertionIndex: 2,
		});

		expect(result).not.toBeNull();
		expect(presentation.getSlides().length).toBe(initialCount + 1);
	});

	it("forwards custom colors and font sizes to content slides", () => {
		const { presentation } = buildMockPresentation();

		const result = processLongQuoteSlideItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			templateLongQuoteSlideId: "content-slide-id",
			longQuoteSlidesItem: {
				title: "Styled",
				subtitle: "Styled Sub",
				quote: "Styled quote text.",
			},
			baseInsertionIndex: 2,
			titleColor: SlidesApp.ThemeColorType.ACCENT1,
			subtitleColor: SlidesApp.ThemeColorType.ACCENT2,
			quoteColor: SlidesApp.ThemeColorType.ACCENT3,
			addendumColor: SlidesApp.ThemeColorType.DARK1,
			titleFontSize: 30,
			subtitleFontSize: 20,
			quoteFontSize: 16,
			addendumFontSize: 12,
		});

		expect(result).not.toBeNull();
	});

	it("uses per-item titleColor over global titleColor", () => {
		const { presentation } = buildMockPresentation();

		const result = processLongQuoteSlideItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			templateLongQuoteSlideId: "content-slide-id",
			longQuoteSlidesItem: {
				title: "Styled",
				subtitle: "Styled Sub",
				quote: "Quote.",
				titleColor: "ACCENT1",
			},
			baseInsertionIndex: 2,
		});

		expect(result).not.toBeNull();

		const titleSlide = presentation.getSlides()[2]!;
		const titleState = getMockShapeState(
			titleSlide.getPageElements().find(e => e.getDescription() === "section-title-text-box")!.asShape(),
		);
		expect(titleState.foregroundColor).toBe("ACCENT1");
	});

	it("uses per-item quoteBold to make quote bold", () => {
		const { presentation } = buildMockPresentation();

		const result = processLongQuoteSlideItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			templateLongQuoteSlideId: "content-slide-id",
			longQuoteSlidesItem: {
				title: "Bold Quote",
				subtitle: "Sub",
				quote: "Bold quote text.",
				quoteBold: true,
			},
			baseInsertionIndex: 2,
		});

		expect(result).not.toBeNull();

		const contentSlide = presentation.getSlides()[3]!;
		const quoteState = getMockShapeState(
			contentSlide.getPageElements().find(e => e.getDescription() === "quote-text-box")!.asShape(),
		);
		expect(quoteState.bold).toBe(true);
		expect(quoteState.text).toBe("Bold quote text.");
	});

	it("uses per-item titleItalic to make title italic", () => {
		const { presentation } = buildMockPresentation();

		const result = processLongQuoteSlideItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			templateLongQuoteSlideId: "content-slide-id",
			longQuoteSlidesItem: {
				title: "Italic Title",
				subtitle: "Sub",
				quote: "Quote.",
				titleItalic: true,
			},
			baseInsertionIndex: 2,
		});

		expect(result).not.toBeNull();

		const titleSlide = presentation.getSlides()[2]!;
		const titleState = getMockShapeState(
			titleSlide.getPageElements().find(e => e.getDescription() === "section-title-text-box")!.asShape(),
		);
		expect(titleState.italic).toBe(true);
	});

	it("per-item fontSize overrides global fontSize", () => {
		const { presentation } = buildMockPresentation();

		const result = processLongQuoteSlideItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			templateLongQuoteSlideId: "content-slide-id",
			longQuoteSlidesItem: {
				title: "Size Test",
				subtitle: "Sub",
				quote: "Quote text.",
				titleFontSize: 44,
				quoteFontSize: 22,
			},
			baseInsertionIndex: 2,
			titleFontSize: 30,
			quoteFontSize: 16,
		});

		expect(result).not.toBeNull();

		const titleSlide = presentation.getSlides()[2]!;
		const titleState = getMockShapeState(
			titleSlide.getPageElements().find(e => e.getDescription() === "section-title-text-box")!.asShape(),
		);
		expect(titleState.fontSize).toBe(44);

		const contentSlide = presentation.getSlides()[3]!;
		const quoteState = getMockShapeState(
			contentSlide.getPageElements().find(e => e.getDescription() === "quote-text-box")!.asShape(),
		);
		expect(quoteState.fontSize).toBe(22);
	});

	it("per-item subtitleColor and addendumColor override globals", () => {
		const { presentation } = buildMockPresentation();

		const result = processLongQuoteSlideItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			templateLongQuoteSlideId: "content-slide-id",
			longQuoteSlidesItem: {
				title: "Color Override",
				subtitle: "Colored Sub",
				quote: "Quote.",
				subtitleColor: "ACCENT2",
				addendumColor: "ACCENT3",
			},
			baseInsertionIndex: 2,
		});

		expect(result).not.toBeNull();

		const titleSlide = presentation.getSlides()[2]!;
		const subtitleState = getMockShapeState(
			titleSlide.getPageElements().find(e => e.getDescription() === "section-subtitle-text-box")!.asShape(),
		);
		expect(subtitleState.foregroundColor).toBe("ACCENT2");
	});

	it("fetches content template slide only once even for multi-paragraph quotes", () => {
		const { presentation } = buildMockPresentation();
		const getSlideByIdSpy = jest.spyOn(presentation, "getSlideById");

		processLongQuoteSlideItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			templateLongQuoteSlideId: "content-slide-id",
			longQuoteSlidesItem: {
				title: "Test",
				subtitle: "Sub",
				quote: "Para 1.\n\nPara 2.\n\nPara 3.",
			},
			baseInsertionIndex: 2,
		});

		const callsForContent = getSlideByIdSpy.mock.calls.filter(
			([id]) => id === "content-slide-id",
		);
		expect(callsForContent.length).toBe(1);
	});

	it("per-item addendumBold makes addendum bold", () => {
		const { presentation } = buildMockPresentation();

		const result = processLongQuoteSlideItem_({
			presentation,
			templateTitleSlideId: "title-slide-id",
			templateLongQuoteSlideId: "content-slide-id",
			longQuoteSlidesItem: {
				title: "Test",
				subtitle: "Sub",
				quote: "Quote.",
				addendumBold: true,
			},
			baseInsertionIndex: 2,
		});

		expect(result).not.toBeNull();

		const contentSlide = presentation.getSlides()[3]!;
		const addendumState = getMockShapeState(
			contentSlide.getPageElements().find(e => e.getDescription() === "addendum-text-box")!.asShape(),
		);
		expect(addendumState.bold).toBe(true);
	});
});
