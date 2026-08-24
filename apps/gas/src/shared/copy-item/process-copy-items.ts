/**
 * shared/copy-item/process-copy-items.ts
 * 
 * Created by Min-Kyu Lee on 20-09-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved. 
*/

import { applyTextStyle_ } from "../shape/apply-text-style";
import { setText_ } from "../shape/set-text";
import type { CopyItem } from "./copy-item";
import { getPageElementKey_ } from "../page-element-key/get-page-element-key";
import { setBorderColor_ } from "../shape/set-border-color";
import type { PageElementKey } from "../page-element-key/page-element-key";
import type { CopyItemActions } from "./copy-item-actions";

const applyCopyItemActions_ = ({
	shape,
	actions,
}: {
	shape: GoogleAppsScript.Slides.Shape,
	actions: CopyItemActions,
}): void => {
	const { newText, newColor, bold, italic, strikethrough, underline, fontSize, newBorderColor } = actions;

	if (newText !== undefined) {
		setText_({ shape, newText });
	}
	if (newColor) {
		applyTextStyle_(shape, (ts) => ts.setForegroundColor(newColor));
	}
	if (bold !== undefined) {
		applyTextStyle_(shape, (ts) => ts.setBold(bold));
	}
	if (italic !== undefined) {
		applyTextStyle_(shape, (ts) => ts.setItalic(italic));
	}
	if (strikethrough !== undefined) {
		applyTextStyle_(shape, (ts) => ts.setStrikethrough(strikethrough));
	}
	if (underline !== undefined) {
		applyTextStyle_(shape, (ts) => ts.setUnderline(underline));
	}
	if (fontSize !== undefined) {
		applyTextStyle_(shape, (ts) => ts.setFontSize(fontSize));
	}
	if (newBorderColor !== undefined) {
		setBorderColor_({ shape, newColor: newBorderColor });
	}
};

export const processCopyItems_ = ({
	templateSlide,
	destinationSlide,
	copyItems,
}: {
	templateSlide: GoogleAppsScript.Slides.Slide,
	destinationSlide: GoogleAppsScript.Slides.Slide,
	copyItems: CopyItem[],
}): void => {
	const originalKeys: Map<PageElementKey, GoogleAppsScript.Slides.PageElement> = new Map();
	templateSlide.getPageElements().forEach((pageElement): void => {
		const key = getPageElementKey_(pageElement);
		originalKeys.set(key, pageElement);
	});

	copyItems.forEach((copyItem: CopyItem): void => {
		const matched = originalKeys.get(copyItem.pageElementKey.trim());
		if (matched) {
			copyItem.originalPageElement = matched;
		}
	});

	const destinationKeys: Map<PageElementKey, GoogleAppsScript.Slides.PageElement> = new Map();
	const destinationSlideObjectIdSet = new Set<string>();
	destinationSlide.getPageElements().forEach((pageElement: GoogleAppsScript.Slides.PageElement): void => {
		destinationKeys.set(getPageElementKey_(pageElement), pageElement);
		destinationSlideObjectIdSet.add(pageElement.getObjectId());
	});

	copyItems.forEach((copyItem: CopyItem): void => {
		const matchedElement = destinationKeys.get(copyItem.pageElementKey.trim());
		if (matchedElement) {
			copyItem.newPageElement = matchedElement;
		}
	});

	copyItems.forEach((copyItem: CopyItem): void => {
		if (!copyItem.originalPageElement) {
			return;
		}

		if (!copyItem.newPageElement || !destinationSlideObjectIdSet.has(copyItem.newPageElement.getObjectId())) {
			copyItem.newPageElement = destinationSlide.insertPageElement(copyItem.originalPageElement);
		}

		if (!copyItem.newPageElement) {
			return;
		}

		let newShape: GoogleAppsScript.Slides.Shape | null = null;
		try {
			newShape = copyItem.newPageElement.asShape();
		}
		// eslint-disable-next-line no-empty
		catch (_) {}
		if (!newShape) {
			return;
		}

		applyCopyItemActions_({ shape: newShape, actions: copyItem.actions });
	});
};
