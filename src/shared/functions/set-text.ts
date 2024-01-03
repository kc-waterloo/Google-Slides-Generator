/**
 * internal/set-text.ts
 *
 * Created by Min-Kyu Lee on 20-09-2023
 * Copyright © 2023 Min-Kyu Lee. All rights reserved.
 */

export const setText_ = ({
	shape,
	newText
}: {
	shape: GoogleAppsScript.Slides.Shape,
	newText: string
}): void => {
	try {
		shape?.getText()?.setText(newText);
	}
	// eslint-disable-next-line no-empty
	catch (_) { }
};
