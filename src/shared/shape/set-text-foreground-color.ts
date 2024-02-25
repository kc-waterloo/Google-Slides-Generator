/**
 * internal/set-text-foreground-color.ts
 *
 * Created by Min-Kyu Lee on 20-09-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved.
 */

export const setTextForegroundColor_ = ({
	shape,
	newColor,
}: {
	shape: GoogleAppsScript.Slides.Shape,
	newColor: GoogleAppsScript.Slides.ThemeColorType
}): void => {
	try {
		shape?.getText()?.getTextStyle()?.setForegroundColor(newColor);
	}
	// eslint-disable-next-line no-empty
	catch (_) { }
};
