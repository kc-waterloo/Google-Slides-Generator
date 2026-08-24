/**
 * tests/functions/parse-document-items-to-long-quote-items.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { parseDocumentItemsToLongQuoteItems_ } from "../../src/functions/create-long-quotes-slides-from-doc/parse-document-items-to-long-quote-items";
import { ParseDocumentItem } from "../../src/shared/parse-document/parse-document-item";
import { ParagraphHeading } from "../__mocks__/google-apps-script";

const PH = ParagraphHeading as unknown as Record<string, GoogleAppsScript.Document.ParagraphHeading>;

describe("parseDocumentItemsToLongQuoteItems_", () => {
	it("converts a parsed document structure into long quote items", () => {
		const input: ParseDocumentItem[] = [
			{
				paragraphHeading: PH.HEADING1!,
				text: "Chapter 1",
				children: [
					{
						paragraphHeading: PH.HEADING2!,
						text: "Author Name",
						children: [
							{
								paragraphHeading: PH.NORMAL!,
								text: "This is the quote text.",
								children: [],
							},
						],
					},
				],
			},
		];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
		});

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Chapter 1");
		expect(result[0]!.subtitle).toBe("Author Name");
		expect(result[0]!.quote).toBe("This is the quote text.");
	});

	it("filters by titleAllowList", () => {
		const input: ParseDocumentItem[] = [
			{
				paragraphHeading: PH.HEADING1!,
				text: "Keep Me",
				children: [
					{
						paragraphHeading: PH.HEADING2!,
						text: "Author",
						children: [
							{
								paragraphHeading: PH.NORMAL!,
								text: "Quote 1",
								children: [],
							},
						],
					},
				],
			},
			{
				paragraphHeading: PH.HEADING1!,
				text: "Discard Me",
				children: [],
			},
		];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
			titleAllowList: [/^Keep/],
		});

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Keep Me");
	});

	it("accepts string patterns in titleAllowList", () => {
		const input: ParseDocumentItem[] = [
			{
				paragraphHeading: PH.HEADING1!,
				text: "Keep Me",
				children: [
					{
						paragraphHeading: PH.HEADING2!,
						text: "Sub",
						children: [
							{
								paragraphHeading: PH.NORMAL!,
								text: "Quote",
								children: [],
							},
						],
					},
				],
			},
			{
				paragraphHeading: PH.HEADING1!,
				text: "Skip Me",
				children: [
					{
						paragraphHeading: PH.HEADING2!,
						text: "Sub",
						children: [
							{
								paragraphHeading: PH.NORMAL!,
								text: "Quote",
								children: [],
							},
						],
					},
				],
			},
		];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
			titleAllowList: ["^Keep"],
		});

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Keep Me");
	});

	it("accepts string patterns in titleBlockList", () => {
		const input: ParseDocumentItem[] = [
			{
				paragraphHeading: PH.HEADING1!,
				text: "Skip Me",
				children: [
					{
						paragraphHeading: PH.HEADING2!,
						text: "Sub",
						children: [
							{
								paragraphHeading: PH.NORMAL!,
								text: "Quote",
								children: [],
							},
						],
					},
				],
			},
		];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
			titleBlockList: ["^Skip"],
		});

		expect(result).toHaveLength(0);
	});

	it("honours flags in a /pattern/flags string", () => {
		const input: ParseDocumentItem[] = [
			{
				paragraphHeading: PH.HEADING1!,
				text: "KEEP ME",
				children: [
					{
						paragraphHeading: PH.HEADING2!,
						text: "Sub",
						children: [
							{
								paragraphHeading: PH.NORMAL!,
								text: "Quote",
								children: [],
							},
						],
					},
				],
			},
		];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
			titleAllowList: ["/^keep/i"],
		});

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("KEEP ME");
	});

	it("applies a global-flagged pattern to every section", () => {
		const section = (text: string): ParseDocumentItem => ({
			paragraphHeading: PH.HEADING1!,
			text: text,
			children: [
				{
					paragraphHeading: PH.HEADING2!,
					text: "Sub",
					children: [
						{
							paragraphHeading: PH.NORMAL!,
							text: "Quote",
							children: [],
						},
					],
				},
			],
		});

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: [section("Chapter 1"), section("Chapter 2"), section("Chapter 3")],
			titleAllowList: [/^Chapter/g],
		});

		expect(result.map((item) => item.title)).toEqual(["Chapter 1", "Chapter 2", "Chapter 3"]);
	});

	it("filters by titleBlockList", () => {
		const input: ParseDocumentItem[] = [
			{
				paragraphHeading: PH.HEADING1!,
				text: "Good Title",
				children: [
					{
						paragraphHeading: PH.HEADING2!,
						text: "Author",
						children: [
							{
								paragraphHeading: PH.NORMAL!,
								text: "Quote",
								children: [],
							},
						],
					},
				],
			},
			{
				paragraphHeading: PH.HEADING1!,
				text: "Bad Title",
				children: [],
			},
		];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
			titleBlockList: [/^Bad/],
		});

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Good Title");
	});

	it("returns empty array for empty input", () => {
		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: [],
		});
		expect(result).toEqual([]);
	});

	it("applies defaultSplitMode to generated items", () => {
		const input: ParseDocumentItem[] = [
			{
				paragraphHeading: PH.HEADING1!,
				text: "Chapter 1",
				children: [
					{
						paragraphHeading: PH.HEADING2!,
						text: "Author",
						children: [
							{
								paragraphHeading: PH.NORMAL!,
								text: "Quote text.",
								children: [],
							},
						],
					},
				],
			},
		];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
			defaultSplitMode: "sentence",
		});

		expect(result).toHaveLength(1);
		expect(result[0]!.splitMode).toBe("sentence");
	});

	it("applies defaultSplitMaxChars to generated items", () => {
		const input: ParseDocumentItem[] = [
			{
				paragraphHeading: PH.HEADING1!,
				text: "Chapter 1",
				children: [
					{
						paragraphHeading: PH.HEADING2!,
						text: "Author",
						children: [
							{
								paragraphHeading: PH.NORMAL!,
								text: "Quote text.",
								children: [],
							},
						],
					},
				],
			},
		];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
			defaultSplitMode: "char-count",
			defaultSplitMaxChars: 100,
		});

		expect(result).toHaveLength(1);
		expect(result[0]!.splitMode).toBe("char-count");
		expect(result[0]!.splitMaxChars).toBe(100);
	});

	it("joins consecutive NORMAL grandchildren under same H2 with joinConsecutiveQuotes", () => {
		const input: ParseDocumentItem[] = [
			{
				paragraphHeading: PH.HEADING1!,
				text: "Chapter 1",
				children: [
					{
						paragraphHeading: PH.HEADING2!,
						text: "Author",
						children: [
							{
								paragraphHeading: PH.NORMAL!,
								text: "First para.",
								children: [],
							},
							{
								paragraphHeading: PH.NORMAL!,
								text: "Second para.",
								children: [],
							},
							{
								paragraphHeading: PH.NORMAL!,
								text: "Third para.",
								children: [],
							},
						],
					},
				],
			},
		];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
			joinConsecutiveQuotes: true,
		});

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Chapter 1");
		expect(result[0]!.subtitle).toBe("Author");
		expect(result[0]!.quote).toBe("First para.\n\nSecond para.\n\nThird para.");
	});

	it("creates separate items for each NORMAL grandchild by default", () => {
		const input: ParseDocumentItem[] = [
			{
				paragraphHeading: PH.HEADING1!,
				text: "Chapter 1",
				children: [
					{
						paragraphHeading: PH.HEADING2!,
						text: "Author",
						children: [
							{
								paragraphHeading: PH.NORMAL!,
								text: "First para.",
								children: [],
							},
							{
								paragraphHeading: PH.NORMAL!,
								text: "Second para.",
								children: [],
							},
						],
					},
				],
			},
		];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
		});

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Chapter 1");
		expect(result[0]!.quote).toBe("First para.");
		expect(result[1]!.quote).toBe("Second para.");
	});

	it("produces items from H1 to Normal when requireSubtitle is false", () => {
		const input: ParseDocumentItem[] = [
			{
				paragraphHeading: PH.HEADING1!,
				text: "Chapter 1",
				children: [
					{
						paragraphHeading: PH.NORMAL!,
						text: "Direct quote.",
						children: [],
					},
				],
			},
		];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
			requireSubtitle: false,
		});

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Chapter 1");
		expect(result[0]!.subtitle).toBe("");
		expect(result[0]!.quote).toBe("Direct quote.");
	});

	it("skips H1 to Normal when requireSubtitle is true", () => {
		const input: ParseDocumentItem[] = [
			{
				paragraphHeading: PH.HEADING1!,
				text: "Chapter 1",
				children: [
					{
						paragraphHeading: PH.NORMAL!,
						text: "Direct quote.",
						children: [],
					},
				],
			},
		];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
		});

		expect(result).toHaveLength(0);
	});

	it("processes children under TITLE-level paragraphs (reverse children branch)", () => {
		const input: ParseDocumentItem[] = [
			{
				paragraphHeading: PH.TITLE!,
				text: "Document Title",
				children: [
					{
						paragraphHeading: PH.HEADING1!,
						text: "Chapter 1",
						children: [
							{
								paragraphHeading: PH.HEADING2!,
								text: "Author",
								children: [
									{
										paragraphHeading: PH.NORMAL!,
										text: "Quote text",
										children: [],
									},
								],
							},
						],
					},
				],
			},
		];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
		});

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Chapter 1");
		expect(result[0]!.subtitle).toBe("Author");
		expect(result[0]!.quote).toBe("Quote text");
	});

	it("filters subtitles with subtitleAllowList", () => {
		const input: ParseDocumentItem[] = [
			{
				paragraphHeading: PH.HEADING1!,
				text: "Chapter 1",
				children: [
					{
						paragraphHeading: PH.HEADING2!,
						text: "Author",
						children: [
							{ paragraphHeading: PH.NORMAL!, text: "Quote text.", children: [] },
						],
					},
					{
						paragraphHeading: PH.HEADING2!,
						text: "SkipThis",
						children: [
							{ paragraphHeading: PH.NORMAL!, text: "Other quote.", children: [] },
						],
					},
				],
			},
		];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
			subtitleAllowList: [/^Author/],
		});

		expect(result).toHaveLength(1);
		expect(result[0]!.subtitle).toBe("Author");
	});

	it("accepts string patterns in subtitleAllowList", () => {
		const input: ParseDocumentItem[] = [
			{
				paragraphHeading: PH.HEADING1!,
				text: "Chapter 1",
				children: [
					{
						paragraphHeading: PH.HEADING2!,
						text: "Author",
						children: [
							{
								paragraphHeading: PH.NORMAL!,
								text: "Quote text",
								children: [],
							},
						],
					},
					{
						paragraphHeading: PH.HEADING2!,
						text: "Editor",
						children: [
							{
								paragraphHeading: PH.NORMAL!,
								text: "Other quote",
								children: [],
							},
						],
					},
				],
			},
		];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
			subtitleAllowList: ["^Author"],
		});

		expect(result).toHaveLength(1);
		expect(result[0]!.subtitle).toBe("Author");
	});

	it("filters subtitles with subtitleBlockList", () => {
		const input: ParseDocumentItem[] = [
			{
				paragraphHeading: PH.HEADING1!,
				text: "Chapter 1",
				children: [
					{
						paragraphHeading: PH.HEADING2!,
						text: "SkipThis",
						children: [
							{ paragraphHeading: PH.NORMAL!, text: "Skipped.", children: [] },
						],
					},
				],
			},
		];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
			subtitleBlockList: [/^Skip/],
		});

		expect(result).toHaveLength(0);
	});

	it("applies default bold/italic to generated items", () => {
		const input: ParseDocumentItem[] = [
			{
				paragraphHeading: PH.HEADING1!,
				text: "Chapter 1",
				children: [
					{
						paragraphHeading: PH.HEADING2!,
						text: "Author",
						children: [
							{ paragraphHeading: PH.NORMAL!, text: "Quote.", children: [] },
						],
					},
				],
			},
		];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
			defaultTitleBold: false,
			defaultSubtitleItalic: true,
			defaultQuoteBold: true,
		});

		expect(result).toHaveLength(1);
		expect(result[0]!).toMatchObject({
			titleBold: false,
			subtitleItalic: true,
			quoteBold: true,
		});
	});

	it("handles undefined items in the parse queue without throwing", () => {
		const input = [
			undefined,
			{
				paragraphHeading: PH.HEADING1!,
				text: "Chapter 1",
				children: [
					{
						paragraphHeading: PH.HEADING2!,
						text: "Author",
						children: [
							{ paragraphHeading: PH.NORMAL!, text: "Quote.", children: [] },
						],
					},
				],
			},
		] as unknown as ParseDocumentItem[];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
		});

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Chapter 1");
	});

	it("returns empty array when queue contains only undefined elements", () => {
		const input = [undefined as unknown as ParseDocumentItem];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
		});

		expect(result).toEqual([]);
	});

	it("skips NORMAL child with empty text when joinConsecutiveQuotes is true", () => {
		const input: ParseDocumentItem[] = [
			{
				paragraphHeading: PH.HEADING1!,
				text: "Chapter 1",
				children: [
					{
						paragraphHeading: PH.NORMAL!,
						text: "",
						children: [],
					},
				],
			},
		];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
			requireSubtitle: false,
			joinConsecutiveQuotes: true,
		});

		expect(result).toHaveLength(0);
	});

	it("skips non-NORMAL child separator when joinConsecutiveQuotes is false", () => {
		const input: ParseDocumentItem[] = [
			{
				paragraphHeading: PH.HEADING1!,
				text: "Chapter 1",
				children: [
					{
						paragraphHeading: PH.NORMAL!,
						text: "First text",
						children: [],
					},
					{
						paragraphHeading: PH.HEADING3!,
						text: "Separator",
						children: [],
					},
				],
			},
		];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
			requireSubtitle: false,
		});

		expect(result).toHaveLength(1);
		expect(result[0]!.quote).toBe("First text");
	});

	it("processes multiple H1 sections in document order (flat input)", () => {
		const input: ParseDocumentItem[] = [
			{
				paragraphHeading: PH.HEADING1!,
				text: "Chapter 1",
				children: [
					{
						paragraphHeading: PH.HEADING2!,
						text: "Author A",
						children: [
							{ paragraphHeading: PH.NORMAL!, text: "Quote A", children: [] },
						],
					},
				],
			},
			{
				paragraphHeading: PH.HEADING1!,
				text: "Chapter 2",
				children: [
					{
						paragraphHeading: PH.HEADING2!,
						text: "Author B",
						children: [
							{ paragraphHeading: PH.NORMAL!, text: "Quote B", children: [] },
						],
					},
				],
			},
		];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
		});

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Chapter 1");
		expect(result[1]!.title).toBe("Chapter 2");
	});

	it("processes multiple H1 sections in document order under a TITLE heading", () => {
		const input: ParseDocumentItem[] = [
			{
				paragraphHeading: PH.TITLE!,
				text: "Document Title",
				children: [
					{
						paragraphHeading: PH.HEADING1!,
						text: "Chapter 1",
						children: [
							{
								paragraphHeading: PH.HEADING2!,
								text: "Author A",
								children: [
									{ paragraphHeading: PH.NORMAL!, text: "Quote A", children: [] },
								],
							},
						],
					},
					{
						paragraphHeading: PH.HEADING1!,
						text: "Chapter 2",
						children: [
							{
								paragraphHeading: PH.HEADING2!,
								text: "Author B",
								children: [
									{ paragraphHeading: PH.NORMAL!, text: "Quote B", children: [] },
								],
							},
						],
					},
				],
			},
		];

		const result = parseDocumentItemsToLongQuoteItems_({
			parseDocumentItems: input,
		});

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Chapter 1");
		expect(result[1]!.title).toBe("Chapter 2");
	});
});
