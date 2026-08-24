/**
 * create-verse-slides/defaults.ts
 *
 * Created by Min-Kyu Lee on 25-02-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import type { Nullable, SlideNumber, VerseItemInput } from "@gsg/shared";

export const templateSlideNumberDefault_: Nullable<SlideNumber> = null;
export const insertionSlideNumberDefault_: SlideNumber = 9;
export const verseItemsDefault_: VerseItemInput[] = [
	{"book": "Psalms", "chapter": 42, "startingVerse": 5, "endingVerse": 5, version: "niv"},
];
