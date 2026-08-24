/**
 * create-verse-slides/index.ts
 *
 * Created by Min-Kyu Lee on 25-02-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */


import type { Nullable, SlideNumber, VerseItemInput } from "@gsg/shared";
import { createShortQuotesSlides } from "../create-short-quotes-slides";
import { VerseApiResponse } from "./verse-api-response";
import { VerseItem } from "./verse-item";
import { verseItemToShortQuoteItems_ } from "./verse-item-to-short-quote-items";
import { verseItemToRequests_ } from "./verse-item-to-requests";
import { insertionSlideNumberDefault_, templateSlideNumberDefault_, verseItemsDefault_ } from "./defaults";
import { getVersesText_ } from "./get-verses-text";
import { parseStringToVerseItemInput } from "./parse-string-to-verse-item-input";
import { LocalBible, loadLocalBible_, localVerseResponses_ } from "./local-bible";
import { VerseVersionSource } from "./verse-version-source";
import { logInfo } from "../../shared/logger/logger";

const MODULE = "createVerseSlides";

/**
 * 
 * @param {Object} parameters
 * @param {VerseItemInput[]} parameters.verseItemInputs
 * @param {Nullable<SlideNumber>} parameters.templateSlideNumber
 * @param {SlideNumber} parameters.insertionSlideNumber
 * @param {string} parameters.verseItemInputs[].book
 * @param {number} parameters.verseItemInputs[].chapter
 * @param {number} parameters.verseItemInputs[].startingVerse
 * @param {number | undefined} parameters.verseItemInputs[].endingVerse
 * @param {string} parameters.verseItemInputs[].version
 * @param {VerseVersionSource[]} [parameters.versionSources] - Versions read from a
 *   Drive JSON file instead of the verse API, e.g. 개역개정
 */
export const createVerseSlides = ({
	verseItemInputs = verseItemsDefault_,
	templateSlideNumber = templateSlideNumberDefault_,
	insertionSlideNumber = insertionSlideNumberDefault_,
	versionSources = [],
}: {
	verseItemInputs: (VerseItemInput | string)[],
	templateSlideNumber: Nullable<SlideNumber>,
	insertionSlideNumber: SlideNumber,
	versionSources?: VerseVersionSource[],
} = {
	verseItemInputs: verseItemsDefault_,
	templateSlideNumber: templateSlideNumberDefault_,
	insertionSlideNumber: insertionSlideNumberDefault_,
}): void => {
	const parsedVerseItemInputItems: VerseItemInput[] = verseItemInputs.map(parseStringToVerseItemInput);

	const fileUrlByVersion: Record<string, string> = {};
	versionSources.forEach((versionSource: VerseVersionSource): void => {
		fileUrlByVersion[versionSource.version] = versionSource.fileUrl;
	});
	const loadedBibles: Record<string, LocalBible> = {};

	const verseItems: VerseItem[] = parsedVerseItemInputItems.map((verseItemInput: VerseItemInput): VerseItem => {
		const versesText: string = getVersesText_(verseItemInput);
		const fileUrl: string | undefined = fileUrlByVersion[verseItemInput.version];

		if (fileUrl !== undefined) {
			logInfo(MODULE, `Reading ${verseItemInput.book} ${verseItemInput.chapter}:${versesText} from ${verseItemInput.version} source`);
			return {
				input: verseItemInput,
				responses: localVerseResponses_(verseItemInput, loadLocalBible_(fileUrl, loadedBibles)),
			};
		}

		return {
			input: verseItemInput,
			responses: UrlFetchApp.fetchAll(verseItemToRequests_(verseItemInput)).map(
				(response): VerseApiResponse => {
					logInfo(MODULE, `Parsing response for ${verseItemInput.book} ${verseItemInput.chapter}:${versesText}`);
					return JSON.parse(response.getContentText()) as VerseApiResponse;
				}
			),
		};
	});

	createShortQuotesSlides({
		shortQuoteItems: verseItems.flatMap((verseItem) => {
			return verseItemToShortQuoteItems_(verseItem);
		}),
		templateSlideNumber: templateSlideNumber,
		insertionSlideNumber: insertionSlideNumber,
	});
};


