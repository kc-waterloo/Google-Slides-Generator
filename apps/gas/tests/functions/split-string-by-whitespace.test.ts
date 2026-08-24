/**
 * tests/functions/split-string-by-whitespace.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { splitStringByWhitespace as splitStringByWhitespace_ } from "@gsg/shared";

describe("splitStringByWhitespace_", () => {
	it("splits a string into paragraphs separated by blank lines", () => {
		const input = `
            First paragraph line 1.
            First paragraph line 2.

            Second paragraph line 1.

            Third paragraph.
        `;
		const result = splitStringByWhitespace_(input);
		expect(result).toHaveLength(3);
		expect(result[0]).toContain("First paragraph line 1.");
		expect(result[0]).toContain("First paragraph line 2.");
		expect(result[1]).toBe("Second paragraph line 1.");
		expect(result[2]).toBe("Third paragraph.");
	});

	it("returns a single string when there are no blank lines", () => {
		const input = `
            Line 1
            Line 2
            Line 3
        `;
		const result = splitStringByWhitespace_(input);
		expect(result).toHaveLength(1);
		expect(result[0]).toContain("Line 1");
		expect(result[0]).toContain("Line 2");
		expect(result[0]).toContain("Line 3");
	});

	it("returns an empty array for an empty string", () => {
		expect(splitStringByWhitespace_("")).toEqual([]);
	});

	it("returns an empty array for whitespace-only input", () => {
		expect(splitStringByWhitespace_("   \n  \n  ")).toEqual([]);
	});

	it("trims whitespace from each line", () => {
		const input = `
            Hello   
               
            World
        `;
		const result = splitStringByWhitespace_(input);
		expect(result).toHaveLength(2);
		expect(result[0]).toBe("Hello");
		expect(result[1]).toBe("World");
	});

	it("splits by sentences with sentence mode", () => {
		const result = splitStringByWhitespace_("Hello world. How are you? I'm fine!", "sentence");
		expect(result).toHaveLength(3);
		expect(result[0]).toBe("Hello world.");
		expect(result[1]).toBe("How are you?");
		expect(result[2]).toBe("I'm fine!");
	});

	it("sentence mode returns full string when no punctuation", () => {
		const result = splitStringByWhitespace_("Just one long string without punctuation", "sentence");
		expect(result).toHaveLength(1);
		expect(result[0]).toBe("Just one long string without punctuation");
	});

	it("sentence mode handles empty input", () => {
		expect(splitStringByWhitespace_("", "sentence")).toEqual([]);
	});

	it("char-count mode splits at word boundaries", () => {
		const result = splitStringByWhitespace_("Word1 word2 word3 word4 word5", "char-count", 15);
		expect(result.length).toBeGreaterThan(1);
		result.forEach((part: string) => {
			expect(part.length).toBeLessThanOrEqual(15);
		});
	});

	it("char-count mode returns single chunk when text shorter than maxChars", () => {
		const result = splitStringByWhitespace_("Short text", "char-count", 500);
		expect(result).toHaveLength(1);
		expect(result[0]).toBe("Short text");
	});

	it("char-count mode handles words longer than maxChars (hard break)", () => {
		const result = splitStringByWhitespace_("Supercalifragilisticexpialidocious is long", "char-count", 10);
		expect(result.length).toBeGreaterThan(1);
	});

	it("char-count mode uses default maxChars when not provided", () => {
		const result = splitStringByWhitespace_("Short text", "char-count");
		expect(result).toHaveLength(1);
		expect(result[0]).toBe("Short text");
	});

	it("char-count mode handles empty input", () => {
		expect(splitStringByWhitespace_("", "char-count", 10)).toEqual([]);
	});

	it("none mode returns single trimmed string", () => {
		const result = splitStringByWhitespace_("  Hello\nWorld  ", "none");
		expect(result).toHaveLength(1);
		expect(result[0]).toBe("Hello\nWorld");
	});

	it("none mode returns array with empty string for empty input", () => {
		const result = splitStringByWhitespace_("", "none");
		expect(result).toHaveLength(1);
		expect(result[0]).toBe("");
	});

	it("handles multiple consecutive blank lines", () => {
		const result = splitStringByWhitespace_("A\n\n\n\nB");
		expect(result).toHaveLength(2);
		expect(result[0]).toBe("A");
		expect(result[1]).toBe("B");
	});

	it("char-count mode with maxChars 0 returns empty array", () => {
		expect(splitStringByWhitespace_("Some text", "char-count", 0)).toEqual([]);
	});

	it("char-count mode with maxChars -1 returns empty array", () => {
		expect(splitStringByWhitespace_("Some text", "char-count", -1)).toEqual([]);
	});

	it("char-count mode with maxChars 1 splits into individual characters", () => {
		const result = splitStringByWhitespace_("ABC", "char-count", 1);
		expect(result).toHaveLength(3);
		expect(result[0]).toBe("A");
		expect(result[1]).toBe("B");
		expect(result[2]).toBe("C");
	});

	it("sentence mode with only whitespace returns empty array", () => {
		expect(splitStringByWhitespace_("   \n  ", "sentence")).toEqual([]);
	});

	it("word boundary crossing exactly maxChars boundary in char-count mode", () => {
		const result = splitStringByWhitespace_("abcde fghij klmno", "char-count", 10);
		expect(result).toHaveLength(3);
		expect(result[0]).toBe("abcde");
		expect(result[1]).toBe("fghij");
		expect(result[2]).toBe("klmno");
	});
});
