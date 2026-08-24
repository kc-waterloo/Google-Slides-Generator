/**
 * tests/shared/paragraph-heading-to-number.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { paragraphHeadingToNumber_, headingNumber_ } from "../../src/shared/parse-document/paragraph-heading-to-number";

describe("paragraphHeadingToNumber_", () => {
	it("maps TITLE to 0", () => {
		expect(paragraphHeadingToNumber_.get(DocumentApp.ParagraphHeading.TITLE)).toBe(0);
	});

	it("maps SUBTITLE to 1", () => {
		expect(paragraphHeadingToNumber_.get(DocumentApp.ParagraphHeading.SUBTITLE)).toBe(1);
	});

	it("maps HEADING1 to 2", () => {
		expect(paragraphHeadingToNumber_.get(DocumentApp.ParagraphHeading.HEADING1)).toBe(2);
	});

	it("maps HEADING2 to 3", () => {
		expect(paragraphHeadingToNumber_.get(DocumentApp.ParagraphHeading.HEADING2)).toBe(3);
	});

	it("maps HEADING3 to 4", () => {
		expect(paragraphHeadingToNumber_.get(DocumentApp.ParagraphHeading.HEADING3)).toBe(4);
	});

	it("maps HEADING4 to 5", () => {
		expect(paragraphHeadingToNumber_.get(DocumentApp.ParagraphHeading.HEADING4)).toBe(5);
	});

	it("maps HEADING5 to 6", () => {
		expect(paragraphHeadingToNumber_.get(DocumentApp.ParagraphHeading.HEADING5)).toBe(6);
	});

	it("maps HEADING6 to 7", () => {
		expect(paragraphHeadingToNumber_.get(DocumentApp.ParagraphHeading.HEADING6)).toBe(7);
	});

	it("maps NORMAL to 8", () => {
		expect(paragraphHeadingToNumber_.get(DocumentApp.ParagraphHeading.NORMAL)).toBe(8);
	});
});

describe("headingNumber_", () => {
	it("returns the number for TITLE", () => {
		expect(headingNumber_(DocumentApp.ParagraphHeading.TITLE)).toBe(0);
	});

	it("returns the number for HEADING1", () => {
		expect(headingNumber_(DocumentApp.ParagraphHeading.HEADING1)).toBe(2);
	});

	it("returns the number for NORMAL", () => {
		expect(headingNumber_(DocumentApp.ParagraphHeading.NORMAL)).toBe(8);
	});

	it("returns Infinity for an unknown heading", () => {
		expect(headingNumber_("UNKNOWN" as unknown as GoogleAppsScript.Document.ParagraphHeading)).toBe(Infinity);
	});

	it("returns Infinity for null", () => {
		expect(headingNumber_(null as unknown as GoogleAppsScript.Document.ParagraphHeading)).toBe(Infinity);
	});

	it("returns Infinity for undefined", () => {
		expect(headingNumber_(undefined as unknown as GoogleAppsScript.Document.ParagraphHeading)).toBe(Infinity);
	});
});
