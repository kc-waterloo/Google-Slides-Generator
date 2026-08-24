/**
 * apply-text-style.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

export const applyTextStyle_ = (
	shape: GoogleAppsScript.Slides.Shape,
	apply: (textStyle: GoogleAppsScript.Slides.TextStyle) => void,
): void => {
	try {
		const textStyle = shape?.getText()?.getTextStyle();
		if (textStyle) {
			apply(textStyle);
		}
	}
	// eslint-disable-next-line no-empty
	catch (_) { }
};
