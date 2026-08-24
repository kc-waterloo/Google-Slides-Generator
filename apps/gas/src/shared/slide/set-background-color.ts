/**
 * set-background-color.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

export const setBackgroundColor_ = ({
	slide,
	newColor,
}: {
	slide: GoogleAppsScript.Slides.Slide,
	newColor: GoogleAppsScript.Slides.ThemeColorType,
}): void => {
	try {
		slide?.getBackground()?.setSolidFill(newColor);
	}
	// eslint-disable-next-line no-empty
	catch (_) { }
};
