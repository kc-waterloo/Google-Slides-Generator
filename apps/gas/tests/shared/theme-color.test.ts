/**
 * tests/shared/theme-color.test.ts
 *
 * Created by Min-Kyu Lee on 31-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { toThemeColor_ } from "../../src/shared/theme-color";

describe("toThemeColor_", () => {
	it("returns the ThemeColorType for a valid string", () => {
		const result = toThemeColor_("DARK1");

		expect(result).toBe("DARK1");
	});

	it("returns undefined for an empty string", () => {
		const result = toThemeColor_("");

		expect(result).toBeUndefined();
	});

	it("returns undefined for null", () => {
		const result = toThemeColor_(null);

		expect(result).toBeUndefined();
	});

	it("returns undefined for undefined", () => {
		const result = toThemeColor_(undefined);

		expect(result).toBeUndefined();
	});

	it("returns the ThemeColorType for a multi-word color", () => {
		const result = toThemeColor_("ACCENT3");

		expect(result).toBe("ACCENT3");
	});

	it("returns undefined for an unknown color string", () => {
		const result = toThemeColor_("UNKNOWN_COLOR");

		expect(result).toBeUndefined();
	});

	it("returns undefined for lowercase input", () => {
		const result = toThemeColor_("dark1");

		expect(result).toBeUndefined();
	});

	it("returns undefined for input with surrounding whitespace", () => {
		const result = toThemeColor_("  DARK1  ");

		expect(result).toBeUndefined();
	});
});
