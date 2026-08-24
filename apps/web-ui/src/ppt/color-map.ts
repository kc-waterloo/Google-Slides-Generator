/**
 * color-map.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

const THEME_COLOR_MAP: Record<string, string> = {
	DARK1: "000000",
	LIGHT1: "FFFFFF",
	DARK2: "44546A",
	LIGHT2: "E7E6E6",
	ACCENT1: "4472C4",
	ACCENT2: "ED7D31",
	ACCENT3: "A5A5A5",
	ACCENT4: "FFC000",
	ACCENT5: "5B9BD5",
	ACCENT6: "70AD47",
};

export const toPptColor = (themeColor: string | undefined): string | undefined => {
	if (themeColor === undefined) {
		return undefined;
	}
	const result = THEME_COLOR_MAP[themeColor];
	if (!result) {
		console.warn(`toPptColor: unknown color "${themeColor}"`);
	}
	return result;
};
