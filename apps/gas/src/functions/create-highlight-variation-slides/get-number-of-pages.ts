/**
 * get-number-of-pages.ts
 *
 * Created by Min-Kyu Lee on 13-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { Nullable } from "@gsg/shared";
import { getPageElementKey_ } from "../../shared/page-element-key/get-page-element-key";

export const getNumberOfPages_ = ({
	inputSlide,
}: {
	inputSlide: GoogleAppsScript.Slides.Slide;
}): Nullable<number> => {
	let output: Nullable<number> = null;
	inputSlide.getPageElements().some((pageElement: GoogleAppsScript.Slides.PageElement) => {
		const pageElementRegex: RegExp = /point-\d+-of-(\d+)-text-box/;

		const pageElementKey: string = getPageElementKey_(pageElement);
		const match: RegExpMatchArray | null = pageElementKey.match(pageElementRegex);
		if (match) {
			const candidateOutput: number = parseInt(match[1]!, 10);

			if (!isFinite(candidateOutput) || candidateOutput < 1) {
				return false;
			}

			output = candidateOutput;
			return true;
		}

		return false;
	});

	return output;
};
