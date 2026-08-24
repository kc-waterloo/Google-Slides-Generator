/**
 * tests/functions/create-verse-slides.test.ts
 *
 * Created by Min-Kyu Lee on 23-08-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import type { VerseItemInput } from "@gsg/shared";
import { parseStringToVerseItemInput } from "../../src/functions/create-verse-slides/parse-string-to-verse-item-input";
import { getVersesText_ } from "../../src/functions/create-verse-slides/get-verses-text";
import { verseItemToRequests_ } from "../../src/functions/create-verse-slides/verse-item-to-requests";
import { verseItemToShortQuoteItems_ } from "../../src/functions/create-verse-slides/verse-item-to-short-quote-items";

const input = (overrides: Partial<VerseItemInput> = {}): VerseItemInput => ({
	book: "Psalms",
	chapter: 42,
	startingVerse: 5,
	endingVerse: undefined,
	version: "niv",
	...overrides,
});

describe("parseStringToVerseItemInput", () => {
	it("returns an object input unchanged", () => {
		const original = input();

		expect(parseStringToVerseItemInput(original)).toBe(original);
	});

	it("parses a single-verse reference", () => {
		expect(parseStringToVerseItemInput("Psalms 42:5 niv")).toEqual({
			book: "Psalms",
			chapter: 42,
			startingVerse: 5,
			endingVerse: undefined,
			version: "niv",
		});
	});

	it("parses a verse range", () => {
		expect(parseStringToVerseItemInput("Psalms 42:5-6 niv")).toEqual({
			book: "Psalms",
			chapter: 42,
			startingVerse: 5,
			endingVerse: 6,
			version: "niv",
		});
	});

	it("parses a two-word book name", () => {
		expect(parseStringToVerseItemInput("1 John 4:8 niv")).toEqual({
			book: "1 John",
			chapter: 4,
			startingVerse: 8,
			endingVerse: undefined,
			version: "niv",
		});
	});

	it("throws on an unparsable reference", () => {
		expect(() => parseStringToVerseItemInput("not a reference")).toThrow(
			/Could not parse/,
		);
	});
});

describe("getVersesText_", () => {
	it("renders a single verse", () => {
		expect(getVersesText_(input())).toBe("5");
	});

	it("renders a range", () => {
		expect(getVersesText_(input({ endingVerse: 7 }))).toBe("5-7");
	});

	it("renders a single verse when the range ends where it starts", () => {
		expect(getVersesText_(input({ endingVerse: 5 }))).toBe("5");
	});
});

describe("verseItemToRequests_", () => {
	it("builds one request for a single verse", () => {
		const requests = verseItemToRequests_(input());

		expect(requests).toHaveLength(1);
		expect(requests[0]!.url).toContain("jsonbible.com");
		expect(requests[0]!.url).toContain("%22verse%22:%225%22");
	});

	it("builds one request per verse in a range", () => {
		const requests = verseItemToRequests_(input({ endingVerse: 7 }));

		expect(requests).toHaveLength(3);
	});
});

describe("verseItemToShortQuoteItems_", () => {
	it("maps each response to a quote and an addendum", () => {
		const items = verseItemToShortQuoteItems_({
			input: input({ endingVerse: 6 }),
			responses: [
				{
					book: "Psalms",
					chapter: "42",
					verses: "5",
					text: "Why, my soul, are you downcast?",
					version: "niv",
					bid: "1",
				},
			],
		});

		expect(items).toEqual([
			{
				quote: "(5) Why, my soul, are you downcast?",
				addendum: "Psalms 42:5-6 (niv)",
			},
		]);
	});

	it("falls back to an error quote when the API returned no text", () => {
		const items = verseItemToShortQuoteItems_({
			input: input(),
			responses: [
				{
					book: "Psalms",
					chapter: "42",
					verses: "5",
					text: undefined,
					version: "niv",
					bid: "1",
				},
			],
		});

		expect(items[0]!.quote).toBe("API ERROR: Not found");
	});
});
