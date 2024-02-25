/**
 * get-page-element-key.ts
 *
 * Created by Min-Kyu Lee on 02-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { PageElementKey } from "./page-element-key";

export const getPageElementKey_ = (
	pageElement: GoogleAppsScript.Slides.PageElement,
): PageElementKey => {
	return pageElement.getDescription().trim();
};
