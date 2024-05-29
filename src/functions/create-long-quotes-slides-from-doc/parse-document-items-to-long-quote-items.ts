/**
 * parse-document-items-to-long-quote-items.ts
 *
 * Created by Min-Kyu Lee on 22-05-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { paragraphHeadingToNumber_ } from "../../shared/parse-document/paragraph-heading-to-number";
import { ParseDocumentItem } from "../../shared/parse-document/parse-document-item";
import { LongQuoteItem } from "../create-long-quotes-slides/long-quote-item";

export const parseDocumentItemsToLongQuoteItems_ = ({
	parseDocumentItems,
	titleAllowList = [],
	titleBlockList = [],
}: {
	parseDocumentItems: ParseDocumentItem[],
	titleAllowList: RegExp[],
	titleBlockList: RegExp[],
}): LongQuoteItem[] => {
	const longQuoteItems: LongQuoteItem[] = [];

	const parseDocumentQueue: ParseDocumentItem[] = [...parseDocumentItems];
	while (parseDocumentQueue.length > 0) {
		const currentParseDocumentItem: ParseDocumentItem | undefined = parseDocumentQueue.pop();
        
		if (currentParseDocumentItem === undefined) {
			break;
		}
        
		if (
			currentParseDocumentItem.paragraphHeading === DocumentApp.ParagraphHeading.HEADING1
		) {
			const title: string = currentParseDocumentItem.text;

			if (
				titleAllowList.length !== 0 &&
				!titleAllowList.some(r => r.test(title))
			) {
				continue;
			}
		
			if (
				titleBlockList.length !== 0 &&
				titleBlockList.some(r => r.test(title))
			) {
				continue;
			}

			currentParseDocumentItem.children.forEach((childOfTitle) => {
				if (childOfTitle.paragraphHeading === DocumentApp.ParagraphHeading.HEADING2) {
					const subtitle: string = childOfTitle.text;

					childOfTitle.children.forEach((childOfSubtitle) => {
						if (childOfSubtitle.paragraphHeading === DocumentApp.ParagraphHeading.NORMAL) {
							const quote: string = childOfSubtitle.text;

							longQuoteItems.push(
								{
									title: title,
									subtitle: subtitle,
									quote: quote,
								}
							);
						}
					});
				}
			});
		}

		if (
			paragraphHeadingToNumber_.get(currentParseDocumentItem.paragraphHeading)! <
			paragraphHeadingToNumber_.get(DocumentApp.ParagraphHeading.HEADING1)!
		) {
			parseDocumentQueue.push(...currentParseDocumentItem.children);
		}
	}

	return longQuoteItems;
};
