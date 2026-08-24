/**
 * regexp-pattern.test.ts
 *
 * Created by Min-Kyu Lee on 23-08-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { toRegExp, fromRegExp, testPattern } from "./regexp-pattern";

describe("toRegExp", () => {
	it("returns RegExp values unchanged", () => {
		const regexp = /^Chapter/i;

		expect(toRegExp(regexp)).toBe(regexp);
	});

	it("treats a plain string as the pattern source", () => {
		expect(toRegExp("^Chapter")).toEqual(/^Chapter/);
	});

	it("parses the /pattern/flags literal form, keeping flags", () => {
		expect(toRegExp("/^chapter/i")).toEqual(/^chapter/i);
	});

	it("parses the literal form without flags", () => {
		expect(toRegExp("/^Chapter/")).toEqual(/^Chapter/);
	});

	it("treats an escaped leading slash as a literal slash pattern", () => {
		const result = toRegExp("\\/api\\/");

		expect(result.source).toBe("\\/api\\/");
		expect(result.test("/api/")).toBe(true);
	});

	it("falls back to the whole string when the flags are invalid", () => {
		const result = toRegExp("/a/q");

		expect(result.flags).toBe("");
		expect(result.test("/a/q")).toBe(true);
	});

	it("does not read an empty literal body as the match-everything regex", () => {
		expect(toRegExp("//").test("x")).toBe(false);
		expect(toRegExp("//").test("//")).toBe(true);
	});

	it("throws on an unparsable pattern", () => {
		expect(() => toRegExp("(")).toThrow();
	});
});

describe("fromRegExp", () => {
	it("returns the bare source when there are no flags", () => {
		expect(fromRegExp(/^Chapter/)).toBe("^Chapter");
	});

	it("returns the literal form when flags are present", () => {
		expect(fromRegExp(/^chapter/i)).toBe("/^chapter/i");
	});

	it("round-trips through toRegExp", () => {
		const original = /^chapter\s+\d+/gi;

		expect(toRegExp(fromRegExp(original))).toEqual(original);
	});
});

describe("testPattern", () => {
	it("matches a plain pattern string", () => {
		expect(testPattern("^Chapter", "Chapter 1")).toBe(true);
		expect(testPattern("^Chapter", "Appendix")).toBe(false);
	});

	it("is stateless across calls for a shared global RegExp", () => {
		const shared = /^Chapter/g;

		expect(testPattern(shared, "Chapter 1")).toBe(true);
		expect(testPattern(shared, "Chapter 2")).toBe(true);
		expect(testPattern(shared, "Chapter 3")).toBe(true);
	});

	it("is stateless across calls for a sticky RegExp", () => {
		const shared = /Chapter/y;

		expect(testPattern(shared, "Chapter 1")).toBe(true);
		expect(testPattern(shared, "Chapter 2")).toBe(true);
	});
});
