/**
 * batch-set-text-style/index.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import type { TextStyleOverride, SlideNumber } from "@gsg/shared";
import { getPageElementKey_ } from "../../shared/page-element-key/get-page-element-key";
import { applyTextStyle_ } from "../../shared/shape/apply-text-style";
import { setBorderColor_ } from "../../shared/shape/set-border-color";
import { logInfo, logError } from "../../shared/logger/logger";
import { forEachSlideInRange_ } from "../../shared/slide-range";
import { getActivePresentation_ } from "../../shared/presentation";
import { toThemeColor_ } from "../../shared/theme-color";

const MODULE = "batchSetTextStyle";

/**
 * Applies text style overrides (font size, bold, italic, color, border color)
 * to page elements matching given keys across a range of slides.
 *
 * @param {Object} parameters - parameters for the function
 * @param {TextStyleOverride[]} parameters.textStyles - Array of style overrides to apply
 * @param {SlideNumber} [parameters.lowerBoundSlideNumber=1] - First slide to process (inclusive)
 * @param {SlideNumber} [parameters.upperBoundSlideNumber=9999] - Last slide to process (inclusive)
 * @returns {void}
 */
export const batchSetTextStyle = ({
	textStyles,
	lowerBoundSlideNumber = 1,
	upperBoundSlideNumber = 9999,
}: {
	textStyles: TextStyleOverride[],
	lowerBoundSlideNumber: SlideNumber,
	upperBoundSlideNumber: SlideNumber,
} = {
	textStyles: [],
	lowerBoundSlideNumber: 1,
	upperBoundSlideNumber: 9999,
}): void => {
	const presentation = getActivePresentation_(MODULE);
	if (!presentation) {
		return;
	}

	let totalApplied = 0;
	forEachSlideInRange_({
		presentation: presentation,
		lowerBoundSlideNumber: lowerBoundSlideNumber,
		upperBoundSlideNumber: upperBoundSlideNumber,
		callback: (slide: GoogleAppsScript.Slides.Slide): void => {
			const pageElements: GoogleAppsScript.Slides.PageElement[] = slide.getPageElements();

			textStyles.forEach((override: TextStyleOverride): void => {
				pageElements.forEach((pageElement: GoogleAppsScript.Slides.PageElement): void => {
					if (getPageElementKey_(pageElement) !== override.pageElementKey) {
						return;
					}

					let shape: GoogleAppsScript.Slides.Shape | null = null;
					try {
						shape = pageElement.asShape();
					}
					// eslint-disable-next-line no-empty
					catch (_) {}
					if (!shape) {
						return;
					}

					if (override.fontSize !== undefined) {
						applyTextStyle_(shape, (ts) => ts.setFontSize(override.fontSize!));
					}
					if (override.italic !== undefined) {
						applyTextStyle_(shape, (ts) => ts.setItalic(override.italic!));
					}
					if (override.bold !== undefined) {
						applyTextStyle_(shape, (ts) => ts.setBold(override.bold!));
					}
					if (override.strikethrough !== undefined) {
						applyTextStyle_(shape, (ts) => ts.setStrikethrough(override.strikethrough!));
					}
					if (override.underline !== undefined) {
						applyTextStyle_(shape, (ts) => ts.setUnderline(override.underline!));
					}
					if (override.color !== undefined) {
						const resolvedColor = toThemeColor_(override.color);
						if (resolvedColor === undefined) {
							logError(MODULE, `Invalid color: '${override.color}'`);
						} else {
							applyTextStyle_(shape, (ts) => ts.setForegroundColor(resolvedColor));
						}
					}
					if (override.borderColor !== undefined) {
						const resolvedBorderColor = toThemeColor_(override.borderColor);
						if (resolvedBorderColor === undefined) {
							logError(MODULE, `Invalid border color: '${override.borderColor}'`);
						} else {
							setBorderColor_({
								shape: shape,
								newColor: resolvedBorderColor,
							});
						}
					}

					totalApplied++;
				});
			});
		},
	});

	logInfo(MODULE, `Applied ${totalApplied} style overrides across slides ${lowerBoundSlideNumber}-${upperBoundSlideNumber}`);
};
