/**
 * is-page-element-key-equal.ts
 *
 * Created by Min-Kyu Lee on 02-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { PageElementKey } from "./page-element-key";

export const isPageElementKeyEqual_ = (
	pageElementKey1: PageElementKey,
	pageElementKey2: PageElementKey,
): boolean => {
	return pageElementKey1.trim() === pageElementKey2.trim();
};
