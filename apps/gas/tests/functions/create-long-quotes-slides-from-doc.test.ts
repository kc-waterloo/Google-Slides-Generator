/**
 * create-long-quotes-slides-from-doc.test.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { createLongQuotesSlidesFromDoc } from "../../src/functions/create-long-quotes-slides-from-doc";
import { createLongQuotesSlides } from "../../src/functions/create-long-quotes-slides";
import { createLongQuotesSlidesFromDocSchema } from "@gsg/shared";
import { validateParams } from "@gsg/shared";
import type { LongQuoteItem } from "@gsg/shared";
import { processCopyItems_ } from "../../src/shared/copy-item/process-copy-items";
import { buildMockPresentation, resetMocks } from "../helpers";
import {
	mockDocumentApp,
	ParagraphHeading,
	createMockParagraph,
	createMockBody,
	createMockDocument,
	createMockPageElement,
	createMockSlide,
	getMockShapeState,
} from "../__mocks__/google-apps-script";

const suppressLogs = (): void => {
	jest.spyOn(console, "log").mockImplementation(() => {});
	jest.spyOn(console, "error").mockImplementation(() => {});
};

beforeEach(() => {
	resetMocks();
});

describe("createLongQuotesSlidesFromDoc integration", () => {
	it("processCopyItems_ sets text on destination element", () => {
		const templateEl = createMockPageElement("section-title-text-box", "Template Title");
		const destEl = createMockPageElement("section-title-text-box", "Dest Title");
		const templateSlide = createMockSlide([templateEl], "template-1");
		const destSlide = createMockSlide([destEl], "dest-1");

		processCopyItems_({
			templateSlide,
			destinationSlide: destSlide,
			copyItems: [
				{
					pageElementKey: "section-title-text-box",
					actions: { newText: "New Text", bold: true },
				},
			],
		});

		const state = getMockShapeState(destEl.asShape());
		expect(state.text).toBe("New Text");
		expect(state.bold).toBe(true);
	});

	it("parses a document and creates a title + content slide", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const para1 = createMockParagraph(ParagraphHeading.HEADING1, "Chapter 1");
		const para2 = createMockParagraph(ParagraphHeading.HEADING2, "Author Name");
		const para3 = createMockParagraph(ParagraphHeading.NORMAL, "First paragraph.");
		const body = createMockBody([para1, para2, para3]);
		const doc = createMockDocument("http://example.com/doc", body);
		mockDocumentApp.addDocument("http://example.com/doc", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/doc",
			titleAllowList: [],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 2);

		const titleSlide = presentation.getSlides()[2]!;
		const titleElements = titleSlide.getPageElements();

		const titleEl = titleElements.find((el) => el.getDescription() === "section-title-text-box");
		const subtitleEl = titleElements.find((el) => el.getDescription() === "section-subtitle-text-box");

		expect(titleEl).toBeDefined();
		expect(subtitleEl).toBeDefined();
	});

	it("splits multi-paragraph quotes on double newlines from document", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const para1 = createMockParagraph(ParagraphHeading.HEADING1, "Part 1");
		const para2 = createMockParagraph(ParagraphHeading.HEADING2, "Sub A");
		const para3 = createMockParagraph(ParagraphHeading.NORMAL, "First para.\n\nSecond para.");
		const body = createMockBody([para1, para2, para3]);
		const doc = createMockDocument("http://example.com/multi", body);
		mockDocumentApp.addDocument("http://example.com/multi", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/multi",
			titleAllowList: [],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 3);
	});

	it("filters documents by titleAllowList", () => {
		suppressLogs();
		buildMockPresentation();

		const body = createMockBody([
			createMockParagraph(ParagraphHeading.HEADING1, "Include This"),
			createMockParagraph(ParagraphHeading.HEADING2, "Info"),
			createMockParagraph(ParagraphHeading.NORMAL, "Quote."),
			createMockParagraph(ParagraphHeading.HEADING1, "Exclude That"),
			createMockParagraph(ParagraphHeading.HEADING2, "Info"),
			createMockParagraph(ParagraphHeading.NORMAL, "Other quote."),
		]);
		const doc = createMockDocument("http://example.com/filter", body);
		mockDocumentApp.addDocument("http://example.com/filter", doc);

		expect(() => {
			createLongQuotesSlidesFromDoc({
				inputDocumentUrl: "http://example.com/filter",
				titleAllowList: [/^Include/],
				titleBlockList: [],
				templateTitleSlideNumber: null,
				templateContentSlideNumber: null,
				insertionSlideNumber: 1,
			});
		}).not.toThrow();
	});

	it("handles empty body without throwing", () => {
		suppressLogs();
		buildMockPresentation();

		const body = createMockBody([]);
		const doc = createMockDocument("http://example.com/empty", body);
		mockDocumentApp.addDocument("http://example.com/empty", doc);

		expect(() => {
			createLongQuotesSlidesFromDoc({
				inputDocumentUrl: "http://example.com/empty",
				titleAllowList: [],
				titleBlockList: [],
				templateTitleSlideNumber: null,
				templateContentSlideNumber: null,
				insertionSlideNumber: 1,
			});
		}).not.toThrow();
	});

	it("propagates templateSlideNumber: null correctly for auto-detect", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const para1 = createMockParagraph(ParagraphHeading.HEADING1, "Auto Detect");
		const para2 = createMockParagraph(ParagraphHeading.HEADING2, "Test");
		const para3 = createMockParagraph(ParagraphHeading.NORMAL, "Works.");
		const body = createMockBody([para1, para2, para3]);
		const doc = createMockDocument("http://example.com/auto", body);
		mockDocumentApp.addDocument("http://example.com/auto", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/auto",
			titleAllowList: [],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBeGreaterThan(initialCount);
	});

	it("isolates mocks between calls (no cross-test contamination)", () => {
		suppressLogs();
		const body = createMockBody([]);
		const doc = createMockDocument("http://example.com/isolated", body);
		mockDocumentApp.addDocument("http://example.com/isolated", doc);

		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/isolated",
			titleAllowList: [],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("filters by titleBlockList", () => {
		suppressLogs();
		buildMockPresentation();

		const body = createMockBody([
			createMockParagraph(ParagraphHeading.HEADING1, "Keep This"),
			createMockParagraph(ParagraphHeading.HEADING2, "Info"),
			createMockParagraph(ParagraphHeading.NORMAL, "Quote."),
			createMockParagraph(ParagraphHeading.HEADING1, "Skip This"),
			createMockParagraph(ParagraphHeading.HEADING2, "Info"),
			createMockParagraph(ParagraphHeading.NORMAL, "Other quote."),
		]);
		const doc = createMockDocument("http://example.com/blocklist", body);
		mockDocumentApp.addDocument("http://example.com/blocklist", doc);

		expect(() => {
			createLongQuotesSlidesFromDoc({
				inputDocumentUrl: "http://example.com/blocklist",
				titleAllowList: [],
				titleBlockList: [/^Skip/],
				templateTitleSlideNumber: null,
				templateContentSlideNumber: null,
				insertionSlideNumber: 1,
			});
		}).not.toThrow();
	});

	it("handles document with only filtered-out content", () => {
		suppressLogs();
		buildMockPresentation();

		const body = createMockBody([
			createMockParagraph(ParagraphHeading.HEADING1, "Skip Me"),
			createMockParagraph(ParagraphHeading.HEADING2, "Info"),
			createMockParagraph(ParagraphHeading.NORMAL, "Quote."),
		]);
		const doc = createMockDocument("http://example.com/all-blocked", body);
		mockDocumentApp.addDocument("http://example.com/all-blocked", doc);

		expect(() => {
			createLongQuotesSlidesFromDoc({
				inputDocumentUrl: "http://example.com/all-blocked",
				titleAllowList: [],
				titleBlockList: [/^Skip/],
				templateTitleSlideNumber: null,
				templateContentSlideNumber: null,
				insertionSlideNumber: 1,
			});
		}).not.toThrow();
	});

	it("propagates optional style params through the full pipeline without crashing", () => {
		buildMockPresentation();

		const para1 = createMockParagraph(ParagraphHeading.HEADING1, "Styled Title");
		const para2 = createMockParagraph(ParagraphHeading.HEADING2, "Author");
		const para3 = createMockParagraph(ParagraphHeading.NORMAL, "Body text.");
		const body = createMockBody([para1, para2, para3]);
		const doc = createMockDocument("http://example.com/styled", body);
		mockDocumentApp.addDocument("http://example.com/styled", doc);

		expect(() => {
			createLongQuotesSlidesFromDoc({
				inputDocumentUrl: "http://example.com/styled",
				titleAllowList: [],
				titleBlockList: [],
				templateTitleSlideNumber: null,
				templateContentSlideNumber: null,
				insertionSlideNumber: 1,
				titleColor: SlidesApp.ThemeColorType.ACCENT1,
				subtitleColor: SlidesApp.ThemeColorType.ACCENT2,
				quoteColor: SlidesApp.ThemeColorType.DARK2,
				addendumColor: SlidesApp.ThemeColorType.LIGHT2,
				titleFontSize: 36,
				subtitleFontSize: 24,
				quoteFontSize: 18,
				addendumFontSize: 12,
			});
		}).not.toThrow();
	});

	it("handles complex document hierarchy with deep nesting", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const para1 = createMockParagraph(ParagraphHeading.TITLE, "Document Title");
		const para2 = createMockParagraph(ParagraphHeading.SUBTITLE, "Doc Subtitle");
		const para3 = createMockParagraph(ParagraphHeading.HEADING1, "Chapter 1");
		const para4 = createMockParagraph(ParagraphHeading.HEADING2, "Section 1.1");
		const para5 = createMockParagraph(ParagraphHeading.NORMAL, "Content for section 1.1.");
		const para6 = createMockParagraph(ParagraphHeading.HEADING1, "Chapter 2");
		const para7 = createMockParagraph(ParagraphHeading.HEADING2, "Section 2.1");
		const para8 = createMockParagraph(ParagraphHeading.HEADING3, "Subsection 2.1.1");
		const para9 = createMockParagraph(ParagraphHeading.NORMAL, "Deep content.");
		const body = createMockBody([para1, para2, para3, para4, para5, para6, para7, para8, para9]);
		const doc = createMockDocument("http://example.com/deep", body);
		mockDocumentApp.addDocument("http://example.com/deep", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/deep",
			titleAllowList: [],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBeGreaterThan(initialCount);
	});

	it("processes multiple H1 sections creating multiple items", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const para1 = createMockParagraph(ParagraphHeading.HEADING1, "Part One");
		const para2 = createMockParagraph(ParagraphHeading.HEADING2, "Author 1");
		const para3 = createMockParagraph(ParagraphHeading.NORMAL, "Content one.");
		const para4 = createMockParagraph(ParagraphHeading.HEADING1, "Part Two");
		const para5 = createMockParagraph(ParagraphHeading.HEADING2, "Author 2");
		const para6 = createMockParagraph(ParagraphHeading.NORMAL, "Content two.");
		const body = createMockBody([para1, para2, para3, para4, para5, para6]);
		const doc = createMockDocument("http://example.com/multi-section", body);
		mockDocumentApp.addDocument("http://example.com/multi-section", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/multi-section",
			titleAllowList: [],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 4);
	});

	it("throws when document is not found", () => {
		suppressLogs();
		buildMockPresentation();

		expect(() => {
			createLongQuotesSlidesFromDoc({
				inputDocumentUrl: "http://example.com/nonexistent",
				titleAllowList: [],
				titleBlockList: [],
				templateTitleSlideNumber: null,
				templateContentSlideNumber: null,
				insertionSlideNumber: 1,
			});
		}).toThrow();
	});

	it("uses override text box keys when provided", () => {
		suppressLogs();
		const customTitleEl = createMockPageElement("custom-title", "Title");
		const customSubtitleEl = createMockPageElement("custom-subtitle", "Subtitle");
		const customQuoteEl = createMockPageElement("custom-quote", "Quote");
		const customAddendumEl = createMockPageElement("custom-addendum", "Addendum");

		buildMockPresentation({
			titleSlideElements: [customTitleEl, customSubtitleEl],
			contentSlideElements: [customQuoteEl, customAddendumEl],
		});

		const para1 = createMockParagraph(ParagraphHeading.HEADING1, "Custom Keys");
		const para2 = createMockParagraph(ParagraphHeading.HEADING2, "Author");
		const para3 = createMockParagraph(ParagraphHeading.NORMAL, "Body text.");
		const body = createMockBody([para1, para2, para3]);
		const doc = createMockDocument("http://example.com/override", body);
		mockDocumentApp.addDocument("http://example.com/override", doc);

		expect(() => {
			createLongQuotesSlidesFromDoc({
				inputDocumentUrl: "http://example.com/override",
				titleAllowList: [],
				titleBlockList: [],
				templateTitleSlideNumber: null,
				templateContentSlideNumber: null,
				insertionSlideNumber: 1,
				overrideTitleTextBoxKey: "custom-title",
				overrideSubtitleTextBoxKey: "custom-subtitle",
				overrideQuoteTextBoxKey: "custom-quote",
				overrideAddendumTextBoxKey: "custom-addendum",
			});
		}).not.toThrow();
	});

	it("sentence split mode through pipeline", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const longQuoteItems: LongQuoteItem[] = [
			{
				title: "Sentence Title",
				subtitle: "Sentence Subtitle",
				quote: "First sentence. Second sentence. Third sentence.",
				splitMode: "sentence",
			},
		];

		createLongQuotesSlides({
			longQuoteItems: longQuoteItems,
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 4);
	});

	it("char-count split mode through pipeline", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const longQuoteItems: LongQuoteItem[] = [
			{
				title: "Char Title",
				subtitle: "Char Subtitle",
				quote: "AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA",
				splitMode: "char-count",
				splitMaxChars: 20,
			},
		];

		createLongQuotesSlides({
			longQuoteItems: longQuoteItems,
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 3);
	});

	it("template slide not found with auto-detect", () => {
		suppressLogs();
		const noMatchEls = [
			createMockPageElement("custom-key-1", "A"),
			createMockPageElement("custom-key-2", "B"),
		];
		const { presentation } = buildMockPresentation({
			titleSlideElements: noMatchEls,
			contentSlideElements: noMatchEls,
		});
		const initialCount = presentation.getSlides().length;

		const para1 = createMockParagraph(ParagraphHeading.HEADING1, "Chapter");
		const para2 = createMockParagraph(ParagraphHeading.HEADING2, "Author");
		const para3 = createMockParagraph(ParagraphHeading.NORMAL, "Quote text.");
		const body = createMockBody([para1, para2, para3]);
		const doc = createMockDocument("http://example.com/no-template", body);
		mockDocumentApp.addDocument("http://example.com/no-template", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/no-template",
			titleAllowList: [],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("allowList with zero matches", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const body = createMockBody([
			createMockParagraph(ParagraphHeading.HEADING1, "Alpha"),
			createMockParagraph(ParagraphHeading.HEADING2, "Sub A"),
			createMockParagraph(ParagraphHeading.NORMAL, "Quote A."),
			createMockParagraph(ParagraphHeading.HEADING1, "Beta"),
			createMockParagraph(ParagraphHeading.HEADING2, "Sub B"),
			createMockParagraph(ParagraphHeading.NORMAL, "Quote B."),
		]);
		const doc = createMockDocument("http://example.com/allow-zero", body);
		mockDocumentApp.addDocument("http://example.com/allow-zero", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/allow-zero",
			titleAllowList: [/^ZZZ/],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("override text box keys with color param", () => {
		suppressLogs();
		const customTitleEl = createMockPageElement("my-title", "Title");
		const customSubtitleEl = createMockPageElement("my-subtitle", "Subtitle");
		const customQuoteEl = createMockPageElement("my-quote", "Quote");
		const customAddendumEl = createMockPageElement("my-addendum", "Addendum");

		const { presentation } = buildMockPresentation({
			titleSlideElements: [customTitleEl, customSubtitleEl],
			contentSlideElements: [customQuoteEl, customAddendumEl],
		});
		const initialCount = presentation.getSlides().length;

		const para1 = createMockParagraph(ParagraphHeading.HEADING1, "Override Title");
		const para2 = createMockParagraph(ParagraphHeading.HEADING2, "Override Author");
		const para3 = createMockParagraph(ParagraphHeading.NORMAL, "Override quote.");
		const body = createMockBody([para1, para2, para3]);
		const doc = createMockDocument("http://example.com/override-color", body);
		mockDocumentApp.addDocument("http://example.com/override-color", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/override-color",
			titleAllowList: [],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
			overrideTitleTextBoxKey: "my-title",
			overrideSubtitleTextBoxKey: "my-subtitle",
			overrideQuoteTextBoxKey: "my-quote",
			overrideAddendumTextBoxKey: "my-addendum",
			quoteColor: SlidesApp.ThemeColorType.ACCENT3,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 2);
	});

	it("mix of allowList and blockList filters correctly", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const body = createMockBody([
			createMockParagraph(ParagraphHeading.HEADING1, "Keep Me"),
			createMockParagraph(ParagraphHeading.HEADING2, "Author A"),
			createMockParagraph(ParagraphHeading.NORMAL, "Content A."),
			createMockParagraph(ParagraphHeading.HEADING1, "Skip Me"),
			createMockParagraph(ParagraphHeading.HEADING2, "Author B"),
			createMockParagraph(ParagraphHeading.NORMAL, "Content B."),
			createMockParagraph(ParagraphHeading.HEADING1, "Also Keep"),
			createMockParagraph(ParagraphHeading.HEADING2, "Author C"),
			createMockParagraph(ParagraphHeading.NORMAL, "Content C."),
		]);
		const doc = createMockDocument("http://example.com/mix-filter", body);
		mockDocumentApp.addDocument("http://example.com/mix-filter", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/mix-filter",
			titleAllowList: [/^Keep/, /^Also/],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 4);
	});

	it("empty document body produces no new slides", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const body = createMockBody([]);
		const doc = createMockDocument("http://example.com/empty-body", body);
		mockDocumentApp.addDocument("http://example.com/empty-body", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/empty-body",
			titleAllowList: [],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("applies defaultSplitMode to generated items", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const para1 = createMockParagraph(ParagraphHeading.HEADING1, "Chapter 1");
		const para2 = createMockParagraph(ParagraphHeading.HEADING2, "Author");
		const para3 = createMockParagraph(ParagraphHeading.NORMAL, "First sentence. Second sentence. Third sentence.");
		const body = createMockBody([para1, para2, para3]);
		const doc = createMockDocument("http://example.com/split-mode", body);
		mockDocumentApp.addDocument("http://example.com/split-mode", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/split-mode",
			titleAllowList: [],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
			defaultSplitMode: "sentence",
		});

		expect(presentation.getSlides().length).toBe(initialCount + 4);
	});



	it("produces slides from H1 to Normal when requireSubtitle is false", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const para1 = createMockParagraph(ParagraphHeading.HEADING1, "Chapter 1");
		const para2 = createMockParagraph(ParagraphHeading.NORMAL, "Direct quote text.");
		const body = createMockBody([para1, para2]);
		const doc = createMockDocument("http://example.com/no-subtitle", body);
		mockDocumentApp.addDocument("http://example.com/no-subtitle", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/no-subtitle",
			titleAllowList: [],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
			requireSubtitle: false,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 2);
	});

	it("skips H1 to Normal when requireSubtitle is true", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const para1 = createMockParagraph(ParagraphHeading.HEADING1, "Chapter 1");
		const para2 = createMockParagraph(ParagraphHeading.NORMAL, "Direct quote text.");
		const body = createMockBody([para1, para2]);
		const doc = createMockDocument("http://example.com/require-subtitle", body);
		mockDocumentApp.addDocument("http://example.com/require-subtitle", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/require-subtitle",
			titleAllowList: [],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("filters items by subtitleAllowList through pipeline", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const body = createMockBody([
			createMockParagraph(ParagraphHeading.HEADING1, "Chapter"),
			createMockParagraph(ParagraphHeading.HEADING2, "Author A"),
			createMockParagraph(ParagraphHeading.NORMAL, "Content A."),
			createMockParagraph(ParagraphHeading.HEADING1, "Chapter"),
			createMockParagraph(ParagraphHeading.HEADING2, "Different"),
			createMockParagraph(ParagraphHeading.NORMAL, "Content B."),
		]);
		const doc = createMockDocument("http://example.com/sub-allow", body);
		mockDocumentApp.addDocument("http://example.com/sub-allow", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/sub-allow",
			titleAllowList: [],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
			subtitleAllowList: [/^Author/],
		});

		expect(presentation.getSlides().length).toBe(initialCount + 2);
	});

	it("filters items by subtitleBlockList through pipeline", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const body = createMockBody([
			createMockParagraph(ParagraphHeading.HEADING1, "Chapter"),
			createMockParagraph(ParagraphHeading.HEADING2, "SkipThis"),
			createMockParagraph(ParagraphHeading.NORMAL, "Skipped."),
		]);
		const doc = createMockDocument("http://example.com/sub-block", body);
		mockDocumentApp.addDocument("http://example.com/sub-block", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/sub-block",
			titleAllowList: [],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
			subtitleBlockList: [/^Skip/],
		});

		expect(presentation.getSlides().length).toBe(initialCount);
	});

	it("applies defaultBold/defaultItalic to generated items through pipeline", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const body = createMockBody([
			createMockParagraph(ParagraphHeading.HEADING1, "Chapter 1"),
			createMockParagraph(ParagraphHeading.HEADING2, "Author"),
			createMockParagraph(ParagraphHeading.NORMAL, "Quote text."),
		]);
		const doc = createMockDocument("http://example.com/default-style", body);
		mockDocumentApp.addDocument("http://example.com/default-style", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/default-style",
			titleAllowList: [],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
			defaultTitleBold: false,
			defaultQuoteItalic: true,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 2);
	});

	it("applies defaultTitleStrikethrough to generated title elements through pipeline", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const body = createMockBody([
			createMockParagraph(ParagraphHeading.HEADING1, "Chapter 1"),
			createMockParagraph(ParagraphHeading.HEADING2, "Author"),
			createMockParagraph(ParagraphHeading.NORMAL, "Quote text."),
		]);
		const doc = createMockDocument("http://example.com/strike-title", body);
		mockDocumentApp.addDocument("http://example.com/strike-title", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/strike-title",
			titleAllowList: [],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
			defaultTitleStrikethrough: true,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 2);

		const titleSlide = presentation.getSlides().find(slide =>
			slide.getPageElements().some(el =>
				el.getDescription() === "section-title-text-box" &&
				getMockShapeState(el.asShape()).text === "Chapter 1"
			)
		)!;
		const titleEl = titleSlide.getPageElements().find(
			el => el.getDescription() === "section-title-text-box"
		)!;
		expect(getMockShapeState(titleEl.asShape()).strikethrough).toBe(true);
	});

	it("applies defaultQuoteStrikethrough to generated quote elements through pipeline", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();

		const body = createMockBody([
			createMockParagraph(ParagraphHeading.HEADING1, "Chapter 1"),
			createMockParagraph(ParagraphHeading.HEADING2, "Author"),
			createMockParagraph(ParagraphHeading.NORMAL, "Quote text."),
		]);
		const doc = createMockDocument("http://example.com/strike-quote", body);
		mockDocumentApp.addDocument("http://example.com/strike-quote", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/strike-quote",
			titleAllowList: [],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
			defaultQuoteStrikethrough: true,
		});

		const contentSlide = presentation.getSlides().find(slide =>
			slide.getPageElements().some(el =>
				el.getDescription() === "quote-text-box" &&
				getMockShapeState(el.asShape()).text === "Quote text."
			)
		)!;
		const quoteEl = contentSlide.getPageElements().find(
			el => el.getDescription() === "quote-text-box"
		)!;
		expect(getMockShapeState(quoteEl.asShape()).strikethrough).toBe(true);
	});

	it("applies defaultTitleUnderline to generated title elements through pipeline", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const body = createMockBody([
			createMockParagraph(ParagraphHeading.HEADING1, "Chapter 1"),
			createMockParagraph(ParagraphHeading.HEADING2, "Author"),
			createMockParagraph(ParagraphHeading.NORMAL, "Quote text."),
		]);
		const doc = createMockDocument("http://example.com/underline-title", body);
		mockDocumentApp.addDocument("http://example.com/underline-title", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/underline-title",
			titleAllowList: [],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
			defaultTitleUnderline: true,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 2);

		const titleSlide = presentation.getSlides().find(slide =>
			slide.getPageElements().some(el =>
				el.getDescription() === "section-title-text-box" &&
				getMockShapeState(el.asShape()).text === "Chapter 1"
			)
		)!;
		const titleEl = titleSlide.getPageElements().find(
			el => el.getDescription() === "section-title-text-box"
		)!;
		expect(getMockShapeState(titleEl.asShape()).underline).toBe(true);
	});

	it("applies defaultQuoteUnderline to generated quote elements through pipeline", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();

		const body = createMockBody([
			createMockParagraph(ParagraphHeading.HEADING1, "Chapter 1"),
			createMockParagraph(ParagraphHeading.HEADING2, "Author"),
			createMockParagraph(ParagraphHeading.NORMAL, "Quote text."),
		]);
		const doc = createMockDocument("http://example.com/underline-quote", body);
		mockDocumentApp.addDocument("http://example.com/underline-quote", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/underline-quote",
			titleAllowList: [],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
			defaultQuoteUnderline: true,
		});

		const contentSlide = presentation.getSlides().find(slide =>
			slide.getPageElements().some(el =>
				el.getDescription() === "quote-text-box" &&
				getMockShapeState(el.asShape()).text === "Quote text."
			)
		)!;
		const quoteEl = contentSlide.getPageElements().find(
			el => el.getDescription() === "quote-text-box"
		)!;
		expect(getMockShapeState(quoteEl.asShape()).underline).toBe(true);
	});

	it("combines requireSubtitle false with joinConsecutiveQuotes true", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const para1 = createMockParagraph(ParagraphHeading.HEADING1, "Chapter 1");
		const para2 = createMockParagraph(ParagraphHeading.NORMAL, "First para.");
		const para3 = createMockParagraph(ParagraphHeading.NORMAL, "Second para.");
		const body = createMockBody([para1, para2, para3]);
		const doc = createMockDocument("http://example.com/combined", body);
		mockDocumentApp.addDocument("http://example.com/combined", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/combined",
			titleAllowList: [],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
			requireSubtitle: false,
			joinConsecutiveQuotes: true,
			defaultSplitMode: "none",
		});

		expect(presentation.getSlides().length).toBe(initialCount + 2);
	});

	it("flushes pending quotes on non-NORMAL child in processConsecutiveQuotes_", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const h1 = createMockParagraph(ParagraphHeading.HEADING1, "Title");
		const h2 = createMockParagraph(ParagraphHeading.HEADING2, "Subtitle");
		const normal = createMockParagraph(ParagraphHeading.NORMAL, "First quote");
		const h3 = createMockParagraph(ParagraphHeading.HEADING3, "Section break");
		const normal2 = createMockParagraph(ParagraphHeading.NORMAL, "Second quote");
		const body = createMockBody([h1, h2, normal, h3, normal2]);
		const doc = createMockDocument("http://example.com/else-branch", body);
		mockDocumentApp.addDocument("http://example.com/else-branch", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/else-branch",
			titleAllowList: [],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
			joinConsecutiveQuotes: true,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 2);
	});

	it("flushes pending quotes on non-NORMAL child in processHeading1DirectNormals_", () => {
		suppressLogs();
		const { presentation } = buildMockPresentation();
		const initialCount = presentation.getSlides().length;

		const h1 = createMockParagraph(ParagraphHeading.HEADING1, "Title");
		const normal = createMockParagraph(ParagraphHeading.NORMAL, "First quote");
		const h3 = createMockParagraph(ParagraphHeading.HEADING3, "Interrupt");
		const body = createMockBody([h1, normal, h3]);
		const doc = createMockDocument("http://example.com/else-if-branch", body);
		mockDocumentApp.addDocument("http://example.com/else-if-branch", doc);

		createLongQuotesSlidesFromDoc({
			inputDocumentUrl: "http://example.com/else-if-branch",
			titleAllowList: [],
			titleBlockList: [],
			templateTitleSlideNumber: null,
			templateContentSlideNumber: null,
			insertionSlideNumber: 1,
			requireSubtitle: false,
			joinConsecutiveQuotes: true,
		});

		expect(presentation.getSlides().length).toBe(initialCount + 2);
	});

	it("validateParams rejects missing required params with exact errors", () => {
		const errors = validateParams(createLongQuotesSlidesFromDocSchema, {});

		expect(errors).toEqual(
			expect.arrayContaining([
				{ field: "inputDocumentUrl", message: "inputDocumentUrl is required" },
				{ field: "titleAllowList", message: "titleAllowList is required" },
				{ field: "titleBlockList", message: "titleBlockList is required" },
				{ field: "insertionSlideNumber", message: "insertionSlideNumber is required" },
			]),
		);
		expect(errors).toHaveLength(4);
	});

	it("validateParams rejects wrong type for inputDocumentUrl (number instead of string)", () => {
		const errors = validateParams(createLongQuotesSlidesFromDocSchema, {
			inputDocumentUrl: 123,
			titleAllowList: [/test/],
			titleBlockList: [],
			insertionSlideNumber: 1,
		});

		expect(errors).toEqual([
			{ field: "inputDocumentUrl", message: "inputDocumentUrl must be a string" },
		]);
	});

	it("validateParams rejects number for titleAllowList items (wrong type for RegExp[])", () => {
		const errors = validateParams(createLongQuotesSlidesFromDocSchema, {
			inputDocumentUrl: "http://example.com",
			titleAllowList: [123],
			titleBlockList: [/test/],
			insertionSlideNumber: 1,
		});

		expect(errors).toEqual([
			{ field: "titleAllowList[0]", message: "Each item must be a RegExp or valid regex string" },
		]);
	});

	it("validateParams rejects NaN for insertionSlideNumber", () => {
		const errors = validateParams(createLongQuotesSlidesFromDocSchema, {
			inputDocumentUrl: "http://example.com",
			titleAllowList: [/test/],
			titleBlockList: [],
			insertionSlideNumber: NaN,
		});

		expect(errors).toEqual([
			{ field: "insertionSlideNumber", message: "insertionSlideNumber must be a finite number" },
		]);
	});

	it("validateParams accepts valid input", () => {
		const errors = validateParams(createLongQuotesSlidesFromDocSchema, {
			inputDocumentUrl: "http://example.com",
			titleAllowList: [/test/],
			titleBlockList: [],
			insertionSlideNumber: 1,
		});

		expect(errors).toEqual([]);
	});
});
