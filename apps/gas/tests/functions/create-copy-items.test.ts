/**
 * tests/functions/create-copy-items.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { createCopyItems_ } from "../../src/functions/create-highlight-variation-slides/create-copy-items";

describe("createCopyItems_", () => {
	it("creates the correct number of copy items (2 per page)", () => {
		const result = createCopyItems_({
			currentPageIndex: 1,
			numberOfPages: 3,
			isLastSlide: false,
		});

		expect(result).toHaveLength(6);
	});

	it("highlights the current page index", () => {
		const result = createCopyItems_({
			currentPageIndex: 2,
			numberOfPages: 3,
			isLastSlide: false,
		});

		const highlighted = result.filter((item) => item.actions.bold === true);
		expect(highlighted).toHaveLength(2);
		highlighted.forEach((item) => {
			expect(item.pageElementKey).toMatch(/point-2-of-3/);
		});
	});

	it("highlights all items on the last slide", () => {
		const result = createCopyItems_({
			currentPageIndex: 4,
			numberOfPages: 3,
			isLastSlide: true,
		});

		const highlighted = result.filter((item) => item.actions.bold === true);
		expect(highlighted).toHaveLength(6);
	});

	it("dims non-highlighted items", () => {
		const result = createCopyItems_({
			currentPageIndex: 1,
			numberOfPages: 3,
			isLastSlide: false,
		});

		const dimmed = result.filter((item) => item.actions.bold === false);
		expect(dimmed).toHaveLength(4);
		dimmed.forEach((item) => {
			expect(item.actions.newColor).toBe("LIGHT1");
		});
	});
});
