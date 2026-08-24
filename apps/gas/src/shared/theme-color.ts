/**
 * theme-color.ts
 *
 * Created by Min-Kyu Lee on 26-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

const THEME_COLOR_MAP: Record<string, GoogleAppsScript.Slides.ThemeColorType> = {
	DARK1: SlidesApp.ThemeColorType.DARK1,
	LIGHT1: SlidesApp.ThemeColorType.LIGHT1,
	DARK2: SlidesApp.ThemeColorType.DARK2,
	LIGHT2: SlidesApp.ThemeColorType.LIGHT2,
	ACCENT1: SlidesApp.ThemeColorType.ACCENT1,
	ACCENT2: SlidesApp.ThemeColorType.ACCENT2,
	ACCENT3: SlidesApp.ThemeColorType.ACCENT3,
	ACCENT4: SlidesApp.ThemeColorType.ACCENT4,
	ACCENT5: SlidesApp.ThemeColorType.ACCENT5,
	ACCENT6: SlidesApp.ThemeColorType.ACCENT6,
};

export const toThemeColor_ = (
	value: string | undefined | null,
): GoogleAppsScript.Slides.ThemeColorType | undefined => {
	if (value && THEME_COLOR_MAP[value]) {
		return THEME_COLOR_MAP[value];
	}
	return undefined;
};
