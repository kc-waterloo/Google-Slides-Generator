/**
 * split-string.test.ts
 *
 * Created by Min-Kyu Lee on 05-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { splitStringByWhitespace } from "./split-string";

describe("splitStringByWhitespace - paragraph mode (default)", () => {
	it("splits on blank lines", () => {
		const result = splitStringByWhitespace("Para one.\n\nPara two.\n\nPara three.");
		expect(result).toEqual(["Para one.", "Para two.", "Para three."]);
	});

	it("splits on blank lines with explicit paragraph mode", () => {
		const result = splitStringByWhitespace("A\n\nB", "paragraph");
		expect(result).toEqual(["A", "B"]);
	});

	it("collapses consecutive blank lines", () => {
		const result = splitStringByWhitespace("A\n\n\n\nB");
		expect(result).toEqual(["A", "B"]);
	});

	it("trims whitespace from each paragraph", () => {
		const result = splitStringByWhitespace("  Hello  \n\n  World  ");
		expect(result).toEqual(["Hello", "World"]);
	});

	it("trims leading and trailing whitespace from input", () => {
		const result = splitStringByWhitespace("  \n\nFoo\n\nBar\n\n  ");
		expect(result).toEqual(["Foo", "Bar"]);
	});

	it("returns single element for text with no blank lines", () => {
		const result = splitStringByWhitespace("Single paragraph with\nmultiple lines");
		expect(result).toEqual(["Single paragraph with\nmultiple lines"]);
	});

	it("returns empty array for empty input", () => {
		const result = splitStringByWhitespace("");
		expect(result).toEqual([]);
	});

	it("returns empty array for whitespace-only input", () => {
		const result = splitStringByWhitespace("   \n  \n   ");
		expect(result).toEqual([]);
	});

	it("handles single paragraph without trailing blank line", () => {
		const result = splitStringByWhitespace("Only one");
		expect(result).toEqual(["Only one"]);
	});

	it("handles consecutive blank lines at the start", () => {
		const result = splitStringByWhitespace("\n\n\nFirst\n\nSecond");
		expect(result).toEqual(["First", "Second"]);
	});
});

describe("splitStringByWhitespace - sentence mode", () => {
	it("splits on sentence-ending punctuation", () => {
		const result = splitStringByWhitespace("First sentence. Second sentence! Third?",
			"sentence");
		expect(result).toEqual(["First sentence.", "Second sentence!", "Third?"]);
	});

	it("returns trimmed single element when no sentence punctuation found", () => {
		const result = splitStringByWhitespace("No punctuation at all", "sentence");
		expect(result).toEqual(["No punctuation at all"]);
	});

	it("handles empty input", () => {
		const result = splitStringByWhitespace("", "sentence");
		expect(result).toEqual([]);
	});

	it("trims whitespace from each sentence", () => {
		const result = splitStringByWhitespace("  Hello.   World?  ", "sentence");
		expect(result).toEqual(["Hello.", "World?"]);
	});

	it("handles ellipsis as sentence boundary", () => {
		const result = splitStringByWhitespace("Wait... What?", "sentence");
		expect(result).toEqual(["Wait...", "What?"]);
	});

	it("returns empty array for whitespace-only input", () => {
		const result = splitStringByWhitespace("   \n  ", "sentence");
		expect(result).toEqual([]);
	});

	it("handles single sentence without trailing punctuation", () => {
		const result = splitStringByWhitespace("Just one sentence", "sentence");
		expect(result).toEqual(["Just one sentence"]);
	});

	it("handles multiple punctuation marks together", () => {
		const result = splitStringByWhitespace("Really?! No way!!", "sentence");
		expect(result).toEqual(["Really?!", "No way!!"]);
	});
});

describe("splitStringByWhitespace - char-count mode", () => {
	it("splits at word boundary within maxChars", () => {
		const result = splitStringByWhitespace(
			"word1 word2 word3 word4 word5",
			"char-count",
			10,
		);
		expect(result.length).toBeGreaterThan(1);
		expect(result.every((s) => s.length <= 12)).toBe(true);
	});

	it("returns entire text trimmed if shorter than maxChars", () => {
		const result = splitStringByWhitespace("Short text", "char-count", 100);
		expect(result).toEqual(["Short text"]);
	});

	it("returns empty array when maxChars <= 0", () => {
		const result1 = splitStringByWhitespace("Some text", "char-count", 0);
		expect(result1).toEqual([]);

		const result2 = splitStringByWhitespace("Some text", "char-count", -1);
		expect(result2).toEqual([]);
	});

	it("handles empty input", () => {
		const result = splitStringByWhitespace("", "char-count", 10);
		expect(result).toEqual([]);
	});

	it("handles whitespace-only input", () => {
		const result = splitStringByWhitespace("     ", "char-count", 10);
		expect(result).toEqual([]);
	});

	it("uses default maxChars=500 when not provided", () => {
		const long = "a".repeat(600);
		const result = splitStringByWhitespace(long, "char-count");
		expect(result).toHaveLength(2);
	});

	it("handles exact word boundary crossing", () => {
		const result = splitStringByWhitespace("abcde fghij klmno", "char-count", 8);
		expect(result).toEqual(["abcde", "fghij", "klmno"]);
	});

	it("trims each chunk", () => {
		const result = splitStringByWhitespace("  aaa   bbb   ccc  ", "char-count", 5);
		expect(result.every((s) => s === s.trim())).toBe(true);
	});

	it("breaks at exact maxChars if no space found before boundary", () => {
		const result = splitStringByWhitespace("abcdefghijklmno", "char-count", 5);
		expect(result).toEqual(["abcde", "fghij", "klmno"]);
	});

	it("handles newline as word separator for char-count breaks", () => {
		const result = splitStringByWhitespace("abc\ndef\nghi", "char-count", 4);
		expect(result.length).toBeGreaterThan(1);
	});

	it("does not exceed maxChars per chunk", () => {
		const result = splitStringByWhitespace(
			"one two three four five six seven eight nine ten",
			"char-count",
			10,
		);
		for (const chunk of result) {
			expect(chunk.length).toBeLessThanOrEqual(10);
		}
	});
});

describe("splitStringByWhitespace - none mode", () => {
	it("returns single trimmed string", () => {
		const result = splitStringByWhitespace("  Hello World  ", "none");
		expect(result).toEqual(["Hello World"]);
	});

	it("preserves internal newlines", () => {
		const result = splitStringByWhitespace("Line1\nLine2", "none");
		expect(result).toEqual(["Line1\nLine2"]);
	});

	it("returns empty array for empty input", () => {
		const result = splitStringByWhitespace("", "none");
		expect(result).toEqual([""]);
	});

	it("returns empty string for whitespace-only input", () => {
		const result = splitStringByWhitespace("   \n  ", "none");
		expect(result).toEqual([""]);
	});
});

describe("splitStringByWhitespace - default mode (undefined)", () => {
	it("defaults to paragraph mode when mode is undefined", () => {
		const result = splitStringByWhitespace("A\n\nB");
		expect(result).toEqual(["A", "B"]);
	});

	it("defaults to paragraph mode when mode is null", () => {
		const result = splitStringByWhitespace("A\n\nB", null as never);
		expect(result).toEqual(["A", "B"]);
	});

	it("defaults to paragraph mode for unknown mode value", () => {
		const result = splitStringByWhitespace("A\n\nB", "unknown-mode" as never);
		expect(result).toEqual(["A", "B"]);
	});
});
