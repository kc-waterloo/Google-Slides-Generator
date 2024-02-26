/**
 * verse-item-inputs.d.ts
 *
 * Created by Min-Kyu Lee on 25-02-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

export interface VerseItemInput {
	book: string,
	chapter: number,
	startingVerse: number,
	endingVerse: number | undefined,
	version: string,
}
