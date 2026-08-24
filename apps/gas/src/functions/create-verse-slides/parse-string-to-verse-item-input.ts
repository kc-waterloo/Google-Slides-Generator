/**
 * parse-string-to-verse-item-input.ts
 *
 * Created by Min-Kyu Lee on 14-05-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import type { VerseItemInput } from "@gsg/shared";

/**
 * Matches "Psalms 42:5 niv", "Psalms 42:5-6 niv", "창세기 1:1 개역개정" and the
 * abbreviated form the Korean sources use, where no space separates the book
 * from the chapter ("창1:1 개역개정", "고전13:4-7 개역개정"). The book is lazy so
 * it gives back as few characters as possible before the chapter number.
 */
const REFERENCE_PATTERN = /^\s*(.+?) ?(\d+):(\d+)(?:-(\d+))? (\S+)\s*$/u;

export const parseStringToVerseItemInput = (
	verseItemInput: VerseItemInput | string,
): VerseItemInput => {
	if (typeof verseItemInput !== "string") {
		return verseItemInput;
	}

	const match: RegExpMatchArray | null = verseItemInput.match(REFERENCE_PATTERN);

	if (match === null) {
		throw new Error(`PARSE_STRING_TO_VERSE_ITEM_INPUT: Could not parse ${verseItemInput}`);
	}

	const endingVerse: string | undefined = match[4];

	return {
		book: match[1]!,
		chapter: parseInt(match[2]!),
		startingVerse: parseInt(match[3]!),
		endingVerse: endingVerse === undefined ? undefined : parseInt(endingVerse),
		version: match[5]!,
	};
};
