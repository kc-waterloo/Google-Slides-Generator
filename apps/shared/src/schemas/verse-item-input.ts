/**
 * verse-item-input.ts
 *
 * Created by Min-Kyu Lee on 23-08-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

export interface VerseItemInput {
	book: string;
	chapter: number;
	startingVerse: number;
	endingVerse: number | undefined;
	version: string;
}
