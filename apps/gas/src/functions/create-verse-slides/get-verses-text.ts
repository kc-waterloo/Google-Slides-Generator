/**
 * get-verses-text.ts
 *
 * Created by Min-Kyu Lee on 26-02-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import type { VerseItemInput } from "@gsg/shared";

export const getVersesText_ = (verseItemInput: VerseItemInput): string => {
	return verseItemInput.startingVerse < (verseItemInput.endingVerse ?? -Infinity) ?
		`${verseItemInput.startingVerse}-${verseItemInput.endingVerse}` : verseItemInput.startingVerse.toString();
};
