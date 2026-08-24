/**
 * split-string.ts
 *
 * Created by Min-Kyu Lee on 01-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import type { LongQuoteSplitMode } from "../schemas/long-quote-item";

const splitByParagraphs = (input: string): string[] => {
	const partiallyFormattedStrings: string[] = input
		.trim()
		.split("\n")
		.map(((element: string): string => element.trim()));

	const formattedStrings: string[] = [];

	let candidateString: string = "";
	partiallyFormattedStrings.forEach((partiallyFormattedString: string): void => {
		if (partiallyFormattedString !== "") {
			if (candidateString === "") {
				candidateString = partiallyFormattedString;
			} else {
				candidateString = candidateString.concat("\n", partiallyFormattedString);
			}
		} else {
			if (candidateString !== "") {
				formattedStrings.push(candidateString);
				candidateString = "";
			}
		}
	});
	if (candidateString !== "") {
		formattedStrings.push(candidateString);
	}

	return formattedStrings;
};

const splitBySentences = (input: string): string[] => {
	const text = input.trim();
	const parts = text.match(/[^.!?]+[.!?]+/g) ?? [text];

	return parts
		.map((s: string): string => s.trim())
		.filter((s: string): boolean => s.length > 0);
};

const splitByCharCount = (input: string, maxChars: number): string[] => {
	if (maxChars <= 0) return [];
	const text = input.trim();
	const result: string[] = [];
	let startIndex: number = 0;

	while (startIndex < text.length) {
		if (startIndex + maxChars >= text.length) {
			result.push(text.slice(startIndex).trim());
			break;
		}

		let endIndex: number = startIndex + maxChars;
		while (endIndex > startIndex && text[endIndex] !== " " && text[endIndex] !== "\n") {
			endIndex--;
		}

		const foundDelimiter = endIndex > startIndex;
		if (!foundDelimiter) {
			endIndex = startIndex + maxChars;
		}

		result.push(text.slice(startIndex, endIndex).trim());
		startIndex = foundDelimiter ? endIndex + 1 : endIndex;
	}

	return result.filter((s: string): boolean => s.length > 0);
};

export const splitStringByWhitespace = (
	input: string,
	mode?: LongQuoteSplitMode,
	maxChars?: number,
): string[] => {
	switch (mode) {
	case "sentence":
		return splitBySentences(input);
	case "char-count":
		return splitByCharCount(input, maxChars ?? 500);
	case "none":
		return [input.trim()];
	case "paragraph":
	default:
		return splitByParagraphs(input);
	}
};
