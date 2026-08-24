/**
 * split-into-paragraphs.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { splitIntoParagraphs } from "../split-into-paragraphs";

describe("splitIntoParagraphs", () => {
	it("splits text by blank lines", () => {
		const result = splitIntoParagraphs("First paragraph.\n\nSecond paragraph.");
		expect(result).toHaveLength(2);
		expect(result[0]).toBe("First paragraph.");
		expect(result[1]).toBe("Second paragraph.");
	});

	it("returns single paragraph when no blank lines", () => {
		const result = splitIntoParagraphs("Line one\nLine two\nLine three");
		expect(result).toHaveLength(1);
		expect(result[0]).toBe("Line one\nLine two\nLine three");
	});

	it("handles empty string", () => {
		const result = splitIntoParagraphs("");
		expect(result).toEqual([]);
	});

	it("trims whitespace from each line", () => {
		const result = splitIntoParagraphs("  First  \n\n  Second  ");
		expect(result).toHaveLength(2);
		expect(result[0]).toBe("First");
		expect(result[1]).toBe("Second");
	});

	it("handles multiple consecutive blank lines", () => {
		const result = splitIntoParagraphs("A\n\n\n\nB");
		expect(result).toHaveLength(2);
	});

	it("handles leading and trailing blank lines", () => {
		const result = splitIntoParagraphs("\n\nA\n\nB\n\n");
		expect(result).toHaveLength(2);
	});

	it("returns empty array for whitespace-only input", () => {
		const result = splitIntoParagraphs("   \n  \n  ");
		expect(result).toEqual([]);
	});
});
