/**
 * internal/process-copy-items.ts
 * 
 * Created by Min-Kyu Lee on 20-09-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved. 
*/

import { isPageElementKeyEqual_ } from "./../page-element-key/is-page-element-key-equal";
import { setBold_ } from "../set-bold";
import { setTextForegroundColor_ } from "../set-text-foreground-color";
import { setText_ } from "../set-text";
import { CopyItem } from "./copy-item";
import { getPageElementKey_ } from "../page-element-key/get-page-element-key";

export const processCopyItems_ = ({
	templateSlide,
	destinationSlide,
	copyItems,
}: {
	templateSlide: GoogleAppsScript.Slides.Slide,
	destinationSlide: GoogleAppsScript.Slides.Slide,
	copyItems: CopyItem[],
}): void => {
	templateSlide.getPageElements().forEach((pageElement): void => {
		copyItems.forEach((copyItem: CopyItem): void => {
			if (isPageElementKeyEqual_(getPageElementKey_(pageElement), copyItem.pageElementKey)) {
				copyItem.originalPageElement = pageElement;
			}
		});
	});

	const destinationSlideObjectIdSet = new Set<string>();

	destinationSlide.getPageElements().forEach(pageElement => {
		copyItems.forEach((copyItem: CopyItem) => {
			if (getPageElementKey_(pageElement).includes(copyItem.pageElementKey)) {
				copyItem.newPageElement = pageElement;
			}
		});
		destinationSlideObjectIdSet.add(pageElement.getObjectId());
	});

	copyItems.forEach((copyItem: CopyItem): void => {
		if (copyItem.originalPageElement) {
			if (!copyItem.newPageElement || !destinationSlideObjectIdSet.has(copyItem.newPageElement.getObjectId())) {
				copyItem.newPageElement = destinationSlide.insertPageElement(copyItem.originalPageElement);
			}

			if (copyItem.newPageElement) {
				const newShape: GoogleAppsScript.Slides.Shape = copyItem.newPageElement.asShape();
				if (newShape) {
					if (copyItem.actions.newText) {
						setText_({
							shape: newShape,
							newText: copyItem.actions.newText
						});
					}
					if (copyItem.actions.newColor) {
						setTextForegroundColor_({
							shape: newShape,
							newColor: copyItem.actions.newColor
						});
					}
					if (copyItem.actions.bold !== undefined) {
						setBold_({
							shape: newShape,
							bold: copyItem.actions.bold
						});
					}
				}
			}
		}
	});
	return;
};
