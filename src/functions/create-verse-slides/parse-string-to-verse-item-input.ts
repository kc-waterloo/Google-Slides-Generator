/**
 * parse-string-to-verse-item-input.ts
 *
 * Created by Min-Kyu Lee on 14-05-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { VerseItemInput } from "./verse-item-inputs";

export const parseStringToVerseItemInput = (
	verseItemInput: VerseItemInput | string,
): VerseItemInput => {
	if (typeof verseItemInput !== "string") {
		return verseItemInput;
	}

	const rangedMatch: RegExpMatchArray | null = verseItemInput.match(/(\w+ ?\w+) (\d+):(\d+)-(\d+) (\w+)/);
        
	if (rangedMatch !== null) {
		return {
			book: rangedMatch[1],
			chapter: parseInt(rangedMatch[2]),
			startingVerse: parseInt(rangedMatch[3]),
			endingVerse: parseInt(rangedMatch[4]),
			version: rangedMatch[5],
		};
	}

	const nonRangedMatch: RegExpMatchArray | null = verseItemInput.match(/(\w+ ?\w+) (\d+):(\d+) (\w+)/);

	if (nonRangedMatch !== null) {
		return {
			book: nonRangedMatch[1],
			chapter: parseInt(nonRangedMatch[2]),
			startingVerse: parseInt(nonRangedMatch[3]),
			endingVerse: undefined,
			version: nonRangedMatch[4],
		};
	}

	throw new Error(`PARSE_STRING_TO_VERSE_ITEM_INPUT: Could not parse ${verseItemInput}`);
};
