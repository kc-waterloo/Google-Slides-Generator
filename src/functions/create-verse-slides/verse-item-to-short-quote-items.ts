/**
 * verse-item-to-short-quote-items.ts
 *
 * Created by Min-Kyu Lee on 25-02-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { VerseApiResponse } from "./verse-api-response";
import { ShortQuoteItem } from "../create-short-quotes-slides/short-quote-item";
import { VerseItem } from "./verse-item";

export const verseItemToShortQuoteItems_ = (verseItem: VerseItem): ShortQuoteItem[] => {
	const versesText = verseItem.input.startingVerse < (verseItem.input.endingVerse ?? -Infinity) ?
		`${verseItem.input.startingVerse}-${verseItem.input.endingVerse}` : verseItem.input.startingVerse.toString();

	return verseItem.responses.map((response: VerseApiResponse) => {
		return {
			quote: `(${response.verses}) ${response.text}` ?? "API ERROR: Not found",
			addendum: `${response.book} ${response.chapter}:${versesText} (${response.version})`
		};
	});
};
