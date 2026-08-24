/**
 * tests/shared/parse-document.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { parseDocument_ } from "../../src/shared/parse-document/parse-document";
import { paragraphHeadingToNumber_, headingNumber_ } from "../../src/shared/parse-document/paragraph-heading-to-number";
import { mockDocumentApp, ParagraphHeading } from "../__mocks__/google-apps-script";
import { createMockParagraph, createMockBody, createMockDocument } from "../__mocks__/google-apps-script";

beforeEach(() => {
	mockDocumentApp.clearDocuments();
});

describe("paragraphHeadingToNumber_", () => {
	it("maps TITLE to 0", () => {
		expect(paragraphHeadingToNumber_.get(ParagraphHeading.TITLE as unknown as GoogleAppsScript.Document.ParagraphHeading)).toBe(0);
	});

	it("maps HEADING1 to 2", () => {
		expect(paragraphHeadingToNumber_.get(ParagraphHeading.HEADING1 as unknown as GoogleAppsScript.Document.ParagraphHeading)).toBe(2);
	});

	it("maps NORMAL to 8", () => {
		expect(paragraphHeadingToNumber_.get(ParagraphHeading.NORMAL as unknown as GoogleAppsScript.Document.ParagraphHeading)).toBe(8);
	});

	it("contains all expected heading keys", () => {
		const expectedHeadings = [
			"TITLE", "SUBTITLE", "HEADING1", "HEADING2", "HEADING3",
			"HEADING4", "HEADING5", "HEADING6", "NORMAL",
		];
		expectedHeadings.forEach((h) => {
			expect(paragraphHeadingToNumber_.has(h as unknown as GoogleAppsScript.Document.ParagraphHeading)).toBe(true);
		});
	});

	it("maps unknown heading to Infinity", () => {
		expect(headingNumber_(999 as unknown as GoogleAppsScript.Document.ParagraphHeading)).toBe(Infinity);
	});
});

describe("parseDocument_", () => {
	it("returns an empty array for a document with no paragraphs", () => {
		const body = createMockBody([]);
		const doc = createMockDocument("http://example.com/doc", body);
		mockDocumentApp.addDocument("http://example.com/doc", doc);

		const result = parseDocument_("http://example.com/doc");
		expect(result).toEqual([]);
	});

	it("returns a single item for a document with one paragraph", () => {
		const para = createMockParagraph(ParagraphHeading.HEADING1, "Title");
		const body = createMockBody([para]);
		const doc = createMockDocument("http://example.com/doc", body);
		mockDocumentApp.addDocument("http://example.com/doc", doc);

		const result = parseDocument_("http://example.com/doc");
		expect(result).toHaveLength(1);
		expect(result[0]!.text).toBe("Title");
		expect(result[0]!.paragraphHeading).toBe(ParagraphHeading.HEADING1);
	});

	it("groups consecutive paragraphs with same heading", () => {
		const para1 = createMockParagraph(ParagraphHeading.NORMAL, "Line 1");
		const para2 = createMockParagraph(ParagraphHeading.NORMAL, "Line 2");
		const body = createMockBody([para1, para2]);
		const doc = createMockDocument("http://example.com/doc", body);
		mockDocumentApp.addDocument("http://example.com/doc", doc);

		const result = parseDocument_("http://example.com/doc");
		expect(result).toHaveLength(1);
		expect(result[0]!.text).toContain("Line 1");
		expect(result[0]!.text).toContain("Line 2");
	});

	it("builds nested structure for heading hierarchy", () => {
		const h1 = createMockParagraph(ParagraphHeading.HEADING1, "Chapter 1");
		const h2 = createMockParagraph(ParagraphHeading.HEADING2, "Section 1.1");
		const body = createMockBody([h1, h2]);
		const doc = createMockDocument("http://example.com/doc", body);
		mockDocumentApp.addDocument("http://example.com/doc", doc);

		const result = parseDocument_("http://example.com/doc");
		expect(result).toHaveLength(1);
		expect(result[0]!.text).toBe("Chapter 1");
		expect(result[0]!.children).toHaveLength(1);
		expect(result[0]!.children[0]!.text).toBe("Section 1.1");
	});

	it("pops stack when heading goes back up in hierarchy (H2 -> H1)", () => {
		const h2 = createMockParagraph(ParagraphHeading.HEADING2, "Section");
		const h1 = createMockParagraph(ParagraphHeading.HEADING1, "Chapter");
		const body = createMockBody([h2, h1]);
		const doc = createMockDocument("http://example.com/doc", body);
		mockDocumentApp.addDocument("http://example.com/doc", doc);

		const result = parseDocument_("http://example.com/doc");
		expect(result).toHaveLength(2);
		expect(result[0]!.paragraphHeading).toBe(ParagraphHeading.HEADING2);
		expect(result[0]!.text).toBe("Section");
		expect(result[1]!.paragraphHeading).toBe(ParagraphHeading.HEADING1);
		expect(result[1]!.text).toBe("Chapter");
	});

	it("pops multiple times when hierarchy jumps up multiple levels", () => {
		const h1 = createMockParagraph(ParagraphHeading.HEADING1, "Chapter");
		const h2 = createMockParagraph(ParagraphHeading.HEADING2, "Section");
		const h3 = createMockParagraph(ParagraphHeading.HEADING3, "Subsection");
		const h2Again = createMockParagraph(ParagraphHeading.HEADING2, "Next Section");
		const body = createMockBody([h1, h2, h3, h2Again]);
		const doc = createMockDocument("http://example.com/doc", body);
		mockDocumentApp.addDocument("http://example.com/doc", doc);

		const result = parseDocument_("http://example.com/doc");
		expect(result).toHaveLength(1);
		expect(result[0]!.text).toBe("Chapter");
		expect(result[0]!.children).toHaveLength(2);
		expect(result[0]!.children[0]!.text).toBe("Section");
		expect(result[0]!.children[0]!.children).toHaveLength(1);
		expect(result[0]!.children[0]!.children[0]!.text).toBe("Subsection");
		expect(result[0]!.children[1]!.text).toBe("Next Section");
	});

	it("handles SUBTITLE followed by HEADING1 hierarchy transition", () => {
		const sub = createMockParagraph(ParagraphHeading.SUBTITLE, "Subtitle");
		const h1 = createMockParagraph(ParagraphHeading.HEADING1, "Title");
		const body = createMockBody([sub, h1]);
		const doc = createMockDocument("http://example.com/doc", body);
		mockDocumentApp.addDocument("http://example.com/doc", doc);

		const result = parseDocument_("http://example.com/doc");
		expect(result).toHaveLength(1);
		expect(result[0]!.text).toBe("Subtitle");
		expect(result[0]!.children).toHaveLength(1);
		expect(result[0]!.children[0]!.text).toBe("Title");
	});

	it("handles TITLE -> HEADING1 transition correctly", () => {
		const title = createMockParagraph(ParagraphHeading.TITLE, "Title");
		const h1 = createMockParagraph(ParagraphHeading.HEADING1, "Chapter 1");
		const body = createMockBody([title, h1]);
		const doc = createMockDocument("http://example.com/doc", body);
		mockDocumentApp.addDocument("http://example.com/doc", doc);

		const result = parseDocument_("http://example.com/doc");
		expect(result).toHaveLength(1);
		expect(result[0]!.text).toBe("Title");
		expect(result[0]!.children).toHaveLength(1);
		expect(result[0]!.children[0]!.text).toBe("Chapter 1");
	});

	it("handles normal paragraph followed by heading", () => {
		const normal = createMockParagraph(ParagraphHeading.NORMAL, "Some text");
		const h1 = createMockParagraph(ParagraphHeading.HEADING1, "Chapter");
		const body = createMockBody([normal, h1]);
		const doc = createMockDocument("http://example.com/doc", body);
		mockDocumentApp.addDocument("http://example.com/doc", doc);

		const result = parseDocument_("http://example.com/doc");
		expect(result).toHaveLength(2);
	});

	it("throws for null URL", () => {
		jest.spyOn(console, "error").mockImplementation(() => {});

		expect(() => parseDocument_(null as unknown as string)).toThrow();

		jest.restoreAllMocks();
	});

	it("throws for undefined URL", () => {
		jest.spyOn(console, "error").mockImplementation(() => {});

		expect(() => parseDocument_(undefined as unknown as string)).toThrow();

		jest.restoreAllMocks();
	});

	it("throws for empty string URL", () => {
		jest.spyOn(console, "error").mockImplementation(() => {});

		expect(() => parseDocument_("")).toThrow();

		jest.restoreAllMocks();
	});

	it("handles empty body text gracefully", () => {
		const para = createMockParagraph(ParagraphHeading.NORMAL, "");
		const body = createMockBody([para]);
		const doc = createMockDocument("http://example.com/empty", body);
		mockDocumentApp.addDocument("http://example.com/empty", doc);

		const result = parseDocument_("http://example.com/empty");
		expect(result).toHaveLength(1);
		expect(result[0]!.text).toBe("");
	});

	it("handles whitespace-only paragraph", () => {
		const para = createMockParagraph(ParagraphHeading.NORMAL, "   ");
		const body = createMockBody([para]);
		const doc = createMockDocument("http://example.com/whitespace", body);
		mockDocumentApp.addDocument("http://example.com/whitespace", doc);

		const result = parseDocument_("http://example.com/whitespace");
		expect(result).toHaveLength(1);
		expect(result[0]!.text).toBe("   ");
	});
});
