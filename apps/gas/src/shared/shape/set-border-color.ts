/**
 * set-border-color.ts
 *
 * Created by Min-Kyu Lee on 13-01-2024
 * Copyright © 2024 Min-Kyu Lee. All rights reserved.
 */

export const setBorderColor_ = ({
	shape,
	newColor,
}: {
	shape: GoogleAppsScript.Slides.Shape,
	newColor: GoogleAppsScript.Slides.ThemeColorType
}): void => {
	try {
		shape.getBorder().getLineFill().setSolidFill(newColor);
	}
	// eslint-disable-next-line no-empty
	catch (_) { }
};

