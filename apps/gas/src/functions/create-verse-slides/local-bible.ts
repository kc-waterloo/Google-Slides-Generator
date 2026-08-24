/**
 * local-bible.ts
 *
 * Created by Min-Kyu Lee on 23-08-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import type { VerseItemInput } from "@gsg/shared";
import { VerseApiResponse } from "./verse-api-response";
import { toBookAbbreviation_ } from "./book-aliases";
import { logError, logInfo } from "../../shared/logger/logger";

const MODULE = "createVerseSlides";

const DRIVE_ID_PATTERN = /[-\w]{25,}/;
const RANGE_KEY_PATTERN = /^(.+?)(\d+):(\d+)-(\d+)$/;

/** A verse source keyed like "창1:1" — book abbreviation, chapter, verse. */
export type LocalBible = Record<string, string>;

/**
 * Accepts either a Drive file id or any Drive URL containing one.
 */
export const toDriveFileId_ = (fileUrlOrId: string): string => {
	const match = DRIVE_ID_PATTERN.exec(fileUrlOrId);
	if (!match) {
		throw new Error(`CREATE_VERSE_SLIDES: Could not read a Drive file id from '${fileUrlOrId}'`);
	}
	return match[0];
};

/**
 * Expands range keys ("겔24:4-5") so every verse in the range is reachable by
 * its own key. Sources of this shape store a handful of verses that way.
 */
export const expandRangeKeys_ = (bible: LocalBible): LocalBible => {
	const expanded: LocalBible = { ...bible };

	Object.keys(bible).forEach((key: string): void => {
		const match = RANGE_KEY_PATTERN.exec(key);
		if (!match) {
			return;
		}

		const [, book, chapter, startingVerse, endingVerse] = match;
		for (let verse = parseInt(startingVerse!); verse <= parseInt(endingVerse!); verse++) {
			const verseKey = `${book}${chapter}:${verse}`;
			if (expanded[verseKey] === undefined) {
				expanded[verseKey] = bible[key]!;
			}
		}
	});

	return expanded;
};

/**
 * Reads a verse source from Drive. Results are memoized per file for the life
 * of the execution, so several verse items share one download and parse.
 */
export const loadLocalBible_ = (
	fileUrlOrId: string,
	cache: Record<string, LocalBible> = {},
): LocalBible => {
	const fileId = toDriveFileId_(fileUrlOrId);

	const cached = cache[fileId];
	if (cached !== undefined) {
		return cached;
	}

	logInfo(MODULE, `Loading verse source ${fileId} from Drive`);
	const contents = DriveApp.getFileById(fileId).getBlob().getDataAsString("UTF-8");
	const bible = expandRangeKeys_(JSON.parse(contents) as LocalBible);
	cache[fileId] = bible;

	return bible;
};

/**
 * Looks up every verse of the item in an already-loaded source, shaped like the
 * responses the verse API returns so both paths render identically.
 */
export const localVerseResponses_ = (
	verseItemInput: VerseItemInput,
	bible: LocalBible,
	extraAliases: Record<string, string> = {},
): VerseApiResponse[] => {
	const abbreviation = toBookAbbreviation_(verseItemInput.book, extraAliases);
	const lastVerse = verseItemInput.endingVerse ?? verseItemInput.startingVerse;

	const responses: VerseApiResponse[] = [];
	for (let verse = verseItemInput.startingVerse; verse <= lastVerse; verse++) {
		const key = `${abbreviation}${verseItemInput.chapter}:${verse}`;
		const text = bible[key];

		if (text === undefined) {
			logError(MODULE, `Verse not found in source: ${key}`);
		}

		responses.push({
			book: verseItemInput.book,
			chapter: verseItemInput.chapter.toString(),
			verses: verse.toString(),
			text: text === undefined ? undefined : text.trim(),
			version: verseItemInput.version,
			bid: undefined,
		});
	}

	return responses;
};
