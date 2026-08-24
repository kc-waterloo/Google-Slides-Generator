/**
 * tests/functions/get-number-of-pages.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { getNumberOfPages_ } from "../../src/functions/create-highlight-variation-slides/get-number-of-pages";
import { createMockSlide, createMockPageElement } from "../__mocks__/google-apps-script";

describe("getNumberOfPages_", () => {
	it("extracts number of pages from a matching page element description", () => {
		const slide = createMockSlide([
			createMockPageElement("point-1-of-5-text-box"),
			createMockPageElement("point-2-of-5-text-box"),
		]);

		const result = getNumberOfPages_({ inputSlide: slide });
		expect(result).toBe(5);
	});

	it("returns null when no matching elements exist", () => {
		const slide = createMockSlide([
			createMockPageElement("some-other-key"),
		]);

		const result = getNumberOfPages_({ inputSlide: slide });
		expect(result).toBeNull();
	});

	it("returns null when the page number is invalid (zero)", () => {
		const slide = createMockSlide([
			createMockPageElement("point-1-of-0-text-box"),
		]);

		const result = getNumberOfPages_({ inputSlide: slide });
		expect(result).toBeNull();
	});

	it("returns null when the page number is not finite", () => {
		const slide = createMockSlide([
			createMockPageElement("point-1-of-Infinity-text-box"),
		]);

		const result = getNumberOfPages_({ inputSlide: slide });
		expect(result).toBeNull();
	});
});
