
/**
 * parse-document.ts
 *
 * Created by Min-Kyu Lee on 22-05-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { paragraphHeadingToNumber_ } from "./paragraph-heading-to-number";
import { ParseDocumentItem } from "./parse-document-item";



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
			const currentElementParagraphHeadingNumber: number = paragraphHeadingToNumber_.get(currentElementParagraphHeading)!;

			if (currentElementParagraphHeading === currentElementStack[currentElementStack.length - 1].paragraphHeading) {
				currentElementStack[currentElementStack.length - 1].text += "\n" + paragraph.getText();
			}
			else {
				while (
					(
						(
							// The top of the stack is higher than the current element
							currentElementParagraphHeadingNumber < paragraphHeadingToNumber_.get(currentElementStack[currentElementStack.length - 1].paragraphHeading)!
							
						) || (
							// The top of the stack is not lower than the current element
							currentElementParagraphHeadingNumber <= paragraphHeadingToNumber_.get(currentElementStack[currentElementStack.length - 1].paragraphHeading)! &&
							// There exists an element in the stack that is lower than the current element
							minimumParagraphHeadingNumber < paragraphHeadingToNumber_.get(currentElementStack[currentElementStack.length - 1].paragraphHeading)!
						)
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

				if (paragraphHeadingToNumber_.get(currentElementStack[currentElementStack.length - 1].paragraphHeading)! < currentElementParagraphHeadingNumber) {
					currentElementStack[currentElementStack.length - 1].children.push(newParseDocumentItem);
				}
				currentElementStack.push(newParseDocumentItem);
			}
		}

		minimumParagraphHeadingNumber = Math.min(
			minimumParagraphHeadingNumber,
			paragraphHeadingToNumber_.get(currentElementParagraphHeading)!,
		);
	});

	while (paragraphHeadingToNumber_.get(currentElementStack[currentElementStack.length - 1].paragraphHeading)! > minimumParagraphHeadingNumber) {
		currentElementStack.pop();
	}
	
	return currentElementStack;
};
