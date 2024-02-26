/**
 * verse-item-to-requests.ts
 *
 * Created by Min-Kyu Lee on 25-02-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { VerseItemInput } from "./verse-item-inputs";

export const verseItemToRequests_ = (verseItem: VerseItemInput) => {
	const outputRequests = [];

	for (let verseIndex = verseItem.startingVerse; verseIndex <= (verseItem.endingVerse ?? verseItem.startingVerse); verseIndex++) {
		outputRequests.push({
			url: encodeURI(
				"https://jsonbible.com/search/verses.php?" +
				`json={"book":"${verseItem.book}"` +
				`,"chapter":"${verseItem.chapter}"` +
				`,"verse":"${verseIndex}"` +
				`,"version":"${verseItem.version}"}`
			),
		});
	}

	return outputRequests;
};
