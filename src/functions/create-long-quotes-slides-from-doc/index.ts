/**
 * create-long-quotes-slides-from-doc/index.ts
 *
 * Created by Min-Kyu Lee on 22-05-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { Nullable } from "../../shared/nullable/nullable";
import { parseDocument_ } from "../../shared/parse-document/parse-document";
import { ParseDocumentItem } from "../../shared/parse-document/parse-document-item";
import { SlideNumber } from "../../shared/slide-number/slide-number";
import { createLongQuotesSlides } from "../create-long-quotes-slides";
import { LongQuoteItem } from "../create-long-quotes-slides/long-quote-item";
import { parseDocumentItemsToLongQuoteItems_ } from "./parse-document-items-to-long-quote-items";

export const createLongQuoteSlidesFromDoc = ({
	inputDocumentUrl,
	titleAllowList,
	titleBlockList,
	templateTitleSlideNumber,
	templateContentSlideNumber,
	insertionSlideNumber,
}: {
	inputDocumentUrl: string,
	titleAllowList: RegExp[],
    titleBlockList: RegExp[],
	templateTitleSlideNumber: Nullable<SlideNumber>,
	templateContentSlideNumber: Nullable<SlideNumber>,
	insertionSlideNumber: SlideNumber,
}): void => {
	const parsedDocumentItems: ParseDocumentItem[] = parseDocument_(inputDocumentUrl);

	const longQuoteItems: LongQuoteItem[] = parseDocumentItemsToLongQuoteItems_({
		parseDocumentItems: parsedDocumentItems,
		titleAllowList: titleAllowList,
		titleBlockList: titleBlockList,
	});

	createLongQuotesSlides({
		longQuoteItems: longQuoteItems,
		templateTitleSlideNumber: templateTitleSlideNumber,
		templateContentSlideNumber: templateContentSlideNumber,
		insertionSlideNumber: insertionSlideNumber,
	});
};
