/**
 * paragraph-heading-to-number.ts
 *
 * Created by Min-Kyu Lee on 22-05-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

const paragraphHeadingToNumber_: Map<GoogleAppsScript.Document.ParagraphHeading, number> = new Map();
paragraphHeadingToNumber_.set(DocumentApp.ParagraphHeading.TITLE, 0);
paragraphHeadingToNumber_.set(DocumentApp.ParagraphHeading.SUBTITLE, 1);
paragraphHeadingToNumber_.set(DocumentApp.ParagraphHeading.HEADING1, 2);
paragraphHeadingToNumber_.set(DocumentApp.ParagraphHeading.HEADING2, 3);
paragraphHeadingToNumber_.set(DocumentApp.ParagraphHeading.HEADING3, 4);
paragraphHeadingToNumber_.set(DocumentApp.ParagraphHeading.HEADING4, 5);
paragraphHeadingToNumber_.set(DocumentApp.ParagraphHeading.HEADING5, 6);
paragraphHeadingToNumber_.set(DocumentApp.ParagraphHeading.HEADING6, 7);
paragraphHeadingToNumber_.set(DocumentApp.ParagraphHeading.NORMAL, 8);

export { paragraphHeadingToNumber_ };
