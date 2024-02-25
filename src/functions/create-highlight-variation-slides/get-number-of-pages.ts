/**
 * get-number-of-pages.ts
 *
 * Created by Min-Kyu Lee on 13-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

import { getPageElementKey_ } from "../../shared/page-element-key/get-page-element-key";
import { Nullable } from "../../shared/nullable/nullable";

export const getNumberOfPages_ = ({
	inputSlide,
}: {
	inputSlide: GoogleAppsScript.Slides.Slide;
}): Nullable<number> => {
	let output: Nullable<number> = null;
	inputSlide.getPageElements().some((pageElement: GoogleAppsScript.Slides.PageElement) => {
		const pageElementRegex: RegExp = /point-[0-9]-of-([0-9])-text-box/;

		if (pageElementRegex.test(getPageElementKey_(pageElement))) {
			const matchResult = getPageElementKey_(pageElement).match(pageElementRegex);
			if (matchResult !== null && matchResult.length > 1) {
				const firstCaptureGroup = matchResult[1];
				const candidateOutput = parseInt(firstCaptureGroup, 10);
				
				// Ensure that parsed integer is positive and finite
				if (!isFinite(candidateOutput) || candidateOutput < 1) {
					return false;
				}

				output = candidateOutput;
				return true;
			}
		}

		return false;
	});

	return output;
};
