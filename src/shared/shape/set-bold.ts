/**
 * internal/set-bold.ts
 *
 * Created by Min-Kyu Lee on 20-09-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved.
 */

export const setBold_ = ({
	shape,
	bold,
}: {
	shape: GoogleAppsScript.Slides.Shape,
	bold: boolean
}): void => {
	try {
		shape?.getText()?.getTextStyle()?.setBold(bold);
	}
	// eslint-disable-next-line no-empty
	catch (_) { }
};
