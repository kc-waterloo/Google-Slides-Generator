/**
 * parse-document-item.d.ts
 *
 * Created by Min-Kyu Lee on 22-05-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

export interface ParseDocumentItem {
	paragraphHeading: GoogleAppsScript.Document.ParagraphHeading,
	text: string,
	children: ParseDocumentItem[],
}
