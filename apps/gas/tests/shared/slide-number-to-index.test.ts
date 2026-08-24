/**
 * tests/shared/slide-number-to-index.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { slideNumberToIndex_ } from "../../src/shared/slide-number/slide-number-to-index";

describe("slideNumberToIndex_", () => {
	it("converts slide number 1 to index 0", () => {
		expect(slideNumberToIndex_(1)).toBe(0);
	});

	it("converts slide number 5 to index 4", () => {
		expect(slideNumberToIndex_(5)).toBe(4);
	});

	it("converts slide number 0 to index -1", () => {
		expect(slideNumberToIndex_(0)).toBe(-1);
	});

	it("handles negative slide numbers", () => {
		expect(slideNumberToIndex_(-5)).toBe(-6);
	});

	it("handles large slide numbers", () => {
		expect(slideNumberToIndex_(999999)).toBe(999998);
	});

	it("handles non-integer slide numbers", () => {
		expect(slideNumberToIndex_(2.5)).toBe(1.5);
	});
});
