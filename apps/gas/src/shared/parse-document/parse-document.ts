/**
 * parse-document.ts
 *
 * Created by Min-Kyu Lee on 22-05-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { headingNumber_ } from "./paragraph-heading-to-number";
import { ParseDocumentItem } from "./parse-document-item";

const stackTopHeading_ = (stack: ParseDocumentItem[]): number =>
	headingNumber_(stack[stack.length - 1]!.paragraphHeading);

const shouldPopStack_ = (
	currentHeadingNum: number,
	topHeadingNum: number,
	minimumHeadingNum: number,
): boolean =>
	currentHeadingNum <= topHeadingNum &&
	(currentHeadingNum !== topHeadingNum || minimumHeadingNum < topHeadingNum);

export const parseDocument_ = (
	inputDocumentUrl: string,
): ParseDocumentItem[] => {
	const document = DocumentApp.openByUrl(inputDocumentUrl);

	const currentElementStack: ParseDocumentItem[] = [];
	let minimumParagraphHeadingNumber: number = Infinity;
	document.getBody().getParagraphs().forEach((paragraph: GoogleAppsScript.Document.Paragraph): void => {
		const currentElementParagraphHeading: GoogleAppsScript.Document.ParagraphHeading = paragraph.getHeading();

		if (currentElementStack.length < 1) {
			const newParseDocumentItem: ParseDocumentItem = {
				paragraphHeading: paragraph.getHeading(),
				text: paragraph.getText(),
				children: [],
			};

			currentElementStack.push(newParseDocumentItem);
		}
		else {
			const currentElementParagraphHeadingNumber: number = headingNumber_(currentElementParagraphHeading);

			if (currentElementParagraphHeading === currentElementStack[currentElementStack.length - 1]!.paragraphHeading) {
				currentElementStack[currentElementStack.length - 1]!.text += "\n" + paragraph.getText();
			}
			else {
				while (
					shouldPopStack_(
						currentElementParagraphHeadingNumber,
						stackTopHeading_(currentElementStack),
						minimumParagraphHeadingNumber,
					) &&
					currentElementStack.length > 1
				) {
					currentElementStack.pop();
				}

				const newParseDocumentItem: ParseDocumentItem = {
					paragraphHeading: paragraph.getHeading(),
					text: paragraph.getText(),
					children: [],
				};

				if (headingNumber_(currentElementStack[currentElementStack.length - 1]!.paragraphHeading) < currentElementParagraphHeadingNumber) {
					currentElementStack[currentElementStack.length - 1]!.children.push(newParseDocumentItem);
				}
				currentElementStack.push(newParseDocumentItem);
			}
		}

		minimumParagraphHeadingNumber = Math.min(
			minimumParagraphHeadingNumber,
			headingNumber_(currentElementParagraphHeading),
		);
	});

	while (
		currentElementStack.length > 0 &&
		headingNumber_(currentElementStack[currentElementStack.length - 1]!.paragraphHeading) > minimumParagraphHeadingNumber
	) {
		currentElementStack.pop();
	}

	return currentElementStack;
};
