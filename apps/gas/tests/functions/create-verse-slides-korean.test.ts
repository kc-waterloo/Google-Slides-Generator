/**
 * tests/functions/create-verse-slides-korean.test.ts
 *
 * Created by Min-Kyu Lee on 23-08-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { parseStringToVerseItemInput } from "../../src/functions/create-verse-slides/parse-string-to-verse-item-input";
import {
	toBookAbbreviation_,
	KOREAN_BOOK_ABBREVIATIONS,
} from "../../src/functions/create-verse-slides/book-aliases";
import {
	toDriveFileId_,
	expandRangeKeys_,
	loadLocalBible_,
	localVerseResponses_,
} from "../../src/functions/create-verse-slides/local-bible";

/** Stand-in verse text — the real source file is never committed. */
const BIBLE = {
	"창1:1": " 첫째 구절",
	"창1:2": "둘째 구절",
	"창1:3": "셋째 구절",
	"겔24:4-5": "범위 구절",
};

describe("parseStringToVerseItemInput with Korean references", () => {
	it("parses an abbreviated reference with no space", () => {
		expect(parseStringToVerseItemInput("창1:1 개역개정")).toEqual({
			book: "창",
			chapter: 1,
			startingVerse: 1,
			endingVerse: undefined,
			version: "개역개정",
		});
	});

	it("parses an abbreviated range", () => {
		expect(parseStringToVerseItemInput("창1:1-3 개역개정")).toEqual({
			book: "창",
			chapter: 1,
			startingVerse: 1,
			endingVerse: 3,
			version: "개역개정",
		});
	});

	it("parses a full book name", () => {
		expect(parseStringToVerseItemInput("창세기 1:1 개역개정")).toEqual({
			book: "창세기",
			chapter: 1,
			startingVerse: 1,
			endingVerse: undefined,
			version: "개역개정",
		});
	});

	it("parses a multi-character abbreviation", () => {
		expect(parseStringToVerseItemInput("고전13:4-7 개역개정")).toEqual({
			book: "고전",
			chapter: 13,
			startingVerse: 4,
			endingVerse: 7,
			version: "개역개정",
		});
	});

	it("still parses the English form", () => {
		expect(parseStringToVerseItemInput("1 John 4:8 niv")).toEqual({
			book: "1 John",
			chapter: 4,
			startingVerse: 8,
			endingVerse: undefined,
			version: "niv",
		});
	});
});

describe("toBookAbbreviation_", () => {
	it("maps a full name to the source's abbreviation", () => {
		expect(toBookAbbreviation_("창세기")).toBe("창");
		expect(toBookAbbreviation_("데살로니가전서")).toBe("살전");
		expect(toBookAbbreviation_("요한계시록")).toBe("계");
	});

	it("leaves an abbreviation alone", () => {
		expect(toBookAbbreviation_("창")).toBe("창");
		expect(toBookAbbreviation_("고전")).toBe("고전");
	});

	it("accepts a common alternate", () => {
		expect(toBookAbbreviation_("계시록")).toBe("계");
	});

	it("prefers a caller-supplied alias", () => {
		expect(toBookAbbreviation_("Genesis", { Genesis: "창" })).toBe("창");
	});

	it("returns an unknown name unchanged", () => {
		expect(toBookAbbreviation_("Nowhere")).toBe("Nowhere");
	});

	it("covers all 66 books with unique abbreviations", () => {
		const abbreviations = Object.values(KOREAN_BOOK_ABBREVIATIONS);

		expect(abbreviations).toHaveLength(66);
		expect(new Set(abbreviations).size).toBe(66);
	});
});

describe("toDriveFileId_", () => {
	it("reads an id out of a Drive URL", () => {
		expect(
			toDriveFileId_("https://drive.google.com/file/d/1RYiFU8abcsq6xc1WSPSVgVQO5vwUHjONB3uSs446pK8/view"),
		).toBe("1RYiFU8abcsq6xc1WSPSVgVQO5vwUHjONB3uSs446pK8");
	});

	it("accepts a bare id", () => {
		expect(toDriveFileId_("1RYiFU8abcsq6xc1WSPSVgVQO5vwUHjONB3uSs446pK8")).toBe(
			"1RYiFU8abcsq6xc1WSPSVgVQO5vwUHjONB3uSs446pK8",
		);
	});

	it("throws when there is no id to read", () => {
		expect(() => toDriveFileId_("not-a-drive-link")).toThrow(/Could not read a Drive file id/);
	});
});

describe("expandRangeKeys_", () => {
	it("makes every verse of a range key reachable on its own", () => {
		const expanded = expandRangeKeys_(BIBLE);

		expect(expanded["겔24:4"]).toBe("범위 구절");
		expect(expanded["겔24:5"]).toBe("범위 구절");
	});

	it("never overwrites an exact key", () => {
		const expanded = expandRangeKeys_({ "창1:1": "정확한 구절", "창1:1-2": "범위 구절" });

		expect(expanded["창1:1"]).toBe("정확한 구절");
		expect(expanded["창1:2"]).toBe("범위 구절");
	});
});

describe("localVerseResponses_", () => {
	const input = (overrides: Record<string, unknown> = {}) => ({
		book: "창세기",
		chapter: 1,
		startingVerse: 1,
		endingVerse: undefined,
		version: "개역개정",
		...overrides,
	});

	it("resolves a full book name against the source's abbreviation", () => {
		const responses = localVerseResponses_(input(), BIBLE);

		expect(responses).toEqual([
			{
				book: "창세기",
				chapter: "1",
				verses: "1",
				text: "첫째 구절",
				version: "개역개정",
				bid: undefined,
			},
		]);
	});

	it("returns one response per verse of a range", () => {
		const responses = localVerseResponses_(input({ endingVerse: 3 }), BIBLE);

		expect(responses.map((r) => r.text)).toEqual(["첫째 구절", "둘째 구절", "셋째 구절"]);
	});

	it("leaves text undefined for a verse the source lacks", () => {
		const responses = localVerseResponses_(input({ startingVerse: 99 }), BIBLE);

		expect(responses[0]!.text).toBeUndefined();
	});
});

describe("loadLocalBible_", () => {
	const mockDriveApp = (contents: string) => {
		const getDataAsString = jest.fn(() => contents);
		const getBlob = jest.fn(() => ({ getDataAsString }));
		const getFileById = jest.fn(() => ({ getBlob }));
		(globalThis as Record<string, unknown>).DriveApp = { getFileById };
		return { getFileById, getBlob, getDataAsString };
	};

	afterEach(() => {
		delete (globalThis as Record<string, unknown>).DriveApp;
	});

	it("reads and parses the file, expanding range keys", () => {
		mockDriveApp(JSON.stringify(BIBLE));

		const bible = loadLocalBible_("1RYiFU8abcsq6xc1WSPSVgVQO5vwUHjONB3uSs446pK8");

		expect(bible["창1:1"]).toBe(" 첫째 구절");
		expect(bible["겔24:5"]).toBe("범위 구절");
	});

	it("downloads each file only once per run", () => {
		const drive = mockDriveApp(JSON.stringify(BIBLE));
		const cache = {};

		loadLocalBible_("1RYiFU8abcsq6xc1WSPSVgVQO5vwUHjONB3uSs446pK8", cache);
		loadLocalBible_("https://drive.google.com/file/d/1RYiFU8abcsq6xc1WSPSVgVQO5vwUHjONB3uSs446pK8/view", cache);

		expect(drive.getFileById).toHaveBeenCalledTimes(1);
	});
});
