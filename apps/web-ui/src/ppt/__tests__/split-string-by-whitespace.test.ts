/**
 * split-string-by-whitespace.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { splitStringByWhitespace } from "@gsg/shared";

describe("splitStringByWhitespace", () => {
	it("splits into paragraphs by default", () => {
		const result = splitStringByWhitespace("Para one.\n\nPara two.\n\nPara three.");
		expect(result).toHaveLength(3);
		expect(result[0]).toBe("Para one.");
		expect(result[1]).toBe("Para two.");
		expect(result[2]).toBe("Para three.");
	});

	it("returns single string when no blank lines", () => {
		const result = splitStringByWhitespace("Line 1\nLine 2\nLine 3");
		expect(result).toHaveLength(1);
		expect(result[0]).toContain("Line 1");
		expect(result[0]).toContain("Line 2");
	});

	it("returns empty array for empty string", () => {
		expect(splitStringByWhitespace("")).toEqual([]);
	});

	it("returns empty array for whitespace-only input", () => {
		expect(splitStringByWhitespace("   \n  \n  ")).toEqual([]);
	});

	it("trims whitespace from each line", () => {
		const result = splitStringByWhitespace("Hello   \n\nWorld");
		expect(result).toHaveLength(2);
		expect(result[0]).toBe("Hello");
		expect(result[1]).toBe("World");
	});

	it("splits by sentences in sentence mode", () => {
		const result = splitStringByWhitespace("Hello world. How are you? I'm fine!", "sentence");
		expect(result).toHaveLength(3);
		expect(result[0]).toBe("Hello world.");
		expect(result[1]).toBe("How are you?");
		expect(result[2]).toBe("I'm fine!");
	});

	it("sentence mode returns full string when no punctuation", () => {
		const result = splitStringByWhitespace("Just one long string", "sentence");
		expect(result).toHaveLength(1);
		expect(result[0]).toBe("Just one long string");
	});

	it("sentence mode handles empty input", () => {
		expect(splitStringByWhitespace("", "sentence")).toEqual([]);
	});

	it("char-count mode splits at word boundaries", () => {
		const result = splitStringByWhitespace("Word1 word2 word3 word4 word5", "char-count", 15);
		expect(result.length).toBeGreaterThan(1);
		result.forEach((part) => {
			expect(part.length).toBeLessThanOrEqual(15);
		});
	});

	it("char-count mode returns single chunk when shorter than maxChars", () => {
		const result = splitStringByWhitespace("Short text", "char-count", 500);
		expect(result).toHaveLength(1);
		expect(result[0]).toBe("Short text");
	});

	it("char-count mode uses default maxChars when not provided", () => {
		const result = splitStringByWhitespace("Short text", "char-count");
		expect(result).toHaveLength(1);
		expect(result[0]).toBe("Short text");
	});

	it("char-count mode handles empty input", () => {
		expect(splitStringByWhitespace("", "char-count", 10)).toEqual([]);
	});

	it("none mode returns single trimmed string", () => {
		const result = splitStringByWhitespace("  Hello\nWorld  ", "none");
		expect(result).toHaveLength(1);
		expect(result[0]).toBe("Hello\nWorld");
	});

	it("none mode returns array with empty string for empty input (unlike other modes)", () => {
		const result = splitStringByWhitespace("", "none");
		expect(result).toHaveLength(1);
		expect(result[0]).toBe("");
	});

	it("char-count mode hard-breaks when word exceeds maxChars", () => {
		const result = splitStringByWhitespace("Supercalifragilisticexpialidocious is long", "char-count", 10);
		expect(result.length).toBeGreaterThan(1);
	});

	it("char-count mode slices at word boundaries when words are shorter than maxChars", () => {
		const result = splitStringByWhitespace("aaaaa bbbbb ccccc ddddd eeeee", "char-count", 11);
		expect(result).toHaveLength(3);
		expect(result[0]).toBe("aaaaa bbbbb");
		expect(result[1]).toBe("ccccc ddddd");
		expect(result[2]).toBe("eeeee");
	});

	it("paragraph mode handles multiple consecutive blank lines", () => {
		const result = splitStringByWhitespace("A\n\n\n\nB");
		expect(result).toHaveLength(2);
		expect(result[0]).toBe("A");
		expect(result[1]).toBe("B");
	});

	it("paragraph mode trims leading/trailing whitespace from each chunk", () => {
		const result = splitStringByWhitespace("  A  \n\n  B  ");
		expect(result).toHaveLength(2);
		expect(result[0]).toBe("A");
		expect(result[1]).toBe("B");
	});

	it("char-count mode with maxChars=0 returns empty array", () => {
		expect(splitStringByWhitespace("Some text", "char-count", 0)).toEqual([]);
	});

	it("char-count mode with maxChars=-1 returns empty array", () => {
		expect(splitStringByWhitespace("Some text", "char-count", -1)).toEqual([]);
	});

	it("char-count mode with maxChars=1 chunks into single characters", () => {
		const result = splitStringByWhitespace("ABC", "char-count", 1);
		expect(result).toHaveLength(3);
		expect(result[0]).toBe("A");
		expect(result[1]).toBe("B");
		expect(result[2]).toBe("C");
	});

	it("char-count mode word boundary falls exactly at chunk boundary", () => {
		const result = splitStringByWhitespace("aaaa bbbb", "char-count", 9);
		expect(result).toHaveLength(1);
		expect(result[0]).toBe("aaaa bbbb");
	});

	it("sentence mode with only whitespace returns empty array", () => {
		expect(splitStringByWhitespace("   \n  ", "sentence")).toEqual([]);
	});

	it("sentence mode with trailing newline handles correctly", () => {
		const result = splitStringByWhitespace("Hello.\n\nWorld.\n", "sentence");
		expect(result).toHaveLength(2);
		expect(result[0]).toBe("Hello.");
		expect(result[1]).toBe("World.");
	});

	it("paragraph mode with single line returns single item", () => {
		const result = splitStringByWhitespace("Single paragraph with no breaks.");
		expect(result).toHaveLength(1);
		expect(result[0]).toBe("Single paragraph with no breaks.");
	});

	it("char-count mode with word that crosses exactly maxChars boundary", () => {
		const result = splitStringByWhitespace("abcde fghij klmno", "char-count", 10);
		expect(result).toHaveLength(3);
		expect(result[0]).toBe("abcde");
		expect(result[1]).toBe("fghij");
		expect(result[2]).toBe("klmno");
	});
});
